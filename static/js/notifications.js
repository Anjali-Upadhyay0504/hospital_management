async function loadNotifications() {

    const res = await authFetch(`${BASE_URL}/api/notifications/`);

    if (!res.ok) return;

    const data = await safeJson(res);

    // Backend se aane wala data
    const notifications = data.results || [];
    const unread = data.count_unread ?? 0;

    // Notification count
    const countEl = document.getElementById("notificationCount");
    if (countEl) countEl.innerText = unread;

    // Notification list
    const list = document.getElementById("notificationList");
    if (!list) return;

    list.innerHTML = "";

    if (notifications.length === 0) {
        list.innerHTML = `
            <li class="dropdown-item text-muted">
                No Notifications
            </li>
        `;
        return;
    }

    notifications.forEach(notification => {

        const style = notification.is_read ? "" : "fw-bold";

        list.innerHTML += `
            <li class="dropdown-item ${style}"
                onclick="markNotificationRead(${notification.id})"
                style="cursor:pointer">

                <strong>${notification.title}</strong><br>
                <small>${notification.message}</small>

            </li>
        `;
    });
}
async function markNotificationRead(id) {

    const res = await authFetch(`${BASE_URL}/api/notifications/${id}/read/`, {
        method: "POST"
    });

    if (!res.ok) {
        showToast("Failed to mark notification as read", "error");
        return;
    }

    loadNotifications(); // Notification list refresh
}