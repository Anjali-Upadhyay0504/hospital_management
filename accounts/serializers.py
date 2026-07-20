from rest_framework import serializers
from .models import User

class SignupSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["username", "password"]

        extra_kwargs = {
            "password": {"write_only": True}
        }
#create_user() method password bhi hash kr dete hai
    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            role="patient"   # 🔐 HARD FIX
        )

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username", "role"]