from rest_framework import serializers
from .models import DoctorProfile


class DoctorSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    is_verified = serializers.BooleanField(read_only=True)

    class Meta:
        model = DoctorProfile
        fields = "__all__"
        read_only_fields = ["user", "is_verified"]