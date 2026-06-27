



from django.urls import path
from .views import PrescriptionAPIView, PrescriptionDetailAPIView

urlpatterns = [
    path("", PrescriptionAPIView.as_view()),
    path("<int:pk>/", PrescriptionDetailAPIView.as_view()),
]
