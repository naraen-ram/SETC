


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
    console.log(1);
    
    
    let jsonFile = await fetch("attendance.json");
    if (!jsonFile.ok) 
    {
        throw new Error("can't pull data");
    }
    allData = await jsonFile.json();
   
    let count=[0,0,0];
    for(let i=0;i<allData.length;i++)
    {   
        count[0]++;
        if(allData[i].outtime!=null)
            count[1]++;
          let intime = new Date(`1970-01-01T${allData[i].intime}`);
        let cutoff = new Date(`1970-01-01T09:15:00`);

        if (intime > cutoff) 
            count[2]++; 

    }


    document.querySelector("#in").innerHTML=count[0].toString();
    document.querySelector("#out").innerHTML=count[1].toString();
    document.querySelector("#late").innerHTML=count[2].toString();
  
    
}

getdata();

