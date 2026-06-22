from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import DoctorProfile
from .serializers import DoctorSerializer


class DoctorListAPIView(generics.ListAPIView):

    queryset = DoctorProfile.objects.filter(is_available=True)
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

class DoctorDetailAPIView(generics.RetrieveAPIView):

    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]


class DoctorCreateAPIView(generics.CreateAPIView):

    serializer_class = DoctorSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()