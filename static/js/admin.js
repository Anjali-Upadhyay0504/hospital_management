const BASE_URL = "http://127.0.0.1:8000";

const token = localStorage.getItem("access_token");


// =========================
// Check Auth (IMPORTANT)
// =========================
function checkAuth() {

    if (!token) {
        window.location.href = "/login/";
    }
}


// =========================
// Load Dashboard Stats
// =========================
async function loadStats() {

    try {

        const response = await fetch(
            `${BASE_URL}/api/dashboard/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load dashboard");
        }

        const data = await response.json();

        console.log("Dashboard Data:", data);

        document.getElementById("doctorsCount").innerText =
            data.total_doctors || 0;

        document.getElementById("patientsCount").innerText =
            data.total_patients || 0;

        document.getElementById("appointmentsCount").innerText =
            data.total_appointments || 0;

        document.getElementById("prescriptionsCount").innerText =
            data.total_prescriptions || 0;

    } catch (error) {

        console.error(error);
        alert("Unable to load dashboard data");
    }
}
// =========================
// Load Doctor Requests
// =========================
async function loadDoctorRequests() {

    try {

        const response = await fetch(
            `${BASE_URL}/api/doctor/pending_requests/`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const requests = await response.json();

        const table = document.getElementById("doctorRequestTable");

        table.innerHTML = "";

        requests.forEach(item => {

            table.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.username}</td>
                    <td>${item.specialization}</td>
                    <td>${item.experience}</td>
                    <td>${item.qualification}</td>
                    <td>${item.status}</td>
                    <td>
                        <button
                            class="btn btn-success btn-sm"
                            onclick="approveRequest(${item.id})">
                            Approve
                        </button>
                        <button
                            class="btn btn-danger btn-sm ms-2"
                            onclick="rejectRequest(${item.id})">

                            Reject

                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (error) {

        console.error(error);

    }

}


// =========================
// Approve Doctor Request
// =========================
async function approveRequest(id) {

    const response = await fetch(
        `${BASE_URL}/api/doctor/${id}/approve_request/`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    const data = await response.json();

    alert(data.message || data.error);

    loadDoctorRequests();
    loadStats();

}


// =========================
// Reject Doctor Request
// =========================
async function rejectRequest(id) {

    if (!confirm("Are you sure you want to reject this request?")) {
        return;
    }

    try {

        const response = await fetch(
            `${BASE_URL}/api/doctor/${id}/reject_request/`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        alert(data.message || data.error);

        // Refresh table and dashboard
        loadDoctorRequests();
        loadStats();

    } catch (error) {

        console.error(error);
        alert("Unable to reject request");

    }
}
// =========================
// Logout
// =========================
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/";
}


// =========================
// Page Load
// =========================
document.addEventListener("DOMContentLoaded", function () {

    checkAuth();

    loadStats();

    loadDoctorRequests();

});

