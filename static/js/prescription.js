

 async function viewPrescription(id) {

    try {

        const response = await authFetch(`${BASE_URL}/api/prescriptions/${id}/`);

        const data = await safeJson(response);

        console.log(data);

        if (!response.ok) {
        showToast(
            data?.detail || data?.error || "Unable to load prescription",
            "error"
        );
        return;
       }

        document.getElementById("viewPatient").textContent = data.patient_name;
        document.getElementById("viewDoctor").textContent = data.doctor_name;
        document.getElementById("viewDiagnosis").textContent = data.diagnosis;
        document.getElementById("viewMedicines").textContent = data.medicines;
        document.getElementById("viewNotes").textContent = data.notes || "-";
        document.getElementById("viewDate").textContent = formatDate(data.created_at);

        const modal = new bootstrap.Modal(
            document.getElementById("prescriptionModal")
        );

        modal.show();

    } catch (error) {

        console.error(error);
        showToast("Network Error", "error")

    }

}