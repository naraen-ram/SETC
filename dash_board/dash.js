


let menu=document.querySelector(".menu");
let button=document.querySelector(".menu-button");
function openmenu()
{
   menu.classList.toggle("menu-open");
   button.classList.toggle("menu-button-open");

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
   
    let inCount=outCount=lateCount=activeCount=absentCount=0;
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
   document.querySelector("#out").innerHTML=outCount.toString();
    document.querySelector("#late").innerHTML=lateCount.toString();
    document.querySelector("#absent").innerHTML=absentCount.toString();
    document.querySelector("#active").innerHTML=activeCount.toString();
  
    
}

getdata();
