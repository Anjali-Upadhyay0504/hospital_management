
from django.urls import path
from .views import SignupAPIView, MeAPIView
from django.views.generic import TemplateView


urlpatterns = [

    path("signup/", SignupAPIView.as_view(), name="signup"),
    path("me/", MeAPIView.as_view(), name="me"),

]

   