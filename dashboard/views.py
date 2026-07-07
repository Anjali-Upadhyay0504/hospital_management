from django.shortcuts import render
from django.utils import timezone
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
                "doctor_name": f"Dr. {request.user.get_full_name() or request.user.username}",

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

        # =========================
        # BASE QUERIES (OPTIMIZED)
        # =========================
        appointment_qs = Appointment.objects.filter(patient=patient)

        # =========================
        # RESPONSE
        # =========================
        data = {

            # 🔵 EXISTING COUNTS (NO BREAK)
            "doctor_count": User.objects.filter(role="doctor").count(),

            "appointment_count": appointment_qs.filter(
                status__in=["pending", "approved"]
            ).count(),

            "prescription_count": Prescription.objects.filter(
                appointment__patient=patient
            ).count(),

            "notification_count": Notification.objects.filter(
                receiver=patient,
                is_read=False
            ).count(),

            # =========================
            # 🟢 NEW SAFE ADDITIONS
            # (won't break frontend if ignored)
            # =========================

            "recent_appointments": list(
                appointment_qs.select_related("doctor")
                .order_by("-appointment_date")[:5]
                .values(
                    "id",
                    "status",
                    "appointment_date",
                    "doctor__user__username",
                    "doctor__specialization"
                )
            ),

            "next_appointment": (
                appointment_qs.filter(
                    appointment_date__gte=timezone.now(),
                    status__in=["pending", "approved"]
                )
                .order_by("appointment_date")
                .values(
                    "id",
                    "status",
                    "appointment_date",
                    "doctor__user__username"
                )
                .first()
            ),
            "latest_prescriptions": list(
            Prescription.objects.filter(
                appointment__patient=patient
            )
            .select_related(
                "appointment__doctor__user"
            )
            .order_by("-created_at")[:3]
            .values(
                "id",
                "diagnosis",
                "created_at",
                "appointment__doctor__user__username"
            )
        ),
        }

        return Response(data)