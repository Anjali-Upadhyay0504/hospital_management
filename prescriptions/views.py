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
from django.shortcuts import get_object_or_404

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
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

        # return Prescription.objects.none()

        appointment_id = self.request.query_params.get("appointment")

        if appointment_id:
            queryset = queryset.filter(
                appointment_id=appointment_id
            )


        return queryset           

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
    

class PrescriptionPDFAPIView(generics.GenericAPIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        prescription = get_object_or_404(
            Prescription,
            pk=pk
        )

        user = request.user

        # Permission Check
        if user.role == "patient":
            if prescription.appointment.patient != user:
                raise PermissionDenied()

        elif user.role == "doctor":
            if prescription.appointment.doctor.user != user:
                raise PermissionDenied()

        # Admin can access everything

        response = HttpResponse(
            content_type="application/pdf"
        )

        response["Content-Disposition"] = (
            f'attachment; filename="Prescription_{prescription.id}.pdf"'
        )

        doc = SimpleDocTemplate(response)

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "Title",
            parent=styles["Heading1"],
            alignment=TA_CENTER,
            textColor=HexColor("#0d6efd"),
            spaceAfter=20,
        )

        heading_style = styles["Heading2"]

        normal_style = styles["BodyText"]

        story = []

        # ==========================
        # Hospital Title
        # ==========================

        story.append(
            Paragraph(
                "Hospital Management System",
                title_style
            )
        )

        story.append(Spacer(1, 20))

        appointment = prescription.appointment

        # ==========================
        # Patient Information
        # ==========================

        story.append(
            Paragraph(
                f"<b>Prescription ID:</b> {prescription.id}",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Patient:</b> {appointment.patient.username}",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Doctor:</b> Dr. {appointment.doctor.user.username}",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Specialization:</b> {appointment.doctor.specialization}",
                normal_style
            )
        )

        story.append(
            Paragraph(
                f"<b>Appointment Date:</b> {appointment.appointment_date}",
                normal_style
            )
        )

        story.append(Spacer(1, 20))

        # ==========================
        # Diagnosis
        # ==========================

        story.append(
            Paragraph(
                "Diagnosis",
                heading_style
            )
        )

        story.append(
            Paragraph(
                prescription.diagnosis,
                normal_style
            )
        )

        story.append(Spacer(1, 15))

        # ==========================
        # Medicines
        # ==========================

        story.append(
            Paragraph(
                "Medicines",
                heading_style
            )
        )

        story.append(
            Paragraph(
                prescription.medicines.replace("\n", "<br/>"),
                normal_style
            )
        )

        story.append(Spacer(1, 15))

        # ==========================
        # Notes
        # ==========================

        story.append(
            Paragraph(
                "Doctor Notes",
                heading_style
            )
        )

        story.append(
            Paragraph(
                prescription.notes or "No Notes",
                normal_style
            )
        )

        story.append(Spacer(1, 30))

        story.append(
            Paragraph(
                "Doctor Signature: ____________________",
                normal_style
            )
        )

        doc.build(story)

        return response