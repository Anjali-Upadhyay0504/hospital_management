from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import DoctorSchedule
from .serializers import ScheduleSerializer


class DoctorScheduleViewSet(viewsets.ModelViewSet):
    queryset = DoctorSchedule.objects.all()  
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]

    # =========================
    # 🔐 ROLE BASED ACCESS
    # =========================
    def get_queryset(self):
        user = self.request.user

        # Admin → all schedules
        if user.role == "admin":
            return DoctorSchedule.objects.all()

        # Doctor → only own schedule
        if user.role == "doctor":
            return DoctorSchedule.objects.filter(doctor=user)

        # Patient → can view all (for booking purpose)
        if user.role == "patient":
            return DoctorSchedule.objects.all()

        return DoctorSchedule.objects.none()

    # =========================
    # 🔐 CREATE (ONLY DOCTOR)
    # =========================
    def perform_create(self, serializer):

        user = self.request.user

        if user.role != "doctor":
            raise PermissionDenied("Only doctors can create schedule")

        serializer.save(doctor=user)