from bs4 import BeautifulSoup
import requests
import selenium
from selenium import webdriver
import csv
from selenium.webdriver.common.by import By

URL_RADBIKE = "https://www.radpowerbikes.com/collections/electric-bikes?g_acctid=743-021-7144&g_adgroup" \
              "id=128462652613&g_adid=580555369113&g_adtype=search&g_campaign=TL%20-%20US%20-%20B%20-%20" \
              "Retail%20-%20Seattle%20Rad%20Power%20Bikes&g_campaignid=15034234482&g_keyword=rad%20bikes&" \
              "g_keywordid=kwd-773593113241&g_network=g&gclid=Cj0KCQjwgMqSBhDCARIsAIIVN1Vmn5tQGw_97Y3hUbvW" \
              "uRumrD29sMKirreKBarGxDZ8FAXhn9RCvCIaArJZEALw_wcB&utm_campaign=retail&utm_content=Rad&utm_medium=" \
              "paidsearch&utm_source=google&utm_term=TL%20US%20Rad%20Power%20Bikes%20%20Brand%20Seattle%20Retail"

URL_AMAZON = "https://www.amazon.com/s?k=electric+bike&crid=1TXWEISR43HB8&sprefix=electric+bike%2Caps%2C162&ref=nb_sb_noss_1"

GOOGLE_FORMS = "https://docs.google.com/forms/d/e/1FAIpQLSfT8eIf-78tWF6yvZsLvbai0-b-mFP-_wuiYFhXfp8K8_3fzA/viewform?usp=sf_link"



driver = webdriver.Chrome()
driver.get(URL_RADBIKE)

radbike_html = driver.page_source
soup = BeautifulSoup(radbike_html, "html.parser")


radbike_product_list = soup.find_all("div", "product-item__info-inner")
radbike_link_list = soup.find_all("a", 'product-item__title text--strong link')
radbike_reviews_list = soup.find_all("span", "reviews-stars-copy")
radbike_stars_list = soup.find_all("span", "stars")





# print(radbike_product_list[0].find("a", "product-item__title text--strong link").text)
#
#
# print(radbike_product_list[0].find("span", "price").text)
#
#
# print(radbike_link_list[0].get("href"))
#
#
#
# print(radbike_reviews_list[0].text.strip())



driver.quit()


amazon_driver = webdriver.Chrome()
amazon_driver.get(URL_AMAZON)
amazon_data = amazon_driver.page_source

amazon_soup = BeautifulSoup(amazon_data, "html.parser")

amazon_product_list = soup.find_all("div", "product-item__info-inner")
amazon_link_list = soup.find_all("a", 'product-item__title text--strong link')
amazon_reviews_list = soup.find_all("span", "reviews-stars-copy")
amazon_stars_list = soup.find_all("span", "stars")


forms_driver = webdriver.Chrome()

forms_driver.get(GOOGLE_FORMS)



for i in range(len(radbike_product_list)):
    # open google forms fill out each line and click submit
    product_input = forms_driver.find_element(By.XPATH,
                                              '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[1]/div/div/div[2]/div/div[1]/div/div[1]/input')
    product_input.send_keys(radbike_product_list[i].find("a", "product-item__title text--strong link").text)

    product_price = forms_driver.find_element(By.XPATH,
                                              '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[2]/div/div/div[2]/div/div[1]/div/div[1]/input')
    product_price.send_keys(radbike_product_list[i].find("span", "price").text)

    product_link = forms_driver.find_element(By.XPATH,
                                             '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[3]/div/div/div[2]/div/div[1]/div/div[1]/input')
    product_link.send_keys(f'https://www.radpowerbikes.com/{radbike_link_list[i].get("href")}')


    product_reviews = forms_driver.find_element(By.XPATH,
                                                '//*[@id="mG61Hd"]/div[2]/div/div[2]/div[4]/div/div/div[2]/div/div[1]/div/div[1]/input')

    product_reviews.send_keys(radbike_reviews_list[i].text.strip())

    submit_button = forms_driver.find_element(By.XPATH,
                                              '//*[@id="mG61Hd"]/div[2]/div/div[3]/div[1]/div[1]/div/span/span')
    submit_button.click()

    continue_button = forms_driver.find_element(By.XPATH,
                                                '/html/body/div[1]/div[2]/div[1]/div/div[4]/a')
    continue_button.click()


