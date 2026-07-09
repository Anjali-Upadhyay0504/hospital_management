from rest_framework import serializers
from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    doctor_name = serializers.CharField(
        source="doctor.user.username",
        read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "appointment",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "consultation_fee",
            "extra_charge",
            "discount",
            "total_amount",
            "payment_status",
            "created_at",
            "paid_at",
        ]

        read_only_fields = (
            "invoice_number",
            "total_amount",
            "created_at",
            "paid_at",
        )