const parameters = new URLSearchParams(window.location.search);  
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
});
document.addEventListener('DOMContentLoaded', () => {
            const searchByIdRadio = document.getElementById('searchById');
            const searchByDepotRadio = document.getElementById('searchByDepot');
            const idWiseForm = document.querySelector('.search-form.id-wise');
            const depotWiseForm = document.querySelector('.search-form.depot-wise');
            startDate.value="2025-09-29";
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

async function getdata() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    try {
        let jsonFile = await fetch("http://127.0.0.1:5500/data?start=2026-01-28&end=2026-01-31");
        if (!jsonFile.ok) {
            throw new Error("can't pull data");
        }
        const response = await jsonFile.json();
        allData=response;

        data = allData;
        resetSortArray();
        datefilter(data);
    } catch (error) {
        console.error("Failed to get data:", error);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

function pageControl() {
    let totalPages;

    if (showabsent)
        totalPages = Math.ceil(filterCategory(filterDepot(filterAbsent(data))).length / rowsPerPage);
    else
        totalPages = Math.ceil(filterCategory(filterDepot(filterpresent(data))).length / rowsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1 || totalPages===0;
    nextBtn.disabled = currentPage === totalPages || totalPages===0;
}

getdata();

function datefilter(allData) {
    resetSortArray();
    let startDateVal = startDate.value.toString();
    let endDateVal = endDate.value.toString();
    data = allData.filter(element => {
        const elementDate = element.date;
        return (elementDate >= startDateVal && elementDate <= endDateVal)||elementDate===' ';
    });

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
        const elementDate = element.date;
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
        let elementDate = element.date;
        if (elementDate === ' ') elementDate = element.date;

        ExcelData.push([
            index + 1,
            element['EmployeeName'],
            element['EmployeeCode'],
            element['SECTION'],
            element['InTime'],
            element['OutTime'],
            elementDate,
            element.HoursWorked,
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

    let filteredData = getFilteredDataForExcel(); 

    filteredData = filterAbsent(filteredData);

    filteredData.forEach((element, index) => {
        let elementDate = element.date;
        if (elementDate === ' ') elementDate = element.date;

        ExcelData.push([
            index + 1,
            element['EmployeeName'],
            element['EmployeeCode'],
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
        let startsWithResults = allData.filter(element =>
            String(element['EmployeeCode']).startsWith(query) 
            );
        if (startsWithResults.length > 0) {
            data = startsWithResults;
        } else {
            data = allData.filter(element => {
               
                return (
                    (String(element['EmployeeCode']).includes(query) && !String(element['EmployeeCode']).startsWith(query)) 
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
        let startsWithResults = allData.filter(element =>
            element['EmployeeName'].toString().toLowerCase().startsWith(query) );
        if (startsWithResults.length > 0) {
            data = startsWithResults;
        } else {
            data = allData.filter(element => {
                
                    (element['EmployeeName'].toString().toLowerCase().includes(query) && !element['EmployeeName'].toString().toLowerCase().startsWith(query)) 
            });
        }
    }
    datefilter(data);
}


function createTable(tableData, page) {
    if (showabsent) {
        renderTable(filterAbsent(tableData), page);

    }
    else {
        renderTable(filterpresent(tableData), page);

    }
}
function filterpresent(data) {
 
    return data.filter(element=>element.SECTION!=='');
}
function filterAbsent(data)
{
    return data.filter(element=>element.SECTION==='');
}
function filterDepot(data)
{   let currentDepot=searchDepot.value;
    let result;
    if(currentDepot!=='All depots')
    result=data.filter(element=>element['SECTION']===currentDepot);
    else
        result=data;
    return result;
}
const catrgorySelect=document.getElementById("categorySelect");
catrgorySelect.addEventListener("change",()=>{
    datefilter(data);
});
function filterCategory(data)
{
    let currentCat=catrgorySelect.value;
    if(currentCat=="all")
        return data;
    let result=data.filter(element=>element.CAT===currentCat);
    return result;
    
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
      <th>Category</th>
      <th>Department</th>
    </tr>
  </thead><tbody>`;
  tableData=filterDepot(tableData);
  tableData=filterCategory(tableData);
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

        const elementDate=element.date;
        html += `
        <tr>
        <td>${++currentTable}</td>
        <td><a href="../employeeData/index.html?id=${element['EmployeeCode']}&loginName=${loginUserName}">${element['EmployeeName']}</a></td>
        <td>${element['EmployeeCode']}</td>
        <td>${element['SECTION']}</td>
        <td>${element['InTime']}</td>
        <td>${element['OutTime']}</td>
        <td>${elementDate}</td>
        <td>${element.HoursWorked}</td>
        <td>${element.CAT}</td>
        <td>${element.Department}</td>
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
    return data.slice().sort((a, b) => {
        const A = (a['EmployeeName'] || '').toString();
        const B = (b['EmployeeName'] || '').toString();
        return A.localeCompare(B);
    });
}

function quicksortId(data) {
    return data.slice().sort((a, b) => {
        const na = a['EmployeeCode'];
        const nb = b['EmployeeCode'];
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return String(a['EmployeeCode'] || '').localeCompare(String(b['EmployeeCode'] || ''));
    });
}

function quicksortDepot(data) {
    return data.slice().sort((a, b) => {
        const A = (a['SECTION'] || '').toString();
        const B = (b['SECTION'] || '').toString();
        return A.localeCompare(B);
    });
}

function quicksortInTime(data) {
    return data.slice().sort((a, b) => {
        const A = (a.InTime || '').toString();
        const B = (b.InTime || '').toString();
        return A.localeCompare(B);
    });
}

function quicksortout_time(data) {
    return data.slice().sort((a, b) => {
        const A = (a.OutTime || '').toString();
        const B = (b.OutTime || '').toString();
        return A.localeCompare(B);
    });
}

function quicksortdate(data) {
    return data.slice().sort((a, b) => {
        const A = (a.date || '').toString();
        const B = (b.date || '').toString();
        return A.localeCompare(B);
    });
}

function quicksortHours(data) {
    return data.slice().sort((a, b) => {
        const na = parseFloat(a.HoursWorked);
        const nb = parseFloat(b.HoursWorked);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return String(a.Overtime || '').localeCompare(String(b.Overtime || ''));
    });
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

window.sortTable = sortTable;