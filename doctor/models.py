from django.db import models
from django.conf import settings


class DoctorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    specialization = models.CharField(max_length=100)
    experience = models.IntegerField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)

    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class DoctorRequest(models.Model):

  
    STATUS_CHOICES = (
    ("pending", "Pending"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),
    ("completed", "Completed"),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="doctor_request"
    )

    specialization = models.CharField(max_length=100)
    experience = models.PositiveIntegerField()
    qualification = models.CharField(max_length=200)

    fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.status}"