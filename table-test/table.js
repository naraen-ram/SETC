let data = [];
let allData = [];
showabsent = false;
currentTable = 0;
async function getdata() {
    let jsonFile = await fetch("dummy.json");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
    data = allData;
    resetSortArray();
    datefilter(data);
    //createTable(data,currentPage)
}
const rowsPerPage = 50;
let currentPage = 1;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        createTable(data, currentPage);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        createTable(data, currentPage);
    }
});
const pageInfo = document.getElementById('pageInfo');
let searchBar = document.getElementById("search");
let searchButton = document.querySelector(".searchButton");
let searchIdButton=document.getElementById("searchId");
let toggle=document.getElementById("toggle");
toggle.addEventListener('click',()=>
{
if(toggle.checked===true)
    showabsent=true;
else
    showabsent=false;
datefilter(data);
currentPage=1;
});
function pageControl() {
    let totalPages;
    if (showabsent)
        totalPages = Math.ceil(data.length / rowsPerPage);
    else
        totalPages = Math.ceil(filterpresent(data).length / rowsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

searchBar.addEventListener('keyup',(val)=>{
    searcher();
    searchIdButton.value='';
});
searchButton.addEventListener("click", () => {
   searcher();
   searcherId();
   searcherDepot();
}
);
searchIdButton.addEventListener('keyup',(val)=>{
    searcherId();
    searchBar.value='';
})

getdata();
function searcherDepot() {
    resetSortArray();
    let query = document.getElementById("searchDepot").value.trim().toLowerCase();
    if (!query) {
        return;
        //data = allData;  
    } else {
        // 1. "Starts with" search
        // let startsWithResults = allData.filter(element =>
        //     element.depot.toLowerCase().startsWith(query)
        // );
        let startsWithResults = data.filter(element =>
            element.depot.toLowerCase().startsWith(query)
        );
        if (startsWithResults.length > 0) {
            data = startsWithResults;
        } 
        else {
            // 2. Substring search, but exclude "starts with" matches
            data = allData.filter(element =>
                element.depot.toLowerCase().includes(query) &&
                !element.depot.toLowerCase().startsWith(query)
            );
        }
    }
    datefilter(data);
}
function datefilter(allData) {
    resetSortArray();
    let results = [];
    let startDateVal = document.getElementById("startDate").value.toString();
    let endDateVal = document.getElementById("endDate").value.toString();
    results = allData.filter(element => (element.date >= startDateVal && element.date <= endDateVal));
    data = results;


    currentPage = 1;
    createTable(data, currentPage);
}
let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
startDate.addEventListener('change', () => {
    endDate.min = startDate.value;
    searcher();
    datefilter(data);
});
endDate.addEventListener('change', () => {
    searcher();
    datefilter(data);
})

   
function searcherId()
{  resetSortArray();
     let query =
    document.getElementById("searchId").value.trim().toLowerCase();
    if (!query) {
        data = allData;
    } else {
        // 1. "Starts with" search
        let startsWithResults = allData.filter(element =>
            //element.name.toLowerCase().startsWith(query) /*||
            String(element.id).toLowerCase().startsWith(query) 
           /* element.depot.toLowerCase().startsWith(query) ||
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
                   // (element.name.toLowerCase().includes(query) && !element.name.toLowerCase().startsWith(query)) /*||
                    (String(element.id).toLowerCase().includes(query) && !String(element.id).toLowerCase().startsWith(query)) /*||
                    (element.depot.toLowerCase().includes(query) && !element.depot.toLowerCase().startsWith(query)) ||
                    (element.intime && element.intime.toLowerCase().includes(query) && !element.intime.toLowerCase().startsWith(query)) ||
                    (element.out_time && element.out_time.toLowerCase().includes(query) && !element.out_time.toLowerCase().startsWith(query))*/
                );
            });
        }
    }
    datefilter(data);
}

function searcher() {
    resetSortArray();
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


function createTable(tableData, page) {
    if (showabsent === true) {
        renderTable(tableData, page);

    }
    else {
        renderTable(filterpresent(tableData), page);

    }
}
function filterpresent(data) {
    filteredData = data.filter(element => element.present);
    return filteredData;
}

function renderTable(tableData, page) {
    let html = `<table id="tableJS">
  <thead>
    <tr>
        <th>No</th>
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
    currentTable = (page - 1) * rowsPerPage;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = tableData.slice(startIndex, endIndex);
    pageData.forEach(element => {

        html += `
        <tr>
        <td>${++currentTable}</td>
         <td>${element.name}</td>
        <td>${element.id}</td>
        <td>${element.depot}</td>
        <td>${element.intime}</td>
        <td>${element.out_time}</td>
        <td>${element.date}</td>
        <td>${element.hours}</td>
        </tr>`;

    });
    html += `</tbody></table>`;
    document.querySelector(".bottom").innerHTML = html;
    pageControl();
}
function resetSortArray() {
    direction = ['', '', '', '', '', '', ''];
}
function quicksortName(data) {
    if (data.length < 2)
        return data;
    let left = [], right = [], pivot = data[data.length - 1];
    for (i = 0; i < data.length - 1; i++) {
        if (data[i].name.toLowerCase() > pivot.name.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortName(left), pivot, ...quicksortName(right)];
}
function quicksortId(data) {
    if (data.length < 2)
        return data;
    let left = [], right = [], pivot = data[data.length - 1];
    for (i = 0; i < data.length - 1; i++) {
        if (data[i].id.toLowerCase() > pivot.id.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortId(left), pivot, ...quicksortId(right)];
}
function quicksortDepot(data) {
    if (data.length < 2)
        return data;
    let left = [], right = [], pivot = data[data.length - 1];
    for (i = 0; i < data.length - 1; i++) {
        if (data[i].depot.toLowerCase() > pivot.depot.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortDepot(left), pivot, ...quicksortDepot(right)];
} function quicksortInTime(data) {
    if (data.length < 2)
        return data;
    let left = [], right = [], pivot = data[data.length - 1];
    for (i = 0; i < data.length - 1; i++) {
        if (data[i].intime > pivot.intime)
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortInTime(left), pivot, ...quicksortInTime(right)];
} function quicksortout_time(data) {
    if (data.length < 2)
        return data;
    let left = [], right = [], pivot = data[data.length - 1];
    for (i = 0; i < data.length - 1; i++) {
        if (data[i].out_time > pivot.out_time)
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortout_time(left), pivot, ...quicksortout_time(right)];
} function quicksortdate(data) {
    if (data.length < 2)
        return data;
    let left = [], right = [], pivot = data[data.length - 1];
    for (i = 0; i < data.length - 1; i++) {
        if (data[i].date.toLowerCase() > pivot.date.toLowerCase())
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortdate(left), pivot, ...quicksortdate(right)];
} function quicksortHours(data) {
    if (data.length < 2)
        return data;
    let left = [], right = [], pivot = data[data.length - 1];
    for (i = 0; i < data.length - 1; i++) {
        if (data[i].hours > pivot.hours)
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortHours(left), pivot, ...quicksortHours(right)];
}
let direction = ['', '', '', '', '', '', ''];
function sortTable(n) {
    const sortFunctions = [
        quicksortName,
        quicksortId,
        quicksortDepot,
        quicksortInTime,
        quicksortout_time,
        quicksortdate,
        quicksortHours
    ];

    if (!direction[n]) {
        data = sortFunctions[n](data);
        createTable(data, currentPage);
        resetSortArray();
        direction[n] = 'asc';
    } else if (direction[n] === 'asc') {
        direction[n] = 'desc';
        data = data.reverse();
        createTable(data, currentPage);
    } else if (direction[n] === 'desc') {
        direction[n] = 'asc';
        data = data.reverse();
        createTable(data, currentPage);
    }
}

// Make sortTable globally accessible
window.sortTable = sortTable;