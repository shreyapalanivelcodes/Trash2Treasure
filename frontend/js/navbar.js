// frontend/js/navbar.js

function updateNavbar() {
    const token = localStorage.getItem("token");
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
        user = null;
    }

    const navbar = document.getElementById("navbar");

    if (navbar) {
        if (token && user) {
            navbar.innerHTML = `
                <a href="index.html">Home</a>
                <a href="profile.html">Profile (${user.name})</a>
                <a href="upload.html">Upload Waste</a>
                <a href="leaderboard.html">Leaderboard</a>
                <button id="logoutBtn">Logout</button>
            `;
            document.getElementById("logoutBtn").addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
            });
        } else {
            navbar.innerHTML = `
                <a href="index.html">Home</a>
                <a href="login.html">Login</a>
                <a href="signup.html">Signup</a>
                <a href="leaderboard.html">Leaderboard</a>
            `;
        }
    }
}

window.addEventListener("DOMContentLoaded", updateNavbar);
