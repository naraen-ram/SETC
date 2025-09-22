const oldUsername = sessionStorage.getItem("loginUsername");
const oldPassword = sessionStorage.getItem("loginPassword");

function back(x,y)
{   
    localStorage.setItem("username", x);
    localStorage.setItem("password", y);
    localStorage.setItem("remember", true);
    window.location.href='./../login%20page/login.html';
}


function edit() {
    document.querySelector(".edit").innerHTML = `
        <h2>Edit User Account</h2>
        <form id="EditForm">
            Username: <input type="text" id="Username" value="${oldUsername}" autocomplete="off" required>
            <br>
            <div class="password-container">
            Password: <input type="password" id="Password" value="${oldPassword}" autocomplete="new-password" required>
            <span class="toggle-password" onclick="togglePasswordVisibility()">
            <i class="fas fa-eye"></i> 
            </span>
            </div>
            <br>
            <div class="password-container">
            Confirm Password: <input type="password" id="confirmPassword" value="${oldPassword}" autocomplete="new-password" required>
            <span class="toggle-confirmPassword" onclick="toggleConfirmPasswordVisibility()">
            <i class="fas fa-eye"></i> 
            </span>
            </div>
            <br>
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

function toggleConfirmPasswordVisibility() {
    const passwordInput = document.getElementById('confirmPassword');
    const toggleIcon = document.querySelector('.toggle-confirmPassword i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('Password');
    const toggleIcon = document.querySelector('.toggle-password i');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
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
        const usersResp = await fetch("http://127.0.0.1:5500/userPasswords");
        if (!usersResp.ok) throw new Error("Failed to fetch users");

        const usersData = await usersResp.json();
        const users = usersData.userPasswords;

        // Check if new username already exists (excluding current user)
        if (newUsername !== oldUsername && users.some(u => u.username === newUsername)) {
            msg.textContent = "Username already exists!";
            return;
        }

        // Proceed with update
        const response = await fetch("http://127.0.0.1:5500/updateUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ oldUsername, username: newUsername, password: newPassword })
        });

        const result = await response.json();

        if (result.status === "success") {
            msg.style.color = "green";
           msg.textContent = "User updated successfully!";
           back(newUsername, newPassword);
        } else {
            msg.textContent = result.message;
        }

    } catch (err) {
        msg.textContent = "Error: " + err.message;
    }
}
document.getElementById("EditForm").innerHTML=`<label for="Username">Username</label>
        <div id="editForm"class="password-container">
            <input type="text" id="Username" value='${oldUsername}' autocomplete="off" required>
        </div>

        <label for="Password">Password</label>
        <div class="password-container">
            <input type="password" id="Password" value='${oldPassword}' autocomplete="new-password" required>
            <span class="toggle-password" onclick="togglePasswordVisibility()">
                <i class="fas fa-eye"></i>
            </span>
        </div>

        <label for="confirmPassword">Confirm Password</label>
        <div class="password-container">
            <input type="password" id="confirmPassword" value='${oldPassword}' autocomplete="new-password" required>
            <span class="toggle-confirmPassword" onclick="toggleConfirmPasswordVisibility()">
                <i class="fas fa-eye"></i>
            </span>
        </div>

        <button type="button" id="subbtn">Submit</button>
        <p id="message" style="color:red;"></p>`;
edit();
