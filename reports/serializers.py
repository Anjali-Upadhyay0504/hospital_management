from rest_framework import serializers
from .models import MedicalReport


class MedicalReportSerializer(serializers.ModelSerializer):

    doctor_name = serializers.CharField(
        source="appointment.doctor.user.username",
        read_only=True
    )
    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    class Meta:

        model = MedicalReport

        fields = [

            "id",

            "appointment",

            "patient",

            "patient_name",

            "title",

            "doctor_name",

            "report_file",

            "uploaded_at",

        ]

        read_only_fields = (

            "patient",

            "uploaded_at",

            "doctor_name",

        )