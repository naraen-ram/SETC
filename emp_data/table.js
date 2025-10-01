const parameters = new URLSearchParams(window.location.search);  //from the url , username is retrieved
const loginUserName = parameters.get('loginName');
let data = [];
let allData = [];
let direction = ['', '', '', '', '', '', ''];
showabsent = false;
currentTable = 0;
const rowsPerPage = 50;
let currentPage = 1;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let date = new Date();
const formattedDate = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
const pageInfo = document.getElementById('pageInfo');
let searchBar = document.getElementById("search");
let searchIdButton=document.getElementById("searchId");
let toggle=document.getElementById("toggle");
const searchByIdRadio=document.getElementById("searchById");
const searchDepot = document.getElementById("searchDepot");
const searchByDepotRadio = document.getElementById('searchByDepot');
let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
//console.log(loginUserName);




//actions
startDate.value=formattedDate;
endDate.value=formattedDate;
endDate.min = startDate.value;
startDate.max=endDate.value;
document.querySelector(".user-name").textContent = loginUserName;
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
searchBar.addEventListener('keyup',(val)=>{
    searcher();
    //searchBar.value='';
});
document.addEventListener('DOMContentLoaded', () => {
            const searchByIdRadio = document.getElementById('searchById');
            const searchByDepotRadio = document.getElementById('searchByDepot');
            const idWiseForm = document.querySelector('.search-form.id-wise');
            const depotWiseForm = document.querySelector('.search-form.depot-wise');
            startDate.value=formattedDate;
            endDate.value=formattedDate;
            toggle.checked=false;
            function toggleSearchForm() {
                if (searchByIdRadio.checked) {
                    idWiseForm.style.display = 'flex';
                    depotWiseForm.style.display = 'none';
                } else {
                    idWiseForm.style.display = 'none';
                    depotWiseForm.style.display = 'flex';
                }
            }

            searchByIdRadio.addEventListener('change', toggleSearchForm);
            searchByDepotRadio.addEventListener('change', toggleSearchForm);
            
            // Initial call to set the correct form on page load
            toggleSearchForm();
        });
searchDepot.addEventListener('change',()=>
{
    datefilter(data);
});
toggle.addEventListener('click',()=>
    {
    if(toggle.checked===true)
        showabsent=true;
    else
        showabsent=false;
    datefilter(data);
    currentPage=1;
    }
);

searchIdButton.addEventListener('keyup',(val)=>{
    searcherId();
   // searchBar.value='';
})
searchByIdRadio.addEventListener('click',()=>
{
    searchBar.value='';
    searchDepot.value='All depots';
    datefilter(allData);
});
searchByDepotRadio.addEventListener('click',()=>
{
    searchIdButton.value='';
    datefilter(allData);
});
startDate.addEventListener('change', () => {
    endDate.min = startDate.value;
    searcher();
    searcherId();
    datefilter(data);
});
endDate.addEventListener('change', () => {
    startDate.max=endDate.value;
    searcher();
    searcherId();
    datefilter(data);
});



//functions

function dateConverter(date)
{
    const onlyDate=date.substring(0,2);
    const onlyYear='20'+date.substring(7,9);
    let onlyMonth=' ';
    switch(date.substring(3,6))
    {
        case 'Jan':
            onlyMonth='-01-';
            break;
        case 'Feb':
            onlyMonth='-02-';
            break;
        case 'Mar':
            onlyMonth='-03-';
            break;
        case 'Apr':
            onlyMonth='-04-';
            break;
        case 'May':
            onlyMonth='-05-';
            break;
        case 'Jun':
            onlyMonth='-06-';
            break;
        case 'Jul':
            onlyMonth='-07-';
            break;
        case 'Aug':
            onlyMonth='-08-';
            break;
        case 'Sep':
            onlyMonth='-09-';
            break;
        case 'Oct':
            onlyMonth='-10-';
            break;
        case 'Nov':
            onlyMonth='-11-';
            break;
        case 'Dec':
            onlyMonth='-12-';
            break;

    }
    return onlyYear+onlyMonth+onlyDate;
}
function hourformatter(hour)
{   
     if(hour==0)
        return'-';
    // console.log("hr is "+hour%60)
    // console.log((Math.floor(hour/60)).toFixed(0)+':'+ ((hour%60)<10?("0"+(hour%60)):(hour%60)))
    return (Math.floor(hour/60)).toFixed(0)+':'+ ((hour%60)<10?("0"+(hour%60)):(hour%60))
    // return (hour/60-1).toFixed(0)+':'+(hour%60); //prev code
}
async function getdata() {
    let jsonFile = await fetch("http://127.0.0.1:5500/data");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    const response = await jsonFile.json();
    allData=response.data;
    data = allData;
    resetSortArray();
    datefilter(data);
    //createTable(data,currentPage)
}

function pageControl() {
    let totalPages;

    if (showabsent)
        totalPages = Math.ceil(filterDepot(data).length / rowsPerPage);
    else
        totalPages = Math.ceil(filterDepot(filterpresent(data)).length / rowsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1 || totalPages===0;
    nextBtn.disabled = currentPage === totalPages || totalPages===0;
}

getdata();
/*function searcherDepot() {
    resetSortArray();
    let query = searchDepot.value.trim().toLowerCase();
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
}*/
function datefilter(allData) {
    resetSortArray();
   // let results = [];
  // console.log(showabsent);
    let startDateVal = startDate.value.toString();
    let endDateVal = endDate.value.toString();
   // console.log(endDateVal)
    data = allData.filter(element => {
        const elementDate = dateConverter(element.AttendanceDate);
        return (elementDate >= startDateVal && elementDate <= endDateVal)||elementDate===' ';
    });
    //data = results;


    currentPage = 1;
    createTable(data, currentPage);
}
function getFilteredDataForExcel() {
    let filteredData = [...data];

    filteredData = filterDepot(filteredData);

    if (!showabsent) {
        filteredData = filterpresent(filteredData);
    } else {
        filteredData = filterAbsent(filteredData);
    }

    const startDateVal = startDate.value;
    const endDateVal = endDate.value;

    filteredData = filteredData.filter(element => {
        const elementDate = dateConverter(element.AttendanceDate);
        return (elementDate >= startDateVal && elementDate <= endDateVal) || elementDate === ' ';
    });

    return filteredData;
}

function ExcelGenerator() {
    let ExcelData = [
        [],
        ["Date Range: " + startDate.value + " to " + endDate.value],
        [],
        ["No", "Name", "ID", "Depot", "In-Time", "Out-Time", "Date", "Hours-worked", "Shift"],
        []
    ];

    let filteredData = getFilteredDataForExcel();

    filteredData.forEach((element, index) => {
        let elementDate = dateConverter(element.AttendanceDate);
        if (elementDate === ' ') elementDate = element.AttendanceDate;

        ExcelData.push([
            index + 1,
            element['Employee Name'],
            element['Employee Code'],
            element['In Device Name'],
            element['InTime'],
            element['OutTime'],
            elementDate,
            hourformatter(element['Duration'] + element['Overtime']),
            element.ShiftName
        ]);
    });

    return ExcelData;
}

function ExcelGeneratorAbsent() {
    let ExcelData = [
        [],
        ["Date Range: " + startDate.value + " to " + endDate.value],
        [],
        ["No", "Name", "ID", "Date", "Shift"],
        []
    ];

    let filteredData = getFilteredDataForExcel(); // filtered including showabsent

    filteredData = filterAbsent(filteredData);

    filteredData.forEach((element, index) => {
        let elementDate = dateConverter(element.AttendanceDate);
        if (elementDate === ' ') elementDate = element.AttendanceDate;

        ExcelData.push([
            index + 1,
            element['Employee Name'],
            element['Employee Code'],
            elementDate,
            element.ShiftName
        ]);
    });

    return ExcelData;
}

function exportDataToExcel() {
    const ExcelData = ExcelGenerator();
    const ws = XLSX.utils.aoa_to_sheet(ExcelData);
    ws['!cols'] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 10 },
        { wch: 18 },
        { wch: 12 },
        { wch: 12 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SETC_Attendance");
    XLSX.writeFile(wb, "SETC_Attendance.xlsx");
}

function exportAbsentToExcel() {
    const ExcelData = ExcelGeneratorAbsent();
    const ws = XLSX.utils.aoa_to_sheet(ExcelData);
    ws['!cols'] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 10 },
        { wch: 15 },
        { wch: 12 }
    ];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SETC_Attendance");
    XLSX.writeFile(wb, "SETC_Attendance.xlsx");
}

function exportToExcel() {
    if (showabsent) {
        exportAbsentToExcel();
    } else {
        exportDataToExcel();
    }
}


   
function searcherId()
{  resetSortArray();
     let query =searchIdButton.value.trim();
    if (!query) {
        data = allData;
    } else {
        // 1. "Starts with" search
        let startsWithResults = allData.filter(element =>
            //element.name.toLowerCase().startsWith(query) /*||
            String(element['Employee Code']).startsWith(query) 
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
                    (String(element['Employee Code']).includes(query) && !String(element['Employee Code']).startsWith(query)) /*||
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
            element['Employee Name'].toString().toLowerCase().startsWith(query) /*||
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
                
                    (element['Employee Name'].toString().toLowerCase().includes(query) && !element['Employee Name'].toString().toLowerCase().startsWith(query)) /*||
                    (String(element.id).toLowerCase().includes(query) && !String(element.id).toLowerCase().startsWith(query)) ||
                    (element.depot.toLowerCase().includes(query) && !element.depot.toLowerCase().startsWith(query)) ||
                    (element.intime && element.intime.toLowerCase().includes(query) && !element.intime.toLowerCase().startsWith(query)) ||
                    (element.out_time && element.out_time.toLowerCase().includes(query) && !element.out_time.toLowerCase().startsWith(query))*/
                
            });
        }
    }
    datefilter(data);
}


function createTable(tableData, page) {
    if (showabsent) {
        renderAbsentTable(filterAbsent(tableData), page);

    }
    else {
        renderTable(filterpresent(tableData), page);

    }
}
function filterpresent(data) {
    filteredData = data.filter(element => element.StatusCode==='P');
    return filteredData;
}
function filterAbsent(data)
{
    return data.filter(element=>element.StatusCode==='A');
}
function filterDepot(data)
{   let currentDepot=searchDepot.value;
    let result;
    if(currentDepot!=='All depots')
    result=data.filter(element=>element['In Device Name']===currentDepot);
    else
        result=data;
    return result;
}
function renderAbsentTable(tableData, page) {
    document.getElementById("ExcelDownload").style.display="inline-block";
    let html = `<table id="tableJS">
  <thead>
    <tr>
        <th>No</th>
      <th onclick="sortTable(0)">Name</th>
      <th onclick="sortTable(1)">ID</th>
      <th onclick="sortTable(5)">Date</th>
      <th>Shift</th>
    </tr>
  </thead><tbody>`;

  tableData=filterDepot(tableData);
    if (!tableData || tableData.length == 0) {
        document.querySelector(".bottom").innerHTML = "NO CONTENT TO DISPLAY!!";
        document.getElementById("ExcelDownload").style.display="none";
        return;
    }
    
    currentTable = (page - 1) * rowsPerPage;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = tableData.slice(startIndex, endIndex);
    pageData.forEach(element => {

        let elementDate=dateConverter(element.AttendanceDate);
            if(elementDate===' ')
                elementDate=element.AttendanceDate;
        html += `
        <tr>
        <td>${++currentTable}</td>
        <td><a href="../employeeData/index.html?id=${element['Employee Code']}">${element['Employee Name']}</a></td>
        <td>${element['Employee Code']}</td>
        <td>${elementDate}</td>
        <td>${element.ShiftName}</td>
        </tr>`;

    });
    html += `</tbody></table>`;
    document.querySelector(".bottom").innerHTML = html;
    pageControl();
}
function renderTable(tableData, page) {
    document.getElementById("ExcelDownload").style.display="inline-block";
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
      <th>Shift</th>
    </tr>
  </thead><tbody>`;

  tableData=filterDepot(tableData);
    if (!tableData || tableData.length == 0) {
        document.querySelector(".bottom").innerHTML = "NO CONTENT TO DISPLAY!!";
        document.getElementById("ExcelDownload").style.display="none";
        return;
    }
    
    currentTable = (page - 1) * rowsPerPage;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = tableData.slice(startIndex, endIndex);
    pageData.forEach(element => {

        let elementDate=dateConverter(element.AttendanceDate);
            if(elementDate===' ')
                elementDate=element.AttendanceDate;
        html += `
        <tr>
        <td>${++currentTable}</td>
        <td><a href="../employeeData/index.html?id=${element['Employee Code']}&loginName=${loginUserName}">${element['Employee Name']}</a></td>
        <td>${element['Employee Code']}</td>
        <td>${element['In Device Name']}</td>
        <td>${element['InTime']}</td>
        <td>${element['OutTime']}</td>
        <td>${elementDate}</td>
        <td>${hourformatter((element['Duration']+element['Overtime']))}</td>
        <td>${element.ShiftName}</td>
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
        if (data[i]['Employee Name'] > pivot['Employee Name'])
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
        if (data[i]['Employee Code'] > pivot['Employee Code'])
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
        if (data[i]['In Device Name'] > pivot['In Device Name'])
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
        if (data[i].InTime > pivot.InTime)
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
        if (data[i].OutTime > pivot.OutTime)
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
        if (data[i].AttendanceDate > pivot.AttendanceDate)
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
        if (data[i].Overtime > pivot.Overtime)
            right.push(data[i]);
        else
            left.push(data[i]);
    }
    return [...quicksortHours(left), pivot, ...quicksortHours(right)];
}

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