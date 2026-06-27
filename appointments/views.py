from datetime import date
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

    # =========================
    # GET APPOINTMENTS (FILTERED)
    # =========================
    def get_queryset(self):
        user = self.request.user

        if user.role == "doctor":

            try:
                doctor = DoctorProfile.objects.get(user=user)
            except DoctorProfile.DoesNotExist:
                return Appointment.objects.none()

            queryset = Appointment.objects.filter(doctor=doctor)

            view_type = self.request.query_params.get("view")
            today = date.today()

            if view_type == "today":
                queryset = queryset.filter(appointment_date__date=today)

            elif view_type == "pending":
                queryset = queryset.filter(status="pending")

            elif view_type == "approved":
                queryset = queryset.filter(status="approved")

            elif view_type == "completed":
                queryset = queryset.filter(status="completed")

            return queryset

        if user.role == "patient":
            return Appointment.objects.filter(patient=user)

        return Appointment.objects.all()

    # =========================
    # CREATE APPOINTMENT
    # =========================
    def perform_create(self, serializer):

        user = self.request.user

        if user.role != "patient":
            raise PermissionDenied("Only patients can book appointment")

        serializer.save(
            patient=user,
            status="pending"
        )

    # =========================
    # UPDATE STATUS (SECURE)
    # =========================
    @action(detail=True, methods=["post"])
    def update_status(self, request, pk=None):

        appointment = self.get_object()
        user = request.user
        new_status = request.data.get("status")

        if user.role != "doctor":
            raise PermissionDenied("Only doctor can update status")

        allowed_status = ["approved", "rejected", "completed"]

        if new_status not in allowed_status:
            raise ValidationError("Invalid status")

        appointment.status = new_status
        appointment.save()

        return Response({
            "message": "Status updated successfully",
            "status": appointment.status
        })