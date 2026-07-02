// ==========================
// AUTH GUARD (PAGE PROTECTION ONLY)
// ==========================

async function protectPage(requiredRole = null) {

    const token = localStorage.getItem("access_token");

    if (!token) {
        window.location.href = "/login/";
        return;
    }

    try {

        const response = await fetch(`${BASE_URL}/api/accounts/me/`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            window.location.href = "/login/";
            return;
        }

        const user = await response.json();

        // role check
        if (requiredRole && user.role !== requiredRole) {
            alert("Access Denied");
            window.location.href = "/login/";
            return;
        }

        return user;

    } catch (error) {
        console.error("Auth Guard Error:", error);
        window.location.href = "/login/";
    }
}