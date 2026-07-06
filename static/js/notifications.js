/* =========================================
        NOTIFICATIONS
========================================= */

let shownNotifications = new Set();
let firstLoad = true;

async function loadNotifications() {

    try {

        const res = await authFetch(
            `${BASE_URL}/api/notifications/`
        );

        const data = await safeJson(res);

        if (!res.ok) {

            showToast(
                "Unable to load notifications.",
                "error"
            );

            return;

        }

        const notifications = data.results || [];
        const unread = data.count_unread ?? 0;

        /* ==========================
                Bell Count
        ========================== */

        const countEl = getE1("notificationCount");

        if (countEl) {

            countEl.innerText = unread;

            countEl.style.display =
                unread > 0 ? "inline-block" : "none";

        }

        /* ==========================
            Toast Only New Notification
        ========================== */

        notifications.forEach(notification => {

            if (firstLoad) {

                shownNotifications.add(notification.id);

                return;

            }

            if (
                !notification.is_read &&
                !shownNotifications.has(notification.id)
            ) {

                shownNotifications.add(notification.id);

                showToast(
                    `${notification.title}: ${notification.message}`,
                    "info"
                );

            }

        });

        firstLoad = false;

        /* ==========================
            Notification Dropdown
        ========================== */

        const list = getE1("notificationList");

        if (!list) return;

        list.innerHTML = "";

        if (!notifications.length) {

            list.innerHTML = `
                <li class="dropdown-item text-center text-muted">
                    No Notifications
                </li>
            `;

            return;

        }

        // Latest 5 only
        const latest = notifications.slice(0, 5);

        latest.forEach(notification => {

            let icon = "🔔";

            if (
                notification.title
                    .toLowerCase()
                    .includes("appointment")
            ) {

                icon = "📅";

            }

            else if (
                notification.title
                    .toLowerCase()
                    .includes("prescription")
            ) {

                icon = "💊";

            }

            const item =
                document.createElement("li");

            item.className =
                "dropdown-item";

            item.style.cursor =
                "pointer";

            item.innerHTML = `

                <div class="d-flex">

                    ${
                        !notification.is_read
                            ? '<span class="text-primary me-2">●</span>'
                            : ""
                    }

                    <div>

                        <strong>

                            ${icon}
                            ${notification.title}

                        </strong>

                        <br>

                        <small class="text-muted d-block">

                        ${notification.message}

                    </small>

                    <small class="text-secondary">

                        ${getRelativeTime(notification.created_at)}

                    </small>

                    </div>

                </div>

            `;

            item.addEventListener(
                "click",
                async () => {

                    await markNotificationRead(
                        notification.id
                    );

                }
            );

            list.appendChild(item);

        });

    }

    catch (err) {

        console.error(err);

        showToast(
            "Unable to load notifications.",
            "error"
        );

    }

}


/* =========================================
        MARK AS READ
========================================= */

async function markNotificationRead(id) {

    try {

        const res = await authFetch(

            `${BASE_URL}/api/notifications/${id}/read/`,

            {
                method: "POST"
            }

        );

        const data = await safeJson(res);

        if (!res.ok) {

            showToast(
                data?.error ||
                "Unable to mark notification.",
                "error"
            );

            return;

        }

        await loadNotifications();

        if (
            typeof loadDashboard ===
            "function"
        ) {

            await loadDashboard();

        }

    }

    catch (err) {

        console.error(err);

        showToast(
            "Server Error",
            "error"
        );

    }

}

async function markAllNotificationsRead() {

    try {

        const res = await authFetch(

            `${BASE_URL}/api/notifications/mark-all-read/`,

            {
                method: "POST"
            }

        );

        if (!res.ok) return;

        await loadNotifications();

        if (typeof loadDashboard === "function") {

            await loadDashboard();

        }

    }

    catch (err) {

        console.error(err);

    }

}

document.addEventListener("DOMContentLoaded", () => {

    const bell = document.getElementById("notificationBell");

    if (bell) {

        bell.addEventListener("click", () => {

            markAllNotificationsRead();

        });

    }

    // Load notifications immediately
    loadNotifications();

    // Auto refresh every 10 seconds
    setInterval(() => {

        loadNotifications();

    }, 10000);

});
function getRelativeTime(dateString) {

    const now = new Date();
    const created = new Date(dateString);

    const diff = Math.floor((now - created) / 1000);

    if (diff < 60) {
        return "Just now";
    }

    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} min ago`;
    }

    if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    if (diff < 172800) {
        return "Yesterday";
    }

    const days = Math.floor(diff / 86400);

    return `${days} days ago`;

}