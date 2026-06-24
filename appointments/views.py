from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action

from .models import Appointment
from .serializers import AppointmentSerializer
from schedule.models import DoctorSchedule


class AppointmentViewSet(viewsets.ModelViewSet):

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    # 🔐 ROLE BASED DATA
    def get_queryset(self):

        user = self.request.user

        if user.role == "doctor":
            return Appointment.objects.filter(doctor=user)

        if user.role == "patient":
            return Appointment.objects.filter(patient=user)

        return Appointment.objects.all()

    # 🔐 CREATE APPOINTMENT
    def perform_create(self, serializer):

        user = self.request.user

        if user.role != "patient":
            raise PermissionDenied("Only patients can book appointment")

        doctor = serializer.validated_data["doctor"]
        appointment_date = serializer.validated_data["appointment_date"]

        # schedule check
        if not DoctorSchedule.objects.filter(doctor=doctor).exists():
            raise ValidationError("Doctor not available")

        # duplicate check
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).exists():
            raise ValidationError("Slot already booked")

        serializer.save(
            patient=user,
            status="pending"
        )

    # 🔐 DOCTOR STATUS UPDATE (APPROVE / REJECT)
    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):

        appointment = self.get_object()
        user = request.user

        if user.role != "doctor":
            return Response(
                {"error": "Only doctor can update status"},
                status=status.HTTP_403_FORBIDDEN
            )

        if appointment.doctor != user:
            return Response(
                {"error": "Not your appointment"},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get("status")

        if new_status not in ["approved", "rejected"]:
            return Response(
                {"error": "Invalid status"},
                status=status.HTTP_400_BAD_REQUEST
            )

        appointment.status = new_status
        appointment.save()

        return Response({
            "message": "Status updated",
            "status": appointment.status
        })