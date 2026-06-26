from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action

from .models import Appointment
from .serializers import AppointmentSerializer
from schedule.models import DoctorSchedule
from doctor.models import DoctorProfile

class AppointmentViewSet(viewsets.ModelViewSet):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "doctor":
            try:
                doctor = DoctorProfile.objects.get(user=user)
            except DoctorProfile.DoesNotExist:
                return Appointment.objects.none()

            return Appointment.objects.filter(doctor=doctor)

        if user.role == "patient":
            return Appointment.objects.filter(patient=user)

        return Appointment.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != "patient":
            raise PermissionDenied("Only patients can book appointment")

        serializer.save(
            patient=user,
            status="pending"
        )

    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):
        appointment = self.get_object()

        appointment.status = request.data.get("status")
        appointment.save()

        return Response({
            "message": "Status updated",
            "status": appointment.status
        })