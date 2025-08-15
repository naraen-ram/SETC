let data = [];
let allData = [];

async function getdata() {
    let jsonFile = await fetch("dummy.json");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
    data = allData;
    resetSortArray();
    datefilter(data);
    
}
let searchBar=document.getElementById("search");
let searchButton = document.querySelector(".searchButton");
/*butt.addEventListener("click", () => {
    let query = document.getElementById("search").value.trim().toLowerCase();
    if (!query) {
        data = allData;
    } else {
        data = allData.filter(element =>
            element.name.toLowerCase().includes(query) ||
            String(element.id).toLowerCase().includes(query) ||
            element.depot.toLowerCase().includes(query) ||
            (element.intime && element.intime.toLowerCase().includes(query)) ||
            (element.out_time && element.out_time.toLowerCase().includes(query))
        );
    }
    createTable(data);
});*/
searchBar.addEventListener('keyup',(val)=>{
    searcher();
});
searchButton.addEventListener("click", () => {
   searcher();
});
getdata();
function datefilter(allData)
{   resetSortArray();
    let startDate=document.getElementById("startDate").value.toString();
    let endDate=document.getElementById("endDate").value.toString();
    if(!startDate)
        data=allData;
    else
    {
    let results=allData.filter(element=>element.date>=startDate && element.date<=endDate)
    data=results;
    }
    createTable(data);
}
let startDate=document.getElementById("startDate");
let endDate=document.getElementById("endDate");
startDate.addEventListener('change',()=>{ endDate.min=startDate.value;
    searcher();
    datefilter(data);
});
endDate.addEventListener('change',()=>{
    searcher();
    datefilter(data);
})
   
function searcher()
{  resetSortArray();
     let query =
    document.getElementById("search").value.trim().toLowerCase();
    if (!query) {
        data = allData;
    } else {
        // 1. "Starts with" search
        let startsWithResults = allData.filter(element =>
            element.name.toLowerCase().startsWith(query) /*||
            String(element.id).toLowerCase().startsWith(query) ||
            element.depot.toLowerCase().startsWith(query) ||
            (element.intime && element.intime.toLowerCase().startsWith(query)) ||
            (element.out_time && element.out_time.toLowerCase().startsWith(query))
        */);
        if (startsWithResults.length > 0) {
            data = startsWithResults;
        } else {
            // 2. Substring search, but exclude "starts with" matches
            data = allData.filter(element => {
                // Check if any field contains the query, but does NOT start with it
                return (
                    (element.name.toLowerCase().includes(query) && !element.name.toLowerCase().startsWith(query)) /*||
                    (String(element.id).toLowerCase().includes(query) && !String(element.id).toLowerCase().startsWith(query)) ||
                    (element.depot.toLowerCase().includes(query) && !element.depot.toLowerCase().startsWith(query)) ||
                    (element.intime && element.intime.toLowerCase().includes(query) && !element.intime.toLowerCase().startsWith(query)) ||
                    (element.out_time && element.out_time.toLowerCase().includes(query) && !element.out_time.toLowerCase().startsWith(query))*/
                );
            });
        }
    }
    datefilter(data);
}
function createTable(tableData) {
    let html = `<table id="tableJS">
  <thead>
    <tr>
      <th onclick="sortTable(0)">Name</th>
      <th onclick="sortTable(1)">ID</th>
      <th onclick="sortTable(2)">Depot</th>
      <th onclick="sortTable(3)">In Time</th>
      <th onclick="sortTable(4)">Out Time</th>
      <th onclick="sortTable(5)">Date</th>
      <th onclick="sortTable(6)">Hours worked</th>
    </tr>
  </thead><tbody>`;
    if (!tableData || tableData.length == 0) {
        document.querySelector(".bottom").innerHTML = "NO CONTENT TO DISPLAY!!";
        return;
    }
    tableData.forEach(element=> {
        let intime=new Date(element.date+'T'+element.intime+'Z');
        let out_time=new Date(element.date+'T'+element.out_time+'Z');
        let temphours=new Date(out_time-intime);
        let hours=temphours.getHours()-5;
        let min=temphours.getMinutes()%30;
        html += `
        <tr>
         <td>${element.name}</td>
        <td>${element.id}</td>
        <td>${element.depot}</td>
        <td>${element.intime}</td>
        <td>${element.out_time}</td>
        <td>${element.date}</td>
        <td>${hours}:${min.toString().padStart(2,'0')}</td>
        </tr>`;
        });
    html += `</tbody></table>`;
    document.querySelector(".bottom").innerHTML = html;
}
function resetSortArray()
{
    direction=['','','','','','',''];
}
function quicksortName(data)
{   if(data.length<2)
    return data;
    let left=[],right=[],pivot=data[data.length-1];
    for(i=0;i<data.length-1;i++)
    {
        if(data[i].name.toLowerCase()>pivot.name.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortName(left),pivot,...quicksortName(right)];
}   
    function quicksortId(data)
{   if(data.length<2)
    return data;
    let left=[],right=[],pivot=data[data.length-1];
    for(i=0;i<data.length-1;i++)
    {
        if(data[i].id.toLowerCase()>pivot.id.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortId(left),pivot,...quicksortId(right)];
}   
function quicksortDepot(data)
{   if(data.length<2)
    return data;
    let left=[],right=[],pivot=data[data.length-1];
    for(i=0;i<data.length-1;i++)
    {
        if(data[i].depot.toLowerCase()>pivot.depot.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortDepot(left),pivot,...quicksortDepot(right)];
}   function quicksortInTime(data)
{   if(data.length<2)
    return data;
    let left=[],right=[],pivot=data[data.length-1];
    for(i=0;i<data.length-1;i++)
    {
        if(data[i].intime.toLowerCase()>pivot.intime.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortInTime(left),pivot,...quicksortInTime(right)];
}   function quicksortout_time(data)
{   if(data.length<2)
    return data;
    let left=[],right=[],pivot=data[data.length-1];
    for(i=0;i<data.length-1;i++)
    {
        if(data[i].out_time.toLowerCase()>pivot.out_time.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortout_time(left),pivot,...quicksortout_time(right)];
}  function quicksortdate(data)
{   if(data.length<2)
    return data;
    let left=[],right=[],pivot=data[data.length-1];
    for(i=0;i<data.length-1;i++)
    {
        if(data[i].date.toLowerCase()>pivot.date.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortdate(left),pivot,...quicksortdate(right)];
}  function quicksortHours(data)
{   if(data.length<2)
    return data;
    let left=[],right=[],pivot=data[data.length-1];
    for(i=0;i<data.length-1;i++)
    {
        if(data[i].hours>pivot.hours)
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortHours(left),pivot,...quicksortHours(right)];
}     
let direction=['','','','','','',''];
function sortTable(n) {
    
    switch(n)
    {
        case 0:
            if(!direction[0])
            {data=quicksortName(data);
            datefilter(data);
            resetSortArray();
            direction[0]='asc';
            break;
            }
            if(direction[0]==='asc')
            {
            direction[0]='desc';
            data=data.reverse();
            createTable(data);
            break;
            }
            if(direction[0]==='desc')
            {
                direction[0]='asc';
                data=data.reverse();
                createTable(data);
                break;
            }
            case 1:
            if(!direction[1])
            {data=quicksortId(data);
            resetSortArray();
            createTable(data);
            direction[1]='asc';
            break;
            }
            if(direction[1]==='asc')
            {
            direction[1]='desc';
            data=data.reverse();
            createTable(data);
            break;
            }
            if(direction[1]==='desc')
            {
                direction[1]='asc';
                data=data.reverse();
                createTable(data);
                break;
            }
            case 2:
            if(!direction[2])
            {data=quicksortDepot(data);
            createTable(data);
            resetSortArray();
            direction[2]='asc';
            break;
            }
            if(direction[2]==='asc')
            {
            direction[2]='desc';
            data=data.reverse();
            createTable(data);
            break;
            }
            if(direction[2]==='desc')
            {
                direction[2]='asc';
                data=data.reverse();
                createTable(data);
                break;
            }
            case 3:
            if(!direction[3])
            {data=quicksortInTime(data);
            createTable(data);
            resetSortArray();
            direction[3]='asc';
            break;
            }
            if(direction[3]==='asc')
            {
            direction[3]='desc';
            data=data.reverse();
            createTable(data);
            break;
            }
            if(direction[3]==='desc')
            {
                direction[3]='asc';
                data=data.reverse();
                createTable(data);
                break;
            }
            case 4:
            if(!direction[4])
            {data=quicksortout_time(data);
            createTable(data);
            resetSortArray();
            direction[4]='asc';
            break;
            }
            if(direction[4]==='asc')
            {
            direction[4]='desc';
            data=data.reverse();
            createTable(data);
            break;
            }
            if(direction[4]==='desc')
            {
                direction[4]='asc';
                data=data.reverse();
                createTable(data);
                break;
            }
            case 5:
            if(!direction[5])
            {data=quicksortdate(data);
            createTable(data);
            resetSortArray();
            direction[5]='asc';
            break;
            }
            if(direction[5]==='asc')
            {
            direction[5]='desc';
            data=data.reverse();
            createTable(data);
            break;
            }
            if(direction[5]==='desc')
            {
                direction[5]='asc';
                data=data.reverse();
                createTable(data);
                break;
            }
            case 6:
            if(!direction[6])
            {data=quicksortHours(data);
            createTable(data);
            resetSortArray();
            direction[6]='asc';
            break;
            }
            if(direction[6]==='asc')
            {
            direction[6]='desc';
            data=data.reverse();
            data=quicksortHours(data);
            createTable(data);
            break;
            }
            if(direction[6]==='desc')
            {
                direction[6]='asc';
                data=data.reverse();
                createTable(data);
                break;
            }
            
            
}
}

// Make sortTable globally accessible
window.sortTable = sortTable;