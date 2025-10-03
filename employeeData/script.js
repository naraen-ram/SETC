//declarations


const parameters = new URLSearchParams(window.location.search);  //from the url gets the parameters
// console.log(parameters)
const loginUserName = parameters.get('loginName');
const empId = parameters.get('id');
// console.log(empId); 
let data=[];
//let lateArrivalTime = "09:15:00"; //Consider 9 am as the deadline for the entry
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

/* To set inital date */
let now = new Date();
// console.log(now)
let startDt = new Date(now.getFullYear(), now.getMonth(), 2);
let endDt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
// console.log(now.getMonth()+1)
startDate.value = startDt.toISOString().split("T")[0]
endDate.value = endDt.toISOString().split("T")[0]
// console.log(startDate.value)

/* startDate.value="2025-09-01";
endDate.value="2025-10-00"; */
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
function hoursWorked(inTime,outTime) {
    let [datePart, timePart] = inTime.split(" ");
    let [day, month, year] = datePart.split("-").map(Number);
    let [hour, minute] = timePart.split(":").map(Number);
    let h1 = new Date(year, month - 1, day, hour, minute);
    
    [datePart, timePart] = outTime.split(" ");
    [day, month, year] = datePart.split("-").map(Number);
    [hour, minute] = timePart.split(":").map(Number);
    let h2 = new Date(year, month - 1, day, hour, minute);
    
    let diff = h2-h1
    return String(Math.floor((diff/(1000*3600))%3600)).padStart(2,'0')+":"+String(Math.floor((diff/(1000*60)))%60).padStart(2,"0")
}
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
async function getData() {
    let jsonFile = await fetch("http://127.0.0.1:5500/data");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
    allData=allData.allData;
    data = allData;
  //console.log(allData);
  //console.log(empId);
    data = data.filter(item => item['Employee Code'].toString() === empId);
    allData=data;
  //console.log(data);
   
    datefilter(data);
    document.getElementById("empHeadName").innerText += ` ${allData[0]['Employee Name']}`;
    document.getElementById("empHeadId").innerText += ` ${empId}`;
    document.getElementById("empHeadDesignation").innerText += ` ${allData[0].DESIG}`;
    document.getElementById("empHeadCat").innerText += allData[0]['CAT'];
    document.getElementById("empHeadDepot").innerText += ` ${allData[0]['SECTION']}`;
    updateButtonState();
}
getData(); // called the getData() function
/*function isPresent(val) {
    return val.StatusCode==='P' ? "Present" : "Absent";
}*/
function isLate(val) {
    /*if (val === "N/A")
        return "N/A";*/
    if (val.Status === "Absent")
        return "-"  
    return val.LateBy!==0 ? "Late" : "On Time";
}


function datefilter(allData) {
    //resetSortArray();
    //let results = [];
    let startDateVal = startDate.value;
    let endDateVal = endDate.value;
    data = allData.filter(element => {
        const elementDate = dateConverter(element.AttendanceDate);
        return (elementDate >= startDateVal && elementDate <= endDateVal)||elementDate===' ';
    }); 
   //data = results;
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
    // console.log(pageData);
    // console.log(pageData);

    if (!pageData || pageData.length == 0) {
        empData.innerHTML = "<tr><td colspan='6'>No data available</td></tr>";
    }
    else {
        pageData.forEach((item) => {
            /*if (item['StatusCode'] === 'A') {
                item.ntime = "N/A";
                item.out_time = "N/A";
            }8*/
            let elementDate=dateConverter(item.AttendanceDate);
           /* if(elementDate===' ')
                elementDate=item.AttendanceDate;*/
            item.InTime = item.InTime === "00:00"?"-":item.InTime
            item.OutTime = item.OutTime === "00:00"?"-":item.OutTime
            empData.innerHTML += `
                <tr>
                <td>${currentTable + 1}</td>
                <td>${elementDate}</td>
                <td>${item.InTime}</td>
                <td>${item.OutTime}</td>
                <td style="background-color: ${item.StatusCode === "P" ? '' : "#e36464"}">${item.Status}</td>
                <td style="background-color: ${item.LateBy!==0 ? "#e0fa5fff" : ""} ; ">${isLate(item)}</td>
                <td>${hoursWorked(item['In DateTime'],item['Out DateTime'])}</td>
                
            </tr>
            `;
             
            currentTable++;
        });
        
        pageInfo.innerText = `Page ${page} of ${totalPages}`;
        
        
    }
}
/* <td>${hourformatter(item.Duration+item.Overtime)}</td> */
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
        const elementDate = dateConverter(element.AttendanceDate);
        return (elementDate >= startDateVal && elementDate <= endDateVal)||elementDate===' ';
    });
        ex_data.forEach((item,index) => {
          
            let elementDate=dateConverter(item.AttendanceDate);
            ExcelData.push([index + 1, elementDate, item.InTime, item.OutTime, item.Status, isLate(item), hoursWorked(item['In DateTime'],item['Out DateTime'])]);
            
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