const BASE_URL =
    "http://127.0.0.1:8000";

const token =
    localStorage.getItem("access_token");

let allDoctors = [];


// =========================
// Load Doctors
// =========================

async function loadDoctors() {

    try {

        const response = await fetch(
            `${BASE_URL}/api/doctors/list/`,
            {
                headers: {
                    Authorization:
                    `Bearer ${token}`
                }
            }
        );

        allDoctors =
            await response.json();

        renderDoctors(allDoctors);

    } catch(error) {

        console.error(error);

        alert(
            "Unable to load doctors"
        );
    }
}


// =========================
// Render Doctors
// =========================

function renderDoctors(doctors) {

    const table =
        document.getElementById(
            "doctorTable"
        );

    table.innerHTML = "";

    doctors.forEach(doctor => {

        table.innerHTML += `
        <tr>

            <td>${doctor.id}</td>

            <td>
                ${doctor.username}
            </td>

            <td>
                ${doctor.specialization}
            </td>

            <td>
                ${doctor.experience}
            </td>

            <td>
                ₹${doctor.fee}
            </td>

            <td>
                ${
                    doctor.is_available
                    ? "✅"
                    : "❌"
                }
            </td>

        </tr>
        `;
    });
}


// =========================
// Search
// =========================

document
.getElementById("searchDoctor")
.addEventListener(
    "keyup",
    function() {

        const keyword =
            this.value.toLowerCase();

        const filtered =
            allDoctors.filter(
                doctor =>
                doctor.username
                .toLowerCase()
                .includes(keyword)
            );

        renderDoctors(filtered);
    }
);


loadDoctors();