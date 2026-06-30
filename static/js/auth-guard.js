window.BASE_URL = "http://127.0.0.1:8000";
/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        logout();
        return null;
    }

    try {

        const response = await fetch(`${BASE_URL}/api/token/refresh/`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                refresh: refreshToken
            })

        });

        if (!response.ok) {
            logout();
            return null;
        }

        const data = await response.json();

        localStorage.setItem("access_token", data.access);

        if (data.refresh) {
            localStorage.setItem("refresh_token", data.refresh);
        }

        return data.access;

    } catch (error) {

        console.error("Refresh Token Error:", error);

        logout();

        return null;
    }
}

/**
 * Common authenticated fetch
 */
async function authFetch(url, options = {}) {

    let token = localStorage.getItem("access_token");

    options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    let response = await fetch(url, options);

    // Access token expired
    if (response.status === 401) {

        const newToken = await refreshAccessToken();

        if (!newToken) {
            return response;
        }

        options.headers.Authorization = `Bearer ${newToken}`;

        response = await fetch(url, options);
    }

    return response;
}

/**
 * Check Login + Role
 */
async function checkAuth(requiredRole = null) {

    try {

        const response = await authFetch(
            `${BASE_URL}/api/accounts/me/`
        );

        if (!response.ok) {
            logout();
            return;
        }

        const user = await response.json();

        if (
            requiredRole &&
            user.role !== requiredRole
        ) {

            alert("Access Denied");

            logout();

            return;
        }

        return user;

    } catch (error) {

        console.error(error);

        logout();
    }
}

/**
 * Logout
 */
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    window.location.href = "/login/";
}