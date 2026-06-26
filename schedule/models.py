from django.db import models
from django.core.exceptions import ValidationError

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
        "doctor.DoctorProfile",
        on_delete=models.CASCADE,
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
        return f"{self.doctor.user.username} - {self.day}"

    def clean(self):
        # 1. time validation
        if self.start_time >= self.end_time:
            raise ValidationError("Start time must be before end time")

        # 2. overlap validation
        overlap = DoctorSchedule.objects.filter(
            doctor=self.doctor,
            day=self.day,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time
        )

        if self.pk:
            overlap = overlap.exclude(pk=self.pk)

        if overlap.exists():
            raise ValidationError("Schedule overlaps with existing slot")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)