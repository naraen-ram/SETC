const oldUsername = sessionStorage.getItem("username");
const oldPassword = sessionStorage.getItem("password");

function back() {
    window.location.replace("index.html");
}

function edit() {
    document.querySelector(".edit").innerHTML = `
        <h2>Edit User Account</h2>
        <form id="EditForm">
            Username: <input type="text" id="Username" value="${oldUsername}" autocomplete="off" required><br>
            Password: <input type="password" id="Password" value="${oldPassword}" autocomplete="new-password" required><br>
            Confirm Password: <input type="password" id="confirmPassword" value="${oldPassword}" autocomplete="new-password" required><br>
            <button type="button" id="subbtn">Submit</button>
        </form>
        <p id="message" style="color:red;"></p>
    `;

    const btn = document.getElementById("subbtn");
    btn.addEventListener("click", submitForm);

    const inputs = document.querySelectorAll("#Username, #Password, #confirmPassword");
    inputs.forEach(input => {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                event.preventDefault();
                btn.click();
            }
        });
    });
}
async function submitForm() {
    const newUsername = document.getElementById("Username").value.trim();
    const newPassword = document.getElementById("Password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const msg = document.getElementById("message");
    msg.style.color = "red";
    msg.textContent = "";

    if (!newUsername || !newPassword || !confirmPassword) {
        msg.textContent = "Please fill all fields!";
        return;
    }

    if (newPassword !== confirmPassword) {
        msg.textContent = "Passwords do not match!";
        return;
    }

    try {
        // Fetch all users first
        const usersResp = await fetch("http://127.0.0.1:5000/userPasswords");
        if (!usersResp.ok) throw new Error("Failed to fetch users");

        const usersData = await usersResp.json();
        const users = usersData.userPasswords;

        // Check if new username already exists (excluding current user)
        if (newUsername !== oldUsername && users.some(u => u.username === newUsername)) {
            msg.textContent = "Username already exists!";
            return;
        }

        // Proceed with update
        const response = await fetch("http://127.0.0.1:5000/updateUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldUsername, username: newUsername, password: newPassword })
        });

        const result = await response.json();

        if (result.status === "success") {
            msg.style.color = "green";
            msg.textContent = "User updated successfully!";
            back();
        } else {
            msg.textContent = result.message;
        }

    } catch (err) {
        msg.textContent = "Error: " + err.message;
    }
}
// Initial render
edit();
