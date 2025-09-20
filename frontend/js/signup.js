// ================== Handle signup form ==================
document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const organization = document.getElementById("organization").value.trim();

  if (!name || !email || !password) {
    alert("Please fill in all required fields.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, organization })
    });

    const data = await response.json();

    if (response.ok) {
      // Save token
      localStorage.setItem("token", data.token);

      // Always store full user object with org
      const userData = {
        id: data.user.id,        // ✅ backend always sends "id"
        name: data.user.name,
        email: data.user.email,
        organization: data.user.organization || ""
      };

      localStorage.setItem("user", JSON.stringify(userData));

      alert("Signup successful! Redirecting to home...");
      window.location.href = "index.html";
    } else {
      alert(data.message || "Signup failed. Try again.");
    }

  } catch (err) {
    console.error("Network error:", err);
    alert("Network error. Please try later.");
  }
});
