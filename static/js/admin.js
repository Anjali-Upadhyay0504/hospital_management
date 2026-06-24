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

    checkAuth();   // 👈 IMPORTANT
    loadStats();

});