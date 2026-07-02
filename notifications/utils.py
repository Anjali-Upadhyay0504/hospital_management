from .models import Notification


def create_notification(receiver, title, message):

    Notification.objects.create(
        receiver=receiver,
        title=title,
        message=message
    )


# isse code clean rhega
# abb future me har jagah sirf ye hi likhna pdega
# create_notification(...)