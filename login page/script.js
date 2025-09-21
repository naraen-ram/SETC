//declarations
let invalidEmailOrPass = document.getElementById("invalidEmailOrPass");
let ids = [], passwords = [];
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
    event.preventDefault()      // console.log("Form submission prevented")
});

window.onload = function () {
    //console.log("Page loaded, checking for saved credentials...");
    if (localStorage.getItem("remember") === "true") {
        //console.log("Remember me is checked, loading saved credentials.");
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
    for (let x = 0; x < ids.length; x++) {
        if (user === ids[x] && pass === passwords[x]) {
            console.log("Login successful for user:", user)
            await sleep(100);
            loginButton.style.bottom = "0px";
            invalidEmailOrPass.style.display = "none"
            
            if (rememberMe.checked) 
            {       //sets remember password if login is successful
                localStorage.setItem("username", user);
                localStorage.setItem("password", pass);
                localStorage.setItem("remember", true);
                localStorage.setItem("forget_remember", 0);
        
            } 
           

            window.location.href = `../dash_board/dashboard.html?loginName=${encodeURIComponent(user)}`;
            return

        }
    }

    //console.log("Login failed. Invalid username or password.")
    await sleep(1); // to overcome "Please select the field error || if you dont understand this, just comment this line and see what happens"
    invalidEmailOrPass.style.display = "block"
    loginButton.style.bottom = "12px"; /* Added this to adjust the position of the login button as it moves so down so that it touches the margin */
    username.value = ""
    password.value = ""
    username.focus()
});


//functions

// created a function sleep(ms) ... so whenever i call "await sleep(500)" the program stops for 500 milliseconds | efficient than setTimeout function in js
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}
async function getIdsAndPasswords() {
    let jsonFIle = fetch("../database/userPasswords.json")
    let response = await jsonFIle
    if (!response.ok) {
        throw new Error("Network response was not ok")
    }
    let datas = await response.json() /* converted respons to json  format */
    let data = datas.userPasswords; /* accessing the userPasswords array from the JSON data */
    ids = data.map(user => user.username)
    passwords = data.map(user => user.password)
    //console.log("IDs:", ids)
    //console.log("Passwords:", passwords)
}
getIdsAndPasswords()  /* The function is called here */
//console.log("Remember me status:", rememberMe.checked)
/* Function for the submit button */



