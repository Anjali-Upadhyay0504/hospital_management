/* =========================================
        LOAD APPOINTMENTS (PAGINATED)
========================================= */

/* =========================================
        LOAD APPOINTMENTS (PAGINATED + FILTER)
========================================= */

async function loadAppointments(page = 1) {

    try {

        // Search & Filter values
        const search = getE1("searchInput")?.value.trim() || "";
        const status = getE1("statusFilter")?.value || "";

        // Build URL
        let url = `${BASE_URL}/api/appointments/?page=${page}`;

        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        if (status) {
            url += `&status=${encodeURIComponent(status)}`;
        }

        const res = await authFetch(url);

        const data = await safeJson(res);

        if (!res.ok) {
            showToast(
                data?.detail ||
                data?.error ||
                "Failed to load appointments",
                "error"
            );
            return;
        }

        const appointments = data.results || [];

        renderAppointments(appointments);
        renderPagination(data);

    } catch (err) {

        console.error(err);

        showToast(
            "Server error while loading appointments",
            "error"
        );
    }
}

/* =========================================
        RENDER APPOINTMENTS TABLE
========================================= */

function renderAppointments(appointments) {

    const table = getE1("appointmentTable");
    table.innerHTML = "";

    if (!appointments.length) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4 text-muted">
                    No appointments found
                </td>
            </tr>
        `;
        return;
    }

    appointments.forEach(a => {

        let badge = "bg-secondary";

        if (a.status === "pending") badge = "bg-warning text-dark";
        if (a.status === "approved") badge = "bg-primary";
        if (a.status === "completed") badge = "bg-success";
        if (a.status === "cancelled") badge = "bg-danger";

        let actions = "";

        if (a.status !== "cancelled" && a.status !== "completed") {
            actions += `
                <button class="btn btn-sm btn-danger"
                    onclick="cancelAppointment(${a.id})">
                    Cancel
                </button>
            `;
        }

        if (a.status === "completed" && a.prescription_id) {
            actions += `
                <button class="btn btn-sm btn-success"
                    onclick="viewPrescription(${a.prescription_id})">
                    View
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
                    <span class="badge ${badge}">
                        ${a.status}
                    </span>
                </td>
                <td>${actions || "-"}</td>
            </tr>
        `;
    });
}


/* =========================================
        PAGINATION UI
========================================= */

function renderPagination(data) {

    const container = getE1("pagination");

    if (!container || !data.count) return;

    const totalPages = Math.ceil(data.count / 10);

    let html = "";

    for (let i = 1; i <= totalPages; i++) {

        html += `
            <button class="btn btn-sm btn-outline-primary m-1"
                onclick="loadAppointments(${i})">
                ${i}
            </button>
        `;
    }

    container.innerHTML = html;
}


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