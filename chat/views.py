from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from appointments.models import Appointment

from .models import ChatMessage
from .serializers import (
    ChatMessageSerializer,
    SendMessageSerializer,
)


class ChatMessageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_appointment(self, appointment_id):

        appointment = get_object_or_404(
            Appointment,
            id=appointment_id
        )

        # Only patient and doctor can access chat
        if (
            self.request.user != appointment.patient and
            self.request.user != appointment.doctor.user
        ):
            raise PermissionDenied(
                "You are not allowed to access this chat."
            )

        return appointment

    # ===========================
    # GET CHAT HISTORY
    # ===========================

    def get(self, request, appointment_id):

        appointment = self.get_appointment(appointment_id)

        messages = ChatMessage.objects.filter(
            appointment=appointment
        ).order_by("created_at")

        serializer = ChatMessageSerializer(
            messages,
            many=True
        )

        return Response({

            "appointment": {

                "id": appointment.id,

                "doctor_name": appointment.doctor.user.get_full_name()
                or appointment.doctor.user.username,

                "patient_name": appointment.patient.get_full_name()
                or appointment.patient.username,

                "status": appointment.status,

            },

            "current_user": {

                "id": request.user.id,

                "role": request.user.role,

            },

            "messages": serializer.data

        })

    # ===========================
    # SEND MESSAGE
    # ===========================

    def post(self, request, appointment_id):

        appointment = self.get_appointment(appointment_id)

        if appointment.status not in [

            "approved",

            "completed"

        ]:

            raise PermissionDenied(

                "Chat is not available."

            )

        serializer = SendMessageSerializer(

            data=request.data

        )

        serializer.is_valid(

            raise_exception=True

        )

        serializer.save(

            appointment=appointment,

            sender=request.user

        )

        return Response(

            serializer.data,

            status=status.HTTP_201_CREATED

        )