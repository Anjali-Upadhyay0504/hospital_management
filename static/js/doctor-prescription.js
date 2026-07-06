


// =========================================
// LOAD APPROVED APPOINTMENTS
// =========================================
async function loadApprovedAppointments() {

    const select = document.getElementById("appointmentSelect");

    if (!select) return;

    select.innerHTML = `
        <option value="">
            Loading...
        </option>
    `;

    try {

        const response = await authFetch(
            `${BASE_URL}/api/appointments/`
        );

        const data = await safeJson(response);

        const appointments = data.results || data || [];

        select.innerHTML = `
            <option value="">
                Select Approved Appointment
            </option>
        `;

        const approvedAppointments = appointments.filter(
            item => item.status === "approved"
        );

        if (!approvedAppointments.length) {

            select.innerHTML = `
                <option value="">
                    No Approved Appointments
                </option>
            `;

            return;
        }

        approvedAppointments.forEach(item => {

            select.innerHTML += `
                <option value="${item.id}">
                    #${item.id} - ${item.patient_name}
                </option>
            `;

        });

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to load approved appointments.",
            "error"
        );

    }

}



// =========================================
// SAVE PRESCRIPTION
// =========================================
async function savePrescription() {

    const appointment =
        document.getElementById("appointmentSelect").value;

    const diagnosis =
        document.getElementById("diagnosis").value.trim();

    const medicines =
        document.getElementById("medicines").value.trim();

    const notes =
        document.getElementById("notes").value.trim();


    if (!appointment || !diagnosis || !medicines) {

        showToast(
            "Please fill all required fields.",
            "warning"
        );

        return;

    }

    try {

        const response = await authFetch(

            `${BASE_URL}/api/prescriptions/`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify({

                    appointment: Number(appointment),

                    diagnosis,

                    medicines,

                    notes

                })

            }

        );


        const data = await safeJson(response);


        if (!response.ok) {

            showToast(

                data?.detail ||

                data?.error ||

                JSON.stringify(data) ||

                "Failed to save prescription",

                "error"

            );

            return;

        }


        showToast(

            "Prescription Saved Successfully",

            "success"

        );


        // Reset Form

        document.getElementById("appointmentSelect").value = "";

        document.getElementById("diagnosis").value = "";

        document.getElementById("medicines").value = "";

        document.getElementById("notes").value = "";


        // Reload Data

        await loadApprovedAppointments();

        await loadPrescriptions();

    }

    catch (error) {

        console.error(error);

        showToast(

            "Network Error",

            "error"

        );

    }

}
//// =========================================
// LOAD PRESCRIPTIONS
// =========================================
async function loadPrescriptions() {

    const table = document.getElementById("prescriptionTable");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="7" class="text-center">
                Loading...
            </td>
        </tr>
    `;

    try {

        const response = await authFetch(
            `${BASE_URL}/api/prescriptions/`
        );

        const data = await safeJson(response);

        const prescriptions = data.results || data || [];

        if (!response.ok) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-danger text-center">
                        Failed to load prescriptions
                    </td>
                </tr>
            `;

            return;

        }

        if (!prescriptions.length) {

            table.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        No Prescriptions Found
                    </td>
                </tr>
            `;

            return;

        }

        let rows = "";

        prescriptions.forEach(p => {

            rows += `

                <tr>

                    <td>${p.id}</td>

                    <td>${p.patient_name}</td>

                    <td>${p.doctor_name}</td>

                    <td>${p.diagnosis}</td>

                    <td>${p.medicines}</td>

                    <td>${formatDate(p.created_at)}</td>

                    <td>

                        <button
                            class="btn btn-info btn-sm"
                            onclick="viewPrescription(${p.id})">

                            View

                        </button>

                    </td>

                </tr>

            `;

        });

        table.innerHTML = rows;

    }

    catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="7"
                    class="text-danger text-center">

                    Error Loading Prescriptions

                </td>
            </tr>
        `;

    }

}



// =========================================
// VIEW PRESCRIPTION
// =========================================
async function viewPrescription(id) {

    try {

        const response = await authFetch(
            `${BASE_URL}/api/prescriptions/${id}/`
        );

        const data = await safeJson(response);

        if (!response.ok) {

            showToast(

                data?.detail ||

                data?.error ||

                "Unable to load prescription",

                "error"

            );

            return;

        }

        document.getElementById("viewPatient").textContent =
            data.patient_name;

        document.getElementById("viewDoctor").textContent =
            data.doctor_name;

        document.getElementById("viewDiagnosis").textContent =
            data.diagnosis;

        document.getElementById("viewMedicines").textContent =
            data.medicines;

        document.getElementById("viewNotes").textContent =
            data.notes || "-";

        document.getElementById("viewDate").textContent =
            formatDate(data.created_at);

        const modal = new bootstrap.Modal(
            document.getElementById("prescriptionModal")
        );

        modal.show();

    }

    catch (error) {

        console.error(error);

        showToast(

            "Network Error",

            "error"

        );

    }

}



// =========================================
// PRINT PRESCRIPTION
// =========================================
function printPrescription() {

    window.print();

}



// =========================================
// INIT
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("appointmentSelect")) {

        loadApprovedAppointments();

    }

    if (document.getElementById("prescriptionTable")) {

        loadPrescriptions();

    }

});



// =========================================
// GLOBAL FUNCTIONS
// =========================================
window.loadApprovedAppointments = loadApprovedAppointments;

window.savePrescription = savePrescription;

window.loadPrescriptions = loadPrescriptions;

window.viewPrescription = viewPrescription;

window.printPrescription = printPrescription;