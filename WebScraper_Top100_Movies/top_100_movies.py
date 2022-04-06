import requests
from bs4 import BeautifulSoup
import lxml
import html5lib

response = requests.get("https://www.imdb.com/list/ls055592025/")
data = response.text

soup = BeautifulSoup(data, "html.parser")


for i in soup.findAll("h3"):
    with open("movies.txt", "a") as file:
        file.write(f"{i.getText().strip()}\n")






