from django.urls import path
from .views import ScheduleListAPIView

urlpatterns = [
    path("list/", ScheduleListAPIView.as_view()),
]