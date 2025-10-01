//declarations
let lineChartData;
let allData = [];
const parameters = new URLSearchParams(window.location.search);  //from the url , username is retrieved
const loginUserName = parameters.get('loginName');
//console.log(loginUserName);
const today=new Date();
const buttons = document.querySelectorAll('.circle-btn');
let querydate=today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
const searchDepot = document.getElementById("searchDepot");
//console.log(querydate);
let inCount=outCount=lateCount=activeCount=absentCount=leaveCount=0;
let menu=document.querySelector(".menu");
let button=document.querySelector(".menu-button");
const ctx = document.getElementById('myPieChart').getContext('2d');
const initialData = {
  labels: ['present', 'absent', 'late'],
  datasets: [{
    data: [300, 50, 100],
    backgroundColor: [ '#36A2EB','#FF6384', '#FFCE56'],
    hoverBackGroundColor:['#0099ffff','#ff4c73ff', '#ffb700ff'],
    hoverOffset:10,
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

/*document.addEventListener("DOMContentLoaded",()=>{
    scheduleDailyTask();
    //console.log(localStorage.getItem('lastDailyRun'))
});*/
document.querySelector(".employee-details-btn").addEventListener("click", function () {
window.location.href = `../emp_data/employee_data.html?loginName=${encodeURIComponent(loginUserName)}`;
});
searchDepot.addEventListener('change',()=>
{
    renderPage();
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


function createLineChart()
{
const ctx = document.getElementById('lineChart').getContext('2d');
        let names=[];
        let presentLine=[],lateLine=[],absentLine=[];
        let datename;
        for(let i=0;i<lineChartData.length;i++)
        {   datename=new Date;
            datename.setDate(today.getDate()-31+i);
            names.push(datename.toLocaleDateString('de-DE'));
            presentLine.push(lineChartData[i][0]);
            //console.log(lineChartData[i][0])
            lateLine.push(lineChartData[i][2]);
            absentLine.push(lineChartData[i][1]);
        }
        const totalDuration = 6000;
        const delayBetweenPoints = totalDuration / presentLine.length;
        const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
        const animation = {
        x: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: NaN, // the point is initially skipped
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.xStarted) {
            return 0;
            }
            ctx.xStarted = true;
            return ctx.index * delayBetweenPoints;
        }
        },
        y: {
        type: 'number',
        easing: 'linear',
        duration: delayBetweenPoints,
        from: previousY,
        delay(ctx) {
            if (ctx.type !== 'data' || ctx.yStarted) {
            return 0;
            }
            ctx.yStarted = true;
            return ctx.index * delayBetweenPoints;
        }
        }
        };
        // 4. Create the chart configuration
        new Chart(ctx, {
            type: 'line',
            data: {
                // Labels for the X-axis
                labels: names,
                
                // The datasets array contains the data for each line
                datasets: [
                    {
                        label: 'Present Count',
                        data: presentLine,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.3,
                        pointBackgroundColor: 'rgb(75, 192, 192)',
                        pointBorderColor: 'rgb(255, 255, 255)'
                    },
                    {
                        label: 'Late Count',
                        data: lateLine,
                        borderColor: 'rgb(255, 159, 64)',
                        tension: 0.2,
                        pointBackgroundColor: 'rgb(255, 159, 64)',
                        pointBorderColor: 'rgb(255, 255, 255)'
                    },
                    {
                        label: 'Absent count',
                        data: absentLine,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.2,
                        pointBackgroundColor: 'rgb(255, 99, 132)',
                        pointBorderColor: 'rgb(255, 255, 255)'
                    }
                ]
            },
            options: {
                responsive: true,
                //maintainAspectRatio: false,
                animation,
                plugins: {
                    title: {
                        display: true,
                        text: 'Present vs Absent & Late Count',
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        position: 'bottom'
                    }
                },
                elements:{
                    point:
                    {
                        radius:5,
                        hoverradius:8
                    }
                },interaction: {
                    intersect: false,
                    mode: 'index',
                    },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Number of Employees'
                        }
                    },
                    x: {
                         title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
}

let loginUsername=sessionStorage.getItem("loginusername");
let loginPassword=sessionStorage.getItem("loginPassword");
let loginIndex=parseInt(sessionStorage.getItem("loginIndex"));

//console.log(loginUserName+loginPassword+loginIndex);

async function masterChecker()
{
const data = await fetch("../database/userPasswords.json").then(res => res.json());
if (data.userPasswords[0].username === loginUserName) 
    document.getElementById("adminAccess").innerHTML = `<button id="master" onclick="window.location.href='../masterAdmin/index.html'">Edit User<br> Accounts</button>`;
else
    document.getElementById("adminAccess").innerHTML = `<button id="master" onclick="window.location.href='editUser.html'">Edit User<br> Account</button>`;
    document.querySelector(".user-name").innerHTML = loginUserName;
}
function updatechart()
{
    let newData=[inCount-lateCount,absentCount,lateCount];
    myPieChart.data.datasets[0].data=newData;
    myPieChart.update();
}
async function getdata() {
    let jsonFile = await fetch("http://127.0.0.1:5500/data");
    if (!jsonFile.ok) {
       throw new Error("can't pull data");
    }
    
    const response = await jsonFile.json();
    allData=response.allData;
    //console.log(allData)
    
   renderPage();
  /* //localStorage.removeItem('lineChartData')
   lineChartData=localStorage.getItem('lineChartData');
if(lineChartData)
{   lineChartData=JSON.parse(lineChartData)
   // console.log(lineChartData)
    //getLineChartData(inCount, absentCount, lateCount)
createLineChart();
}
else
{  */
 lineChartData=[];
     let pres=abs=late=0;
    let targetdate=new Date();
    
    for(let i=31;i>=1;i--)
    {    targetdate=new Date();
        pres=abs=late=0;
     targetdate.setDate(today.getDate()-i);
        const target=targetdate.getFullYear() + '-' +String(targetdate.getMonth() + 1).padStart(2, '0') + '-' +String(targetdate.getDate()).padStart(2, '0');
       // console.log(target)
        const temp=allData.filter(element=>dateConverter(element.AttendanceDate)===target);
        temp.forEach(element=>{
            if(element.StatusCode==='P')
                pres++;
            else
                abs++;
            if(element.LateBy!==0)
                late++;
        
});
lineChartData.push([pres,abs,late]);
//console.log(pres,abs,late+"  ")
    }
    //localStorage.setItem('lineChartData',JSON.stringify(lineChartData));
    createLineChart();
}
     //console.log(lineChartData)}
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
getdata();
/*function getLineChartData(presentCount,absentCount,lateCount)
{   let i;
    for(i=1;i<31;i++)
        lineChartData[i-1]=lineChartData[i];
    lineChartData[30]=[presentCount,absentCount,lateCount];
    //console.log(lineChartData)
    

}
*/
function filterDepot(data)
{   let currentDepot=searchDepot.value;
    let result;
    if(currentDepot!=='All depots')
    result=data.filter(element=>element['In Device Name']===currentDepot);
    else
        result=data;
    return result;
}
function scheduleDailyTask() {
            const lastRunDate = localStorage.getItem('lastDailyRun');
            const today = new Date().toDateString();
    //console.log(lastRunDate === today)
            // Check if the function has already run today
            if (lastRunDate === today) {
                
                
                // Calculate time until midnight to schedule the next check
                const now = new Date();
                const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() , 23, 0, 0);
                const timeUntilMidnight = midnight.getTime() - now.getTime();
                
                // Use setTimeout to schedule the function to run at midnight
                setTimeout(() => {
                    scheduleDailyTask(); // Call the scheduler again
                }, timeUntilMidnight);

            } else {
                // It's a new day, so run the task
                getLineChartData(inCount, absentCount, lateCount)
                // Store the current date to prevent running again today
                localStorage.setItem('lastDailyRun', today);

                // Schedule the next check for the following midnight
                const now = new Date();
                const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
                const timeUntilMidnight = midnight.getTime() - now.getTime();
                
                setTimeout(() => {
                    scheduleDailyTask();
                }, timeUntilMidnight);
            }
        }
function renderPage()
{
  inCount=outCount=lateCount=activeCount=absentCount=leaveCount=0;
    filteredData=allData.filter(element=> dateConverter(element.AttendanceDate) ===querydate);
    filteredData=filterDepot(filteredData);
    //console.log(lineChartData)
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

masterChecker();