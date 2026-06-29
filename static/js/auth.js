const BASE_URL =
    "http://127.0.0.1:8000";
const token = localStorage.getItem("access_token");

async function signup() {

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(
        `${BASE_URL}/api/accounts/signup/`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })
        }
    );

    const data =
        await response.json();

    if (response.ok) {

        alert("Signup Success");

        window.location.href = "/login/";

    } else {

        alert(JSON.stringify(data));
    }

}


async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${BASE_URL}/api/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Invalid Credentials");
            return;
        }

        // =========================
        // SAVE TOKENS (IMPORTANT)
        // =========================
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        console.log("ACCESS TOKEN SAVED:", data.access);

        // =========================
        // GET USER & REDIRECT
        // =========================
        await getCurrentUser();

    } catch (error) {
        console.error("Login error:", error);
        alert("Something went wrong during login");
    }
}
async function getCurrentUser() {

    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("No token found. Please login again.");
        window.location.href = "/login/";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/api/accounts/me/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            alert("Session expired. Please login again.");
            window.location.href = "/login/";
            return;
        }

        const user = await response.json();

        console.log("LOGGED IN USER:", user);

        if (user.role === "patient") {
            window.location.href = "/patient-dashboard/";
        }

        else if (user.role === "doctor") {
            window.location.href = "/doctor-dashboard/";
        }

        else if (user.role === "admin") {
            window.location.href = "/admin-dashboard/";
        }

        else {
            window.location.href = "/login/";
        }

    } catch (error) {
        console.error("User fetch error:", error);
        alert("Failed to get user info");
    }
}