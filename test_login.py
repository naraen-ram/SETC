import pyodbc
import sys

# --- CONFIGURATION (EDIT THIS SECTION) ---

# Replace with your actual Server Name (e.g., 'DESKTOP-XYZ\SQLEXPRESS' or '192.168.1.5')
SERVER = 'SERVER\\SQLEXPRESS'

# Replace with your Database Name
DATABASE = 'paraller' 

# OPTION A: Use Windows Authentication (Trusted Connection)
# Set to True if you don't use a password to login to SQL Server Management Studio
USE_WINDOWS_AUTH = True 

# OPTION B: SQL Server Authentication
USERNAME = ''
PASSWORD = ''

# -----------------------------------------

def test_connection():
    print("--- MSSQL Connection Tester ---")
    
    # define the connection string based on auth type
    if USE_WINDOWS_AUTH:
        conn_str = (
            f"Driver={{SQL Server}};"
            f"Server={SERVER};"
            f"Database={DATABASE};"
            "Trusted_Connection=yes;"
        )
        print(f"Attempting connection to {SERVER} using Windows Authentication...")
    else:
        conn_str = (
            f"Driver={{SQL Server}};"
            f"Server={SERVER};"
            f"Database={DATABASE};"
            f"UID={USERNAME};"
            f"PWD={PASSWORD};"
        )
        print(f"Attempting connection to {SERVER} using User: {USERNAME}...")

    try:
        # Attempt to connect
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # Run a simple query to verify the engine is responding
        cursor.execute("SELECT @@VERSION")
        row = cursor.fetchone()
        
        print("\n✅ SUCCESS! Connection Established.")
        print("Server Version Info:")
        print(f"{row[0][:100]}...") # Print first 100 chars of version
        
        conn.close()
        
    except pyodbc.Error as e:
        print("\n❌ CONNECTION FAILED")
        print("Error Details:")
        # pyodbc errors are often a list of parameters, index 1 usually has the text
        if len(e.args) > 1:
            print(e.args[1])
        else:
            print(e)
            
        print("\nTroubleshooting Tips:")
        print("1. Check if 'SQL Server Browser' service is running in Windows Services.")
        print("2. Ensure TCP/IP is enabled in 'Sql Server Configuration Manager'.")
        print("3. Verify the SERVER name. Sometimes it requires 'Hostname\\InstanceName'.")

if __name__ == "__main__":
    test_connection()
