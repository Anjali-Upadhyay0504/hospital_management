// ==========================getE1
// BASE CONFIG
// ==========================
if (!window.BASE_URL) {
    window.BASE_URL = "http://127.0.0.1:8000";
}


// ==========================
// SAFE JSON
// ==========================
async function safeJson(res) {
    try {
        return await res.json();
    } catch (e) {
        console.error("Invalid JSON response:", e);
        return null;
    }
}


// ==========================
// ESCAPE HTML (XSS protection)
// ==========================
function escapeHtml(text) {
    if (!text) return "";

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==========================
// DOM HELPERS
// ==========================
function getE1(id) {
    return document.getElementById(id);
}

function show(el) {
    if (el) el.style.display = "block";
}

function hide(el) {
    if (el) el.style.display = "none";
}


// ==========================
// TOAST MESSAGE
// ==========================
function showToast(message, type = "info") {

    let color = "#333";

    if (type === "success") color = "green";
    if (type === "error") color = "red";
    if (type === "warning") color = "orange";

    const toast = document.createElement("div");

    toast.innerText = message;
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.left = "50%";
    toast.style.transform = "translateX(-50%)";
    toast.style.background = color;
    toast.style.color = "#fff";
    toast.style.padding = "10px 15px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = 9999;
    toast.style.fontSize = "14px";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// ==========================
// DATE FORMATTERS
// ==========================
function formatDate(dateString) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function formatDateTime(dateString) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleString("en-IN");
}


// ==========================
// LOADING BUTTON
// ==========================
function setLoading(btn, isLoading, text = "Submit") {
    if (!btn) return;

    if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerText;
        btn.innerText = "Loading...";
    } else {
        btn.disabled = false;
        btn.innerText = btn.dataset.originalText || text;
    }
}


// ==========================
// NOTIFICATION UI HELPER
// ==========================
function updateNotificationCount(count) {
    const el = document.getElementById("notificationCount");
    if (el) el.innerText = count;
}