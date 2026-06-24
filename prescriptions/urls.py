



from django.urls import path
from .views import PrescriptionAPIView

urlpatterns = [
    path("", PrescriptionAPIView.as_view()),
]
