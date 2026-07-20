/* ==========================
   LOAD APPOINTMENTS
========================== */

async function loadAppointmentsForReport() {

    try {

        const response = await authFetch(
            `${BASE_URL}/api/appointments/`
        );

        const data = await safeJson(response);

        if (!response.ok) {

            showToast(
                "Unable to load appointments.",
                "error"
            );

            return;

        }

        const select =
            document.getElementById(
                "appointmentSelect"
            );

        if (!select) return;

        select.innerHTML =
            `<option value="">
                Select Appointment
            </option>`;

        const appointments =
            data.results || data;

        appointments.forEach(app => {

    if (app.status !== "approved") return;

    select.innerHTML += `
        <option value="${app.id}">

            Dr. ${app.doctor_name}

            -

            ${new Date(
                app.appointment_date
            ).toLocaleDateString()}

        </option>
    `;

});

    }

    catch (err) {

        console.error(err);

    }

}
async function uploadReport() {

    const appointment =
        document.getElementById(
            "appointmentSelect"
        ).value;

    const title =
        document.getElementById(
            "reportTitle"
        ).value.trim();

    const file =
        document.getElementById(
            "reportFile"
        ).files[0];

    if (!appointment || !title || !file) {

        showToast(
            "Fill all fields.",
            "warning"
        );

        return;

    }

    const formData = new FormData();

    formData.append(
        "appointment",
        appointment
    );

    formData.append(
        "title",
        title
    );

    formData.append(
        "report_file",
        file
    );

    try {

        const response =
            await authFetch(

                `${BASE_URL}/api/medical-reports/`,

                {

                    method: "POST",

                    body: formData

                }

            );

        if (!response.ok) {

            const err =
                await safeJson(response);

            showToast(

                err.detail ||

                "Upload failed",

                "error"

            );

            return;

        }

        showToast(

            "Report uploaded successfully.",

            "success"

        );

        document.getElementById(
            "reportTitle"
        ).value = "";

        document.getElementById(
            "reportFile"
        ).value = "";

        loadReports();

    }

    catch (err) {

        console.error(err);

    }

}
async function loadReports() {

    try {

        const response =
            await authFetch(
                `${BASE_URL}/api/medical-reports/`
            );

        const data =
            await safeJson(response);

        if (!response.ok) return;

        const container =
            document.getElementById(
                "reportsContainer"
            );

        if (!container) return;

        container.innerHTML = "";

        const reports =
            data.results || data;

        if (reports.length === 0) {

            container.innerHTML =

                `<div class="alert alert-info">

                    No reports uploaded.

                </div>`;

            return;

        }

        reports.forEach(report => {

            container.innerHTML += `

            <div class="card mb-3">

                <div class="card-body
                            d-flex
                            justify-content-between
                            align-items-center">

                    <div>

                        <h6>

                            ${report.title}

                        </h6>

                        <small>

                            ${new Date(
                                report.uploaded_at
                            ).toLocaleDateString()}

                        </small>

                    </div>

                    <div>

                        <a

                        href="${BASE_URL}${report.report_file}"

                        target="_blank"

                        class="btn btn-primary btn-sm">

                        View

                        </a>

                        <button

                        onclick="deleteReport(${report.id})"

                        class="btn btn-danger btn-sm">

                        Delete

                        </button>

                    </div>

                </div>

            </div>

            `;

        });

    }

    catch (err) {

        console.log(err);

    }

}
async function deleteReport(id) {

    if (

        !confirm(

            "Delete this report?"

        )

    )

        return;

    const response =
        await authFetch(

            `${BASE_URL}/api/medical-reports/${id}/`,

            {

                method: "DELETE"

            }

        );

    if (response.ok) {

        showToast(

            "Deleted successfully",

            "success"

        );

        loadReports();

    }

}
document.addEventListener(

    "DOMContentLoaded",

    () => {

        loadAppointmentsForReport();

        loadReports();

    }

);