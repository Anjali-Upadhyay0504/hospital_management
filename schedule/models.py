from django.db import models
from django.conf import settings


class DoctorSchedule(models.Model):

    DAYS = (
        ("mon", "Monday"),
        ("tue", "Tuesday"),
        ("wed", "Wednesday"),
        ("thu", "Thursday"),
        ("fri", "Friday"),
        ("sat", "Saturday"),
        ("sun", "Sunday"),
    )

    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "doctor"},
        related_name="schedules"
    )

    day = models.CharField(max_length=10, choices=DAYS)

    start_time = models.TimeField()
    end_time = models.TimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("doctor", "day", "start_time")
        ordering = ["day", "start_time"]

    def __str__(self):
        return f"{self.doctor.username} - {self.day}"

    # 🔥 VALIDATION
    def clean(self):
        if self.start_time >= self.end_time:
            raise ValueError("Start time must be before end time")