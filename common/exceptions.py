from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import APIException, ValidationError as DRFValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    if isinstance(exc, DjangoValidationError):
        if hasattr(exc, "message_dict"):
            exc = DRFValidationError(exc.message_dict)
        else:
            exc = DRFValidationError(exc.messages)

    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {
                "error": {
                    "code": "server_error",
                    "detail": "An unexpected error occurred.",
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if isinstance(exc, DRFValidationError):
        response.data = {
            "error": {
                "code": "validation_error",
                "detail": "Request validation failed.",
                "fields": response.data,
            }
        }
    elif isinstance(exc, APIException):
        detail = response.data.get("detail", "Request failed.") if isinstance(response.data, dict) else "Request failed."
        response.data = {
            "error": {
                "code": getattr(exc, "default_code", "api_error"),
                "detail": detail,
            }
        }

    return response
