



getToken() 


/* =========================================
            SAFE JSON
========================================= */

// async function safeJson(res) {
//     try {
//         return await res.json();
//     } catch {
//         return null;
//     }
// }

/* =========================================
            FORMAT DATE
========================================= */

// function formatDate(date) {
//     return date
//         ? new Date(date).toLocaleString()
//         : "-";
// }

/* =========================================
        DASHBOARD COUNTERS
========================================= */

// function updateCounter(id, count) {

//     const el = document.getElementById(id);

//     if (el) {
//         el.innerText = count;
//     }

// }

/* =========================================
        LOAD AVAILABLE SLOTS
========================================= */

async function loadAvailableSlots() {

    const doctor = getE1("doctorSelect").value;
    const date = getE1("appointmentDate").value;
    const timeSelect = getE1("timeSlot");

    timeSelect.innerHTML = `<option value="">Select Available Time</option>`;

    if (!doctor || !date) return;

    try {

        const res = await authFetch(
            `${BASE_URL}/api/appointments/available-slots/?doctor=${doctor}&date=${date}`
        );

        const data = await safeJson(res);

        if (!res.ok) {
            showToast("Unable to load slots", "error");
            return;
        }

        if (!data?.slots?.length) {
            timeSelect.innerHTML += `<option disabled>No Slots Available</option>`;
            return;
        }

        data.slots.forEach(slot => {
            timeSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
        });

    } catch (err) {
        console.error(err);
        showToast("Server error", "error");
    }
}

/* =========================================
        BOOK APPOINTMENT
========================================= */
async function bookAppointment() {

    const doctor = getE1("doctorSelect").value;
    const date = getE1("appointmentDate").value;
    const time = getE1("timeSlot").value;
    const reason = getE1("reason").value.trim();

    if (!doctor || !date || !time || !reason) {
        showToast("Please fill all fields", "warning");
        return;
    }

    const appointment_date = `${date}T${time}:00`;

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
        showToast("Booking failed", "error");
        return;
    }

    showToast("Appointment Booked", "success");

    getE1("reason").value = "";
    getE1("appointmentDate").value = "";

    getE1("timeSlot").innerHTML =
        `<option value="">Select Available Time</option>`;

    $("#doctorSelect").val(null).trigger("change");

    loadAppointments();
}

/* =========================================
        SELECT2 AJAX
========================================= */

function initializeDoctorSelect() {

    const $doctor = $("#doctorSelect");
    if (!$doctor.length) return;
    if ($doctor.hasClass("select2-hidden-accessible")) return;

    $doctor.select2({

        width: "100%",
        placeholder: "Search Doctor",
        allowClear: true,

        ajax: {
            delay: 300,

            transport: async function (params, success, failure) {

                try {

                    const keyword = params.data.term || "";

                    const res = await authFetch(
                        `${BASE_URL}/api/doctor/?search=${encodeURIComponent(keyword)}`
                    );

                    const data = await safeJson(res);

                    const doctors = data?.results || data || [];

                    success({
                        results: doctors.map(doc => ({
                            id: doc.id,
                            text: `👨‍⚕️ Dr. ${doc.username} | ${doc.specialization} | ₹${doc.fee}`
                        }))
                    });

                } catch (err) {
                    console.error(err);
                    failure(err);
                }
            }
        }
    });

    $doctor.on("change", loadAvailableSlots);
    getE1("appointmentDate").addEventListener("change", loadAvailableSlots);
}

/* =========================================
        LOAD APPOINTMENTS
========================================= */

async function loadAppointments() {

    try {

        const res = await authFetch(`${BASE_URL}/api/appointments/`);
        const data = await safeJson(res);

        const appointments = data?.results || data || [];

        const table = getE1("appointmentTable");
        table.innerHTML = "";

        if (!appointments.length) {
            table.innerHTML = `<tr><td colspan="5" class="text-center py-5">No Appointments</td></tr>`;
            return;
        }

        appointments.forEach(a => {

            let badge = "bg-secondary";

            if (a.status === "confirmed") badge = "bg-primary";
            if (a.status === "completed") badge = "bg-success";
            if (a.status === "cancelled") badge = "bg-danger";
            if (a.status === "pending") badge = "bg-warning text-dark";

            let actions = "";

            if (a.status === "completed" && a.prescription_id) {
                actions += `<button class="btn btn-success btn-sm" onclick="viewPrescription(${a.prescription_id})">View</button>`;
            }

            if (a.status !== "cancelled" && a.status !== "completed") {
                actions += `<button class="btn btn-danger btn-sm" onclick="cancelAppointment(${a.id})">Cancel</button>`;
            }

            table.innerHTML += `
                <tr>
                    <td>${a.id}</td>
                    <td><strong>${a.doctor_name || a.doctor}</strong></td>
                    <td>${formatDate(a.appointment_date)}</td>
                    <td><span class="badge ${badge}">${a.status}</span></td>
                    <td>${actions}</td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
        showToast("Failed to load appointments", "error");
    }
}

/* =========================================
        CANCEL APPOINTMENT
========================================= */
async function cancelAppointment(id) {

    if (!confirm("Cancel this appointment?")) return;

    try {

        const res = await authFetch(
            `${BASE_URL}/api/appointments/${id}/cancel/`,
            {
                method: "POST"
            }
        );

        const data = await safeJson(res);

        if (!res.ok) {
            showToast(
                data?.error || "Unable to cancel appointment.",
                "error"
            );
            return;
        }

        showToast("Appointment Cancelled.", "success");
        loadAppointments();

    } catch (err) {

        console.error(err);
        showToast("Server error.", "error");

    }
}

/* =========================================
        LOAD PRESCRIPTIONS
========================================= */

async function loadPrescriptions() {

    try {

        const res = await authFetch(
            `${BASE_URL}/api/prescriptions/`
        );

        const data = await safeJson(res);

        const prescriptions =
            data?.results || data || [];

        

        const container =
            document.getElementById("prescriptionTable");

        container.innerHTML = "";

        if (!prescriptions.length) {

            container.innerHTML = `

                <div class="col-12">

                    <div class="text-center py-5">

                        <i class="bi bi-file-earmark-medical fs-1 text-muted"></i>

                        <br><br>

                        No Prescription Available

                    </div>

                </div>

            `;

            return;

        }

        prescriptions.forEach(p => {

            container.innerHTML += `

            <div class="col-md-6 col-lg-4 mb-4">

                <div class="card prescription-card h-100">

                    <div class="card-body">

                        <h5 class="mb-3">

                            👨‍⚕️ ${p.doctor_name}

                        </h5>

                        <p>

                            <strong>Date :</strong>

                            ${formatDate(p.created_at)}

                        </p>

                        <p>

                            <strong>Diagnosis :</strong>

                            ${p.diagnosis}

                        </p>

                        <button

                            class="btn btn-primary w-100"

                            onclick="viewPrescription(${p.id})">

                            View Prescription

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    }

    catch (err) {

        console.error(err);

        alert("Unable to load prescriptions.");

    }

}


/* =========================================
        VIEW PRESCRIPTION
========================================= */

async function viewPrescription(id) {

    try {

        const res = await authFetch(

            `${BASE_URL}/api/prescriptions/${id}/`

        );

        const data = await safeJson(res);

        if (!res.ok) {

            showToast(
                data?.error || "Unable to view prescription.",
                "error");

            return;

        }

        document.getElementById("mDoctor").innerHTML =
            data.doctor_name || "-";

        document.getElementById("mDate").innerHTML =
            formatDate(data.created_at);

        document.getElementById("mDiagnosis").innerHTML =
            data.diagnosis || "-";

        document.getElementById("mMedicines").innerHTML =
            data.medicines || "-";

        document.getElementById("mNotes").innerHTML =
            data.notes || "-";

        new bootstrap.Modal(
            document.getElementById("prescriptionModal")
        ).show();

    }

    catch (err) {

        console.error(err);

        showToast("Unable to load prescription.","error");

    }

}


/* =========================================
        PRINT PRESCRIPTION
========================================= */

function printPrescription() {

    const area =
        document.getElementById("printArea").innerHTML;

    const win = window.open("", "", "width=900,height=700");

    win.document.write(`

        <html>

        <head>

            <title>Prescription</title>

            <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
            rel="stylesheet">

            <style>

                body{

                    padding:30px;

                    font-family:Segoe UI;

                }

                h3{

                    text-align:center;

                    margin-bottom:30px;

                }

            </style>

        </head>

        <body>

            <h3>

                Hospital Prescription

            </h3>

            ${area}

        </body>

        </html>

    `);

    win.document.close();

    win.focus();

    win.print();

    win.close();

}
/* =========================================
        LOAD DASHBOARD
========================================= */

async function loadDashboard() {

    try {

        const res = await authFetch(
            `${BASE_URL}/api/dashboard/patient/`
        );

        console.log(res.status);
        const data = await safeJson(res);
        if (!res.ok) {
            showToast("Unable to load dashboard.", "error");
            return;
        }

        getE1("doctorCount").innerText = data.doctor_count;
        getE1("appointmentCount").innerText = data.appointment_count;
        getE1("prescriptionCount").innerText = data.prescription_count;
        getE1("notifyCount").innerText = data.notification_count;

    }

    catch (err) {

        console.error(err);

        showToast("Unable to load dashboard.", "error");

    }

}

/* =========================================
            AUTO REFRESH
========================================= */

function refreshDashboard() {
    loadDashboard();
    loadAppointments();
    loadPrescriptions();
    loadNotifications();

}

/* =========================================
        DOM READY
========================================= */

document.addEventListener("DOMContentLoaded", async function() {
    await protectPage("patient");
    loadDashboard();
    initializeDoctorSelect();
    
    loadAppointments();

    loadPrescriptions();

    loadNotifications();

    const date =
        document.getElementById("appointmentDate");

    if (date) {

        date.min =
            new Date()
                .toISOString()
                .split("T")[0];

    }

});

/* =========================================
        OPTIONAL AUTO REFRESH
========================================= */

// Refresh every 60 seconds

setInterval(() => {

    refreshDashboard();

}, 60000);