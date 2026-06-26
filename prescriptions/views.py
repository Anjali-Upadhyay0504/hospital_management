from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Prescription
from .serializers import PrescriptionSerializer


class PrescriptionAPIView(generics.ListCreateAPIView):

    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    # LIST (GET)
    def get_queryset(self):

        user = self.request.user

        if user.role == "doctor":
            return Prescription.objects.filter(
                appointment__doctor__user=user
            )

        if user.role == "patient":
            return Prescription.objects.filter(
                appointment__patient=user
            )

        if user.role == "admin":
            return Prescription.objects.all()

        return Prescription.objects.none()

    # CREATE (POST)
    def perform_create(self, serializer):

        appointment = serializer.validated_data["appointment"]

        # FIXED DOCTOR CHECK
        if appointment.doctor.user != self.request.user:
            raise PermissionDenied("You are not assigned to this appointment.")

        # STATUS CHECK
        if appointment.status != "approved":
            raise PermissionDenied("Prescription can only be created for approved appointments.")

        prescription = serializer.save()

       

    # 🔥 IMPORTANT FIX (force DB update)
        from appointment.models import Appointment  # adjust app name

        Appointment.objects.filter(id=appointment.id).update(status="completed")

        return prescription



