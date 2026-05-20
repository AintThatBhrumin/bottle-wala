import base64
import hashlib
import hmac
import json
import logging
from typing import Any
from urllib import error, request

from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import APIException, ValidationError

from .models import Order


logger = logging.getLogger(__name__)


class PaymentGatewayError(APIException):
    status_code = 502
    default_code = "payment_gateway_error"
    default_detail = "The payment gateway is currently unavailable."


def ensure_razorpay_is_configured() -> None:
    if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
        return
    raise ValidationError(
        {
            "payment": [
                "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET before accepting payments."
            ]
        }
    )


def build_checkout_payment_payload(*, order: Order, gateway_order: dict[str, Any]) -> dict[str, Any]:
    return {
        "provider": "razorpay",
        "key": settings.RAZORPAY_KEY_ID,
        "amount": gateway_order["amount"],
        "currency": gateway_order["currency"],
        "order_id": gateway_order["id"],
        "name": settings.MARKETPLACE_NAME,
        "description": f"Payment for order #{order.id}",
        "prefill": {
            "name": order.user.name,
            "email": order.user.email,
        },
        "notes": gateway_order.get("notes", {}),
    }


def create_razorpay_order(*, order: Order) -> dict[str, Any]:
    ensure_razorpay_is_configured()

    payload = {
        "amount": order.get_total_in_subunits(),
        "currency": order.currency,
        "receipt": order.receipt,
        "notes": {
            "internal_order_id": str(order.id),
            "supplier_id": str(order.assigned_supplier_id or ""),
        },
    }
    response = razorpay_request(method="POST", path="/v1/orders", payload=payload)

    payment_order_id = str(response.get("id", "")).strip()
    if not payment_order_id:
        raise PaymentGatewayError("Razorpay did not return a payment order id.")

    order.payment_provider = "razorpay"
    order.payment_order_id = payment_order_id
    order.payment_status = Order.PaymentStatus.CREATED
    order.payment_failure_reason = ""
    order.save(
        update_fields=[
            "payment_provider",
            "payment_order_id",
            "payment_status",
            "payment_failure_reason",
            "updated_at",
        ]
    )
    return response


def verify_razorpay_payment(
    *,
    order: Order,
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str,
) -> Order:
    ensure_razorpay_is_configured()

    razorpay_order_id = razorpay_order_id.strip()
    razorpay_payment_id = razorpay_payment_id.strip()
    razorpay_signature = razorpay_signature.strip()

    if not order.payment_order_id:
        raise ValidationError({"payment": ["This order does not have a Razorpay payment order yet."]})
    if razorpay_order_id != order.payment_order_id:
        raise ValidationError({"payment": ["The provided Razorpay order id does not match this order."]})
    if order.payment_status == Order.PaymentStatus.CAPTURED:
        if order.payment_id and order.payment_id != razorpay_payment_id:
            raise ValidationError({"payment": ["This order has already been captured with a different payment id."]})
        if order.payment_signature and order.payment_signature != razorpay_signature:
            raise ValidationError({"payment": ["This order has already been captured with a different signature."]})
        return order

    expected_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        msg=f"{order.payment_order_id}|{razorpay_payment_id}".encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected_signature, razorpay_signature):
        raise ValidationError({"payment": ["Invalid Razorpay signature."]})

    payment = fetch_razorpay_payment(payment_id=razorpay_payment_id)
    payment_status = str(payment.get("status", "")).strip().lower()
    payment_order_id = str(payment.get("order_id", "")).strip()
    payment_amount = int(payment.get("amount", 0) or 0)
    payment_currency = str(payment.get("currency", "")).strip().upper()

    if payment_order_id != order.payment_order_id:
        raise ValidationError({"payment": ["The payment does not belong to this Razorpay order."]})
    if payment_amount != order.get_total_in_subunits():
        raise ValidationError({"payment": ["The captured payment amount does not match the order total."]})
    if payment_currency != order.currency:
        raise ValidationError({"payment": ["The payment currency does not match the order currency."]})

    if payment_status == Order.PaymentStatus.AUTHORIZED:
        order.payment_status = Order.PaymentStatus.AUTHORIZED
        order.payment_id = razorpay_payment_id
        order.payment_signature = razorpay_signature
        order.payment_failure_reason = ""
        order.save(
            update_fields=[
                "payment_status",
                "payment_id",
                "payment_signature",
                "payment_failure_reason",
                "updated_at",
            ]
        )
        raise ValidationError(
            {
                "payment": [
                    "The payment is authorized but not captured yet. Enable auto-capture in Razorpay before confirming the order."
                ]
            }
        )

    if payment_status != Order.PaymentStatus.CAPTURED:
        raise ValidationError({"payment": ["The payment has not been captured successfully."]})

    order.payment_status = Order.PaymentStatus.CAPTURED
    order.payment_id = razorpay_payment_id
    order.payment_signature = razorpay_signature
    order.payment_failure_reason = ""
    order.payment_captured_at = timezone.now()
    order.status = Order.Status.PENDING
    order.save(
        update_fields=[
            "payment_status",
            "payment_id",
            "payment_signature",
            "payment_failure_reason",
            "payment_captured_at",
            "status",
            "updated_at",
        ]
    )
    return order


def mark_razorpay_payment_failed(
    *,
    order: Order,
    razorpay_order_id: str = "",
    razorpay_payment_id: str = "",
    failure_reason: str = "",
) -> Order:
    if order.payment_status == Order.PaymentStatus.CAPTURED:
        raise ValidationError({"payment": ["Captured payments cannot be marked as failed."]})
    if razorpay_order_id and order.payment_order_id and razorpay_order_id.strip() != order.payment_order_id:
        raise ValidationError({"payment": ["The provided Razorpay order id does not match this order."]})

    order.payment_status = Order.PaymentStatus.FAILED
    order.payment_id = razorpay_payment_id.strip() or order.payment_id
    order.payment_failure_reason = (failure_reason or "Payment failed before capture.").strip()[:255]
    order.status = Order.Status.PAYMENT_PENDING
    order.save(
        update_fields=[
            "payment_status",
            "payment_id",
            "payment_failure_reason",
            "status",
            "updated_at",
        ]
    )
    return order


def fetch_razorpay_payment(*, payment_id: str) -> dict[str, Any]:
    ensure_razorpay_is_configured()
    return razorpay_request(method="GET", path=f"/v1/payments/{payment_id}")


def razorpay_request(*, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    base_url = settings.RAZORPAY_API_BASE_URL.rstrip("/")
    url = f"{base_url}{path}"
    data = json.dumps(payload).encode("utf-8") if payload is not None else None

    credentials = f"{settings.RAZORPAY_KEY_ID}:{settings.RAZORPAY_KEY_SECRET}".encode("utf-8")
    headers = {
        "Authorization": f"Basic {base64.b64encode(credentials).decode('ascii')}",
        "Accept": "application/json",
    }
    if payload is not None:
        headers["Content-Type"] = "application/json"

    gateway_request = request.Request(url=url, data=data, headers=headers, method=method.upper())

    try:
        with request.urlopen(gateway_request, timeout=settings.RAZORPAY_TIMEOUT_SECONDS) as response:
            raw_body = response.read().decode("utf-8")
    except error.HTTPError as exc:
        raw_error = exc.read().decode("utf-8", errors="replace")
        logger.warning("Razorpay HTTP error %s for %s: %s", exc.code, path, raw_error)
        raise PaymentGatewayError(parse_razorpay_error(raw_error))
    except error.URLError as exc:
        logger.warning("Razorpay network error for %s: %s", path, exc.reason)
        raise PaymentGatewayError("Unable to reach Razorpay right now. Please try again.")

    try:
        return json.loads(raw_body)
    except json.JSONDecodeError as exc:
        logger.warning("Invalid Razorpay response for %s: %s", path, raw_body)
        raise PaymentGatewayError("Received an invalid response from Razorpay.") from exc


def parse_razorpay_error(raw_error: str) -> str:
    try:
        payload = json.loads(raw_error)
    except json.JSONDecodeError:
        return "Razorpay rejected the request."

    error_payload = payload.get("error") if isinstance(payload, dict) else None
    if isinstance(error_payload, dict):
        description = error_payload.get("description") or error_payload.get("reason")
        if description:
            return str(description)
    return "Razorpay rejected the request."
