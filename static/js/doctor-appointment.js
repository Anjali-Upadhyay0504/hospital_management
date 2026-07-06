// =========================================
// GLOBAL STATE
// =========================================

let currentPage = 1;
let currentSearch = "";
let currentStatus = "all";
let searchTimer = null;
// =========================================
// STATUS BADGE
// =========================================

function getStatusBadge(status) {
    switch (status) {
        case "approved": return "bg-success";
        case "rejected": return "bg-danger";
        case "pending": return "bg-warning text-dark";
        case "completed": return "bg-primary";
        case "cancelled": return "bg-secondary";
        default: return "bg-dark";
    }
}

// =========================================
// SEARCH HANDLER
// =========================================

function handleSearch(value) {
    currentSearch = value;
    currentPage = 1;
    loadAppointments();
}

// =========================================
// FILTER HANDLER
// =========================================

function filterByStatus(status) {
    currentStatus = status;
    currentPage = 1;
    loadAppointments();
}

// =========================================
// LOAD APPOINTMENTS (MAIN)
// =========================================

async function loadAppointments(page = 1) {

    currentPage = page;

    const table = document.getElementById("appointmentTable");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Loading...
            </td>
        </tr>
    `;

    try {

        // ✅ ONLY VALID PARAMS
        let url = `${BASE_URL}/api/appointments/?page=${page}`;

        if (currentSearch) {
            url += `&search=${encodeURIComponent(currentSearch)}`;
        }

        if (currentStatus && currentStatus !== "all") {
            url += `&status=${currentStatus}`;
        }

        const res = await authFetch(url);
        const data = await safeJson(res);

        if (!res.ok) {
            throw new Error("API Error");
        }

        const appointments = data.results || [];

        renderAppointments(appointments);
        renderPagination(data);

    } catch (err) {

        console.error(err);

        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-danger text-center">
                    Error loading appointments
                </td>
            </tr>
        `;
    }
}

// =========================================
// RENDER TABLE
// =========================================

function renderAppointments(appointments) {

    const table = document.getElementById("appointmentTable");
    table.innerHTML = "";

    if (!appointments.length) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No appointments found
                </td>
            </tr>
        `;
        return;
    }

    appointments.forEach(item => {

        let actions = "";

        if (item.status === "pending") {
            actions = `
                <button class="btn btn-success btn-sm"
                    onclick="updateStatus(${item.id}, 'approved')">
                    Approve
                </button>

                <button class="btn btn-danger btn-sm"
                    onclick="updateStatus(${item.id}, 'rejected')">
                    Reject
                </button>
            `;
        }

        if (item.status === "approved") {
            actions = `
                <button class="btn btn-primary btn-sm"
                    onclick="window.location.href='/doctor/prescriptions/?appointment=${item.id}'">
                    Prescription
                </button>
            `;
        }

        table.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.patient_name ?? "-"}</td>
                <td>${formatDate(item.appointment_date)}</td>
                <td>${item.reason ?? "-"}</td>
                <td>
                    <span class="badge ${getStatusBadge(item.status)}">
                        ${item.status}
                    </span>
                </td>
                <td>${actions || "-"}</td>
            </tr>
        `;
    });
}

// =========================================
// PAGINATION (FIXED)
// =========================================

function renderPagination(data) {

    const container = document.getElementById("pagination");

    if (!container || !data.count) return;

    const totalPages = Math.ceil(data.count / 10);

    let html = "";

    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-primary'} m-1"
                onclick="loadAppointments(${i})">
                ${i}
            </button>
        `;
    }

    container.innerHTML = html;
}

// =========================================
// UPDATE STATUS
// =========================================

async function updateStatus(id, statusValue) {

    try {

        const res = await authFetch(
            `${BASE_URL}/api/appointments/${id}/update_status/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: statusValue })
            }
        );

        const data = await safeJson(res);

        if (!res.ok) {
            showToast(data?.error || "Update failed", "error");
            return;
        }

        showToast("Status updated", "success");

        loadAppointments(currentPage);

    } catch (err) {
        console.error(err);
        showToast("Server error", "error");
    }
}
function handleSearch(value) {

    currentSearch = value;

    currentPage = 1;

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {

        loadAppointments(currentPage);

    }, 400);

}
// =========================================
// INIT
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    if (!localStorage.getItem("access_token")) {
        window.location.href = "/login/";
        return;
    }

    loadAppointments(1);
});

// =========================================
// EXPORT GLOBAL
// =========================================

window.loadAppointments = loadAppointments;
window.updateStatus = updateStatus;
window.handleSearch = handleSearch;
window.filterByStatus = filterByStatus;