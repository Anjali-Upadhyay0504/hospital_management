// =========================================
// DOCTOR SCHEDULE MODULE
// =========================================


// =========================================
// LOAD SCHEDULES
// =========================================
async function loadSchedules() {

    const table = document.getElementById("scheduleTable");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="3" class="text-center">
                Loading...
            </td>
        </tr>
    `;

    try {

        const response = await authFetch(`${BASE_URL}/api/schedule/`);

        const data = await safeJson(response);

        const schedules = data.results || data || [];

        if (!response.ok) {

            table.innerHTML = `
                <tr>
                    <td colspan="3" class="text-danger text-center">
                        Failed to load schedules
                    </td>
                </tr>
            `;

            return;
        }

        if (schedules.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">
                        No Schedule Available
                    </td>
                </tr>
            `;

            return;
        }

        let rows = "";

        schedules.forEach(schedule => {

            rows += `
                <tr>

                    <td>${schedule.day}</td>

                    <td>${schedule.start_time}</td>

                    <td>${schedule.end_time}</td>

                </tr>
            `;

        });

        table.innerHTML = rows;

    }

    catch (error) {

        console.error(error);

        table.innerHTML = `
            <tr>
                <td colspan="3" class="text-danger text-center">
                    Error Loading Schedule
                </td>
            </tr>
        `;

    }

}



// =========================================
// ADD SCHEDULE
// =========================================
async function addSchedule() {

    const day = document.getElementById("scheduleDay").value.trim();

    const start_time = document.getElementById("startTime").value;

    const end_time = document.getElementById("endTime").value;

    if (!day || !start_time || !end_time) {

        showToast(
            "Please fill all required fields.",
            "warning"
        );

        return;

    }

    try {

        const response = await authFetch(

            `${BASE_URL}/api/schedule/`,

            {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    day,

                    start_time,

                    end_time

                })

            }

        );

        const data = await safeJson(response);

        if (!response.ok) {

            showToast(

                data?.detail ||

                data?.error ||

                JSON.stringify(data),

                "error"

            );

            return;

        }

        showToast(

            "Schedule Added Successfully",

            "success"

        );

        // Reset Form

        document.getElementById("scheduleDay").value = "";

        document.getElementById("startTime").value = "";

        document.getElementById("endTime").value = "";

        await loadSchedules();

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
// INIT
// =========================================
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("scheduleTable")) {

        loadSchedules();

    }

});



// =========================================
// GLOBAL FUNCTIONS
// =========================================
window.loadSchedules = loadSchedules;

window.addSchedule = addSchedule;