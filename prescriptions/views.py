from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
# from rest_framework.exceptions import PermissionDenied
# from appointments.models import Appointment
from .models import Prescription
from .serializers import PrescriptionSerializer
from django.db import transaction
from appointments.models import Appointment
from rest_framework.exceptions import PermissionDenied
from notifications.utils import create_notification

from io import BytesIO
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from billing.models import Invoice

class PrescriptionAPIView(generics.ListCreateAPIView):

    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    # LIST (GET)
    def get_queryset(self):

        user = self.request.user

        if user.role == "doctor":
            return Prescription.objects.filter(
                appointment__doctor__user_id=user.id
            )

        if user.role == "patient":
            return Prescription.objects.filter(
                appointment__patient_id=user.id
            )

        if user.role == "admin":
            return Prescription.objects.all()

        return Prescription.objects.none()

            

    # CREATE (POST)





# from django.db import transaction
# from appointments.models import Appointment
# from rest_framework.exceptions import PermissionDenied

# from django.db import transaction
# from appointments.models import Appointment
# from rest_framework.exceptions import PermissionDenied


    def perform_create(self, serializer):

        appointment = serializer.validated_data["appointment"]
        print("Logged User :", self.request.user.username)
        print("Appointment Doctor :", appointment.doctor.user.username)
        print("Appointment Status :", appointment.status)
        if appointment.doctor.user != self.request.user:
            raise PermissionDenied()

        if appointment.status != "approved":
            raise PermissionDenied()

        with transaction.atomic():

            prescription = serializer.save()

            rows = Appointment.objects.filter(id=appointment.id).update(
                status="completed"
            )

            if not Invoice.objects.filter(
                appointment=appointment
            ).exists():

                Invoice.objects.create(
                    appointment=appointment,
                    patient=appointment.patient,
                    doctor=appointment.doctor,
                    consultation_fee=appointment.doctor.fee,
                    extra_charge=0,
                    discount=0,
                )
            create_notification(
                receiver=appointment.patient,
                title="Prescription Ready",
                message=f"Your prescription from Dr. {appointment.doctor.user.username} is now available."
            )

            print("UPDATED ROWS:", rows)

        return prescription
    
class PrescriptionDetailAPIView(generics.RetrieveAPIView):

    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        if user.role == "doctor":
            return Prescription.objects.filter(
                appointment__doctor__user_id=user.id
            )

        if user.role == "patient":
            return Prescription.objects.filter(
                appointment__patient_id=user.id
            )

        if user.role == "admin":
            return Prescription.objects.all()

        return Prescription.objects.none()