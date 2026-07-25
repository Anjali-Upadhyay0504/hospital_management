import json

from channels.generic.websocket import AsyncWebsocketConsumer

from channels.db import database_sync_to_async

from django.shortcuts import get_object_or_404

from appointments.models import Appointment

from .models import ChatMessage



class ChatConsumer(AsyncWebsocketConsumer):


    async def connect(self):
        print("✅ consumers loaded")
        # URL se appointment id lena
        self.appointment_id = self.scope["url_route"]["kwargs"]["appointment_id"]


        # Room name
        self.room_group_name = (
            f"chat_appointment_{self.appointment_id}"
        )


        # User
        self.user = self.scope["user"]


        # Permission check
        allowed = await self.check_permission()


        if not allowed:

            await self.close()

            return



        # Room join
        await self.channel_layer.group_add(

            self.room_group_name,

            self.channel_name

        )


        # WebSocket accept

        await self.accept()



    async def disconnect(self, close_code):

        if self.channel_layer:

            await self.channel_layer.group_discard(

                self.room_group_name,

                self.channel_name

            )



    async def receive(self, text_data):


        data = json.loads(text_data)


        message = data.get("message")


        if not message:

            return



        # Database save

        chat_message = await self.save_message(
            message
        )


        # Broadcast

        await self.channel_layer.group_send(

            self.room_group_name,

            {

                "type": "chat_message",

                "message": message,

                "sender": self.user.id,

                "created_at": str(
                    chat_message.created_at
                )

            }

        )



    async def chat_message(self, event):


        await self.send(

            text_data=json.dumps({

                "message": event["message"],

                "sender": event["sender"],

                "created_at": event["created_at"]

            })

        )



    # ==========================
    # DATABASE FUNCTIONS
    # ==========================


    @database_sync_to_async
    def check_permission(self):

        appointment = Appointment.objects.get(
            id=self.appointment_id
        )

        print("Appointment Patient:", appointment.patient.id)
        print("Appointment Doctor:", appointment.doctor.user.id)

        print("Connected User:", self.user)
        print("Connected User ID:", getattr(self.user, "id", None))
        print("Authenticated:", self.user.is_authenticated)

        return (
            self.user == appointment.patient
            or
            self.user == appointment.doctor.user
        )

    @database_sync_to_async
    def save_message(self, message):


        appointment = Appointment.objects.get(

            id=self.appointment_id

        )


        return ChatMessage.objects.create(

            appointment=appointment,

            sender=self.user,

            message=message

        )