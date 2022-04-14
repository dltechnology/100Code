import selenium
from selenium import webdriver
from selenium.webdriver.common.by import By
import time

#beautifulsoup
#price, address, and url


#selenium to fill out form



URL = "hhttps://www.fiverr.com/"

driver = webdriver.Chrome()
driver.get(URL)


driver.switch_to.window(base_window)
time.sleep(2)
google_button = driver.find_element(By.CSS_SELECTOR, "#button-label")
google_button.click()


time.sleep(3)

print(driver.page_source)