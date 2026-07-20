let currentPage = 1;
let currentSearch = "";
function getStatusBadge(status) {
    switch (status) {
        case "approved":
            return "bg-success";

        case "rejected":
            return "bg-danger";

        case "pending":
            return "bg-warning text-dark";

        case "completed":
            return "bg-primary";

        case "cancelled":
            return "bg-secondary";   // Grey

        default:
            return "bg-dark";
    }
}
/* =========================================
        LOAD APPOINTMENTS
========================================= */

async function loadAppointments(page = 1) {

    currentPage = page;

    const search = getE1("searchInput")?.value.trim() || "";
    const status = getE1("statusFilter")?.value || "";

    let url = `${BASE_URL}/api/appointments/?page=${page}`;

    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
    url += `&status=${status}`;
    }

    try {

        const res = await authFetch(url);
        const data = await safeJson(res);

        if (!res.ok) {
            showToast("Failed to load", "error");
            return;
        }

        renderAppointments(data.results || []);
        renderPagination(data);

    } catch (err) {
        console.error(err);
    }
}


/* =========================================
        RENDER TABLE
========================================= */

function renderAppointments(list) {

    const table = getE1("appointmentTable");
    table.innerHTML = "";

    if (!list.length) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">No Data</td>
            </tr>
        `;
        return;
    }

    list.forEach(a => {

        let actions = "";

            if (a.status === "pending" || a.status === "approved") {
            actions = `
                <button class="btn btn-danger btn-sm"
                    onclick="cancelAppointment(${a.id})">
                    Cancel
                </button>
            `;
        }

        table.innerHTML += `
            <tr>
                <td>${a.id}</td>
                <td>${a.doctor_name}</td>
                <td>${a.doctor_specialization}</td>
                <td>${formatDate(a.appointment_date)}</td>
                <td>                               
                <span class="badge ${getStatusBadge(a.status)}">
                    ${a.status}
                </span>
            
                </td>
                <td>${actions || "-"}</td>
            </tr>
        `;
    });
}


/* =========================================
        PAGINATION (SAME PATIENT STYLE)
========================================= */

function renderPagination(data) {

    const container = getE1("pagination");

    if (!container || !data.count) return;

    const totalPages = Math.ceil(data.count / 10);

    let html = "";

    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button class="btn btn-sm btn-outline-primary m-1
                ${i === currentPage ? 'active' : ''}"
                onclick="loadAppointments(${i})">
                ${i}
            </button>
        `;
    }

    container.innerHTML = html;
}
let searchTimer = null;

getE1("searchInput").addEventListener("input", () => {

    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
        loadAppointments(1);
    }, 400);

});

/* INIT */
// document.addEventListener("DOMContentLoaded", () => {
//     loadAppointments(1);
// });
/* =========================================
        CANCEL APPOINTMENT
========================================= */

async function cancelAppointment(id) {

    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {

        const res = await authFetch(
            `${BASE_URL}/api/appointments/${id}/cancel/`,
            {
                method: "PATCH"
            }
        );

        const data = await safeJson(res);

        if (!res.ok) {
            showToast(data?.error || "Cancel failed", "error");
            return;
        }

        showToast("Appointment cancelled", "success");
        loadAppointments();

    } catch (err) {
        console.error(err);
        showToast("Server error", "error");
    }
}


/* =========================================
        INITIAL LOAD
========================================= */
document.addEventListener("DOMContentLoaded", async () => {

    await protectPage("patient");

    loadAppointments(1);

    getE1("filterBtn").addEventListener("click", () => {
        loadAppointments(1);
    });

    getE1("searchInput").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            loadAppointments(1);
        }
    });

    getE1("statusFilter").addEventListener("change", () => {
        loadAppointments(1);
    });

});