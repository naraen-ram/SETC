import json
import random
import time
from datetime import datetime, timedelta
def generate_random_time(start_time_str,end_time_str):
    start_time = datetime.strptime(start_time_str, "%H:%M:%S")
    end_time = datetime.strptime(end_time_str, "%H:%M:%S")
    delta = end_time - start_time
    total_seconds = delta.total_seconds()
    random_seconds = random.randint(0, int(total_seconds))
    random_time = start_time + timedelta(seconds=random_seconds)
    return random_time.strftime("%H:%M:%S")
def generate_random_date():
    days_between_dates = 31
    random_number_of_days = random.randrange(days_between_dates + 1)
    random_timedelta = timedelta(days=random_number_of_days)
    xdate=datetime(2025,8,1)
    start_date=xdate.date()
    random_date = start_date + random_timedelta
    return random_date
def generate_employees(num_entries=50):
    first_names = ["Anand", "Ravi", "Murugan", "Suresh", "raj", "Senthil", "Vignesh", "Mohan", "Ganesh", "Vijay"]
    last_names = ["kumar", "gopal", "gobi", "prasad", "priyan"]
    depots = [
        "Tambaram Depot", "Koyambedu Depot", "Mofussil Depot", "Ambattur Depot", "Vandalur Depot",
        "Madurai Arappalayam Depot", "Coimbatore Gandhipuram Depot", "Salem New Bus Stand Depot",
        "Tiruchirappalli Chathiram Depot", "Vellore New Bus Stand Depot", "Erode Depot",
        "Thanjavur New Bus Stand Depot", "Nagercoil Vadasery Depot", "Hosur Depot",
        "Tiruppur Depot", "Dindigul Depot", "Virudhunagar Depot", "Pudukkottai Depot"
    ]
    
    schedule = []
    for i in range(num_entries):
        bus_id = f"E{random.randint(10, 99)}X{random.randint(1000, 9999)}"
        bus_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        bus_depot = random.choice(depots)
        for j in range(0,1):
            onlydate=datetime(2025,8,1+j).strftime("%Y-%m-%d")
            schedule.append({
            "name": bus_name,
            "id": bus_id,
            "depot": bus_depot,
            "intime": None,
            "out_time": None,
            "date": onlydate,
            "hours":None,
            "present":False
             })
        
    return schedule
def save_data(filename, data):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)
def simulate_in():
    randomizer=random.randint(0,10)
    if(randomizer>2):
        return generate_random_time("8:45:00","9:30:00")
    return None
                
    
def main():
    filename = "database/dummy.json"
    data = []  # Start fresh
    employees = generate_employees(10)

    # Step 1: IN times
    for emp in employees:
        emp["intime"] = simulate_in()
        if(emp["intime"]!=None):
            emp["present"]=True
            data.append(emp)
        save_data(filename, data)
        #print(f"Added IN record: {emp['name']} at {emp['intime']}")
        time.sleep(1.5)  # 3-second delay
    time.sleep(5)
    for emp in employees:
        if(emp not in data):
            data.append(emp)
    # Step 2: OUT times
    for emp in data:
        if(emp["intime"]!=None):
            emp["out_time"] = generate_random_time("16:45:00","17:30:00")
            start_time = datetime.strptime(emp["intime"], "%H:%M:%S")
            end_time = datetime.strptime(emp["out_time"], "%H:%M:%S")
            hours=int((end_time-start_time).total_seconds()/3600)
            mins=int((end_time-start_time).total_seconds()%60)
            temp_hours_string=str(hours)+":"+str(mins)
            if(len(temp_hours_string)<4):
                emp["hours"]=temp_hours_string[0:2]+'0'+temp_hours_string[2:]
            else:
                emp["hours"]=temp_hours_string
            save_data(filename, data)
            #print(f"Updated OUT record: {emp['name']} at {emp['outtime']}")
            time.sleep(1.5)  # 3-second delay

if __name__ == "__main__":
    main()