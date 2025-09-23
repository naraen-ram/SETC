async function loadUsers() {
    let usersDiv = document.querySelector(".users");
    let table= "<table><tr><th>Username</th><th>Password</th></tr>";

    try {
        // Fetch JSON from database folder
        let response = await fetch("../database/userPasswords.json"); 
        if (!response.ok) throw new Error("JSON file not found");

        let data = await response.json(); // convert to JS object
        // Loop through array and print
        data.userPasswords.forEach((user,index) => {
            if(index!=0)
            { table+=
            `<tr> 
                <td >${user.username} </td>
                <td id="sno-${index}">********</td>
                <td>
                    <button onclick="viewPassword(${index}, '${user.password}')">view</button>
                </td>
                 <td>
                    <button onclick="editUser(${index}, '${user.username}','${user.password}')">Edit</button>
                </td>
                <td>
                    <div id="del-${index}"><button onclick="confirm(${index})" >Delete</button></div>
                </td>
            </tr>`;
            }
            else
            {
                  table+=
            `<tr> 
                <td >${user.username} </td>
                <td id="sno-${index}">********</td>
                <td>
                    <button onclick="viewPassword(${index}, '${user.password}')">view</button>
                </td>
                 <td>
                    <button onclick="editUser(${index}, '${user.username}','${user.password}')">Edit</button>
                </td>
                
            </tr>`;
            }

        });
        table+= `</table></br><button onclick="addUser()">Add</button>`;
        usersDiv.innerHTML=table;
    
    } catch (err) {
        usersDiv.innerHTML+= "Error loading JSON: " + err.message;
        console.error(err);
    }
}
function confirm(index)
{       
        let d=`del-${index}`;
        document.getElementById(d).innerHTML=`<button onclick="deleteUser(${index})" >Confirm</button>`;
        setTimeout(()=>document.getElementById(d).innerHTML=`<button onclick="confirm(${index})" >Delete</button>`,5500);
}
function viewPassword(index, password)
{
    let cell = document.getElementById(`sno-${index}`);
    cell.textContent = password; 

    // Hide after 10 seconds
    setTimeout(() => {
        cell.textContent = '********';
    }, 5500); 
}

function editUser(index,username,password)
{   
    sessionStorage.setItem("index", index);
    sessionStorage.setItem("username", username);
    sessionStorage.setItem("password", password);
    window.location.replace("editUser.html");
}
function addUser()
{   
    window.location.replace("addUser.html");
}
// Call the function

async function deleteUser(index) {
    try {
        // First get the current users from the table or fetch
        const usersResp = await fetch("http://127.0.0.1:5500/userPasswords");
        if (!usersResp.ok) throw new Error("Failed to fetch users");

        const usersData = await usersResp.json();
        const user = usersData.userPasswords[index]; // get the user by index
        if (!user) {
            console.error("User not found for this index");
            return;
        }

        // Send the username to the server
        const response = await fetch("http://127.0.0.1:5500/deleteUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user.username })
        });

        const result = await response.json();

        if (result.status === "success") {
            //alert("User deleted successfully!");
            loadUsers(); // reload table after deletion
        } else {
            console.error("Error: " + result.message);
        }
    } catch (err) {
        console.error(err);
    }
}


loadUsers();
