// ==========================
// REFRESH ACCESS TOKEN
// ==========================
async function refreshAccessToken() {

    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
        logout();
        return null;
    }

    const response = await fetch(`${window.BASE_URL}/api/token/refresh/`, {
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

    return data.access;
}

// ==========================
// AUTH FETCH
// ==========================
async function authFetch(url, options = {}) {

    let token = localStorage.getItem("access_token");

    options.headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
    };

    let response = await fetch(url, options);

    if (response.status === 401) {

        token = await refreshAccessToken();

        if (!token) return response;

        options.headers.Authorization = `Bearer ${token}`;

        response = await fetch(url, options);
    }

    return response;
}

// ==========================
// LOGOUT
// ==========================
function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login/";
}