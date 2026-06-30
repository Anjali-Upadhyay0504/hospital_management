

async function signup() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const confirm_password = document.getElementById("confirm_password").value;
    const msg = document.getElementById("msg");

    msg.innerHTML = "";

    // validation
    if (!username || !password || !confirm_password) {
        msg.innerHTML = "<span class='text-danger'>All fields required</span>";
        return;
    }

    if (password !== confirm_password) {
        msg.innerHTML = "<span class='text-danger'>Passwords do not match</span>";
        return;
    }

    try {

        const res = await fetch("/api/signup/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await res.json();

        if (res.ok) {
            msg.innerHTML = "<span class='text-success'>Signup successful!</span>";

            setTimeout(() => {
                window.location.href = "/login/";
            }, 1000);

        } else {
            msg.innerHTML = `<span class='text-danger'>${data.error || "Signup failed"}</span>`;
        }

    } catch (error) {
        msg.innerHTML = "<span class='text-danger'>Server error</span>";
    }
}

async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("All fields required");
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

        const data = await response.json();

        if (!response.ok) {
            alert(data.detail || "Invalid Credentials");
            return;
        }

        // Save tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        console.log("ACCESS TOKEN:", data.access);

        // get user info
        const user = await checkAuth();

        if (!user) {
            alert("User fetch failed");
            return;
        }

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
        

    } catch (error) {
        console.error("Login error:", error);
        alert("Something went wrong during login");
    }
}