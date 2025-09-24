import json
import random
from datetime import datetime, timedelta
import re
def generate_random_time(start_time_str,end_time_str):
    start_time = datetime.strptime(start_time_str, "%H:%M:%S")
    end_time = datetime.strptime(end_time_str, "%H:%M:%S")
    delta = end_time - start_time
    total_seconds = delta.total_seconds()
    random_seconds = random.randint(0, int(total_seconds))
    random_time = start_time + timedelta(seconds=random_seconds)
    return random_time.strftime("%H:%M")
def generate_random_date():
    days_between_dates = 30
    random_number_of_days = random.randrange(days_between_dates + 1)
    random_timedelta = timedelta(days=random_number_of_days)
    xdate=datetime(2025,9,1)
    start_date=xdate.date()
    random_date = start_date + random_timedelta
    return random_date.strftime("%d-%b-%y")
# --- Data Definition ---
# This list will hold all the attendance records.
# Each record is a dictionary with the specified field names.
# --- Helper Function to calculate duration and late time ---
def calculate_times(in_time_str, out_time_str):
    time_format = "%H:%M"
    late_time_threshold = "09:00"
    duration_minutes = 0
    late_by_minutes = 0
    try:
        # Parse the time strings into datetime objects
        in_time = datetime.strptime(in_time_str, time_format)
        out_time = datetime.strptime(out_time_str, time_format)
        late_threshold = datetime.strptime(late_time_threshold, time_format)

        # Calculate duration in minutes
        time_difference = out_time - in_time
        duration_minutes = int(time_difference.total_seconds() / 60)

        # Calculate late time if in_time is after 09:00
        if in_time > late_threshold:
            late_difference = in_time - late_threshold
            late_by_minutes = int(late_difference.total_seconds() / 60)

    except ValueError:
        # Handle cases where time strings are in an incorrect format
        print("Warning: Could not parse time data. Duration and LateBy will be 0.")

    return duration_minutes, late_by_minutes
def generate_bus_schedule():
    first_names = ["Anand", "Ravi", "Dev", "Suresh", "raj", "Senthil", "Vignesh", "Sathya", "Ganesh", "Vijay"]
    last_names = ["kumar", "gopal", "gobi","Murugan"]
    depots = ["Head Quarters","Chennai Depot - A, B, C & D","Coimbatore","Kanyakumari","Kumbakonam","Madurai","Marthandam","Nagercoil",
              "Nagapattinam","Puducherry","Salem","Shencottah","Thanjavur","Tirunelveli - I","Tirunelveli - II","Trichirapalli",
              "Thoothukudi","Thiruvananthapuram","Karaikudi","Dindigul","Hosur"]
    
    schedule = []
    attendance_records = {}
    count=1
    while(1):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        bus_depot = f"{count}{random.choice(depots)}"
        if name in attendance_records.values():
            continue
        attendance_records[name]=bus_depot
        if(count==101):
            break
        count+=1 
    for j in range(0,30):
        onlydate=datetime(2025,9,1+j).strftime("%d-%b-%y")        
        for name in attendance_records:
            randomizer=random.randint(0,10)
            duration=0
            late_by=0
            status="Absent"
            statuscode="A"
            ot=0
            arrival_time="00:00"
            out_time="00:00"
            depot=" "
            code_depot=attendance_records[name]
            pattern=r"^\d+"
            match=re.match(pattern,code_depot)
            code=int(match.group(0))
            end=match.end()
            if(randomizer>2):
                arrival_time = generate_random_time("8:45:00","9:15:00")
                out_time=generate_random_time("17:30:00","17:45:00")
                duration, late_by = calculate_times(arrival_time, out_time)
                status="Present"
                statuscode="P"
                ot=duration-466
                duration=466
                depot=code_depot[end:]
                
                
                
                """start_time = datetime.strptime(arrival_time, "%H:%M:%S")
                //end_time = datetime.strptime(out_time, "%H:%M:%S")
                hours=int((end_time-start_time).total_seconds()/3600)
                mins=int((end_time-start_time).total_seconds()%60)
                temp_hours_string=str(hours)+":"+str(mins)
                if(len(temp_hours_string)<4):
                    hours_string=temp_hours_string[0:2]+'0'+temp_hours_string[2:]
                else:
                    hours_string=temp_hours_string"""
            schedule.append({
        "Employee Code": code,
        "Employee Name": name,
        "AttendanceDate": onlydate,
        "InTime": arrival_time,
        "OutTime": out_time,
        "Status":  status,
        "StatusCode": statuscode,
        "ShiftName": "GS"if randomizer<9 else "NS",
        "Duration":duration,
        "LateBy":late_by,
        "In Device Name":depot,
        "Overtime": ot,
    })
        
    return schedule

# Generate the schedule

bus_schedule_data=generate_bus_schedule()
json_output = json.dumps(bus_schedule_data, indent=4)
with open('database/newdummy.json', 'w') as f:
    f.write(json_output)
