let allData;
let data;
let tableElement=document.getElementById("tableElement");
async function getdata() {
    let jsonFile = await fetch("../database/userPasswords.json");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
    data=allData.userPasswords;
    display(data);
}
getdata();
function display(data)
{
    data.forEach(element=>{

        tableElement.innerHTML+=`<tr> 
        <td>${element.username}</td>
        <td>${element.password}</td>
        <td><button class="changeButton" id="changeButton" onclick="${change(element.username)}";>change</button></td>
        <td><button class="removeButton" id="removeButton"onclick="${remove(element.username)}";>remove</button></td>
        </tr>`;
    });
    
} 
function change(i)
{   
}
function remove(i)
{

}
