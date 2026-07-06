"""
MediQ Load Test Runner
======================
Runs Locust load tests in headless mode, parses performance metrics from CSV outputs,
and exports them as a JSON file for unified report compilation.
"""
import subprocess
import os
import sys
import csv
import json
from pathlib import Path

def run_headless_load_test():
    """Execute Locust in headless mode and collect statistics."""
    # Target URL - read from environment or default to local port 8000
    host = os.environ.get("API_URL", "http://localhost:8000")
    
    locust_file = Path(__file__).parent / "locustfile.py"
    csv_prefix = Path(__file__).parent / "locust_stats"
    
    # Run locust for 10 seconds with 15 concurrent users, spawning 3 users/sec
    cmd = [
        sys.executable, "-m", "locust",
        "-f", str(locust_file),
        "--headless",
        "-u", "15",
        "-r", "3",
        "--run-time", "10s",
        f"--csv={csv_prefix}",
        f"--host={host}"
    ]
    
    print(f"Starting load test on {host}...")
    # Execute and ignore error codes since it may register request failures if server is off
    subprocess.run(cmd, capture_output=True, text=True, check=False)
    print("Load test complete. Parsing results...")
    
    stats_file = Path(__file__).parent / "locust_stats_stats.csv"
    results = {
        "host": host,
        "total_requests": 0,
        "total_failures": 0,
        "requests_per_sec": 0.0,
        "avg_response_time": 0.0,
        "min_response_time": 0.0,
        "max_response_time": 0.0,
        "p95_response_time": 0.0,
        "endpoints": []
    }
    
    if stats_file.exists():
        try:
            with open(stats_file, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Name corresponds to endpoint/aggregate row
                    name = row.get("Name", "")
                    method = row.get("Type", "")
                    
                    reqs = int(row.get("Request Count", 0))
                    fails = int(row.get("Failure Count", 0))
                    avg_time = float(row.get("Average Response Time", 0))
                    min_time = float(row.get("Min Response Time", 0))
                    max_time = float(row.get("Max Response Time", 0))
                    rps = float(row.get("Current RPS", 0.0))
                    p95 = float(row.get("95%", 0.0))
                    
                    if name == "Aggregated":
                        results["total_requests"] = reqs
                        results["total_failures"] = fails
                        results["avg_response_time"] = round(avg_time, 2)
                        results["min_response_time"] = round(min_time, 2)
                        results["max_response_time"] = round(max_time, 2)
                        results["requests_per_sec"] = round(rps, 2)
                        results["p95_response_time"] = round(p95, 2)
                    else:
                        results["endpoints"].append({
                            "method": method,
                            "endpoint": name,
                            "requests": reqs,
                            "failures": fails,
                            "avg_time": round(avg_time, 2),
                            "min_time": round(min_time, 2),
                            "max_time": round(max_time, 2),
                            "rps": round(rps, 2),
                            "p95": round(p95, 2)
                        })
        except Exception as e:
            print(f"Error parsing load test stats: {e}")
            
    # Clean up generated CSV files
    for suffix in ["_stats.csv", "_failures.csv", "_exceptions.csv", "_stats_history.csv"]:
        f_path = Path(__file__).parent / f"locust_stats{suffix}"
        if f_path.exists():
            try:
                os.remove(f_path)
            except Exception:
                pass
                
    # Save results as JSON
    output_json = Path(__file__).parent / "load_test_results.json"
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
        
    print(f"Metrics saved to {output_json}")
    print(f"Total Requests: {results['total_requests']} | Failures: {results['total_failures']} | Avg Time: {results['avg_response_time']}ms")
    return results

if __name__ == "__main__":
    try:
        import locust
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "locust", "-q"], check=False)
    run_headless_load_test()
