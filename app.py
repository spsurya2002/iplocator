from flask import Flask, render_template, jsonify
import random
import requests

app = Flask(__name__)

# Function to get location from IP address using an external API
def get_location(ip):
    try:
        response = requests.get(f"http://ip-api.com/json/{ip}")
        data = response.json()
        return {
            "lat": data["lat"],
            "lon": data["lon"],
            "city": data["city"],
            "state": data["regionName"],  # Add state/region
            "country": data["country"]
        }
    except:
        return {"lat": 0, "lon": 0, "city": "Unknown", "state": "Unknown", "country": "Unknown"}

# Generate random IP addresses for demonstration
def generate_random_ip():
    return ".".join(str(random.randint(0, 255)) for _ in range(4))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_ip_data")
def get_ip_data():
    source_ip = generate_random_ip()
    destination_ip = generate_random_ip()
    # #IP given by me
    # source_ip = "103.184.71.191"
    # destination_ip = "152.228.135.8"
    source_location = get_location(source_ip)
    destination_location = get_location(destination_ip)

    return jsonify({
        "source": {
            "ip": source_ip,
            "lat": source_location["lat"],
            "lon": source_location["lon"],
            "city": source_location["city"],
            "state": source_location["state"],  # Include state
            "country": source_location["country"]
        },
        "destination": {
            "ip": destination_ip,
            "lat": destination_location["lat"],
            "lon": destination_location["lon"],
            "city": destination_location["city"],
            "state": destination_location["state"],  # Include state
            "country": destination_location["country"]
        }
    })

if __name__ == "__main__":
    app.run(debug=True)
    