//declarations
const PORT = 5501
const excelCount=4753;
let lineChartData;
let allData = [];
const parameters = new URLSearchParams(window.location.search);
const loginUserName = parameters.get('loginName');
const today=new Date();
const buttons = document.querySelectorAll('.circle-btn');
let querydate=today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
const searchDepot = document.getElementById("searchDepot");
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


buttons[buttons.length - 1].style.backgroundColor = "#36A2EB"; 
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
            presentLine.push(lineChartData[i][0])
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
        from: NaN, 
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
        new Chart(ctx, {
            type: 'line',
            data: {
        
                labels: names,
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

async function masterChecker()
{
if ('master' === loginUserName) 
    document.getElementById("adminAccess").innerHTML = `<button id="master" onclick="window.location.href='../masterAdmin/index.html'">Edit User<br> Accounts</button>`;
else
    document.getElementById("adminAccess").innerHTML = `<button id="master" onclick="window.location.href='editUser.html'">Edit User<br> Account</button>`;
    document.querySelector(".user-name").innerHTML = loginUserName;
}
function updatechart()
{
    let newData=[inCount,excelCount-inCount,lateCount];
    myPieChart.data.datasets[0].data=newData;
    myPieChart.update();
}
async function getdata() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    try {
        let jsonFile = await fetch(`http://127.0.0.1:${PORT}/data?start=2026-01-28&end=2026-01-31`);
        if (!jsonFile.ok) {
           throw new Error("can't pull data");
        }
        
        const response = await jsonFile.json();
        allData=response;    
       renderPage();
     lineChartData=[];
         let pres=abs=late=0;
        let targetdate=new Date();
        
        for(let i=31;i>=1;i--)
        {    targetdate=new Date();
            pres=abs=late=0;
         targetdate.setDate(today.getDate()-i);
            const target=targetdate.getFullYear() + '-' +String(targetdate.getMonth() + 1).padStart(2, '0') + '-' +String(targetdate.getDate()).padStart(2, '0');
            const temp=allData.filter(element=>element.date===target);
            pres=temp.length;
            abs=excelCount-pres;
            temp.forEach(element=>{
                if(element.InTime>'09:00:00')
                    late++;     
    });
    lineChartData.push([pres,abs,late]);
        }
        createLineChart();
    } finally {
        loadingOverlay.style.display = 'none';
    }
}
   
getdata();

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
    renderPage();
});
function filterCategory(data)
{
    let currentCat=catrgorySelect.value;
    if(currentCat=="all")
        return data;
    let result=data.filter(element=>element.CAT===currentCat);
    return result;
    
}

function renderPage()
{
  inCount=outCount=lateCount=activeCount=absentCount=leaveCount=0;
    filteredData=allData.filter(element=> element.date ===querydate);
    filteredData=filterDepot(filteredData);
    filteredData=filterCategory(filteredData);
    inCount=filteredData.length;
    for(let i=0;i<filteredData.length;i++)
    {  
        
        
        if(filteredData[i].InTime>"10:00:00" )
          lateCount++;
        
        if(filteredData[i].OutTime!==null)
            outCount++;
        activeCount = inCount - outCount;
    }
    absentCount = excelCount - inCount;
    document.querySelector("#in").innerHTML = inCount.toString();
    document.querySelector("#leave").innerHTML = leaveCount.toString();
    document.querySelector("#out").innerHTML=outCount.toString();
    document.querySelector("#late").innerHTML = lateCount.toString();
    document.querySelector("#absent").innerHTML = absentCount.toString();
   document.querySelector("#active").innerHTML=activeCount.toString();
  updatechart();
}
function selectedButtonColor(event)
{
  for(let x=0;x<buttons.length;x++)
  {
    buttons[x].style.backgroundColor = "";
  }
  event.target.style.backgroundColor = "#36A2EB";
}

masterChecker();