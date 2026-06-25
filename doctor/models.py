from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings




class DoctorProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    specialization = models.CharField(max_length=100)
    experience = models.IntegerField()
    fee = models.DecimalField(max_digits=10, decimal_places=2)

    is_available = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username