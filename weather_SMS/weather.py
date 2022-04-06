import requests
from datetime import datetime, date
from geopy.geocoders import Nominatim
from twilio.rest import Client
import os
geolocator = Nominatim(user_agent="geoapiExercises")

API = "https://api.openweathermap.org/data/2.5/onecall"
API_key = os.environ["OpenWeather_Key"]
TWILIO_AUTH = os.environ["TWILIO_AUTH"]
TWILIO_SID = os.environ["TWILIO_SID"]

# lat = "47.6659697"
# long = "-122.3714245"

lat = "49.00317433609347"
long = "-122.76567541066606"

weather_params = {
    "lat": lat,
    "lon": long,
    "appid": API_key,
    "units": "imperial",
}


location = geolocator.reverse((lat+","+long))
response = requests.get(url=API, params=weather_params)
data = response.json()

true_location = f'{location.raw["address"]["city"]}, {location.raw["address"]["state"]}'

weekly = []

for i in range (len(data["daily"])):
    timestamp = data["daily"][i]["dt"]
    description = data["daily"][i]["weather"][0]["description"]
    dt_object = date.fromtimestamp(timestamp)
    weekly.append(f"{dt_object} - {description}")

with open("weather.csv", "w") as file:
    for i in range(len(weekly)):
        file.write(f"{str(weekly[i])}\n")


# account_sid = TWILIO_SID
# auth_token = TWILIO_AUTH
# client = Client(account_sid, auth_token)
#
# message = client.messages.create(
#                               body=f'{weekly}',
#                               from_='+12674502764',
#                               to='+14083185397'
#                           )
#
# print(message.sid)
#
#
#
