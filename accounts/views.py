from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .models import User
from .serializers import SignupSerializer, UserSerializer


class SignupAPIView(CreateAPIView):

    serializer_class = SignupSerializer

class MeAPIView(RetrieveAPIView):

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user