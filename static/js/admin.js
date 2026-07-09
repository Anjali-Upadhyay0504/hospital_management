

let statusChartInstance = null;






// =========================
// async function loadStats() {

//     try {

//         const response = await authFetch(`${BASE_URL}/api/dashboard/admin/`);

//         if (!response.ok) throw new Error("Dashboard API failed");

//         const data = await safeJson(response);

//         if (!data) {
//             showToast("Invalid dashboard response", "error");
//             return;
//         }

//         document.getElementById("doctorsCount").innerText = data.total_doctors || 0;
//         document.getElementById("patientsCount").innerText = data.total_patients || 0;
//         document.getElementById("appointmentsCount").innerText = data.total_appointments || 0;
//         document.getElementById("prescriptionsCount").innerText = data.total_prescriptions || 0;

//         renderStatusChart(data);

//     } catch (error) {
//         console.error(error);
//         showToast("Unable to load dashboard", "error");
//     }
// }
async function loadAdminDashboard() {

    try {

        const response = await authFetch(`${BASE_URL}/api/dashboard/admin/`);
        const data = await safeJson(response);
         console.log(data);
        // cards update
        document.getElementById("doctorsCount").innerText =
            data.total_doctors || 0;

        document.getElementById("patientsCount").innerText =
            data.total_patients || 0;

        document.getElementById("appointmentsCount").innerText =
            data.total_appointments || 0;

        document.getElementById("prescriptionsCount").innerText =
            data.total_prescriptions || 0;

        document.getElementById("pendingAppointments").innerText =
            data.pending_appointments || 0;

        document.getElementById("approveAppointments").innerText =
            data.approved_appointments || 0;

        document.getElementById("rejectAppointments").innerText =
            data.rejected_appointments || 0;

        renderStatusChart(data);

    } catch (error) {

        
        showToast("Unable to load dashboard", "error");
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

        const response = await authFetch(`${BASE_URL}/api/doctor/pending_requests/`);

        const data = await safeJson(response);

        const requests = data.results || data || [];

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
        console.error("dashbaord error: ",error)
        console.error(error);
    }
}

// =========================
// APPROVE REQUEST
// =========================
async function approveRequest(id) {

    try {

        const response = await authFetch(
            `${BASE_URL}/api/doctor/${id}/approve_request/`,
            {
                method: "POST"
            }
        );

        const data = await safeJson(response);

        if (response.ok) {

            showToast(data?.message || "Doctor approved successfully", "success");

            loadDoctorRequests();
            loadStats();

        } else {

            showToast(data?.error || "Approval failed", "error");

        }

    } catch (error) {

        console.error(error);
        showToast("Server error", "error");

    }
}
// =========================
// REJECT REQUEST
// =========================
async function rejectRequest(id) {

    if (!confirm("Are you sure?")) return;

    try {

        const response = await authFetch(`${BASE_URL}/api/doctor/${id}/reject_request/`,
            {
                method : "POST"
            }
        );
          

        const data = await safeJson(response);

        if (response.ok) {

            showToast(data?.message || "Request rejected", "warning");

            loadDoctorRequests();
            loadAdminDashboard();

        } else {

            showToast(data?.error || "Reject failed", "error");

        }

    } catch (error) {

        console.error(error);
        showToast("Server error", "error");

    }
}
async function loadInvoices(){

    try{

        const response = await authFetch(
            `${BASE_URL}/api/invoices/`
        );


        const invoices = await response.json();


        const tbody = document.getElementById(
            "invoiceTableBody"
        );


        tbody.innerHTML = "";


        invoices.forEach(invoice => {


            tbody.innerHTML += `

            <tr>

                <td>${invoice.id}</td>

                <td>${invoice.patient_name}</td>

                <td>${invoice.doctor_name}</td>

                <td>₹${invoice.total_amount}</td>


                <td>
                    <span class="badge bg-info">
                        ${invoice.payment_status}
                    </span>
                </td>


                <td>

                ${
                    invoice.payment_status === "unpaid"

                    ?

                    `<button 
                    class="btn btn-success btn-sm"
                    onclick="markInvoicePaid(${invoice.id})">
                    Mark Paid
                    </button>`

                    :

                    "Paid"

                }


                </td>

                
                <td>
                ${
                    invoice.paid_at
                        ? new Date(invoice.paid_at).toLocaleDateString()
                        : "-"
                }
                </td>
           
            </tr>

            `;

        });


    }
    catch(error){

        console.log(
            "Invoice error",
            error
        );

    }

}

async function markInvoicePaid(id){


    const response = await authFetch(
        `${BASE_URL}/api/invoices/${id}/mark-paid/`,
        {
            method:"PATCH"
        }
    );


    const data = await response.json();


    alert(data.message);

// for refresh UI that's call again
    loadInvoices();

}


// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", async function () {

    await protectPage("admin");
    
    loadAdminDashboard();
    loadDoctorRequests();
    loadInvoices();
    loadNotifications();
});