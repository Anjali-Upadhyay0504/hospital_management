from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import MedicalReport
from .serializers import MedicalReportSerializer
from appointments.models import Appointment

from rest_framework.decorators import action

class MedicalReportViewSet(viewsets.ModelViewSet):

    serializer_class = MedicalReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Patient
        if user.role == "patient":
            return MedicalReport.objects.filter(patient=user)

        # Doctor
        elif user.role == "doctor":
            return MedicalReport.objects.filter(
                appointment__doctor__user=user
            )

        # Admin
        return MedicalReport.objects.all()

    def perform_create(self, serializer):

        appointment_id = self.request.data.get("appointment")

        if not appointment_id:
            raise ValidationError(
                {"appointment": "Appointment is required."}
            )

        try:
            appointment = Appointment.objects.get(id=appointment_id)

        except Appointment.DoesNotExist:
            raise ValidationError(
                {"appointment": "Appointment not found."}
            )

        # Patient can upload only for their own appointment
        if appointment.patient != self.request.user:
            raise PermissionDenied(
                "You cannot upload reports for another patient."
            )
        if appointment.status not in ["approved", "completed"]:
            raise ValidationError(
                {
                    "appointment": "You can upload reports only for approved or completed appointments."
                }
        )

        serializer.save(
            patient=self.request.user,
            appointment=appointment
        )

    def update(self, request, *args, **kwargs):

        report = self.get_object()

        if request.user.role == "patient":

            if report.patient != request.user:
                raise PermissionDenied(
                    "You cannot edit this report."
                )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):

        report = self.get_object()

        if request.user.role == "patient":

            if report.patient != request.user:
                raise PermissionDenied(
                    "You cannot delete this report."
                )

        return super().destroy(request, *args, **kwargs)
    


    @action(detail=False, methods=["get"])
    def appointment_reports(self, request):

        appointment_id = request.query_params.get("appointment")

        if not appointment_id:
            return Response(
                {"detail": "appointment id required"},
                status=400
            )

        reports = self.get_queryset().filter(
            appointment_id=appointment_id
        )

        serializer = self.get_serializer(
            reports,
            many=True
        )

        return Response(serializer.data)