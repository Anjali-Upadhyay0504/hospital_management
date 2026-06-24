function checkAuth(requiredRole) {

    const token =
        localStorage.getItem("access_token");

    if (!token) {

        window.location.href = "/login/";
        return;
    }

    fetch(
        "http://127.0.0.1:8000/api/accounts/me/",
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then(response => response.json())
    .then(user => {

        if (
            requiredRole &&
            user.role !== requiredRole
        ) {

            alert("Access Denied");

            window.location.href = "/login/";
        }
    })
    .catch(() => {

        localStorage.clear();

        window.location.href = "/login/";
    });
}