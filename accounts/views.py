from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .models import User
from .serializers import SignupSerializer, UserSerializer
from rest_framework import generics

class SignupAPIView(CreateAPIView):

    serializer_class = SignupSerializer

class MeAPIView(RetrieveAPIView):

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
    

class PatientListAPIView(generics.ListAPIView):

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role="patient")