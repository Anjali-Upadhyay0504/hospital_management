
from django.db import models
from django.conf import settings
from appointments.models import Appointment


class Invoice(models.Model):

    PAYMENT_STATUS = (
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
    )

    invoice_number = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name="invoice"
    )

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_invoices"
    )

    doctor = models.ForeignKey(
        "doctor.DoctorProfile",
        on_delete=models.CASCADE,
        related_name="doctor_invoices"
    )

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    extra_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS,
        default="unpaid"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(
    null=True,
    blank=True
)
    def save(self, *args, **kwargs):

        if not self.invoice_number:

            last_invoice = Invoice.objects.order_by("-id").first()

            if last_invoice:
                next_id = last_invoice.id + 1
            else:
                next_id = 1

            self.invoice_number = f"INV-{next_id:04d}"

        self.total_amount = (
            self.consultation_fee
            + self.extra_charge
            - self.discount
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoice_number