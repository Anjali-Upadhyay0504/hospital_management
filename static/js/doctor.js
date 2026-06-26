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
        case "approved": return "bg-success";
        case "rejected": return "bg-danger";
        case "pending": return "bg-warning";
        case "completed": return "bg-primary";
        case "cancelled": return "bg-secondary";
        default: return "bg-dark";
    }
}


// ===============================
// APPOINTMENTS
// ===============================
async function loadAppointments() {

    const table = document.getElementById("appointmentTable");

    table.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

    try {

        const res = await fetch(`${BASE_URL}/api/appointments/`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await res.json();
        const appointments = data.results || data || [];

        if (!appointments.length) {
            table.innerHTML = `<tr><td colspan="6" class="text-center">No Appointments Found</td></tr>`;
            return;
        }

        let rows = "";

        appointments.forEach(item => {

            let actions = "";

            if (item.status === "pending") {
                actions = `
                    <button class="btn btn-success btn-sm" onclick="updateStatus(${item.id}, 'approved')">Approve</button>
                    <button class="btn btn-danger btn-sm" onclick="updateStatus(${item.id}, 'rejected')">Reject</button>
                `;
            }

            if (item.status === "approved") {
                actions = `
                    <button class="btn btn-primary btn-sm" onclick="createPrescription(${item.id})">
                        Prescription
                    </button>
                `;
            }

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
                    <td>${actions}</td>
                </tr>
            `;
        });

        table.innerHTML = rows;

    } catch (err) {
        console.error(err);
        table.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Error loading appointments</td></tr>`;
    }
}


// ===============================
// UPDATE STATUS
// ===============================
async function updateStatus(id, statusValue) {

    try {

        const res = await fetch(`${BASE_URL}/api/appointments/${id}/update_status/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ status: statusValue })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.detail || data.error || "Failed");
            return;
        }

        alert("Status updated");
        loadAppointments();

    } catch (err) {
        console.error(err);
        alert("Error updating status");
    }
}


// ===============================
// PRESCRIPTION
// ===============================
async function createPrescription(appointmentId) {
    console.log(typeof appointmentId, appointmentId);


    const diagnosis = prompt("Enter Diagnosis:");
    const medicines = prompt("Enter Medicines:");

    if (!diagnosis || !medicines) {
        alert("Fields required");
        return;
    }

    try {

        const response = await fetch(`${BASE_URL}/api/prescriptions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                appointment: Number(appointmentId),
                diagnosis: diagnosis.trim(),
                medicines: medicines.trim()
            })
            
        });

        const data = await response.json();

        console.log("STATUS:", response.status);
        console.log("RESPONSE:", data);

        if (!response.ok) {
            alert(JSON.stringify(data));
            return;
        }

        alert("Prescription created successfully");

        loadAppointments();
        loadPrescriptions();

    } catch (error) {
        console.error(error);
        alert("Network error");
    }
}

// ===============================
// PRESCRIPTIONS LIST
// ===============================
async function loadPrescriptions() {

    try {

        const res = await fetch(`${BASE_URL}/api/prescriptions/`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await res.json();
        const prescriptions = data.results || data || [];

        const table = document.getElementById("prescriptionTable");
        table.innerHTML = "";

        prescriptions.forEach(p => {

            table.innerHTML += `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.patient_name}</td>
                    <td>${p.doctor_name}</td>
                    <td>${p.diagnosis}</td>
                    <td>${p.medicines}</td>
                    <td>${formatDate(p.created_at)}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
    }
}


// ===============================
// SCHEDULE
// ===============================
async function loadSchedules() {

    try {

        const res = await fetch(`${BASE_URL}/api/schedule/`, {
            headers: {
                "Authorization": `Bearer ${getToken()}`
            }
        });

        const data = await res.json();
        const schedules = data.results || data || [];

        const table = document.getElementById("scheduleTable");
        table.innerHTML = "";

        schedules.forEach(s => {

            table.innerHTML += `
                <tr>
                    <td>${s.day}</td>
                    <td>${s.start_time}</td>
                    <td>${s.end_time}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
    }
}


// ===============================
// ADD SCHEDULE
// ===============================
async function addSchedule() {

    const day = document.getElementById("scheduleDay").value;
    const start_time = document.getElementById("startTime").value;
    const end_time = document.getElementById("endTime").value;

    try {

        const res = await fetch(`${BASE_URL}/api/schedule/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({
                day,
                start_time,
                end_time
            })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(JSON.stringify(data));
            return;
        }

        alert("Schedule Added");
        loadSchedules();

    } catch (err) {
        console.error(err);
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

    if (tabName === "appointments") loadAppointments();
    if (tabName === "schedule") loadSchedules();
    if (tabName === "prescription") loadPrescriptions();
}


// ===============================
// LOGOUT
// ===============================
function logout() {
    localStorage.clear();
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
    loadSchedules();
    loadPrescriptions();
});


// expose
window.addSchedule = addSchedule;
window.loadSchedules = loadSchedules;
window.showTab = showTab;
window.updateStatus = updateStatus;
window.createPrescription = createPrescription;