import json
import random
from datetime import datetime, timedelta

def generate_random_time(start_time_str,end_time_str):
    """Generates a random time between 8:45:00 and 10:00:00."""
    
    
    # Convert time strings to datetime objects for easy manipulation
    start_time = datetime.strptime(start_time_str, "%H:%M:%S")
    end_time = datetime.strptime(end_time_str, "%H:%M:%S")
    
    # Calculate the total duration in seconds
    delta = end_time - start_time
    total_seconds = delta.total_seconds()
    
    # Generate a random number of seconds within the range
    random_seconds = random.randint(0, int(total_seconds))
    
    # Add the random seconds to the start time to get the final random time
    random_time = start_time + timedelta(seconds=random_seconds)
    
    return random_time.strftime("%H:%M:%S")

def generate_bus_schedule(num_entries=50):
    """
    Generates a list of dictionaries representing bus schedules.
    Each dictionary has 'name', 'id', 'depot', and 'intime'.
    """
    first_names = ["Anand", "Ravi", "Murugan", "Suresh", "raj", "Senthil", "Vignesh", "Mohan", "Ganesh", "Vijay"]
    last_names = ["kumar", "gopal", "gobi", "prasad", "priyan"]
    
    # A list of bus depots in various districts of Tamil Nadu
    depots = [
        "Tambaram Depot", "Koyambedu Depot", "Mofussil Depot", "Ambattur Depot", "Vandalur Depot",
        "Madurai Arappalayam Depot", "Coimbatore Gandhipuram Depot", "Salem New Bus Stand Depot",
        "Tiruchirappalli Chathiram Depot", "Vellore New Bus Stand Depot", "Erode Depot",
        "Thanjavur New Bus Stand Depot", "Nagercoil Vadasery Depot", "Hosur Depot",
        "Tiruppur Depot", "Dindigul Depot", "Virudhunagar Depot", "Pudukkottai Depot"
    ]
    
    schedule = []
    
    for i in range(num_entries):
        # Generate a unique bus ID
        bus_id = f"E{random.randint(10, 99)}X{random.randint(1000, 9999)}"
        
        # Combine a random first name and last name
        bus_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        
        # Choose a random depot from the list
        bus_depot = random.choice(depots)
        
        # Get a random arrival time within the specified range
        arrival_time = generate_random_time("8:45:00","9:30:00")
        out_time=generate_random_time("16:30:00","17:30:00")
        schedule.append({
            "name": bus_name,
            "id": bus_id,
            "depot": bus_depot,
            "intime": arrival_time,
            "out_time": out_time
        })
        
    return schedule

# Generate the schedule
bus_schedule_data = generate_bus_schedule()

# Save the data to a JSON string with an indentation for readability
json_output = json.dumps(bus_schedule_data, indent=4)
with open('dummy.json', 'w') as f:
    f.write(json_output)
# Print the JSON output
print(json_output)
