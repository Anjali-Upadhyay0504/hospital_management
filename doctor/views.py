from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import DoctorProfile
from .serializers import DoctorSerializer


class DoctorViewSet(viewsets.ModelViewSet):

    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    # =========================
    # GET DOCTORS
    # =========================
    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return DoctorProfile.objects.select_related("user").all()

        if user.role == "patient":
            return DoctorProfile.objects.filter(is_available=True)

        if user.role == "doctor":
            return DoctorProfile.objects.filter(user=user)

        return DoctorProfile.objects.none()

    # =========================
    # CREATE (ONLY ADMIN OR SYSTEM)
    # =========================
    def perform_create(self, serializer):

        if self.request.user.role != "admin":
            raise PermissionDenied("Only admin can create doctor profile")

        serializer.save()

    # =========================
    # UPDATE (ONLY ADMIN)
    # =========================
    def perform_update(self, serializer):

        if self.request.user.role != "admin":
            raise PermissionDenied("Only admin can update doctor profile")

        serializer.save()

    # =========================
    # DELETE (ONLY ADMIN)
    # =========================
    def perform_destroy(self, instance):

        if self.request.user.role != "admin":
            raise PermissionDenied("Only admin can delete doctor profile")

        instance.delete()

    # =========================
    # 🔥 DOCTOR SELF PROFILE API
    # =========================
    @action(detail=False, methods=["get"])
    def me(self, request):

        if request.user.role != "doctor":
            return Response({"error": "Not a doctor"}, status=403)

        profile = DoctorProfile.objects.get(user=request.user)
        serializer = self.get_serializer(profile)

        return Response(serializer.data)