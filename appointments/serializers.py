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
            "reason",
            "status",
            "created_at"
        ]
        read_only_fields = ("patient", "status", "created_at")

    def validate(self, data):

        doctor = data.get("doctor")
        appointment_date = data.get("appointment_date")

        # Better: include time if available
        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date
        ).exists():
            raise serializers.ValidationError("Slot already booked")

        return data

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["patient"] = request.user
        return super().create(validated_data)