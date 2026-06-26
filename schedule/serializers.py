from rest_framework import serializers
from .models import DoctorSchedule

class ScheduleSerializer(serializers.ModelSerializer):

    class Meta:
        model = DoctorSchedule
        fields = "__all__"
        read_only_fields = ["doctor"]

    def validate(self, data):

        # start/end check
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("Start time must be before end time")

        request = self.context['request']
        doctor = request.user.doctorprofile

        # overlap check
        overlap = DoctorSchedule.objects.filter(
            doctor=doctor,
            day=data['day'],
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time']
        )

        if self.instance:
            overlap = overlap.exclude(pk=self.instance.pk)

        if overlap.exists():
            raise serializers.ValidationError("Schedule overlaps with existing slot")

        return data