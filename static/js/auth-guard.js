async function protectPage(requiredRole = null) {

    const token = getToken();

    if (!token) {
        window.location.href = "/login/";
        return;
    }

    try {

        const response = await authFetch(`${BASE_URL}/api/accounts/me/`);

        if (!response.ok) {
            window.location.href = "/login/";
            return;
        }

        const user = await response.json();

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