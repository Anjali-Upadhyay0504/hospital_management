from rest_framework import serializers
from .models import DoctorProfile


class DoctorSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "username",
            "specialization",
            "experience",
            "fee",
            "is_available"
        ]