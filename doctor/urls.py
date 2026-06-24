from django.urls import path
from .views import (
    DoctorListAPIView,
    DoctorDetailAPIView,
    DoctorCreateAPIView,
    AdminDoctorListAPIView
)

urlpatterns = [
    path("list/", DoctorListAPIView.as_view()),
     path(
        "admin/list/",
        AdminDoctorListAPIView.as_view()
    ),
    path("<int:pk>/", DoctorDetailAPIView.as_view()),

    path("create/", DoctorCreateAPIView.as_view()),
]