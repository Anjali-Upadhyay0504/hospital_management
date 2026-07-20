async function loadPrescriptions() {

    try {

        const response = await authFetch(
            `${BASE_URL}/api/prescriptions/`
        );

        const data = await safeJson(response);

        if (!response.ok) {

            showToast(
                data?.detail || "Unable to load prescriptions",
                "error"
            );

            return;
        }

        const prescriptions = data.results || data;

        const tbody = document.getElementById(
            "prescriptionTableBody"
        );

        if (prescriptions.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        No prescriptions found.
                    </td>
                </tr>
            `;

            return;

        }

        tbody.innerHTML = prescriptions.map(p => `

            <tr>

                <td>${formatDate(p.created_at)}</td>

                <td>${p.doctor_name}</td>

                <td>${p.diagnosis}</td>

                <td>

                    <button
                        class="btn btn-primary btn-sm"
                        onclick="viewPrescription(${p.id})">

                        <i class="bi bi-eye"></i>

                        View

                    </button>

                </td>

                <td>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="downloadPrescription(${p.id})">

                        <i class="bi bi-file-earmark-pdf"></i>

                        PDF

                    </button>

                </td>

            </tr>

        `).join("");

    }

    catch (error) {

        console.error(error);

        showToast(
            "Network Error",
            "error"
        );

    }

}



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

        new bootstrap.Modal(
            document.getElementById("prescriptionModal")
        ).show();

    }

    catch (error) {

        console.error(error);

        showToast(
            "Network Error",
            "error"
        );

    }

}



async function downloadPrescription(id) {

    try {

        const response = await authFetch(

            `${BASE_URL}/api/prescriptions/${id}/pdf/`,

            {
                method: "GET"
            }

        );

        if (!response.ok) {

            const data = await safeJson(response);

            showToast(
                data?.detail ||
                data?.error ||
                "Unable to download PDF",
                "error"
            );

            return;

        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `Prescription_${id}.pdf`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        showToast(
            "Prescription downloaded successfully",
            "success"
        );

    }

    catch (error) {

        console.error(error);

        showToast(
            "Network Error",
            "error"
        );

    }

}



document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await protectPage("patient");

        if (
            document.getElementById(
                "prescriptionTableBody"
            )
        ) {

            loadPrescriptions();

        }

    }

);