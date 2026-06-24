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

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(
        `${BASE_URL}/api/token/`,
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

    if (!response.ok) {

        alert("Invalid Credentials");
        return;
    }

    localStorage.setItem(
        "access_token",
        data.access
    );

    localStorage.setItem(
        "refresh_token",
        data.refresh
    );

    await getCurrentUser();
}
console.log("TOKEN:", token);

async function getCurrentUser() {

    const token =
        localStorage.getItem("access_token");

    const response = await fetch(
        `${BASE_URL}/api/accounts/me/`,
        {
            headers: {
                Authorization:
                `Bearer ${token}`
            }
        }
    );

    

    if (!response.ok) {
        alert("Session expired. Please login again.");
        window.location.href = "/login/";
        return;
    }

    const user = await response.json();

    if (!user || !user.role) {
        alert("Invalid user data");
        return;
    }

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
}