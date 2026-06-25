const BASE_URL = "http://127.0.0.1:8000";

function getToken() {
    return localStorage.getItem("access_token");
}

let allDoctors = [];

// =========================
// LOAD DOCTORS
// =========================
async function loadDoctors() {

    try {

        const token = localStorage.getItem("access_token");

        const response = await fetch(`${BASE_URL}/api/doctor/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const err = await response.json();
            console.log("API ERROR:", err);
            throw new Error("API error");
        }

        const data = await response.json();
        console.log("Doctors:", data);

        renderDoctors(data);

    } catch (error) {
        console.error(error);
        alert("Unable to load doctors");
    }
}

// =========================
// RENDER DOCTORS
// =========================
function renderDoctors(doctors) {

    const table = document.getElementById("doctorTable");

    if (!table) return;

    table.innerHTML = "";

    if (!doctors || doctors.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No Doctors Found
                </td>
            </tr>
        `;
        return;
    }

    doctors.forEach(doctor => {

        table.innerHTML += `
            <tr>
                <td>${doctor.id || "-"}</td>

                <td>${doctor.username || "-"}</td>

                <td>${doctor.specialization || "-"}</td>

                <td>${doctor.experience || 0}</td>

                <td>₹${doctor.fee || 0}</td>

                <td>
                    ${doctor.is_available ? "✅" : "❌"}
                </td>
            </tr>
        `;
    });
}

// =========================
// SEARCH DOCTORS
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const searchInput = document.getElementById("searchDoctor");

    if (searchInput) {
        searchInput.addEventListener("keyup", function () {

            const keyword = this.value.toLowerCase();

            const filtered = allDoctors.filter(doctor => {

                return (
                    (doctor.username || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    (doctor.specialization || "")
                        .toLowerCase()
                        .includes(keyword)
                );
            });

            renderDoctors(filtered);
        });
    }

    loadDoctors();
});