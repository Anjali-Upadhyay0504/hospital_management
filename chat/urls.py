from django.urls import path
from .views import ChatMessageAPIView

urlpatterns = [
    path(
        "appointment/<int:appointment_id>/messages/",
        ChatMessageAPIView.as_view(),
        name="chat-messages",
    ),
]