from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Invoice
from .serializers import InvoiceSerializer
#mixin is used because the same code is repeated 2 times
class InvoiceQuerysetMixin:

    def get_queryset(self):

        user = self.request.user

        if user.role == "doctor":
            return Invoice.objects.filter(
                doctor__user=user
            )

        elif user.role == "patient":
            return Invoice.objects.filter(
                patient=user
            )

        elif user.role == "admin":
            return Invoice.objects.all()

        return Invoice.objects.none()
# we also use modelviewset in place of APIView both are but modelviewset request only one class which is fine 

class InvoiceAPIView(
    InvoiceQuerysetMixin,
    generics.ListAPIView
):

    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


class InvoiceDetailAPIView(
    InvoiceQuerysetMixin,
    generics.RetrieveAPIView
):

    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


class MarkInvoicePaidAPIView(generics.UpdateAPIView):

    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]


    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return Invoice.objects.all()

        return Invoice.objects.none()


    def patch(self, request, *args, **kwargs):

        if request.user.role != "admin":

            return Response(
                {
                    "error": "Only admin can mark invoice as paid."
                },
                status=status.HTTP_403_FORBIDDEN
            )


        invoice = self.get_object()


        if invoice.payment_status == "paid":

            return Response(
                {
                    "message": "Invoice is already paid.",
                    "payment_status": invoice.payment_status
                },
                status=status.HTTP_200_OK
            )


        invoice.payment_status = "paid"
        invoice.paid_at = timezone.now()
        invoice.save()


        return Response(
            {
                "message": "Invoice marked as paid successfully.",
                "invoice_id": invoice.id,
                "payment_status": invoice.payment_status
            },
            status=status.HTTP_200_OK
        )