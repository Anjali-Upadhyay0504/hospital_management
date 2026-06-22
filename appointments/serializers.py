from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = "__all__"

        read_only_fields = (
            "patient",
            "status",
            "created_at"
        )

    # 🔐 VALIDATION LOGIC
    def validate(self, data):

        doctor = data.get("doctor")
        appointment_date = data.get("appointment_date")

        if not doctor:
            raise serializers.ValidationError("Doctor is required")

        if not appointment_date:
            raise serializers.ValidationError("Appointment date is required")
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).exists():
            raise serializers.ValidationError("Slot already booked")
        return data