const BASE_URL = "http://127.0.0.1:8000";

// ALWAYS get fresh token
function getToken() {
    return localStorage.getItem("access_token");
}

// ==========================
// SAFE JSON
// ==========================
async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

// ==========================
// FORMAT DATE
// ==========================
function formatDate(date) {
    return date ? new Date(date).toLocaleString() : "-";
}

// ==========================
// LOAD DOCTORS
// ==========================
async function loadDoctors() {

    const keyword = document.getElementById("doctorSearch").value;

    const res = await authFetch(
    `${BASE_URL}/api/doctor/?search=${encodeURIComponent(keyword)}`
     );

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
    const doctorSelect = document.getElementById("doctorSelect");
    const appointmentDate = document.getElementById("appointmentDate");

    doctorSelect.addEventListener("change", loadAvailableSlots);
    appointmentDate.addEventListener("change", loadAvailableSlots);
}

// ==========================
// LOAD SLOTS
// ==========================

async function loadAvailableSlots() {

    const doctor = document.getElementById("doctorSelect").value;
    const date = document.getElementById("appointmentDate").value;
    const timeSelect = document.getElementById("timeSlot");

    timeSelect.innerHTML = `<option value="">Select Available Time</option>`;

    if (!doctor || !date) {
        return;
    }

    const res = await fetch(
        `${BASE_URL}/api/appointments/available-slots/?doctor=${doctor}&date=${date}`,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

    const data = await safeJson(res);

    console.log(data);

    if (!res.ok) {
        alert("Unable to load slots");
        return;
    }

    data.slots.forEach(slot => {

        timeSelect.innerHTML += `
            <option value="${slot}">
                ${slot}
            </option>
        `;
    });
}
// ==========================
// BOOK APPOINTMENT
// ==========================
async function bookAppointment() {

    const doctor = document.getElementById("doctorSelect").value;
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("timeSlot").value;
    const reason = document.getElementById("reason").value;

    if (!doctor || !date || !time || !reason) {
        alert("Fill all fields");
        return;
    }

    const appointment_date = `${date}T${time}:00`;

    console.log("Sending:", {
        doctor,
        appointment_date,
        reason
    });

    const res = await authFetch(`${BASE_URL}/api/appointments/`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        doctor,
        appointment_date,
        reason
    })
  });

    const data = await safeJson(res);

    if (!res.ok) {
        console.log(data);
        alert(JSON.stringify(data));
        return;
    }

    alert("Appointment booked");
    loadAppointments();
}

// ==========================
// LOAD APPOINTMENTS
// ==========================
async function loadAppointments() {

    const res = await fetch(`${BASE_URL}/api/appointments/`, {
        headers: {
            Authorization: `Bearer ${getToken()}`
        }
    });

    const data = await safeJson(res);
    const appointments = data?.results || data || [];

    const table = document.getElementById("appointmentTable");
    table.innerHTML = "";

    if (!appointments.length) {
        table.innerHTML = `<tr><td colspan="4" class="text-center">No appointments</td></tr>`;
        return;
    }

    appointments.forEach(a => {

        let btn = "";

    
        if (a.status === "completed" && a.prescription_id) {
        btn = `
        <button class="btn btn-sm btn-success"
            onclick="viewPrescription(${a.prescription_id})">
            View Prescription
        </button>
    `;
        }
       if (a.status !== "cancelled" && a.status !== "completed" && !a.prescription_id) {
            btn += `
                <button class="btn btn-sm btn-danger"
                    onclick="cancelAppointment(${a.id})">
                    Cancel
                </button>
            `;
        }


        table.innerHTML += `
            <tr>
                <td>${a.id}</td>
                <td>${a.doctor_name || a.doctor}</td>
                <td>${formatDate(a.appointment_date)}</td>
                <td>
                    <span class="badge bg-secondary">${a.status}</span>
                </td>
                <td>${btn}</td>
            </tr>
        `;
    });
}
// ================
// Canclled appointment
// ===================
async function cancelAppointment(id) {

    try {
        const res = await authFetch(`${BASE_URL}/api/appointments/${id}/cancel/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
               }
            
            
        });
    
        const data = await res.json();

        console.log("STATUS:", res.status);
        console.log("RESPONSE:", data);

        if (!res.ok) {
            alert(data.error || JSON.stringify(data));
            return;
        }

        alert("Cancelled successfully");
        loadAppointments();

    } catch (err) {
        console.error("ERROR:", err);
        alert("Network error");
    }
}

// ==========================
// LOAD PRESCRIPTIONS (FIXED UI)
// ==========================
async function loadPrescriptions() {

    const res = await authFetch(`${BASE_URL}/api/prescriptions/`);
    const data = await safeJson(res);
    const prescriptions = data?.results || data || [];
    console.log("Status:", res.status);
    console.log("Prescriptions:", prescriptions);
    const container = document.getElementById("prescriptionTable");
    container.innerHTML = "";

    if (!prescriptions.length) {
        container.innerHTML = `<p class="text-muted">No prescriptions yet</p>`;
        return;
    }

    prescriptions.forEach(p => {

        container.innerHTML += `
            <div class ="col-md-6">
                <div class="card p-3 shadow-sm">

                    <h6>Dr. ${p.doctor_name}</h6>

                    <p><b>Diagnosis:</b> ${p.diagnosis}</p>
                    <p><b>Medicines:</b> ${p.medicines}</p>

                    <button class="btn btn-primary btn-sm"
                        onclick="viewPrescription(${p.id})">
                        View
                    </button>

                </div>
            </div>
        `;
    });
}

function sendDoctorRequest() {

    const data = {
        specialization: document.getElementById("reqSpecialization").value,
        experience: document.getElementById("reqExperience").value,
        qualification: document.getElementById("reqQualification").value,
        fee: document.getElementById("reqFee").value
    };

    authFetch(`${BASE_URL}/api/doctor/request_doctor/`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        
    },
    body: JSON.stringify(data)
   })
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            alert(data.error);
        } else {
            alert("Doctor request submitted successfully!");
        }

})
.catch(err => {
    console.error(err);
    alert("Something went wrong!");
});
}
// ==========================
// VIEW PRESCRIPTION MODAL
// ==========================
async function viewPrescription(id) {

    const res = await authFetch(`${BASE_URL}/api/prescriptions/${id}/`);

    const data = await safeJson(res);

    if (!res.ok) {
        alert("Failed to load prescription");
        return;
    }

    document.getElementById("mDoctor").innerText = "Dr. " + data.doctor_name;
    document.getElementById("mDiagnosis").innerText = data.diagnosis;
    document.getElementById("mMedicines").innerText = data.medicines;
    document.getElementById("mNotes").innerText = data.notes || "-";
    document.getElementById("mDate").innerText = formatDate(data.created_at);

    new bootstrap.Modal(document.getElementById("prescriptionModal")).show();
}
function scrollToSection(id) {

    const el = document.getElementById(id);

    console.log("Scrolling to:", id, el); // DEBUG

    if (!el) {
        alert("Section not found: " + id);
        return;
    }

    el.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
// ==========================
// PRINT
// ==========================
function printPrescription() {

    const printContent = document.getElementById("printArea").innerHTML;

    const win = window.open("", "", "width=900,height=650");

    win.document.write(`
        <html>
        <body>${printContent}</body>
        </html>
    `);

    win.print();
}




// ==========================
// INIT
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    // load data functions
    loadAppointments();
    loadPrescriptions();
    loadNotifications();

    console.log("jQuery:", $);
    console.log("Select:", $("#doctorSelect"));
    console.log("Select2:", $.fn.select2);

    // Prevent double initialization
    const $doctor = $("#doctorSelect");

    if ($doctor.length > 0 && !$doctor.hasClass("select2-hidden-accessible")) {

        $doctor.select2({
            placeholder: "Search Doctor",
            width: "100%",

            ajax: {
                transport: async function (params, success, failure) {
                    try {

                        const keyword = params.data.term || "";

                        const response = await authFetch(
                            `${BASE_URL}/api/doctor/?search=${encodeURIComponent(keyword)}`
                        );

                        const data = await safeJson(response);

                        success({
                            results: data.map(doc => ({
                                id: doc.id,
                                text: `Dr. ${doc.username}  - ${doc.specialization} - ${doc.fee}`
                            }))
                        });

                    } catch (err) {
                        console.error("Doctor API error:", err);
                        failure(err);
                    }
                },

                delay: 300
            }
        });

    }

});