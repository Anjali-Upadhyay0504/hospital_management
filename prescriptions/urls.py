



from django.urls import path
from .views import PrescriptionAPIView, PrescriptionDetailAPIView, PrescriptionPDFAPIView


urlpatterns = [
    path("", PrescriptionAPIView.as_view()),
    path("<int:pk>/", PrescriptionDetailAPIView.as_view()),
    path("<int:pk>/pdf/", PrescriptionPDFAPIView.as_view())
]
