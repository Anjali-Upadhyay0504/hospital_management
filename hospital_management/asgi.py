import os

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "hospital_management.settings"
)

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

from chat.routing import websocket_urlpatterns
from chat.middleware import JwtAuthMiddleware   # 👈 ye import

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": JwtAuthMiddleware(      # 👈 AuthMiddlewareStack hata do
        URLRouter(
            websocket_urlpatterns
        )
    ),
})