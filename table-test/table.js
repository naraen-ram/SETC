let data = [];
let allData = [];

async function getdata() {
    let jsonFile = await fetch("dummy.json");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
    data = allData;
    createTable(data);
}

let butt = document.querySelector(".searchButton");
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
butt.addEventListener("click", () => {
    let query = document.getElementById("search").value.trim().toLowerCase();
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
    createTable(data);
});
getdata();
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
    tableData.forEach(element => {
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

function sortTable(n) {
    let table, direction = 'asc', rows, switching = true, i, x, y, shouldSwitch, switchcount = 0;
    table = document.getElementById("tableJS");
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (direction === "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
            else if (direction === "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        }
        else {
            if (switchcount === 0 && direction === "asc") {
                direction = "desc";
                switching = true;
            }
        }
    }
}

// Make sortTable globally accessible
window.sortTable = sortTable;