//declarations
let invalidEmailOrPass = document.getElementById("invalidEmailOrPass");
let username = document.getElementById("username")
let password = document.getElementById("password")
let loginButton = document.querySelector(".login-button")
let loginContainer = document.querySelector(".login-container")
let rememberMe = document.getElementById("rememberMe");


//actions

rememberMe.addEventListener('click',()=>{
    if(rememberMe.checked===false)
        if(localStorage.getItem("remember")==="true")
        {   let userChoice=confirm("Proceeding will delete save password");
            if(userChoice) 
            {username.value = "";
             password.value = "";
            localStorage.removeItem("username");
            localStorage.removeItem("password");
            localStorage.setItem("remember", false);}
            else
            rememberMe.checked=true;
        }
        
    
});
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault()     
});

window.onload = function () {
    if (localStorage.getItem("remember") === "true") {
        document.getElementById("username").value = localStorage.getItem("username");
        document.getElementById("password").value = localStorage.getItem("password");
        rememberMe.checked = true;
    }
};
loginButton.addEventListener("click", async function () {
    let user = username.value
    let pass = password.value
    if (user === "" || pass === "") {
        return
    }

    loginButton.classList.add('loading');
    loginButton.disabled = true;

    try {
        const resp = await fetch('http://127.0.0.1:5500/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await resp.json();
        if (resp.ok && data.status === 'success') {
            sessionStorage.setItem("loginUsername", user);
            sessionStorage.setItem("loginPassword", pass);
            await sleep(100);
            loginButton.style.bottom = "0px";
            invalidEmailOrPass.style.display = "none";
            if (rememberMe.checked) {
                localStorage.setItem("username", user);
                localStorage.setItem("password", pass);
                localStorage.setItem("remember", true);
                localStorage.setItem("forget_remember", 0);
            }
            window.location.href = `../dash_board/dashboard.html?loginName=${encodeURIComponent(user)}`;
            return;
        } else {
            invalidEmailOrPass.style.display = "block";
            loginButton.style.bottom = "12px";
            username.value = "";
            password.value = "";
            username.focus();
        }
    } catch (e) {
        console.error('Login request failed', e);
        invalidEmailOrPass.style.display = "block";
    } finally {
        loginButton.classList.remove('loading');
        loginButton.disabled = false;
    }
});


//functions

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}



