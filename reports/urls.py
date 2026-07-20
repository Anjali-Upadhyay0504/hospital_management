from rest_framework.routers import DefaultRouter
from .views import MedicalReportViewSet

router = DefaultRouter()

router.register(
    "medical-reports",
    MedicalReportViewSet,
    basename="medical-reports"
)

urlpatterns = router.urls