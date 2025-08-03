// created a function sleep(ms) ... so whenever i call "await sleep(500)" the program stops for 500 milliseconds | efficient than setTimeout function in js
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms)
    })
}

var invalidEmailOrPass = document.getElementById("invalidEmailOrPass");

let ids = [], passwords = [];
async function getIdsAndPasswords() {
    let jsonFIle = fetch("userPasswords.json")
    let response = await jsonFIle
    if (!response.ok) {
        throw new Error("Network response was not ok")
    }
    let datas = await response.json() /* converted respons to json  format */
    let data = datas.userPasswords; /* accessing the userPasswords array from the JSON data */
    ids = data.map(user => user.username)
    passwords = data.map(user => user.password)
    console.log("IDs:", ids)
    console.log("Passwords:", passwords)
}
getIdsAndPasswords()  /* The function is called here */

let username = document.getElementById("username")
let password = document.getElementById("password")
let loginButton = document.querySelector(".login-button")
let loginContainer = document.querySelector(".login-container")

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault()
    // console.log("Form submission prevented")
});

/* Function for the submit button */
loginButton.addEventListener("click",async function () {
    let user = username.value
    let pass = password.value
    if(user==="" || pass ==="" ){
        return
    }
    for (let x = 0; x < ids.length; x++) {
        if (user === ids[x] && pass === passwords[x]) {
            console.log("Login successful for user:", user)
            await sleep(100);
            invalidEmailOrPass.style.display = "none"
            
            window.location.href='https://www.youtube.com';
            return

        }
    }
    
    console.log("Login failed. Invalid username or password.")
    await sleep(1); // to overcome "Please select the field error || if you dont understand this, just comment this line and see what happens"
    invalidEmailOrPass.style.display = "block"
    await sleep(1000);
});
