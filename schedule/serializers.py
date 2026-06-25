from rest_framework import serializers
from .models import DoctorSchedule

class ScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = DoctorSchedule
        fields = "__all__"
        read_only_fields = ["doctor"]