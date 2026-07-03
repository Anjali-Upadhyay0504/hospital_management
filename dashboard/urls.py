from django.urls import path
from .views import (
    AdminDashboardAPIView,
    DoctorDashboardAPIView,
    PatientDashboardAPIView
)

urlpatterns = [
    path("admin/", AdminDashboardAPIView.as_view()),
    path("doctor/", DoctorDashboardAPIView.as_view()),
    path("patient/", PatientDashboardAPIView.as_view()),
]