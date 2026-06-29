const BASE_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access_token");

let statusChartInstance = null;

// =========================
// AUTH CHECK
// =========================
function checkAuth() {
    if (!token) {
        window.location.href = "/login/";
    }
}

// =========================
// SAFE FETCH JSON
// =========================
async function safeJson(response) {
    try {
        return await response.json();
    } catch (e) {
        console.error("Invalid JSON");
        return null;
    }
}

// =========================
// LOAD STATS (CARDS + CHARTS)
// =========================
async function loadStats() {

    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Dashboard API failed");
        }

        const data = await response.json();

        console.log("Dashboard Data:", data);

        // ================= CARDS =================
        document.getElementById("doctorsCount").innerText = data.total_doctors || 0;
        document.getElementById("patientsCount").innerText = data.total_patients || 0;
        document.getElementById("appointmentsCount").innerText = data.total_appointments || 0;
        document.getElementById("prescriptionsCount").innerText = data.total_prescriptions || 0;

        // ================= CHARTS =================
        renderStatusChart(data);

    } catch (error) {
        console.error(error);
        alert("Unable to load dashboard data");
    }
}

// =========================
// STATUS CHART (DOUGHNUT)
// =========================
function renderStatusChart(data) {

    const ctx = document.getElementById("statusChart");

    if (!ctx) return;

    // destroy old chart (important)
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    statusChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Doctors", "Patients", "Appointments", "Prescriptions"],
            datasets: [{
                data: [
                    data.total_doctors || 0,
                    data.total_patients || 0,
                    data.total_appointments || 0,
                    data.total_prescriptions || 0
                ],
                backgroundColor: ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }
    });
}

// =========================
// LOAD DOCTOR REQUESTS
// =========================
async function loadDoctorRequests() {

    try {

        const response = await fetch(`${BASE_URL}/api/doctor/pending_requests/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

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
                        <button class="btn btn-success btn-sm"
                            onclick="approveRequest(${item.id})">
                            Approve
                        </button>

                        <button class="btn btn-danger btn-sm ms-2"
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
// APPROVE REQUEST
// =========================
async function approveRequest(id) {

    const response = await fetch(`${BASE_URL}/api/doctor/${id}/approve_request/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    alert(data.message || data.error);

    loadDoctorRequests();
    loadStats();
}

// =========================
// REJECT REQUEST
// =========================
async function rejectRequest(id) {

    if (!confirm("Are you sure?")) return;

    const response = await fetch(`${BASE_URL}/api/doctor/${id}/reject_request/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    alert(data.message || data.error);

    loadDoctorRequests();
    loadStats();
}

// =========================
// LOGOUT
// =========================
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login/";
}

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", function () {

    checkAuth();
    loadStats();
    loadDoctorRequests();
});