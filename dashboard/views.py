from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import User
from appointments.models import Appointment
from prescriptions.models import Prescription

from accounts.permissions import IsAdmin


class DashboardAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdmin
    ]

    def get(self, request):

        data = {

            "total_doctors":
            User.objects.filter(
                role="doctor"
            ).count(),

            "total_patients":
            User.objects.filter(
                role="patient"
            ).count(),

            "total_appointments":
            Appointment.objects.count(),

            "pending_appointments":
            Appointment.objects.filter(
                status="pending"
            ).count(),

            "approved_appointments":
            Appointment.objects.filter(
                status="approved"
            ).count(),

            "rejected_appointments":
            Appointment.objects.filter(
                status="rejected"
            ).count(),

            "total_prescriptions":
            Prescription.objects.count(),
        }

        return Response(data)