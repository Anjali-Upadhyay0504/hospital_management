from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from doctor.models import DoctorProfile
from .models import DoctorSchedule
from .serializers import ScheduleSerializer


class DoctorScheduleViewSet(viewsets.ModelViewSet):
    queryset = DoctorSchedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    # =========================
    # ROLE BASED ACCESS
    # =========================
    def get_queryset(self):
        user = self.request.user

        # Admin → all schedules
        if user.role == "admin":
            return DoctorSchedule.objects.all()

        # Doctor → only own schedule
        if user.role == "doctor":
            try:
                doctor = DoctorProfile.objects.get(user=user)
            except DoctorProfile.DoesNotExist:
                return DoctorSchedule.objects.none()

            return DoctorSchedule.objects.filter(doctor=doctor)

        # Patient → can view all schedules
        if user.role == "patient":
            return DoctorSchedule.objects.all()

        return DoctorSchedule.objects.none()

    # =========================
    # CREATE (ONLY DOCTOR)
    # =========================
    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "doctor":
            raise PermissionDenied("Only doctors can create schedule")

        try:
            doctor = DoctorProfile.objects.get(user=user)
        except DoctorProfile.DoesNotExist:
            raise PermissionDenied("Doctor profile not found")

        serializer.save(doctor=doctor)