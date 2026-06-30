from datetime import date,datetime,timedelta
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from rest_framework.decorators import api_view, permission_classes

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
    

    # ==================
    #  slot 
    # =================
    @action(detail=False, methods=["get"], url_path="available-slots")
    def available_slots(self, request):

        doctor_id = request.query_params.get("doctor")
        date_str = request.query_params.get("date")

        if not doctor_id or not date_str:
            return Response(
                {"error": "doctor and date are required"},
                status=400
            )

        try:
            doctor = DoctorProfile.objects.get(pk=doctor_id)
        except DoctorProfile.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=404)

        selected_date = datetime.strptime(date_str, "%Y-%m-%d").date()

        day = selected_date.strftime("%a").lower()

        schedules = DoctorSchedule.objects.filter(
            doctor=doctor,
            day=day
        )

        slots = []

        for schedule in schedules:

            current = datetime.combine(selected_date, schedule.start_time)
            end = datetime.combine(selected_date, schedule.end_time)

            while current < end:

                exists = Appointment.objects.filter(
                    doctor=doctor,
                    appointment_date=current,
                    status__in=["pending", "approved"]
                ).exists()

                if not exists:
                    slots.append(current.strftime("%H:%M"))

                current += timedelta(minutes=30)

        return Response({
            "slots": slots
        })
    


   
    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):

        appointment = self.get_object()

        if appointment.status == "completed":
            return Response({"error": "Cannot cancel"}, status=400)

        appointment.status = "cancelled"
        appointment.save()

        return Response({"message": "Cancelled"})