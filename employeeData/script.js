//declarations
const PORT = 5501

const parameters = new URLSearchParams(window.location.search); 
const loginUserName = parameters.get('loginName');
const empId = parameters.get('id');
let data=[];
empData = document.getElementById("empData");
empData.innerHTML = "";
let startDate = document.getElementById("startDate");
let endDate = document.getElementById("endDate");
let rowsPerPage = 10;
let currentPage = 1;
let pageInfo = document.getElementById("pageInfo");
let totalPages = 0;
let nextButton = document.getElementById("nextBtn");
let previousButton = document.getElementById("prevBtn");
const date=new Date();
const formattedDate = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');

//actions

let now = new Date();
let startDt = new Date("2026-01-01");
let endDt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
startDate.value = startDt.toISOString().split("T")[0]
endDate.value = endDt.toISOString().split("T")[0]
endDate.min = startDate.value;
startDate.max=endDate.value;
startDate.addEventListener('change', () => {
    endDate.min = startDate.value;
    datefilter(allData);
});
endDate.addEventListener('change', () => {
    startDate.max=endDate.value;
    datefilter(allData);
});
nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        createTable(data, currentPage);
        updateButtonState();
    }
});
previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        createTable(data, currentPage);
        updateButtonState();
    }
});
document.querySelector(".user-name").textContent = loginUserName;

//functions

async function getData() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    try {
        let jsonFile = await fetch(`http://127.0.0.1:${PORT}/employee?id=${empId}`);
        if (!jsonFile.ok) {
            throw new Error("can't pull data");
        }
        allData = await jsonFile.json();
        data = allData;
        datefilter(data);
        document.getElementById("empHeadName").innerText += ` ${allData[0]['EmployeeName']}`;
        document.getElementById("empHeadId").innerText += ` ${empId}`;
        document.getElementById("empHeadDesignation").innerText += ` ${allData[0].DESIG}`;
        document.getElementById("empHeadCat").innerText += allData[0]['CAT'];
        document.getElementById("empHeadDepot").innerText += ` ${allData[0]['SECTION']}`;
        updateButtonState();
    } catch (error) {
        console.error("Failed to fetch data:", error);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}
getData(); 
function isLate(val) {

    if (val.InTime === "null")
        return "-"  
    return val.InTime>"09:00:00" ? "Late" : "On Time";
}


function datefilter(allData) {

    let startDateVal = startDate.value;
    let endDateVal = endDate.value;
    data = allData.filter(element => {
        const elementDate = element.date;
        return (elementDate >= startDateVal && elementDate <= endDateVal)||elementDate===' ';
    }); 
    currentPage = 1;
    createTable(data,currentPage);
    updateButtonState();
    
}

function createTable(data, page) 
{
    empData.innerHTML = "";
    
    totalPages = Math.ceil(data.length / rowsPerPage);
    let currentTable = (page - 1) * rowsPerPage;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = data.slice(startIndex, endIndex);

    if (!pageData || pageData.length == 0) {
        empData.innerHTML = "<tr><td colspan='6'>No data available</td></tr>";
    }
    else {
        pageData.forEach((item) => {
         
            let elementDate=item.date;
            item.InTime = item.InTime === "00:00"?"-":item.InTime
            item.OutTime = item.OutTime === "00:00"?"-":item.OutTime
            empData.innerHTML += `
                <tr>
                <td>${currentTable + 1}</td>
                <td>${elementDate}</td>
                <td>${item.InTime}</td>
                <td>${item.OutTime}</td>
                <td style="background-color: ${item.InTime === null ? '#e36464' : ""}">${item.InTime === "" ? 'Absent' : "Present"}</td>
                <td style="background-color: ${item.InTime>"09:00:00" ? "#e0fa5fff" : ""} ; ">${isLate(item)}</td>
                <td>${item.HoursWorked}</td>
                
            </tr>
            `;
            
            currentTable++;
        });
        
        pageInfo.innerText = `Page ${page} of ${totalPages}`;
        
        
    }
}
function ExcelGenerator()
{   
    ExcelData=[  
                 [], 
                 ["Name:",allData[0]['Employee Name'],,,"Emp.ID:",empId],
                 ["Category:",allData[0]['Category'],,,"Depot:",allData[0]['SECTION']],
                 [],
                 ["S.No","Date","In-Time","Out-Time","Attendance","Arrival","Hours_worked"],
                 [],

            ];    
    let startDateVal = startDate.value;
    let endDateVal = endDate.value;
    ex_data = allData.filter(element => {
        const elementDate = element.date;
        return (elementDate >= startDateVal && elementDate <= endDateVal)||elementDate===' ';
    });
        ex_data.forEach((item,index) => {
          
            let elementDate=item.date;
            ExcelData.push([index + 1, elementDate, item.InTime, item.OutTime, item.HoursWorked]);
            
        });
    return ExcelData;
            
}


function updateButtonState() {
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    previousButton.disabled = currentPage === 1 || totalPages === 0;
}

function exportToExcel() 
{
            ExcelData=ExcelGenerator();
            const ws = XLSX.utils.aoa_to_sheet(ExcelData);
            ws['!cols'] = 
            [
              { wch: 5 },   
              { wch: 12 },  
              { wch: 10 },  
              { wch: 10 },  
              { wch: 12 },  
              { wch: 12 },  
              { wch: 15 }   
            ];
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "SETC_Attendance");
            XLSX.writeFile(wb, "SETC_Attendance.xlsx");
}