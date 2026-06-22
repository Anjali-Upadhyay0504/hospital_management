from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from .models import Appointment
from .serializers import AppointmentSerializer

from schedule.models import DoctorSchedule

class AppointmentViewSet(viewsets.ModelViewSet):
    """
    Production-ready Appointment API
    Secure, role-based, and data isolated
    """

    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    # 🔐 1. ROLE-BASED DATA ACCESS (VERY IMPORTANT)
    def get_queryset(self):

        user = self.request.user

        # Doctor sees only assigned appointments
        if user.role == "doctor":
            return Appointment.objects.filter(doctor=user)

        # Patient sees only his/her appointments
        if user.role == "patient":
            return Appointment.objects.filter(patient=user)

        # Admin sees everything
        return Appointment.objects.all()

    # 🔐 2. SECURE CREATE (ONLY PATIENT CAN BOOK)
def perform_create(self, serializer):

    user = self.request.user

    if user.role != "patient":
        raise PermissionDenied("Only patients can book appointments")

    doctor = serializer.validated_data["doctor"]
    appointment_datetime = serializer.validated_data["appointment_date"]

    # 🔐 check schedule
    if not DoctorSchedule.objects.filter(doctor=doctor).exists():
        raise ValidationError("Doctor has no schedule")

    # 🔐 check duplicate booking
    if Appointment.objects.filter(
        doctor=doctor,
        appointment_date=appointment_datetime
    ).exists():
        raise ValidationError("This slot is already booked")

    serializer.save(
        patient=user,
        status="pending"
    )
    # 🔐 3. SECURE UPDATE (ONLY DOCTOR + OWN APPOINTMENT)
    def update(self, request, *args, **kwargs):

        instance = self.get_object()
        user = request.user

        # ownership check
        if instance.doctor != user:
            return Response(
                {"error": "You are not assigned to this appointment"},
                status=status.HTTP_403_FORBIDDEN
            )

        if user.role != "doctor":
            return Response(
                {"error": "Only doctors can update appointments"},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().update(request, *args, **kwargs)

    # 🔐 4. SAFE STATUS UPDATE (CONTROLLED LOGIC)
    def partial_update(self, request, *args, **kwargs):

        instance = self.get_object()
        user = request.user

        # doctor-only access
        if instance.doctor != user or user.role != "doctor":
            return Response(
                {"error": "Not allowed"},
                status=status.HTTP_403_FORBIDDEN
            )

        status_value = request.data.get("status")

        # strict allowed values
        allowed_status = ["approved", "rejected"]

        if status_value and status_value not in allowed_status:
            return Response(
                {"error": "Invalid status value"},
                status=status.HTTP_400_BAD_REQUEST
            )

        instance.status = status_value
        instance.save()

        return Response({
            "message": "Appointment status updated successfully",
            "status": instance.status
        })
    
    