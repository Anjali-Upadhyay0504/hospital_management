from django.db import models

# Create your models here.
from doctor.models import DoctorProfile


class DoctorSchedule(models.Model):

    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.CASCADE,
        related_name="schedules"
    )

    day = models.CharField(max_length=20)  # Monday, Tuesday

    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.doctor} - {self.day}"