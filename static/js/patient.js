/* =========================================
        PATIENT DASHBOARD JS (CLEAN)
========================================= */

/* GLOBAL CHECK */
if (!window.BASE_URL) {
    window.BASE_URL = "http://127.0.0.1:8000";
}

/* =========================================
        LOAD DASHBOARD
========================================= */
async function loadDashboard() {

    try {

        const res = await authFetch(`${BASE_URL}/api/dashboard/patient/`);
        const data = await safeJson(res);

        if (!res.ok) {
            showToast("Unable to load dashboard", "error");
            return;
        }

        // =========================
        // COUNTERS
        // =========================
        getE1("doctorCount").innerText = data.doctor_count || 0;
        getE1("appointmentCount").innerText = data.appointment_count || 0;
        getE1("prescriptionCount").innerText = data.prescription_count || 0;
        getE1("notifyCount").innerText = data.notification_count || 0;

        // =========================
        // RECENT APPOINTMENTS
        // =========================
        renderRecentAppointments(data.recent_appointments || []);

        // =========================
        // NEXT APPOINTMENT
        // =========================
        renderNextAppointment(data.next_appointment);

    } catch (err) {
        console.error(err);
        showToast("Dashboard load failed", "error");
    }
}


/* =========================================
        RECENT APPOINTMENTS UI
========================================= */
function renderRecentAppointments(appointments) {

    const container = getE1("recentAppointments");
    if (!container) return;

    if (!appointments.length) {
        container.innerHTML = `
            <div class="text-muted text-center">
                No recent appointments
            </div>
        `;
        return;
    }

    container.innerHTML = appointments.map(a => `
        <div class="border rounded p-2 mb-2">
            <strong>Dr. ${a.doctor__user__username || "N/A"}</strong>
            <br>
            <small>
                ${formatDate(a.appointment_date)} • ${a.status}
            </small>
        </div>
    `).join("");
}


/* =========================================
        NEXT APPOINTMENT UI
========================================= */
function renderNextAppointment(next) {

    const box = getE1("nextAppointment");
    if (!box) return;

    if (!next) {

        box.innerHTML = `
            <div class="text-center">
                <i class="bi bi-calendar-x fs-1 text-muted"></i>
                <h5 class="mt-3">No Upcoming Appointment</h5>
            </div>
        `;

        return;
    }

    box.innerHTML = `
        <h5>Dr. ${next.doctor__user__username || "N/A"}</h5>
        <p>${formatDate(next.appointment_date)}</p>
        <span class="badge bg-success">${next.status}</span>
    `;
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            doctor,
            appointment_date,
            reason
        })
    });

    const data = await safeJson(res);

    if (!res.ok) {
        showToast(data?.error || "Booking failed", "error");
        return;
    }

    showToast("Appointment booked successfully", "success");

    // reset form
    getE1("reason").value = "";
    getE1("appointmentDate").value = "";
    getE1("timeSlot").innerHTML = `<option value="">Select Available Time</option>`;
    $("#doctorSelect").val(null).trigger("change");

    loadDashboard();
}


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

        console.log("SLOTS API RESPONSE:", data); // 🔥 DEBUG IMPORTANT

        if (!res.ok) {
            showToast(data?.error || "Unable to load slots", "error");
            return;
        }

        const slots = data.slots || [];

        if (!Array.isArray(slots) || slots.length === 0) {
            timeSelect.innerHTML += `<option disabled>No slots available</option>`;
            return;
        }

        slots.forEach(slot => {
            timeSelect.innerHTML += `<option value="${slot}">${slot}</option>`;
        });

    } catch (err) {
        console.error(err);
        showToast("Server error", "error");
    }
}
async function initializeDoctorSelect() {

    const select = document.getElementById("doctorSelect");

    const response = await authFetch("/api/doctor/");

    const data = await response.json();

    if (!response.ok) {
        console.error("API Error:", data);
        return;
    }

    const doctors = data.results || data;

    if (!Array.isArray(doctors)) {
        console.error("Invalid response:", doctors);
        return;
    }

    select.innerHTML = "";

   doctors.forEach(doc => {

    const option = document.createElement("option");
    option.value = doc.id;

    const name =
        doc.user?.username ||   // case 1
        doc.username ||         // case 2
        "Unknown Doctor";
    const fee = doc.fee || "NA";
    const specialization = doc.specialization || "NA";
    option.textContent = `${name} | ${specialization} | ${fee}`;

    select.appendChild(option);
});

}
/* =========================================
        INIT
========================================= */
document.addEventListener("DOMContentLoaded", async function () {

    await protectPage("patient");

    loadDashboard();
    initializeDoctorSelect();
    loadNotifications();
    getE1("doctorSelect").addEventListener("change", loadAvailableSlots);

    // Date change pe slots reload
    getE1("appointmentDate").addEventListener("change", loadAvailableSlots);

    // date restriction
    const date = getE1("appointmentDate");
    if (date) {
        date.min = new Date().toISOString().split("T")[0];
    }

});