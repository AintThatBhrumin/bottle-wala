from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import GuestSession, User
from .serializers import (
    CustomTokenObtainPairSerializer,
    GuestSessionSerializer,
    RegisterSerializer,
    UserSerializer,
)


class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.none()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in {"register", "login", "guest_session", "merge_guest_cart"}:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == "register":
            return RegisterSerializer
        if self.action == "login":
            return CustomTokenObtainPairSerializer
        if self.action == "guest_session":
            return GuestSessionSerializer
        return UserSerializer

    @action(detail=False, methods=["post"])
    def register(self, request):
        """Register a new user and optionally merge guest cart"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Handle guest cart merge if guest_id provided
        guest_id = request.data.get("guest_id")
        if guest_id:
            self._merge_guest_cart(user, guest_id)

        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"])
    def login(self, request):
        """Login user and optionally merge guest cart"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response_data = serializer.validated_data

        # Handle guest cart merge if guest_id provided
        guest_id = request.data.get("guest_id")
        if guest_id and serializer.user:
            self._merge_guest_cart(serializer.user, guest_id)

        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def me(self, request):
        """Get current logged-in user"""
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def guest_session(self, request):
        """
        Create or retrieve a guest session.
        POST: Create new guest session
        Body: {guest_id: null, cart_data: [], browsing_history: [], saved_suppliers: []}
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        guest_session = serializer.save()

        # Store IP and user agent for tracking
        guest_session.ip_address = self._get_client_ip(request)
        guest_session.user_agent = request.META.get("HTTP_USER_AGENT", "")
        guest_session.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get", "put"])
    def guest_session_detail(self, request):
        """
        Retrieve or update guest session.
        GET /api/auth/guest-session-detail/?guest_id=<uuid>
        PUT: Update guest session cart/history
        """
        guest_id = request.query_params.get("guest_id")
        if not guest_id:
            return Response(
                {"detail": "guest_id query parameter required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            guest_session = GuestSession.objects.get(guest_id=guest_id)
        except GuestSession.DoesNotExist:
            return Response(
                {"detail": "Guest session not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if session expired
        if guest_session.is_expired():
            guest_session.delete()
            return Response(
                {"detail": "Guest session expired"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "GET":
            serializer = GuestSessionSerializer(guest_session)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # PUT: Update guest session
        serializer = GuestSessionSerializer(guest_session, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def merge_guest_cart(self, request):
        """
        Merge guest cart with logged-in user's cart.
        POST: {guest_id: uuid}
        Only authenticated users can merge carts.
        """
        guest_id = request.data.get("guest_id")
        if not guest_id:
            return Response(
                {"detail": "guest_id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            guest_session = GuestSession.objects.get(guest_id=guest_id)
        except GuestSession.DoesNotExist:
            return Response(
                {"detail": "Guest session not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if guest_session.is_expired():
            guest_session.delete()
            return Response(
                {"detail": "Guest session expired"},
                status=status.HTTP_404_NOT_FOUND,
            )

        self._merge_guest_cart(request.user, guest_id)

        return Response(
            {"detail": "Cart merged successfully"},
            status=status.HTTP_200_OK,
        )

    def _merge_guest_cart(self, user, guest_id):
        """
        Merge guest cart into user's cart.
        This is called after login/register.
        """
        try:
            guest_session = GuestSession.objects.get(guest_id=guest_id)
        except GuestSession.DoesNotExist:
            return

        if guest_session.is_expired():
            guest_session.delete()
            return

        # Link guest session to user
        guest_session.user = user
        guest_session.save()

        # Cart merge logic will be handled by frontend
        # Backend just stores the guest cart data and frontend merges it

    def _get_client_ip(self, request):
        """Extract client IP from request"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip
