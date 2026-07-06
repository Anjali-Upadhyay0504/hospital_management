from django.shortcuts import render

# Create your views here.
from rest_framework.generics import ListAPIView

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(ListAPIView):

    serializer_class = NotificationSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            receiver=self.request.user
            
        ).order_by("-created_at")
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        serializer = self.get_serializer(queryset, many=True)

        unread = queryset.filter(is_read=False).count()

        return Response({
            "count_unread": unread,
            "results": serializer.data
        })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, pk):

    try:
        notification = Notification.objects.get(
            id=pk,
            receiver=request.user
        )

    except Notification.DoesNotExist:
        return Response(
            {"error": "Notification not found"},
            status=404
        )

    notification.is_read = True
    notification.save()

    return Response({
        "message": "Notification marked as read"
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):

    Notification.objects.filter(
        receiver=request.user,
        is_read=False
    ).update(is_read=True)

    return Response({
        "message": "All notifications marked as read"
    })