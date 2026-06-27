const BASE_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");


// ==========================
// SAFE JSON
// ==========================
async function safeJson(response) {
    try {
        return await response.json();
    } catch (e) {
        console.error("Invalid JSON", e);
        return null;
    }
}


// ==========================
// FORMAT DATE
// ==========================
function formatDate(dateString) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
}


// ==========================
// LOAD DOCTORS
// ==========================
async function loadDoctors() {

    try {

        const res = await fetch(`${BASE_URL}/api/doctor/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await safeJson(res);

        const doctors = data?.results || data || [];

        const select = document.getElementById("doctorSelect");
        select.innerHTML = `<option value="">Select Doctor</option>`;

        doctors.forEach(d => {

            select.innerHTML += `
                <option value="${d.id}">
                    Dr. ${d.username} - ${d.specialization} - ₹${d.fee}
                </option>
            `;
        });

    } catch (err) {
        console.error(err);
        alert("Failed to load doctors");
    }
}


// ==========================
// BOOK APPOINTMENT
// ==========================
async function bookAppointment() {

    const doctor = document.getElementById("doctorSelect").value;
    const appointment_date = document.getElementById("appointmentDate").value;
    const reason = document.getElementById("reason").value;

    if (!doctor || !appointment_date || !reason) {
        alert("Fill all fields");
        return;
    }

    try {

        const res = await fetch(`${BASE_URL}/api/appointments/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                doctor,
                appointment_date,
                reason
            })
        });

        const data = await safeJson(res);

        if (!res.ok) {
            alert(JSON.stringify(data));
            return;
        }

        alert("Appointment booked successfully");

        loadAppointments();

    } catch (err) {
        console.error(err);
        alert("Booking failed");
    }
}


// ==========================
// LOAD APPOINTMENTS
// ==========================
async function loadAppointments() {

    try {

        const res = await fetch(`${BASE_URL}/api/appointments/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await safeJson(res);

        const appointments = data?.results || data || [];

        const table = document.getElementById("appointmentTable");
        table.innerHTML = "";

        if (appointments.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        No appointments found
                    </td>
                </tr>
            `;
            return;
        }

        appointments.forEach(a => {

            table.innerHTML += `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.doctor_name || a.doctor}</td>
                    <td>${formatDate(a.appointment_date)}</td>
                    <td>
                        <span class="badge bg-secondary">
                            ${a.status}
                        </span>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
        alert("Failed to load appointments");
    }
}


// ==========================
// LOAD PRESCRIPTIONS
// ==========================
async function loadPrescriptions() {

    const res = await fetch(`${BASE_URL}/api/prescriptions/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await safeJson(res);
    const prescriptions = data?.results || data || [];

    const container = document.getElementById("prescriptionContainer");
    container.innerHTML = "";

    if (!prescriptions.length) {
        container.innerHTML = `
            <p class="text-muted">No completed prescriptions yet</p>
        `;
        return;
    }

    prescriptions.forEach(p => {

        container.innerHTML += `
            <div class="col-md-6">

                <div class="card shadow-sm p-3">

                    <div class="d-flex justify-content-between">

                        <h6>Dr. ${p.doctor_name}</h6>

                        <span class="badge bg-success">
                            Completed
                        </span>

                    </div>

                    <hr>

                    <p><b>Diagnosis:</b> ${p.diagnosis}</p>

                    <p><b>Medicines:</b> ${p.medicines}</p>

                    <button class="btn btn-primary btn-sm mt-2"
                        onclick="viewPrescription(${p.id})">

                        View Prescription

                    </button>

                </div>

            </div>
        `;
    });
}
//===================
// BECOME DOCTOR REQUEST
// ==========================
async function requestDoctor() {

    const specialization = document.getElementById("specialization").value;
    const experience = document.getElementById("experience").value;
    const qualification = document.getElementById("qualification").value;
    const fee = document.getElementById("fee").value;

    if (!specialization || !experience || !qualification) {
        alert("Please fill all fields");
        return;
    }

    try {

        const res = await fetch(`${BASE_URL}/api/doctor/request_doctor/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                specialization,
                experience,
                qualification,
                fee
            })
        });

        const data = await safeJson(res);

        if (!res.ok) {
            alert(JSON.stringify(data));
            return;
        }

        document.getElementById("doctorRequestMessage").innerHTML =
            `<div class="alert alert-success">Request submitted successfully</div>`;

    } catch (err) {
        console.error(err);
        alert("Request failed");
    }
}


// ==========================
// SCROLL FUNCTIONS (FOR CARDS)
// ==========================
function goToBooking() {
    document.getElementById("doctorSelect").scrollIntoView({ behavior: "smooth" });
}

function goToAppointments() {
    document.getElementById("appointmentTable").scrollIntoView({ behavior: "smooth" });
}

function goToPrescriptions() {
    document.getElementById("prescriptionTable").scrollIntoView({ behavior: "smooth" });
}

let currentPrescription = null;
async function viewPrescription(id) {

    const res = await fetch(`${BASE_URL}/api/prescriptions/${id}/`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await res.json();

    document.getElementById("mDoctor").innerText = "Dr. " + data.doctor_name;
    document.getElementById("mDiagnosis").innerText = data.diagnosis;
    document.getElementById("mMedicines").innerText = data.medicines;
    document.getElementById("mNotes").innerText = data.notes || "-";
    document.getElementById("mDate").innerText = formatDate(data.created_at);

    new bootstrap.Modal(document.getElementById("prescriptionModal")).show();
}function printPrescription() {

    const printContent = document.getElementById("printArea").innerHTML;

    const win = window.open("", "", "width=900,height=650");

    win.document.write(`
        <html>
        <head>
            <title>Prescription</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h5 { color: #000; }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);

    win.document.close();
    win.print();
}
// ==========================
// LOGOUT
// ==========================
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/";
}


// ==========================
// INIT
// ==========================
loadDoctors();
loadAppointments();
loadPrescriptions();