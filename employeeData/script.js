//declarations

const parameters = new URLSearchParams(window.location.search);  //from the url gets the parameters
const empId = parameters.get('id');
// console.log(empId); 
let data;
let lateArrivalTime = "09:15:00"; //Consider 9 am as the deadline for the entry
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


//actions
startDate.addEventListener('change', () => {
    endDate.min = startDate.value;
    datefilter(data);
});
endDate.addEventListener('change', () => {
    datefilter(data);
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

//functions


async function getData() {
    let jsonFile = await fetch("../database/dummy.json");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
    data = allData;
  //  console.log(data);
    data = data.filter((item) => {
        // console.log(item.id, empId);
        return item.id === empId;
    });
   // console.log(data);
    datefilter(data);
    document.getElementById("empHeadName").innerText += ` ${data[0].name}`;
    document.getElementById("empHeadId").innerText += ` ${empId}`;
    // document.getElementById("empHeadDesignation").innerText += ` ${data[0].designation}`;
    document.getElementById("empHeadDesignation").innerText += ` DNC`;
    document.getElementById("empHeadDepot").innerText += ` ${data[0].depot}`;
    updateButtonState();
}
getData(); // called the getData() function
function isPresent(val) {
    return val ? "Present" : "Absent";
}
function isLate(time) {
    if (time === "N/A")
        return "N/A";
    return time > lateArrivalTime ? "Late" : "On Time";
}

function datefilter(allData) {
    //resetSortArray();
    let results = [];
    let startDateVal = document.getElementById("startDate").value.toString();
    let endDateVal = document.getElementById("endDate").value.toString();
    results = allData.filter(element => (element.date >= startDateVal && element.date <= endDateVal));
    filterdData = results;


    currentPage = 1;
    createTable(filterdData, currentPage);
}

function createTable(data, page) {
    empData.innerHTML = "";
    totalPages = Math.ceil(data.length / rowsPerPage);
    let currentTable = (page - 1) * rowsPerPage;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = data.slice(startIndex, endIndex);
    // console.log(pageData);

    if (!pageData || pageData.length == 0) {
        empData.innerHTML = "<tr><td colspan='6'>No data available</td></tr>";
    }
    else {
        pageData.forEach((item) => {
            if (isPresent(item.present) === "Absent") {
                item.intime = "N/A";
                item.out_time = "N/A";
            }
            empData.innerHTML += `
                <tr>
                <td>${currentTable + 1}</td>
                <td>${item.date}</td>
                <td>${item.intime}</td>
                <td>${item.out_time}</td>
                <td style="background-color: ${isPresent(item.present) === "Present" ? '' : "#e36464"}">${isPresent(item.present)}</td>
                <td style="background-color: ${isLate(item.intime) === "Late" ? "#e0fa5fff" : ""} ; ">${isLate(item.intime)}</td>
            </tr>
            `;
            currentTable++;
        });
        pageInfo.innerText = `Page ${page} of ${totalPages}`;
    }
}

function updateButtonState() {
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
    previousButton.disabled = currentPage === 1 || totalPages === 0;
}
