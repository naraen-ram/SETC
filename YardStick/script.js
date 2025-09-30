const fileName = "Records.xls" 

function excelDateToJSDate(serial) {
    if((serial instanceof Date))
    {
        console.log("Already converted to date")
        return serial
    }
    const days = Math.floor(serial - 25569);
    const seconds = days * 86400; // seconds in a day
    const orgDate = new Date(seconds * 1000);
    // console.log(orgDate)
    return orgDate;
}

async function loadData() {
    const response = await fetch(fileName);
    const arrayBuffer = await response.arrayBuffer();

    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    records = XLSX.utils.sheet_to_json(worksheet);
    records.forEach(element => {  // DOR - Date of Retirement
        element.DOR = excelDateToJSDate(element.DOR) // to convert excel dates to normal dates
    });
    let currDate = new Date("2025-12-31")
    let retiredCounter = 0
    var retiredEmployees

    [records, retiredEmployees] = records.reduce(
    (acc, element) => {
        if (currDate <= element.DOR) acc[0].push(element);
        else 
            {
                acc[1].push(element);
                retiredCounter++
            }
        return acc;
    },
    [[], []] //sets the initial values 
    );

    console.log("Retired count : ",retiredCounter);
    console.log(records);
}
loadData()
localStorage.setItem("idx",2)
console.log(localStorage)
