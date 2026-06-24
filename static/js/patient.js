const BASE_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");


// ==========================
// Helper: Safe JSON parser
// ==========================
async function safeJson(response) {
    try {
        return await response.json();
    } catch (e) {
        console.error("Invalid JSON response", e);
        return null;
    }
}


// ==========================
// Load Doctors
// ==========================
async function loadDoctors() {

    try {

        const response = await fetch(
            `${BASE_URL}/api/doctor/list/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await safeJson(response);

        const doctors = Array.isArray(data)
            ? data
            : data?.results || [];

        const select = document.getElementById("doctorSelect");

        select.innerHTML = '<option value="">Select Doctor</option>';

        doctors.forEach(doctor => {

            select.innerHTML += `
                <option value="${doctor.id}">
                    Dr. ${doctor.username} (${doctor.specialization || "N/A"})
                </option>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("Unable to load doctors");
    }
}


// ==========================
// Book Appointment
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

        const response = await fetch(
            `${BASE_URL}/api/appointments/`,
            {
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
            }
        );

        const data = await safeJson(response);

        if (!response.ok) {
            alert(JSON.stringify(data));
            return;
        }

        alert("Appointment Booked Successfully");

        loadAppointments();

    } catch (error) {
        console.error(error);
        alert("Booking Failed");
    }
}


// ==========================
// Load Appointments
// ==========================
async function loadAppointments() {

    try {

        const response = await fetch(
            `${BASE_URL}/api/appointments/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await safeJson(response);

        const appointments = Array.isArray(data)
            ? data
            : data?.results || [];

        const table = document.getElementById("appointmentTable");

        table.innerHTML = "";

        appointments.forEach(item => {

            table.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.doctor_name || item.doctor}</td>
                    <td>${formatDate(item.appointment_date)}</td>
                    <td>${item.status}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("Unable to load appointments");
    }
}


// ==========================
// Load Prescriptions
// ==========================
async function loadPrescriptions() {

    try {

        const response = await fetch(
            `${BASE_URL}/api/prescriptions/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await safeJson(response);

        const prescriptions = Array.isArray(data)
            ? data
            : data?.results || [];

        const table = document.getElementById("prescriptionTable");

        table.innerHTML = "";

        prescriptions.forEach(item => {

            table.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.doctor_name || "N/A"}</td>
                    <td>${item.diagnosis || "N/A"}</td>
                    <td>${item.medicines || "N/A"}</td>
                </tr>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("Unable to load prescriptions");
    }
}


// ==========================
// Logout
// ==========================
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/";
}


// ==========================
// Format Date
// ==========================
function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
}


// ==========================
// Initial Load
// ==========================
loadDoctors();
loadAppointments();
loadPrescriptions();