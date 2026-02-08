from rest_framework.permissions import BasePermission


class CartAccessPermission(BasePermission):
    message = "Authentication or session_id is required."

    def has_permission(self, request, view):
        user = request.user
        if user and user.is_authenticated:
            return True
        session_id = request.query_params.get("session_id") or request.data.get("session_id")
        return bool(session_id)
