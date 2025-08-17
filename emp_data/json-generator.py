import json
import random
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
def generate_bus_schedule(num_entries=50):
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
        for j in range(0,31):
            hours=None
            mins=None
            hours_string=None
            onlydate=datetime(2025,8,1+j).strftime("%Y-%m-%d")
            randomizer=random.randint(0,10)
            present=False
            if(randomizer>2):
                present=True
                arrival_time = generate_random_time("8:45:00","9:30:00")
                out_time=generate_random_time("16:30:00","17:30:00")
                start_time = datetime.strptime(arrival_time, "%H:%M:%S")
                end_time = datetime.strptime(out_time, "%H:%M:%S")
                hours=int((end_time-start_time).total_seconds()/3600)
                mins=int((end_time-start_time).total_seconds()%60)
                temp_hours_string=str(hours)+":"+str(mins)
                if(len(temp_hours_string)<4):
                    hours_string=temp_hours_string[0:2]+'0'+temp_hours_string[2:]
                else:
                    hours_string=temp_hours_string
            else:
                arrival_time=None
                out_time=None
            schedule.append({
            "name": bus_name,
            "id": bus_id,
            "depot": bus_depot,
            "intime": arrival_time,
            "out_time": out_time,
            "date": onlydate,
            "hours":hours_string,
            "present":present
             })
        
    return schedule

# Generate the schedule

bus_schedule_data=generate_bus_schedule(10)
json_output = json.dumps(bus_schedule_data, indent=4)
with open('table-test/dummy.json', 'w') as f:
    f.write(json_output)
