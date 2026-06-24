const BASE_URL = "http://127.0.0.1:8000";


// ===============================
// GET TOKEN
// ===============================
function getToken() {
    return localStorage.getItem("access_token");
}


// ===============================
// LOAD APPOINTMENTS
// ===============================
async function loadAppointments() {

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

        const table = document.getElementById("appointmentTable");
        table.innerHTML = "";

        appointments.forEach(item => {

            table.innerHTML += `
                <tr>
                    <td>${item.id}</td>

                    <td>${item.patient_name || item.patient}</td>

                    <td>${formatDate(item.appointment_date)}</td>

                    <td>${item.reason || "-"}</td>

                    <td>
                        <span class="badge bg-secondary">
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

    } catch (error) {
        console.error(error);
        alert("Unable to load appointments");
    }
}


// ===============================
// UPDATE STATUS (APPROVE / REJECT)
// ===============================
async function updateStatus(appointmentId, statusValue) {

    try {

        const response = await fetch(
            `${BASE_URL}/api/appointments/${appointmentId}/update_status/`,
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
            alert(JSON.stringify(data));
            return;
        }

        alert("Status Updated Successfully");

        loadAppointments();

    } catch (error) {
        console.error(error);
        alert("Update Failed");
    }
}


// ===============================
// CREATE PRESCRIPTION
// ===============================
async function createPrescription(appointmentId) {

    const diagnosis = prompt("Enter Diagnosis");
    if (!diagnosis) return;

    const medicines = prompt("Enter Medicines");

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
                diagnosis: diagnosis,
                medicines: medicines
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        alert(JSON.stringify(data));
        return;
    }

    alert("Prescription Created Successfully");
}


// ===============================
// FORMAT DATE
// ===============================
function formatDate(dateString) {

    if (!dateString) return "-";

    return new Date(dateString).toLocaleString();
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
// INITIAL LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {

    if (!getToken()) {
        window.location.href = "/login/";
        return;
    }

    loadAppointments();
});