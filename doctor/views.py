from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import DoctorProfile, DoctorRequest
from .serializers import DoctorSerializer, DoctorRequestSerializer
from accounts.models import User
from notifications.utils import create_notification

class DoctorViewSet(viewsets.ModelViewSet):

    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    # =========================
    # GET DOCTORS
    # =========================
    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return DoctorProfile.objects.select_related("user").all()

        if user.role == "patient":
            return DoctorProfile.objects.filter(is_available=True)

        if user.role == "doctor":
            return DoctorProfile.objects.filter(user=user)

        return DoctorProfile.objects.none()

    # =========================
    # CREATE (ONLY ADMIN OR SYSTEM)
    # =========================
    def perform_create(self, serializer):

        if self.request.user.role != "admin":
            raise PermissionDenied("Only admin can create doctor profile")

        serializer.save()

    # =========================
    # UPDATE (ONLY ADMIN)
    # =========================
    def perform_update(self, serializer):

        if self.request.user.role != "admin":
            raise PermissionDenied("Only admin can update doctor profile")

        serializer.save()

    # =========================
    # DELETE (ONLY ADMIN)
    # =========================
    def perform_destroy(self, instance):

        if self.request.user.role != "admin":
            raise PermissionDenied("Only admin can delete doctor profile")

        instance.delete()

    # =========================
    # 🔥 DOCTOR SELF PROFILE API
    # =========================
    @action(detail=False, methods=["get"])
    def me(self, request):

        if request.user.role != "doctor":
            return Response({"error": "Not a doctor"}, status=403)

        profile = DoctorProfile.objects.get(user=request.user)
        serializer = self.get_serializer(profile)

        return Response(serializer.data)
    
     # =========================
    # 🔥 REQUEST DOCTOR
    # =========================

    @action(detail=False, methods=["post"])
    def request_doctor(self, request):

        # Sirf patient request bhej sakta hai
        if request.user.role != "patient":
            return Response(
                {"error": "Only patients can send doctor request"},
                status=403
            )

        # Ek hi request allow hogi
        if DoctorRequest.objects.filter(user=request.user).exists():
            return Response(
                {"error": "Doctor request already submitted"},
                status=400
            )

        serializer = DoctorRequestSerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()
        admins = User.objects.filter(role="admin")

        for admin in admins:
            create_notification(
                receiver=admin,
                title="New Doctor Request",
                message=f"{request.user.username} submitted a doctor request."
            )
        return Response(serializer.data, status=201)
      # =========================
    # 🔥 REQUEST PENDING
    # =========================

    @action(detail=False, methods=["get"])


    def pending_requests(self, request):

        if request.user.role != "admin":
            return Response(
                {"error": "Only admin can view pending requests"},
                status=403
            )

        requests = DoctorRequest.objects.filter(status="pending")

        serializer = DoctorRequestSerializer(requests, many=True)

        return Response(serializer.data)
    
     # =========================
    # 🔥REQUEST APPROVE
    # =========================
    
    @action(detail=True, methods=["post"])
    def approve_request(self, request, pk=None):

        if request.user.role != "admin":
            return Response(
                {"error": "Only admin can approve requests"},
                status=403
            )

        try:
            doctor_request = DoctorRequest.objects.get(pk=pk)
        except DoctorRequest.DoesNotExist:
            return Response(
                {"error": "Request not found"},
                status=404
            )

        # Already approved?
        if doctor_request.status == "approved":
            return Response(
                {"error": "Request already approved"},
                status=400
            )

        doctor_request.status = "approved"
        doctor_request.save()

        user = doctor_request.user
        user.role = "doctor"
        user.save()

        DoctorProfile.objects.create(
            user=user,
            specialization=doctor_request.specialization,
            experience=doctor_request.experience,
            fee=doctor_request.fee
        )
        create_notification(
            receiver=user,
            title="Doctor Request Approved",
            message="Congratulations! Your doctor request has been approved by the admin."
        )
        return Response({
            "message": "Doctor approved successfully"
        })
   # =========================
    # 🔥 REQUEST REJECT
    # =========================

    
    @action(detail=True, methods=["post"])
    def reject_request(self, request, pk=None):

        if request.user.role != "admin":
            return Response({"error": "Only admin can reject"}, status=403)

        try:
            doctor_request = DoctorRequest.objects.get(pk=pk)
        except DoctorRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

        if doctor_request.status != "pending":
            return Response({"error": "Request already processed"}, status=400)

        doctor_request.status = "rejected"
        doctor_request.save()
        create_notification(
            receiver=doctor_request.user,
            title="Doctor Request Rejected",
            message="Sorry! Your doctor request has been rejected by the admin."
        )
        return Response({"message": "Doctor request rejected successfully"})