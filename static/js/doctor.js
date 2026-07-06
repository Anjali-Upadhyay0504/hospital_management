// =========================================
// DOCTOR DASHBOARD MODULE
// =========================================


// =========================================
// LOAD DASHBOARD SUMMARY
// =========================================
async function loadDoctorDashboard() {

    try {

        const response = await authFetch(
            `${BASE_URL}/api/dashboard/doctor/`
        );

        const data = await safeJson(response);

        const totalAppointments =
            document.getElementById("totalAppointments");

        const todayAppointments =
            document.getElementById("todayAppointments");

        const pendingAppointments =
            document.getElementById("pendingReports");


        if (totalAppointments) {
            totalAppointments.innerText =
                data.total_appointments || 0;
        }

        if (todayAppointments) {
            todayAppointments.innerText =
                data.today_appointments || 0;
        }

        if (pendingAppointments) {
            pendingAppointments.innerText =
                data.pending_appointments || 0;
        }

    }

    catch (error) {

        console.error(
            "Doctor dashboard error:",
            error
        );

        showToast(
            "Unable to load dashboard.",
            "error"
        );

    }

}



// =========================================
// INIT
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    // Dashboard page
    if (document.getElementById("totalAppointments")) {

        loadDoctorDashboard();

    }

    // Notification dropdown
    if (typeof loadNotifications === "function") {

        loadNotifications();

    }

});



// =========================================
// GLOBAL FUNCTIONS
// =========================================
window.loadDoctorDashboard = loadDoctorDashboard;