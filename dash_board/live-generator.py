import json
import random
import time
from datetime import datetime, timedelta

def generate_random_time(start_time_str, end_time_str):
    start_time = datetime.strptime(start_time_str, "%H:%M:%S")
    end_time = datetime.strptime(end_time_str, "%H:%M:%S")
    delta = end_time - start_time
    total_seconds = int(delta.total_seconds())
    random_seconds = random.randint(0, total_seconds)
    return (start_time + timedelta(seconds=random_seconds)).strftime("%H:%M:%S")

first_names = ["Anand", "Ravi", "Murugan", "Suresh", "Raj", "Senthil", "Vignesh", "Mohan", "Ganesh", "Vijay"]
last_names = ["Kumar", "Gopal", "Gobi", "Prasad", "Priyan"]

def generate_employees(num=10):
    employees = []
    for _ in range(num):
        name = f"{random.choice(first_names)} {random.choice(last_names)}"
        emp_id = f"E{random.randint(10, 99)}X{random.randint(1000, 9999)}"
        employees.append({
            "name": name,
            "id": emp_id,
            "intime": None,
            "outtime": None,
            "date": datetime.now().strftime("%Y/%m/%d")
        })
    return employees

def save_data(filename, data):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)

def main():
    filename = "attendance.json"
    data = []  # Start fresh
    employees = generate_employees(10)

    # Step 1: IN times
    for emp in employees:
        emp["intime"] = generate_random_time("08:00:00", "09:30:00")
        data.append(emp)
        save_data(filename, data)
        #print(f"Added IN record: {emp['name']} at {emp['intime']}")
        time.sleep(3)  # 3-second delay

    # Step 2: OUT times
    for emp in data:
        emp["outtime"] = generate_random_time("16:30:00", "17:30:00")
        save_data(filename, data)
        #print(f"Updated OUT record: {emp['name']} at {emp['outtime']}")
        time.sleep(3)  # 3-second delay

if __name__ == "__main__":
    main()
