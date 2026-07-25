from rest_framework import serializers
from .models import ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(
        source="sender.username",
        read_only=True
    )

    sender_role = serializers.CharField(
        source="sender.role",
        read_only=True
    )

    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "sender",
            "sender_name",
            "sender_role",
            "message",
            "created_at",
            "is_read",
        ]
        read_only_fields = [
            "id",
            "sender",
            "sender_name",
            "sender_role",
            "created_at",
            "is_read",
        ]


class SendMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            "message",
        ]

    def validate_message(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Message cannot be empty."
            )

        return value