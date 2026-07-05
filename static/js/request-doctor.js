getToken();

/* =========================================
        LOAD REQUEST STATUS
========================================= */

async function loadMyRequest() {

    try {

        const res = await authFetch(
            `${BASE_URL}/api/doctor/my_request/`
        );

        const data = await safeJson(res);

        if (!res.ok) {

            showToast(
                data?.error || "Unable to load request.",
                "error"
            );

            return;

        }

        const form = document.getElementById("doctorRequestForm");
        const statusBox = document.getElementById("requestStatus");

        // No request submitted
        if (data.status === "not_submitted") {

            form.classList.remove("d-none");
            statusBox.classList.add("d-none");

            return;

        }

        // Request already exists
        form.classList.add("d-none");
        statusBox.classList.remove("d-none");

        if (data.status === "pending") {

            statusBox.className =
                "alert alert-warning";

            statusBox.innerHTML = `
                <strong>Pending</strong><br>
                Your request is waiting for admin approval.
            `;

        }

        else if (data.status === "approved") {

            statusBox.className =
                "alert alert-success";

            statusBox.innerHTML = `
                <strong>Approved</strong><br>
                Congratulations! Your request has been approved.
            `;

        }

        else if (data.status === "rejected") {

            statusBox.className =
                "alert alert-danger";

            statusBox.innerHTML = `
                <strong>Rejected</strong><br>
                Sorry! Your request has been rejected.
            `;

        }

    }

    catch (err) {

        console.error(err);

        showToast(
            "Server Error",
            "error"
        );

    }

}

/* =========================================
        SUBMIT REQUEST
========================================= */

async function submitDoctorRequest(e) {

    e.preventDefault();

    const specialization =
        document.getElementById("specialization").value.trim();
    const qualification =
    document.getElementById("qualification").value.trim();

    const experience =
        document.getElementById("experience").value;

    const fee =
        document.getElementById("fee").value;

    if (!specialization || !qualification|| !experience || !fee) {

        showToast(
            "Please fill all fields.",
            "warning"
        );

        return;

    }

    try {

        const res = await authFetch(

            `${BASE_URL}/api/doctor/request_doctor/`,

            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    specialization,
                    qualification,
                    experience,
                    fee

                })

            }

        );

        const data = await safeJson(res);

       

        console.log("Status:", res.status);
        console.log("Response:", data);

        if (!res.ok) {
            showToast(JSON.stringify(data), "error");
            return;
            }

        

        showToast(
            "Doctor request submitted successfully.",
            "success"
        );

        await loadMyRequest();

    }

    catch (err) {

        console.error(err);

        showToast(
            "Server Error",
            "error"
        );

    }

}

/* =========================================
        DOM READY
========================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await protectPage("patient");

    loadMyRequest();

    document
        .getElementById("doctorRequestForm")
        .addEventListener(
            "submit",
            submitDoctorRequest
        );

});