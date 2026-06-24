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

    # =========================
    # 🔐 ROLE BASED DATA ACCESS
    # =========================
    def get_queryset(self):

        user = self.request.user

        if user.role == "doctor":
            return Appointment.objects.filter(doctor=user)

        if user.role == "patient":
            return Appointment.objects.filter(patient=user)

        return Appointment.objects.all()

    # =========================
    # 🔥 CREATE APPOINTMENT
    # =========================
    def perform_create(self, serializer):

        user = self.request.user

        if user.role != "patient":
            raise PermissionDenied("Only patients can book appointment")

        doctor = serializer.validated_data["doctor"]
        appointment_date = serializer.validated_data["appointment_date"]

        # check doctor schedule existence
        if not DoctorSchedule.objects.filter(doctor=doctor).exists():
            raise ValidationError("Doctor is not available")

        # slot conflict check
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).exists():
            raise ValidationError("Slot already booked")

        serializer.save(
            patient=user,
            status="pending"
        )

    # =========================
    # 🔥 DOCTOR ACTIONS
    # =========================
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):

        appointment = self.get_object()
        user = request.user

        if user.role != "doctor" or appointment.doctor != user:
            return Response(
                {"error": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        appointment.status = "approved"
        appointment.save()

        return Response({"message": "Appointment approved"})


    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):

        appointment = self.get_object()
        user = request.user

        if user.role != "doctor" or appointment.doctor != user:
            return Response(
                {"error": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        appointment.status = "rejected"
        appointment.save()

        return Response({"message": "Appointment rejected"})
    @action(detail=True, methods=["post"])


    def complete(self, request, pk=None):

        appointment = self.get_object()
        user = request.user

        if user.role != "doctor" or appointment.doctor != user:
            return Response({"error": "Not allowed"}, status=403)

        if appointment.status != "approved":
            return Response({"error": "Only approved can be completed"}, status=400)

        appointment.status = "completed"
        appointment.save()

        return Response({"message": "Appointment completed"})
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):

        appointment = self.get_object()
        user = request.user

        if user.role != "patient" or appointment.patient != user:
            return Response({"error": "Not allowed"}, status=403)

        if appointment.status in ["completed", "rejected"]:
            return Response({"error": "Cannot cancel now"}, status=400)

        appointment.status = "cancelled"
        appointment.save()

        return Response({"message": "Appointment cancelled"})