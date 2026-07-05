from django.db import models
from django.conf import settings


class Appointment(models.Model):

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    )

    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_appointments"
    )

    doctor = models.ForeignKey(
        "doctor.DoctorProfile",
        on_delete=models.CASCADE,
        related_name="appointments"
    )

    appointment_date = models.DateTimeField()

    reason = models.TextField()
    duration = models.IntegerField(default=30)  # minutes
    # 🔥 NEW FIELDS
    symptoms = models.TextField(blank=True, null=True)
    doctor_notes = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )
    
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-appointment_date"]

    def __str__(self):
        return f"{self.patient} → {self.doctor} ({self.status})"