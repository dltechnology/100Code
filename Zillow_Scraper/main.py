from selenium import webdriver
from bs4 import BeautifulSoup
from selenium.webdriver.common.by import By
import requests
import time

GOOGLE_FORMS_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfeMgyVC4qJrkhJNac3ngpYHjLK_fj5hKbG7KiqqVgc8S8yBg/viewform?usp=sf_link"
ZILLOW_LISTINGS = "https://www.zillow.com/seattle-wa-98125/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22usersSearchTerm%22%3A%2298125%22%2C%22mapBounds%22%3A%7B%22west%22%3A-122.35471158776855%2C%22east%22%3A-122.23060041223144%2C%22south%22%3A47.66729875824377%2C%22north%22%3A47.763622375397006%7D%2C%22regionSelection%22%3A%5B%7B%22regionId%22%3A99583%2C%22regionType%22%3A7%7D%5D%2C%22isMapVisible%22%3Atrue%2C%22filterState%22%3A%7B%22sort%22%3A%7B%22value%22%3A%22days%22%7D%2C%22ah%22%3A%7B%22value%22%3Atrue%7D%7D%2C%22mapZoom%22%3A13%7D"

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36 Edg/100.0.1185.29",
    "Accept-Language": "en-US,en;q=0.9,zh-HK;q=0.8,zh;q=0.7"
}

driver = webdriver.Chrome()

response = requests.get(ZILLOW_LISTINGS, headers=headers)

driver.get(ZILLOW_LISTINGS)
time.sleep(30)
data2 = driver.page_source

data = response.content
soup = BeautifulSoup(data2, "html.parser")

# driver = webdriver.Chrome()
# driver.get(ZILLOW_LISTINGS)
#
# search = driver.find_element(By.ID, "search-box-input")
# search.send_keys("Hello")


time.sleep(2)
price = {
    "prices": []
}
address = {
    "addresses": []
}
weblink = {
    "links": []
}

# ---------------------------Use BS to scrape all the zillow links------------------------------------------------#
for links in soup.find_all("a", "list-card-link list-card-link-top-margin"):
    weblink["links"].append(links.get("href"))


#---------------------------Create a list of all the links scraped------------------------------------------------#

#---------------------------Use BS to scrape all the zillow prices------------------------------------------------#

price_list = soup.find_all("div", "list-card-price")
for i in price_list:
    edit1 = i.text.replace("$", "")
    edit2 = edit1.replace("+", "")
    price["prices"].append(edit2)

#---------------------------Create a list of all the prices scraped------------------------------------------------#
for addresses in soup.find_all("a", "list-card-link list-card-link-top-margin"):
    address["addresses"].append(addresses.text)
#---------------------------Use BS to scrape all the zillow addresses------------------------------------------------#

#---------------------------Create a list of all the addresses scraped------------------------------------------------#
driver.quit()
#---------------------------Use Selenium to fill in the form------------------------------------------------#

driver = webdriver.Chrome()
driver.get(GOOGLE_FORMS_URL)
for i in range(len(address["addresses"])):



    address_input = driver.find_element(By.XPATH,'//*[@id="mG61Hd"]/div[2]/div/div[2]/div[1]/div/div/div[2]/div/div[1]/div/div[1]/input')
    address_input.send_keys(address["addresses"][i])

    price_input = driver.find_element(By.XPATH,'//*[@id="mG61Hd"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/input')
    price_input.send_keys(price["prices"][i])

    weblink_input = driver.find_element(By.XPATH,'//*[@id="mG61Hd"]/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div[1]/div/div[1]/input')
    weblink_input.send_keys(weblink["links"][i])

    submit_button = driver.find_element(By.XPATH,'//*[@id="mG61Hd"]/div[2]/div/div[3]/div[1]/div[1]/div/span/span')
    submit_button.click()
    time.sleep(2)
    continue_button = driver.find_element(By.XPATH,'/html/body/div[1]/div[2]/div[1]/div/div[4]/a')
    continue_button.click()
    time.sleep(2)

time.sleep(3)

#---------------------------Once data has been filled click "sheet"------------------------------------------------#

