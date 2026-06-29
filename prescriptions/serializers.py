from rest_framework import serializers
from .models import Prescription




class PrescriptionSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="appointment.patient.username",
        read_only=True
    )

    doctor_name = serializers.CharField(
        source="appointment.doctor.user.username",
        read_only=True
    )

    class Meta:
        model = Prescription
        fields = [
            "id",
            "appointment",
            "patient_name",
            "doctor_name",
            "diagnosis",
            "medicines",
            "notes",
            "created_at",
            "updated_at"
        ]

        read_only_fields = (
            "created_at",
            "updated_at",
        )

       