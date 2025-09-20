// ==================== Signup ====================
const signupForm = document.getElementById("signupForm");
const signupMessage = document.getElementById("signupMessage");

if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = signupForm.querySelector("input[name='name']").value.trim();
        const email = signupForm.querySelector("input[name='email']").value.trim();
        const password = signupForm.querySelector("input[name='password']").value;

        if (!name || !email || !password) {
            signupMessage.textContent = "All fields are required ❌";
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                signupMessage.textContent = "Signup successful ✅ Please login.";
                signupForm.reset();
            } else {
                signupMessage.textContent = data.message || "Signup failed ❌";
            }
        } catch (err) {
            console.error(err);
            signupMessage.textContent = "Error connecting to server ❌";
        }
    });
}

// ==================== Login ====================
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = loginForm.querySelector("input[name='email']").value.trim();
        const password = loginForm.querySelector("input[name='password']").value;

        if (!email || !password) {
            loginMessage.textContent = "All fields are required ❌";
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                loginMessage.textContent = "Login successful ✅ Redirecting...";
                // Save token or user info to localStorage/sessionStorage if needed
                localStorage.setItem("token", data.token);
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1000);
            } else {
                loginMessage.textContent = data.message || "Login failed ❌";
            }
        } catch (err) {
            console.error(err);
            loginMessage.textContent = "Error connecting to server ❌";
        }
    });
}
