from django.urls import path

from .views import PrescriptionCreateAPIView

urlpatterns = [

    path(
        "create/",
        PrescriptionCreateAPIView.as_view(),
        name="prescription-create"
    ),

]