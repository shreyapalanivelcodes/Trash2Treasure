// ==================== Navbar Elements ====================
const logoutBtn = document.getElementById("logoutBtn");
const profileBtn = document.querySelector(".profile-btn");
const loginBtn = document.querySelector(".login-btn");
const signupBtn = document.querySelector(".signup-btn");

// ==================== Leaderboard Buttons ====================
const globalBtn = document.getElementById("globalBtn");
const orgBtn = document.getElementById("orgBtn");

// ==================== Update Navbar ====================
function updateNavbar() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    logoutBtn.style.display = "block";
    profileBtn.style.display = "block";
    profileBtn.textContent = `My Profile (${user.name || "User"})`;
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
  } else {
    logoutBtn.style.display = "none";
    profileBtn.style.display = "none";
    loginBtn.style.display = "block";
    signupBtn.style.display = "block";
  }
}

// ==================== Logout Function ====================
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    updateNavbar();
    window.location.href = "/login.html";
  });
}

// ==================== Load Leaderboard ====================
async function loadLeaderboard(org = null) {
  const tbody = document.getElementById("leaderboardBody");
  const h2 = document.querySelector(".leaderboard h2");

  h2.textContent = org ? `Leaderboard - ${org} 🏢` : "Global Leaderboard 🌍";

  tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Loading...</td></tr>";

  try {
    let url = "http://localhost:5000/api/leaderboard";
    if (org) url += `?org=${encodeURIComponent(org)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Network response was not ok");

    const data = await res.json();

    tbody.innerHTML = "";
    if (!data || data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>No users found 🫣</td></tr>";
      return;
    }

    data.forEach((user, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${user.name}</td>
        <td>${user.count}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    tbody.innerHTML = "<tr><td colspan='3' style='text-align:center;'>Error fetching data ❌</td></tr>";
  }

  // Highlight active button
  if (globalBtn && orgBtn) {
    if (org) {
      orgBtn.classList.add("active-btn");
      globalBtn.classList.remove("active-btn");
    } else {
      globalBtn.classList.add("active-btn");
      orgBtn.classList.remove("active-btn");
    }
  }
}

// ==================== Initialize ====================
window.addEventListener("load", () => {
  updateNavbar();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userOrg = user?.organization?.trim() || null;

  if (userOrg) {
    orgBtn.style.display = "inline-block"; // Show only if user has org
    orgBtn.textContent = `🏢 ${userOrg}`;
    orgBtn.addEventListener("click", () => loadLeaderboard(userOrg));
  } else {
    orgBtn.style.display = "none"; // Hide completely if no org
  }

  // 👉 Default load: Global
  loadLeaderboard(null);

  if (globalBtn) {
    globalBtn.addEventListener("click", () => loadLeaderboard(null));
  }
});
