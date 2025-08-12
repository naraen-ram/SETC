let data=[];
async function getdata()
{
    let jsonFIle=await fetch("dummy.json");
    if(!jsonFIle.ok)
    {
        throw new Error("cant pull data");
    }
    data=await jsonFIle.json();
    createTable();
}

let butt=document.querySelector(".searchButton");
butt.addEventListener("click",()=>{
    getdata();
    
})
function createTable()
{
let html=`<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>ID</th>
      <th>Depot</th>
      <th>Intime</th>
    </tr>
  </thead><tbody>`;
  if(data.length==0)
    {
            document.querySelector(".bottom").innerHTML="NO CONTENT TO DISPLAY!!";
            return;
    }
    data.forEach(element => {
        html+=`
        <tr>
        <td>${element.name}</td>
        <td>${element.id}</td>
        <td>${element.depot}</td>
        <td>${element.intime}</td>
        </tr>`
    });
    html+=`</tbody></table>`;
    document.querySelector(".bottom").innerHTML=html;
}
