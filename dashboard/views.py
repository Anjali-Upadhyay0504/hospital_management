from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.utils import timezone
from accounts.models import User
from appointments.models import Appointment
from prescriptions.models import Prescription
from doctor.models import DoctorProfile
from accounts.permissions import IsAdmin
from notifications.models import Notification

class AdminDashboardAPIView(APIView):

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
    
class DoctorDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        try:

            doctor = DoctorProfile.objects.get(user=request.user)

            data = {
                "total_appointments":
                    Appointment.objects.filter(doctor=doctor).count(),

                "pending_appointments":
                    Appointment.objects.filter(
                        doctor=doctor,
                        status="pending"
                    ).count(),

                "today_appointments":
                    Appointment.objects.filter(
                        doctor=doctor,
                        appointment_date__date=timezone.now().date()
                    ).count(),
            }

            return Response(data)

        except DoctorProfile.DoesNotExist:
            return Response(
                {"error": "Doctor profile not found"},
                status=404
            )
        

class PatientDashboardAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "patient":
            return Response({"error": "Not allowed"}, status=403)

        patient = request.user

        data = {
            "doctor_count": User.objects.filter(role="doctor").count(),

            "appointment_count": Appointment.objects.filter(
                patient=patient,
                status__in=["pending", "approved"]
            ).count(),

            "prescription_count": Prescription.objects.filter(
                appointment__patient=patient
            ).count(),

            "notification_count": Notification.objects.filter(
                receiver=patient,
                is_read=False
            ).count(),
        }

        return Response(data)