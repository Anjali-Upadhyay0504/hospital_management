from urllib.parse import parse_qs
from jwt import decode

from django.conf import settings
from channels.db import database_sync_to_async

from accounts.models import User


@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


class JwtAuthMiddleware:

    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):

        query_string = parse_qs(scope["query_string"].decode())

        token = query_string.get("token")

        if token:
            token = token[0]

            try:

                payload = decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )

                scope["user"] = await get_user(payload["user_id"])

            except Exception:
                pass

        return await self.inner(scope, receive, send)