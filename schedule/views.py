from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import DoctorSchedule
from .serializers import ScheduleSerializer


# 📌 Doctor schedule list
class ScheduleListAPIView(generics.ListAPIView):

    queryset = DoctorSchedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAuthenticated]