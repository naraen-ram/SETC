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
let html=`<table id="tableJS">
  <thead>
    <tr>
      <th onclick="sortTable(0)">Name</th>
      <th onclick="sortTable(1)">ID</th>
      <th onclick="sortTable(2)">Depot</th>
      <th onclick="sortTable(3)">Intime</th>
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
function sortTable(n)
{
    let table,direction='asc',rows,switching=true,i,x,y,shouldSwitch,switchcount=0;
    table=document.getElementById("tableJS");
    while(switching)
    {
        switching=false;
        rows=table.rows;
        for(i=1;i<rows.length-1;i++)
        {
            shouldSwitch=false;
            x=rows[i].getElementsByTagName("TD")[n];
            y=rows[i+1].getElementsByTagName("TD")[n];
            if(direction==="asc")
            {
                if(x.innerHTML.toLowerCase()>y.innerHTML.toLowerCase())
                {
                    shouldSwitch=true;
                    break;
                }
            }
            else if(direction==="desc"){
                if(x.innerHTML.toLowerCase()<y.innerHTML.toLowerCase())
                {
                    shouldSwitch=true;
                    break;
                }
            }
        }
        if(shouldSwitch)
        {
            rows[i].parentNode.insertBefore(rows[i+1],rows[i]);
            switching=true;
            switchcount++;
        }
        else{
            if(switchcount===0 && direction==="asc")
            {
                direction="desc";
                switching=true;
            }
        }
    }
}