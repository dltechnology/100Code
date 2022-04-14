import selenium
from selenium import webdriver
from bs4 import BeautifulSoup
import requests

headers = {
    "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36",
    "Accept-Language" : "en-US,en;q=0.9,zh-HK;q=0.8,zh;q=0.7",
}


URL = "https://www.amazon.com/s?k=triple+monitor+laptop&sprefix=triple+monitor+lap%2Caps%2C141&ref=nb_sb_ss_ts-doa-p_1_18"
response = requests.get(URL, headers=headers)
data = response.text

soup = BeautifulSoup(data, "html.parser")
prices = soup.find_all('i', class_="a-icon a-icon-star-small a-star-small-4 aok-align-bottom")

for i in prices:
    print(i.text)