from django.urls import path
from .views import (
    NotificationListView,
    mark_notification_read,mark_all_notifications_read
)

urlpatterns = [

    path(
        "",
        NotificationListView.as_view()
    ),

    path(
        "<int:pk>/read/",
        mark_notification_read
    ),
     path(
        "mark-all-read/",
        mark_all_notifications_read
    ),

]