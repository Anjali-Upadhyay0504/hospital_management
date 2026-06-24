from rest_framework.permissions import BasePermission, SAFE_METHODS


# =========================
# 🔐 Role Base Permissions
# =========================

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role == "admin"


class IsDoctor(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role == "doctor"


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return user.is_authenticated and user.role == "patient"


# =========================
# 🔄 Mixed Permission
# =========================

class IsDoctorOrReadOnly(BasePermission):
    """
    Doctors can create/update/delete
    Others can only read (GET, HEAD, OPTIONS)
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # safe methods allowed for everyone authenticated
        if request.method in SAFE_METHODS:
            return True

        return user.role == "doctor"


# =========================
# 🔥 Optional (Reusable scalable pattern)
# =========================

class RolePermission(BasePermission):
    """
    Base class for role-based access control
    """

    allowed_roles = []

    def has_permission(self, request, view):
        user = request.user

        return (
            user.is_authenticated and
            user.role in self.allowed_roles
        )


# 👇 Shortcut permissions using base class
class IsAdminRole(RolePermission):
    allowed_roles = ["admin"]


class IsDoctorRole(RolePermission):
    allowed_roles = ["doctor"]


class IsPatientRole(RolePermission):
    allowed_roles = ["patient"]