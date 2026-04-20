import urllib.request
import json
import socket

# This script doesn't need 'requests' library
BASE_URL = "http://localhost:5145"

TESTS = [
    ("Dashboard", "/api/Dashboard/admin-summary"),
    ("Invoices", "/api/invoices"),
    ("Customers", "/api/customers"),
    ("Jobs", "/api/jobcards"),
    ("Inventory", "/api/inventory"),
    ("Inventory Lookup", "/api/Inventory/lookup"),
    ("Special Inventory (Paper)", "/api/SpecializedInventory/paper"),
    ("Special Inventory (Media)", "/api/SpecializedInventory/media"),
    ("Machines", "/api/machines"),
    ("Users", "/api/users"),
    ("Roles", "/api/roles"),
    ("Processes", "/api/processes"),
    ("Purchases", "/api/Purchases"),
    ("Expenses", "/api/expenses"),
    ("Expense Categories", "/api/expense-categories"),
]

def test_api():
    print(f"--- DETAILED API TESTING FOR {BASE_URL} ---\n")
    print(f"{'API NAME':<25} | {'STATUS':<6} | {'TIME'}")
    print("-" * 50)
    
    for name, path in TESTS:
        url = f"{BASE_URL}{path}"
        try:
            start = socket.gettimeofday() if hasattr(socket, 'gettimeofday') else None
            import time
            start = time.time()
            
            with urllib.request.urlopen(url, timeout=5) as response:
                status = response.getcode()
                elapsed = int((time.time() - start) * 1000)
                data = json.loads(response.read().decode())
                count = len(data) if isinstance(data, list) else 1
                print(f"{name:<25} | 🟢 {status} | {elapsed:4}ms | Items: {count}")
                
        except urllib.error.HTTPError as e:
            print(f"{name:<25} | 🔴 {e.code} | FAILED")
            # For 500 errors, let's try to get more details if the server sends them
            try:
                error_body = e.read().decode()
                if error_body:
                    print(f"   ∟ ERROR DETAIL: {error_body[:100]}...")
            except: pass
        except Exception as e:
            print(f"{name:<25} | ❌ ERR | {str(e)[:40]}")

if __name__ == "__main__":
    test_api()
