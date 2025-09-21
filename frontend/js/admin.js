// ===== GET TOKEN =====
const token = localStorage.getItem("token");

// ===== REQUEST ADMIN ACCESS (Normal User) =====
const requestBtn = document.getElementById("requestAdminBtn");
const statusText = document.getElementById("requestStatus");

if (requestBtn) {
    requestBtn.addEventListener("click", async () => {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user || !token) return alert("Login first!");

        const res = await fetch("/api/admin/request-admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ userId: user.id })
        });

        const data = await res.json();
        statusText.textContent = data.msg;
    });
}

// ===== ADMIN DASHBOARD =====

// FETCH USERS
async function fetchUsers() {
    const table = document.querySelector("#users-table tbody");
    if (!table) return; // Skip if table not on page

    const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const users = await res.json();
    table.innerHTML = "";

    users.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.organization || "-"}</td>
            <td>${u.isAdmin}</td>
            <td>
                <button onclick="deleteUser('${u._id}')">Delete</button>
                ${!u.isAdmin && u.requestedAdmin ? `<button onclick="approveAdmin('${u._id}')">Approve Admin</button>` : ""}
            </td>
        `;
        table.appendChild(tr);
    });
}

// DELETE USER
async function deleteUser(id) {
    if (!confirm("Are you sure?")) return;

    await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
}

// APPROVE ADMIN REQUEST
async function approveAdmin(id) {
    await fetch(`/api/admin/approve-admin/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
}

// FETCH SUBMISSIONS
async function fetchSubmissions() {
    const table = document.querySelector("#submissions-table tbody");
    if (!table) return; // Skip if table not on page

    const res = await fetch("/api/admin/submissions", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const submissions = await res.json();
    table.innerHTML = "";

    submissions.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.userName}</td>
            <td>${s.type}</td>
            <td>
                <select onchange="updateStatus('${s._id}', this.value)">
                    <option ${s.status==='Pending'?'selected':''}>Pending</option>
                    <option ${s.status==='Approved'?'selected':''}>Approved</option>
                    <option ${s.status==='Rejected'?'selected':''}>Rejected</option>
                </select>
            </td>
            <td>${s.message || "-"}</td>
        `;
        table.appendChild(tr);
    });
}

// UPDATE SUBMISSION STATUS
async function updateStatus(id, status) {
    await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
    });
    fetchSubmissions();
}

// ===== INIT =====
fetchUsers();
fetchSubmissions();
