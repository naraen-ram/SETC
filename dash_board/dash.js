//declarations


let allData = [];
const parameters = new URLSearchParams(window.location.search);  //from the url , username is retrieved
const loginUserName = parameters.get('loginName');
//console.log(loginUserName);
const today=new Date();
const buttons = document.querySelectorAll('.circle-btn');
let querydate=today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
//console.log(querydate);
let inCount=outCount=lateCount=activeCount=absentCount=leaveCount=0;
let menu=document.querySelector(".menu");
let button=document.querySelector(".menu-button");
const ctx = document.getElementById('myPieChart').getContext('2d');
const initialData = {
  labels: ['present', 'absent', 'late'],
  datasets: [{
    data: [300, 50, 100],
    backgroundColor: [ '#36A2EB','#FF6384', '#FFCE56']
  }]
};
let myPieChart = new Chart(ctx, {
  type: 'pie',
  data: initialData,
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});


//actions


buttons[buttons.length - 1].style.backgroundColor = "#36A2EB"; // Set the last button to blue
document.querySelector(".user-name").textContent = loginUserName;
document.querySelector(".employee-details-btn").addEventListener("click", function () {
  window.location.href = `../emp_data/employee_data.html?loginName=${encodeURIComponent(loginUserName)}`;
});
for (let i = 0; i < buttons.length; i++) {
    let date = new Date(today);
    date.setDate(today.getDate() - (buttons.length - 1 - i));
    const formattedDate = date.getFullYear() + '-' +
        String(date.getMonth() + 1).padStart(2, '0') + '-' +
        String(date.getDate()).padStart(2, '0');
    buttons[i].textContent = formattedDate[8]+formattedDate[9];
    buttons[i].style.fontSize = "12px";
    buttons[i].style.color = "#333";
    buttons[i].addEventListener('click', (event)=> {
        selectedButtonColor(event);
        querydate = formattedDate;
        renderPage();
        
    });
}




//functions


function updatechart()
{
    let newData=[inCount-lateCount,absentCount,lateCount];
    myPieChart.data.datasets[0].data=newData;
    myPieChart.update();
}
async function getdata() {
    let jsonFile = await fetch("../database/attendance.json");
    if (!jsonFile.ok) {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
   renderPage();
    
    
}

getdata();
function renderPage()
{
  inCount=outCount=lateCount=activeCount=absentCount=leaveCount=0;
    filteredData=allData.filter(element=> element.AttendanceDate.substring(0,2) ===querydate.substring(8,10));
    for(let i=0;i<filteredData.length;i++)
    {  
        if(filteredData[i].InTime!=='00:00')
        {
        inCount++;
        if(filteredData[i].LateBy!==0 )
          lateCount++;
        }
        if(filteredData[i].OutTime!=='00:00')
            outCount++;
          if(filteredData[i]['Is On Leave']!==0)
            leaveCount++;
        /*let intime = new Date(`1970-01-01T${filteredData[i].intime}`);
        let cutoff = new Date(`1970-01-01T09:15:00`);

        if (intime > cutoff)
            lateCount++;
        */
        activeCount = inCount - outCount;
    }
    absentCount = filteredData.length - inCount;

    document.querySelector("#in").innerHTML = inCount.toString();
    document.querySelector("#leave").innerHTML = leaveCount.toString();
    document.querySelector("#out").innerHTML=outCount.toString();
    document.querySelector("#late").innerHTML = lateCount.toString();
    document.querySelector("#absent").innerHTML = absentCount.toString();
   document.querySelector("#active").innerHTML=activeCount.toString();
  updatechart();
}
// Store today's date in the last circle button, and previous dates in others
function selectedButtonColor(event)
{
  for(let x=0;x<buttons.length;x++)
  {
    buttons[x].style.backgroundColor = "";
  }
  event.target.style.backgroundColor = "#36A2EB";
}
