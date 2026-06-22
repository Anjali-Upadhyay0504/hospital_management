from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Prescription
from .serializers import PrescriptionSerializer
from accounts.permissions import IsDoctor


class PrescriptionCreateAPIView(
    generics.CreateAPIView
):

    serializer_class = PrescriptionSerializer

    permission_classes = [
        IsAuthenticated,
        IsDoctor
    ]

    def perform_create(self, serializer):

        appointment = serializer.validated_data["appointment"]

        # Sirf assigned doctor hi prescription likh sakta hai
        if appointment.doctor != self.request.user:
            raise PermissionDenied(
                "You are not assigned to this appointment."
            )

        serializer.save()