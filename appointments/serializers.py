from rest_framework import serializers
from .models import Appointment
from schedule.models import DoctorSchedule


class AppointmentSerializer(serializers.ModelSerializer):

    doctor_name = serializers.CharField(source="doctor.user.username", read_only=True)
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
    # VALIDATION
    # =========================
    def validate(self, data):

        doctor = data.get("doctor")
        appointment_datetime = data.get("appointment_date")

        if not doctor:
            raise serializers.ValidationError("Doctor is required")

        if not appointment_datetime:
            raise serializers.ValidationError("Appointment date is required")

        appointment_time = appointment_datetime.time()

        # =========================
        # 1. Duplicate booking check
        # =========================
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_datetime,
            status__in=["pending", "approved"]
        ).exists():
            raise serializers.ValidationError(
                "Doctor already has an appointment at this time"
            )

        # =========================
        # 2. Schedule validation
        # =========================
        schedules = DoctorSchedule.objects.filter(doctor=doctor)

        if not schedules.exists():
            raise serializers.ValidationError("Doctor has no schedule")

        allowed = False

        for schedule in schedules:
            if schedule.start_time <= appointment_time <= schedule.end_time:
                allowed = True
                break

        if not allowed:
            raise serializers.ValidationError(
                "Doctor is not available at this time"
            )

        return data

    # =========================
    # CREATE
    # =========================
    def create(self, validated_data):

        request = self.context.get("request")

        if request and request.user:
            validated_data["patient"] = request.user

        validated_data["duration"] = validated_data.get("duration", 30)

        return super().create(validated_data)