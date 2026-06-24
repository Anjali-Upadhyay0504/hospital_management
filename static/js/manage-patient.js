const BASE_URL =
    "http://127.0.0.1:8000";

const token =
    localStorage.getItem("access_token");

let allPatients = [];


// ====================
// Load Patients
// ====================
async function loadPatients() {

    try {

        const response = await fetch(
            `${BASE_URL}/api/accounts/patients/`,
            {
                headers: {
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

        allPatients =
            await response.json();

        renderPatients(
            allPatients
        );

    } catch(error) {

        console.error(error);

        alert(
            "Unable to load patients"
        );
    }
}


// ====================
// Render Patients
// ====================
function renderPatients(
    patients
) {

    const table =
        document.getElementById(
            "patientTable"
        );

    table.innerHTML = "";

    patients.forEach(patient => {

        table.innerHTML += `
            <tr>

                <td>
                    ${patient.id}
                </td>

                <td>
                    ${patient.username}
                </td>

                <td>
                    ${patient.role}
                </td>

            </tr>
        `;
    });
}


// ====================
// Search
// ====================
document
.getElementById(
    "searchPatient"
)
.addEventListener(
    "keyup",
    function() {

        const keyword =
            this.value.toLowerCase();

        const filtered =
            allPatients.filter(
                patient =>
                patient.username
                .toLowerCase()
                .includes(keyword)
            );

        renderPatients(
            filtered
        );
    }
);


// ====================
// Init
// ====================
loadPatients();