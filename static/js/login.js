
async function signup() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm_password").value;
    const msg = document.getElementById("msg");

    msg.innerHTML = "";

    if (!username || !password || !confirm_password) {
        msg.innerHTML = "<span class='text-danger'>All fields required</span>";
        return;
    }

    if (password !== confirm_password) {
        msg.innerHTML = "<span class='text-danger'>Passwords do not match</span>";
        return;
    }

    try {

        const res = await fetch(`${window.BASE_URL}/api/accounts/signup/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        let data = null;

        try {
            data = await res.json();
        } catch (e) {
            data = {};
        }

        if (res.ok) {
            msg.innerHTML = "<span class='text-success'>Signup successful!</span>";

            setTimeout(() => {
                window.location.href = "/login/";
            }, 1000);

        } else {
            msg.innerHTML = `<span class='text-danger'>${data.error || "Signup failed"}</span>`;
        }

    } catch (error) {
        console.error(error);
        msg.innerHTML = "<span class='text-danger'>Server error</span>";
    }
}
async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        showToast("All fields required", "warning");
        return;
    }

    try {

        const response = await fetch(`${window.BASE_URL}/api/token/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        let data = null;

        try {
            data = await response.json();
        } catch (e) {
            showToast("Invalid server response", "error");
            return;
        }

        if (!response.ok) {
            showToast(data.detail || "Invalid credentials", "error");
            return;
        }

        // Save tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // get user info
        const user = await protectPage();

        if (!user) {
            showToast("User fetch failed", "error");
            return;
        }

        showToast("Login successful", "success");

        // role-based routing
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
            showToast("Unknown role", "error");
        }

    } catch (error) {
        console.error("Login error:", error);
        showToast("Something went wrong", "error");
    }
}