from django.db import models
from django.conf import settings
# Create your models here.
from doctor.models import DoctorProfile

class DoctorSchedule(models.Model):

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'doctor'}
    )

    day = models.CharField(max_length=20)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.doctor.username} - {self.day}"