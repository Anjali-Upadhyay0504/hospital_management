from rest_framework import serializers
from .models import DoctorProfile, DoctorRequest


class DoctorSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = "__all__"
        read_only_fields = ["user", "is_verified"]

class DoctorRequestSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

   
    class Meta:
        model = DoctorRequest
        fields = [
            "id",
            "username",
            "specialization",
            "experience",
            "qualification",
            "fee",
            "status",
            "created_at",
        ]
        read_only_fields = ["username","status", "created_at"]

    def create(self, validated_data):
        return DoctorRequest.objects.create(
            user=self.context["request"].user,
            **validated_data
        )