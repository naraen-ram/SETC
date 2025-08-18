

    let inCount=outCount=lateCount=activeCount=absentCount=0;
let menu=document.querySelector(".menu");
let button=document.querySelector(".menu-button");
function openmenu()
{
   menu.classList.toggle("menu-open");
   button.classList.toggle("menu-button-open");

}
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
function updatechart()
{
    let newData=[inCount-lateCount,absentCount,lateCount];
    myPieChart.data.datasets[0].data=newData;
    myPieChart.update();
}


let allData = [];
async function getdata() 
{   
    
    
    let jsonFile = await fetch("../database/dummy.json");
    if (!jsonFile.ok) 
    {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
   
    inCount=outCount=lateCount=activeCount=absentCount=0;
    for(let i=0;i<allData.length;i++)
    {  
        if(allData[i].intime!=null)
        inCount++;
        if(allData[i].out_time!=null)
            outCount++;
          let intime = new Date(`1970-01-01T${allData[i].intime}`);
        let cutoff = new Date(`1970-01-01T09:15:00`);

        if (intime > cutoff) 
            lateCount++; 
        
        activeCount=inCount-outCount;
    }
absentCount=allData.length-inCount;

    document.querySelector("#in").innerHTML=inCount.toString();
//    document.querySelector("#out").innerHTML=outCount.toString();
    document.querySelector("#late").innerHTML=lateCount.toString();
    document.querySelector("#absent").innerHTML=absentCount.toString();
    // document.querySelector("#active").innerHTML=activeCount.toString();
  updatechart();
    
}

getdata();
