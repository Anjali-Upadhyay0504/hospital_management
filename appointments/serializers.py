from rest_framework import serializers
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    doctor_name = serializers.CharField(source="doctor.username", read_only=True)
    patient_name = serializers.CharField(source="patient.username", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "appointment_date",
            "duration",
            "reason",
            "status",
            "created_at"
        ]

        read_only_fields = (
            "patient",
            "status",
            "created_at",
            "patient_name",
            "doctor_name",
        )

    # =========================
    # 🔥 VALIDATION
    # =========================
    def validate(self, data):

        doctor = data.get("doctor")
        appointment_date = data.get("appointment_date")
        duration = data.get("duration", 30)

        if not doctor:
            raise serializers.ValidationError("Doctor is required")

        if not appointment_date:
            raise serializers.ValidationError("Appointment date is required")

        # Basic conflict check (same slot)
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).exists():
            raise serializers.ValidationError("This time slot is already booked")

        return data

    # =========================
    # 🔥 CREATE
    # =========================
    def create(self, validated_data):

        request = self.context.get("request")

        if request and request.user:
            validated_data["patient"] = request.user

        # default duration fallback
        validated_data["duration"] = validated_data.get("duration", 30)

        return super().create(validated_data)