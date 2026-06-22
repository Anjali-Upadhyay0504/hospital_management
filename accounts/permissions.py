from rest_framework.permissions import BasePermission



class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        return (
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "admin"
        )
class IsDoctor(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        return (
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "doctor"
        )


class IsPatient(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        return (
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "patient"
        )


class IsAdmin(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        return (
            user
            and user.is_authenticated
            and getattr(user, "role", None) == "admin"
        )


# 🔥 OPTIONAL: Mixed access (doctor OR patient read-only)
class IsDoctorOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        if not user or not user.is_authenticated:
            return False

        # allow safe methods (GET, HEAD, OPTIONS)
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        return user.role == "doctor"