async function loadPrescriptions() {

    try {

        const response = await authFetch(`${BASE_URL}/api/prescriptions/`);

        const data = await safeJson(response);

        if (!response.ok) {

            showToast("Unable to load prescriptions", "error");

            return;
        }

        const prescriptions = data.results || data;

        const tbody = document.getElementById("prescriptionTableBody");

        tbody.innerHTML = prescriptions.map(p => `
            <tr>

                <td>${formatDate(p.created_at)}</td>

                <td>${p.doctor_name}</td>

                <td>${p.diagnosis}</td>

                <td>

                    <button class="btn btn-primary btn-sm"
                            onclick="viewPrescription(${p.id})">

                        View

                    </button>

                </td>

            </tr>
        `).join("");

    }

    catch (err) {

        console.error(err);

        showToast("Network Error", "error");

    }

}
async function viewPrescription(id) {

    try {

        const response = await authFetch(`${BASE_URL}/api/prescriptions/${id}/`);

        const data = await safeJson(response);

        if (!response.ok) {

            showToast(
                data?.detail || data?.error || "Unable to load prescription",
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

        showToast("Network Error", "error");

    }

}
document.addEventListener("DOMContentLoaded", async () => {

    await protectPage("patient");

   
      if (document.getElementById("prescriptionTableBody")) {
        loadPrescriptions();
    }


});