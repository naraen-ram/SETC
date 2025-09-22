function back() {
    window.location.replace("index.html");
}

function add() {
    document.querySelector(".add").innerHTML = `
        <h2>Add User Account</h2>
        <form id="AddForm">
            Username: <input type="text" id="Username" autocomplete="off" required>
            <br>
            <div class="password-container">
            Password: <input type="password" id="Password" autocomplete="new-password" required>
            <span class="toggle-password" onclick="togglePasswordVisibility()">
            <i class="fas fa-eye"></i> 
            </span>
            </div>
            <br>
            <div class="password-container">
            Confirm Password: <input type="password" id="confirmPassword" autocomplete="new-password" required>
            <span class="toggle-confirmPassword" onclick="toggleConfirmPasswordVisibility()">
            <i class="fas fa-eye"></i> 
            </span>
            </div>
            <br>
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

function checkPassword(password) {
    minLength = 8;
    upperCase = /[A-Z]/.test(password);
    lowerCase = /[a-z]/.test(password);
    numbers = /\d/.test(password);
    specialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    msgStr = ""

    if(password.leng < 8 )
    {
        msgStr += " minimum of 8 characters,"
    }
    if(!upperCase)
    {
        msgStr += " uppercase,"
    }
    if(!lowerCase)
    {
        msgStr += " lowercase,"
    }
    if(!numbers)
    {
        msgStr += " number,"
    }
    if(!specialChars)
    {
        msgStr += " special character,"
    }

    if(msgStr!="")
        return "Password should contain "+msgStr
    else 
        return "1"
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

    if((str = checkPassword(password))!="1")
    {
        msg.textContent = str
        return;
    }

    try {
        // Fetch existing users
        const usersResp = await fetch("http://127.0.0.1:5500/userPasswords");
        if (!usersResp.ok) throw new Error("Failed to fetch users");

        const usersData = await usersResp.json();
        const users = usersData.userPasswords;

        // Check if username already exists
        if (users.some(u => u.username === username)) {
            msg.textContent = "Username already exists!";
            return;
        }

        // Proceed with adding user
        const response = await fetch("http://127.0.0.1:5500/addUser", {
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
