from flask import Flask, render_template
import random
from datetime import datetime
import requests






year = datetime.today().strftime("%Y")
NAME = "David Ly"


app = Flask(__name__)


@app.route("/")
def home():
    random_number = random.randint(1,10)
    return render_template("index.html", num=random_number, year=year, name=NAME)

# ----------------------Variable Rules and Parsing URLS's---------------------------------------------- #

@app.route("/guess/<name>")
def guess(name):
    agify_api = f"https://api.agify.io?name={name}"
    agify_response = requests.get(agify_api)
    agify_data = agify_response.json()
    agify_age = agify_data["age"]

    genderize_api = f"https://api.genderize.io?name={name}"
    genderize_response = requests.get(genderize_api)
    genderize_data = genderize_response.json()
    genderize_gender = genderize_data["gender"]
    return render_template("guess.html", year=year, name=name, age=agify_age, gender=genderize_gender)

@app.route("/blog")
def blog():
    blogs = {
        "name":{
            "David":{
                "gender": "male",
            },
            "Phoebe":{
                "gender": "female",
            },
            "Abby": {
                "gender": "female",
            },
            "Wenkai": {
                "gender": "Male",
            },
            "Jerryl": {
                "gender": "Male",
            },
            "Louis": {
                "gender": "Male",
            }
        }
    }
    return render_template("blogs.html", all_blogs=blogs)

if __name__ == "__main__":
    app.run(debug=True)

