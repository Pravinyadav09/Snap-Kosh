import requests
import json
import time

BASE_URL = "http://localhost:5145"

# List of endpoints from src/lib/api.ts
# Testing only GET simple endpoints for diagnostic purposes
TEST_ENDPOINTS = [
    # Dashboard
    "/api/Dashboard/admin-summary",
    
    # Customers
    "/api/customers",
    "/api/Customers/lookup",
    
    # Jobs
    "/api/jobcards",
    
    # Invoices
    "/api/invoices",
    
    # Quotations
    "/api/Quotations",
    
    # Inventory
    "/api/inventory",
    "/api/Inventory/lookup",
    "/api/inventory/history",
    "/api/SpecializedInventory/paper",
    "/api/SpecializedInventory/media",
    
    # Machines
    "/api/machines",
    
    # Management (Users / Roles / Processes / Settings)
    "/api/management/users",       # Let's check if this is /api/management/users or /api/users
    "/api/users",
    "/api/roles",
    "/api/processes",
    "/api/settings",
    
    # Outsource
    "/api/Outsource/vendors",
    "/api/Outsource/vendors/lookup",
    "/api/Outsource/jobs",
    
    # Purchases
    "/api/Purchases",
    
    # Finance / Expenses
    "/api/expenses",
    "/api/expense-categories",
    "/api/expense-categories/lookup",
    
    # Scheduler
    "/api/jobcards?page=1&size=10",
    
    # Analytics / Readings
    "/api/dailyreadings",
    "/api/machines/status",
]

def run_diagnostics():
    print(f"--- API Diagnostics for {BASE_URL} ---")
    print(f"Checking {len(TEST_ENDPOINTS)} endpoints...\n")
    
    results = []
    
    for endpoint in TEST_ENDPOINTS:
        url = f"{BASE_URL}{endpoint}"
        try:
            start_time = time.time()
            response = requests.get(url, timeout=5)
            ms = int((time.time() - start_time) * 1000)
            
            status = response.status_code
            emoji = "🟢" if status == 200 else "🟡" if status < 400 else "🔴"
            
            # Check if JSON actually returned
            is_json = "application/json" in response.headers.get("Content-Type", "").lower()
            data_count = "N/A"
            if is_json:
                try:
                    data = response.json()
                    if isinstance(data, list):
                        data_count = len(data)
                    elif isinstance(data, dict):
                        data_count = len(data.keys())
                except:
                    pass
            
            results.append({
                "endpoint": endpoint,
                "status": status,
                "time": f"{ms}ms",
                "count": data_count,
                "emoji": emoji
            })
            
            print(f"{emoji} {status} | {ms:4}ms | Items: {str(data_count):4} | {endpoint}")
            
        except requests.exceptions.ConnectionError:
            print(f"❌ ERR | Backend Offline | {endpoint}")
            results.append({
                "endpoint": endpoint,
                "status": "Offline",
                "time": "N/A",
                "count": "N/A",
                "emoji": "❌"
            })
        except Exception as e:
            print(f"⚠️ ERR | {str(e)[:40]} | {endpoint}")
    
    print("\n--- Summary ---")
    online = [r for r in results if r["status"] == 200]
    failed = [r for r in results if r["status"] != 200 and r["status"] != "Offline"]
    offline = [r for r in results if r["status"] == "Offline"]
    
    print(f"Success: {len(online)}")
    print(f"Broken: {len(failed)}")
    if offline:
        print(f"Server Issues: {len(offline)}")
    
    if failed:
        print("\nBroken endpoints details:")
        for r in failed:
            print(f" - {r['endpoint']} returned {r['status']}")

if __name__ == "__main__":
    run_diagnostics()
