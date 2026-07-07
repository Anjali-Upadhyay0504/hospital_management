let currentPage = 1;
let currentSearch = "";

/* =========================================
        LOAD APPOINTMENTS
========================================= */

async function loadAppointments(page = 1) {

    currentPage = page;

    const search = getE1("searchInput")?.value.trim() || "";

    let url = `${BASE_URL}/api/appointments/?page=${page}`;

    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
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

        if (a.status === "pending") {
            actions = `
                <button class="btn btn-success btn-sm"
                    onclick="updateStatus(${a.id}, 'approved')">
                    Approve
                </button>

                <button class="btn btn-danger btn-sm"
                    onclick="updateStatus(${a.id}, 'rejected')">
                    Reject
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
                    <span class="badge bg-primary">${a.status}</span>
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


/* INIT */
document.addEventListener("DOMContentLoaded", () => {
    loadAppointments(1);
});
/* =========================================
        CANCEL APPOINTMENT
========================================= */

async function cancelAppointment(id) {

    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {

        const res = await authFetch(
            `${BASE_URL}/api/appointments/${id}/cancel/`,
            {
                method: "POST"
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

document.addEventListener("DOMContentLoaded", () => {

    if (typeof protectPage === "function") {
        protectPage("patient");
    }

    // Apply button
    getE1("filterBtn").addEventListener("click", () => {
        loadAppointments(1);
    });

    // Search on Enter
    getE1("searchInput").addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            loadAppointments(1);
        }
    });

    // Auto filter on status change
    getE1("statusFilter").addEventListener("change", () => {
        loadAppointments(1);
    });

    loadAppointments();

});