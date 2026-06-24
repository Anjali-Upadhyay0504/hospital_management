const BASE_URL = "http://127.0.0.1:8000";


// ===============================
// TOKEN
// ===============================
function getToken() {
    return localStorage.getItem("access_token");
}


// ===============================
// HELPERS
// ===============================
function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
}

function getStatusBadge(status) {

    switch (status) {
        case "approved":
            return "bg-success";
        case "rejected":
            return "bg-danger";
        case "pending":
            return "bg-warning";
        case "completed":
            return "bg-primary";
        case "cancelled":
            return "bg-secondary";
        default:
            return "bg-dark";
    }
}


// ===============================
// APPOINTMENTS
// ===============================
async function loadAppointments() {

    const table = document.getElementById("appointmentTable");

    table.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">Loading...</td>
        </tr>
    `;

    try {

        const response = await fetch(`${BASE_URL}/api/appointments/`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("Failed to load appointments");
        }

        const appointments = Array.isArray(data)
            ? data
            : data.results || [];

        if (appointments.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No Appointments Found</td>
                </tr>
            `;
            return;
        }

        let rows = "";

        appointments.forEach(item => {

            rows += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.patient_name || item.patient}</td>
                    <td>${formatDate(item.appointment_date)}</td>
                    <td>${item.reason || "-"}</td>

                    <td>
                        <span class="badge ${getStatusBadge(item.status)}">
                            ${item.status}
                        </span>
                    </td>

                    <td>

                        <button class="btn btn-success btn-sm"
                            onclick="updateStatus(${item.id}, 'approved')">
                            Approve
                        </button>

                        <button class="btn btn-danger btn-sm"
                            onclick="updateStatus(${item.id}, 'rejected')">
                            Reject
                        </button>

                        <button class="btn btn-primary btn-sm"
                            onclick="createPrescription(${item.id})">
                            Prescription
                        </button>

                    </td>
                </tr>
            `;
        });

        table.innerHTML = rows;

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    Failed to load appointments
                </td>
            </tr>
        `;
    }
}


// ===============================
// UPDATE STATUS
// ===============================
async function updateStatus(id, statusValue) {

    try {

        const response = await fetch(
            `${BASE_URL}/api/appointments/${id}/update_status/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    status: statusValue
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Failed to update status");
            return;
        }

        alert("Status updated successfully");

        loadAppointments();

    } catch (error) {
        console.error(error);
        alert("Something went wrong");
    }
}


// ===============================
// PRESCRIPTION
// ===============================
async function createPrescription(appointmentId) {

    const diagnosis = prompt("Enter Diagnosis:");
    if (!diagnosis) return;

    const medicines = prompt("Enter Medicines:");
    if (!medicines) return;

    try {

        const response = await fetch(
            `${BASE_URL}/api/prescriptions/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    appointment: appointmentId,
                    diagnosis,
                    medicines
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || "Failed to create prescription");
            return;
        }

        alert("Prescription created successfully");

    } catch (error) {
        console.error(error);
        alert("Error creating prescription");
    }
}


// ===============================
// SCHEDULE
// ===============================
async function loadSchedules() {

    const table = document.getElementById("scheduleTable");

    try {

        const res = await fetch(`${BASE_URL}/api/schedule/`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await res.json();

        console.log("SCHEDULE API RESPONSE:", data);

        if (!res.ok) {
            throw new Error(data.detail || "Failed to load schedules");
        }

        // 🔥 HANDLE BOTH CASES (array OR paginated)
        const schedules = Array.isArray(data)
            ? data
            : data.results || [];

        if (schedules.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">No Schedule Found</td>
                </tr>
            `;
            return;
        }

        let rows = "";

        schedules.forEach(item => {
            rows += `
                <tr>
                    <td>${item.day}</td>
                    <td>${item.start_time}</td>
                    <td>${item.end_time}</td>
                </tr>
            `;
        });

        table.innerHTML = rows;

    } catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-danger">
                    Failed to load schedules
                </td>
            </tr>
        `;
    }
}


// ===============================
// TABS
// ===============================
function showTab(tabName) {

    document.getElementById("appointmentsTab").style.display = "none";
    document.getElementById("scheduleTab").style.display = "none";
    document.getElementById("prescriptionTab").style.display = "none";

    document.getElementById(tabName + "Tab").style.display = "block";

    if (tabName === "schedule") {
        loadSchedules();
    }

    if (tabName === "appointments") {
        loadAppointments();
    }
}


// ===============================
// LOGOUT
// ===============================
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login/";
}


// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    if (!getToken()) {
        window.location.href = "/login/";
        return;
    }

    loadAppointments();
});