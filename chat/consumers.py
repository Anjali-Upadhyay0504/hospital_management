import json

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from appointments.models import Appointment
from .models import ChatMessage
from django.utils import timezone

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        print("✅ consumers loaded")

        # URL se appointment id lena
        self.appointment_id = self.scope["url_route"]["kwargs"]["appointment_id"]

        # Room name
        self.room_group_name = f"chat_appointment_{self.appointment_id}"

        # Connected user
        self.user = self.scope["user"]

        # Permission check
        allowed = await self.check_permission()

        if not allowed:
            await self.close()
            return

        # Join room
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        # Accept connection
        await self.accept()
        await self.set_online(True)

        other = await self.get_other_user_status()

        await self.send(text_data=json.dumps({
            "type": "status",
            "user_id": other.id,
            "username": other.username,
            "status": "online" if other.is_online else "offline",
        }))

        # Notify other participant that user is online
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "user_id": self.user.id,
                "username": self.user.username,
                "status": "online",
            }
        )

    async def disconnect(self, close_code):
        await self.set_online(False)

        # Notify other participant that user is offline
        if self.user.is_authenticated:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "user_status",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "status": "offline",
                }
            )

        # Leave room
        if self.channel_layer:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):

        data = json.loads(text_data)

        message_type = data.get("type", "chat_message")

        # -------------------------
        # Typing Indicator
        # -------------------------
        if message_type == "typing":

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_event",
                    "user_id": self.user.id,
                    "username": self.user.username,
                    "typing": data.get("typing", True),
                }
            )
            return

        # -------------------------
        # Chat Message
        # -------------------------
        message = data.get("message")

        if not message:
            return

        chat_message = await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": self.user.id,
                "username": self.user.username,
                "created_at": str(chat_message.created_at),
            }
        )

    # ==================================================
    # Receive Chat Message
    # ==================================================

    async def chat_message(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "chat_message",
                "message": event["message"],
                "sender": event["sender"],
                "username": event["username"],
                "created_at": event["created_at"],
            })
        )

    # ==================================================
    # Online / Offline Status
    # ==================================================

    async def user_status(self, event):

        # Don't send status back to same user
        if event["user_id"] == self.user.id:
            return

        await self.send(
            text_data=json.dumps({
                "type": "status",
                "user_id": event["user_id"],
                "username": event["username"],
                "status": event["status"],
            })
        )

    # ==================================================
    # Typing Indicator
    # ==================================================

    async def typing_event(self, event):

        # Don't show own typing
        if event["user_id"] == self.user.id:
            return

        await self.send(
            text_data=json.dumps({
                "type": "typing",
                "user_id": event["user_id"],
                "username": event["username"],
                "typing": event["typing"],
            })
        )

    # ==================================================
    # Database Functions
    # ==================================================

    @database_sync_to_async
    def check_permission(self):

        appointment = Appointment.objects.get(id=self.appointment_id)

        print("Appointment Patient:", appointment.patient.id)
        print("Appointment Doctor:", appointment.doctor.user.id)
        print("Connected User:", self.user)
        print("Connected User ID:", getattr(self.user, "id", None))
        print("Authenticated:", self.user.is_authenticated)

        return (
            self.user == appointment.patient
            or self.user == appointment.doctor.user
        )

    @database_sync_to_async
    def save_message(self, message):

        appointment = Appointment.objects.get(id=self.appointment_id)

        return ChatMessage.objects.create(
            appointment=appointment,
            sender=self.user,
            message=message
        )
    @database_sync_to_async
    def set_online(self, online):
        self.user.is_online = online

        if not online:
            self.user.last_seen = timezone.now()

        self.user.save(update_fields=["is_online", "last_seen"])


    @database_sync_to_async
    def get_other_user_status(self):
        appointment = Appointment.objects.get(id=self.appointment_id)

        if self.user == appointment.patient:
            other = appointment.doctor.user
        else:
            other = appointment.patient

        print("========== STATUS DEBUG ==========")
        print("Current User :", self.user.username)
        print("Other User   :", other.username)
        print("Other Online :", other.is_online)
        print("==================================")

        return other