



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


// ================
// appointmnet
// ===============
async function loadAppointments(view = "today") {

    const table = document.getElementById("appointmentTable");
    table.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;

    try {

        const response = await authFetch(
            `${BASE_URL}/api/appointments/?view=${view}`);

        const data = await safeJson(response);
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

            else if (item.status === "approved") {
                actions = `
                    <button class="btn btn-primary btn-sm"
                        onclick="openPrescriptionTab(${item.id})">
                        Prescription
                    </button>
                `;
            }

            else if (item.status === "completed") {
                actions = `<span class="badge bg-success">Completed</span>`;
            }

            rows += `
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
                    <td>${actions}</td>
                </tr>
            `;
        });

        table.innerHTML = rows;

    } catch (err) {
        console.error(err);
        table.innerHTML = `<tr><td class="text-danger text-center">Error loading appointments</td></tr>`;
    }
}


// ===============================
// UPDATE STATUS
// ===============================
async function updateStatus(id, statusValue) {

    try {

        const response = await authFetch(`${BASE_URL}/api/appointments/${id}/update_status/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                
            },
            body: JSON.stringify({ status: statusValue })
        });

        const data = await safeJson(response);

        if (!response.ok) {
            showToast(data?.detail || data?.error || "Failed to update status", "error");
            return;
        }

        showToast("Appointment status updated successfully", "success");

        await loadAppointments();

    } catch (err) {

        console.error(err);

        showToast("Error updating appointment status", "error");

    }
}



// ===============================
// LOAD APPROVED APPOINTMENTS
// ===============================
async function loadApprovedAppointments() {
 console.log("loadApprovedAppointments called");
    try {

        const response = await authFetch(`${BASE_URL}/api/appointments/`);

        const data = await safeJson(response);
        const appointments = data.results || data || [];
     
        const select = document.getElementById("appointmentSelect");

        select.innerHTML = `
            <option value="">Select Approved Appointment</option>
        `;

        appointments.forEach(item => {

            if (item.status === "approved") {

                select.innerHTML += `
                    <option value="${item.id}">
                        #${item.id} - ${item.patient_name}
                    </option>
                `;

            }

        });

    } catch (err) {

        console.error(err);

    }

}


// ===============================
// SAVE PRESCRIPTION
// ===============================
async function savePrescription() {

    const appointment = document.getElementById("appointmentSelect").value;
    const diagnosis = document.getElementById("diagnosis").value;
    const medicines = document.getElementById("medicines").value;
    const notes = document.getElementById("notes").value;

    if (!appointment || !diagnosis || !medicines) {
        showToast("Please fill all required fields.", "warning");
        return;
    }

    try {

        const response = await authFetch(`${BASE_URL}/api/prescriptions/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                appointment: Number(appointment),
                diagnosis: diagnosis.trim(),
                medicines: medicines.trim(),
                notes: notes.trim()
            })
        });

        const data = await safeJson(response);

        console.log(data);

        if (!response.ok) {
            showToast(
                data?.detail ||
                data?.error ||
                JSON.stringify(data) ||
                "Failed to save prescription",
                "error"
            );
            return;
        }

        showToast("Prescription Saved Successfully", "success");

        // Form Reset
        document.getElementById("appointmentSelect").value = "";
        document.getElementById("diagnosis").value = "";
        document.getElementById("medicines").value = "";
        document.getElementById("notes").value = "";

        // Refresh Data
        loadApprovedAppointments();
        loadAppointments();
        loadPrescriptions();

    } catch (error) {

        console.error(error);
        showToast("Network Error", "error");

    }
}
// ===============================
// PRESCRIPTIONS LIST
// ===============================
async function loadPrescriptions() {

    try {

        const response = await authFetch(`${BASE_URL}/api/prescriptions/`);

        const data = await safeJson(response);
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
                    <td>
                     <button
                class="btn btn-info btn-sm"
                onclick="viewPrescription(${p.id})">

                View

                </button>
               </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
    }
}


// ===============================
// VIEW PRESCRIPTION
// ===============================
async function viewPrescription(id) {

    try {

        const response = await authFetch(`${BASE_URL}/api/prescriptions/${id}/`);

        const data = await safeJson(response);

        console.log(data);

        if (!response.ok) {
        showToast(
            data?.detail || data?.error || "Unable to load prescription",
            "error"
        );
        return;
       }

        document.getElementById("viewPatient").textContent = data.patient_name;
        document.getElementById("viewDoctor").textContent = data.doctor_name;
        document.getElementById("viewDiagnosis").textContent = data.diagnosis;
        document.getElementById("viewMedicines").textContent = data.medicines;
        document.getElementById("viewNotes").textContent = data.notes || "-";
        document.getElementById("viewDate").textContent = formatDate(data.created_at);

        const modal = new bootstrap.Modal(
            document.getElementById("prescriptionModal")
        );

        modal.show();

    } catch (error) {

        console.error(error);
        showToast("Network Error", "error")

    }

}

// ===============================
// SCHEDULE
// ===============================
async function loadSchedules() {

    try {

        const response = await authFetch(`${BASE_URL}/api/schedule/`);

        const data = await safeJson(response);
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

        const response = await authFetch(`${BASE_URL}/api/schedule/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                day,
                start_time,
                end_time
            })
        });

        const data = await safeJson(response);

        if (!response.ok) {
            showToast(
                data?.detail || data?.error || JSON.stringify(data),
                "error"
            );
            return;
        }

        showToast("Schedule Added Successfully", "success");

        loadSchedules();

    } catch (error) {

        console.error(error);

        showToast("Network Error", "error");

    }
}
// ================
// open prescription
// ================
function openPrescriptionTab(appointmentId) {

    // Appointment tab hide
    document.getElementById("appointmentsTab").style.display = "none";

    // Schedule tab hide
    document.getElementById("scheduleTab").style.display = "none";

    // Prescription tab show
    document.getElementById("prescriptionTab").style.display = "block";

    // Dropdown reload
    loadApprovedAppointments().then(() => {

        document.getElementById("appointmentSelect").value = appointmentId;

    });

    // Existing prescriptions reload
    loadPrescriptions();
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
    if (tabName === "prescription") {
    loadApprovedAppointments();
    loadPrescriptions();
}
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

    if (!localStorage.getItem("access_token")) {
    window.location.href = "/login/";
    return;
}

    loadAppointments("all");
    loadSchedules();
    loadPrescriptions();
    loadNotifications();
});

function printPrescription() {
    window.print();
}
// expose
window.addSchedule = addSchedule;
window.loadSchedules = loadSchedules;
window.showTab = showTab;
window.updateStatus = updateStatus;

window.savePrescription = savePrescription;
window.loadApprovedAppointments = loadApprovedAppointments;
