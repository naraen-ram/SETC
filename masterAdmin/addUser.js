function back() {
    window.location.replace("index.html");
}

function add() {
    document.querySelector(".add").innerHTML = `
        <h2>Add User Account</h2>
        <form id="AddForm">
            Username: <input type="text" id="Username" autocomplete="off" required><br>
            Password: <input type="password" id="Password" autocomplete="new-password" required><br>
            Confirm Password: <input type="password" id="confirmPassword" autocomplete="new-password" required><br>
            <button type="button" id="subbtn2">Submit</button>
            <p id="message" style="color:red;"></p>
        </form>
    `;

    const btn = document.getElementById("subbtn2");

    btn.addEventListener("click", submitFormAdd);

    // Press Enter to submit
    const inputs = document.querySelectorAll("#Username, #Password, #confirmPassword");
    inputs.forEach(input => {
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                btn.click();
            }
        });
    });
}

async function submitFormAdd() {
    const username = document.getElementById("Username").value.trim();
    const password = document.getElementById("Password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const msg = document.getElementById("message");
    msg.style.color = "red";
    msg.textContent = "";

    // Validate fields
    if (!username || !password || !confirmPassword) {
        msg.textContent = "Please fill all fields!";
        return;
    }

    if (password !== confirmPassword) {
        msg.textContent = "Passwords do not match!";
        return;
    }

    try {
        // Fetch existing users
        const usersResp = await fetch("http://127.0.0.1:5000/userPasswords");
        if (!usersResp.ok) throw new Error("Failed to fetch users");

        const usersData = await usersResp.json();
        const users = usersData.userPasswords;

        // Check if username already exists
        if (users.some(u => u.username === username)) {
            msg.textContent = "Username already exists!";
            return;
        }

        // Proceed with adding user
        const response = await fetch("http://127.0.0.1:5000/addUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.status === "success") {
            msg.style.color = "green";
            msg.textContent = "User added successfully!";
            back(); // Redirect to index
        } else {
            msg.textContent = result.message;
        }
    } catch (err) {
        msg.textContent = "Error: " + err.message;
    }
}

// Initial render
add();
