import selenium.common.exceptions
from selenium.webdriver.common.by import By
import time
from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.alert import Alert
import pyperclip
from datetime import date, timedelta
from bulk_triage import bulk_triage


if ticket_id != "":
    deploy_stage = input("Failing at: ")

    if deploy_stage == "quit":
        phynet_driver.quit()
    elif deploy_stage == "transfer fpn":
        aznetcim = "https://aznetcim.azurewebsites.net/"
        driver2 = webdriver.Edge()
        driver2.get(aznetcim)

        login = driver2.find_element(By.CSS_SELECTOR,
                                     "body > div.container-fluid.body-content > div > div > a > svg > text")
        login.click()
        diary_entry = driver2.find_element(By.CSS_SELECTOR, '#main_nav > ul:nth-child(1) > li:nth-child(3) > a')
        diary_entry.click()
        icm = driver2.find_element(By.CSS_SELECTOR, '#tabmenubulkId')
        icm.click()
        ticket_box = driver2.find_element(By.CSS_SELECTOR, '#incidentId')
        ticket_box.send_keys(ticket_id)
        get_data = driver2.find_element(By.CSS_SELECTOR, '#incidentIdSubmit')
        get_data.click()
        time.sleep(3)
        Alert(driver2).accept()
        time.sleep(5)
        transfer_select = Select(driver2.find_element(By.CSS_SELECTOR
                                                      , '#owningTeam'))
        transfer_select.select_by_visible_text('CLOUDNET\AzureFirstPartyNetwork-DeploymentsOnly')

        time.sleep(30)
        driver2.quit()

    elif deploy_stage == "close":
        aznetcim = "https://aznetcim.azurewebsites.net/"
        driver2 = webdriver.Edge()
        driver2.get(aznetcim)

        login = driver2.find_element(By.CSS_SELECTOR,
                                     "body > div.container-fluid.body-content > div > div > a > svg > text")
        login.click()

        bulk_update = driver2.find_element(By.CSS_SELECTOR, "#main_nav > ul:nth-child(1) > li:nth-child(4) > a")
        bulk_update.click()
        closure = driver2.find_element(By.CSS_SELECTOR,
                                       '#main_nav > ul:nth-child(1) > li.dropdown.open > ul > li:nth-child(4) > a')
        closure.click()
        time.sleep(1)

        incident_id = driver2.find_element(By.CSS_SELECTOR, "#idTextarea")
        incident_id.send_keys(ticket_id)
        closure_name = driver2.find_element(By.CSS_SELECTOR, "#closureDeviceName")
        closure_name.send_keys(hostname)
        if "FID" in slice_tag:
            fid_radio = driver2.find_element(By.CSS_SELECTOR
                                             ,'#bulkClosureForm > div.panel-body > div:nth-child(4) > label:nth-child(5) > input[type=radio]')
            fid_radio.click()
            id_input = driver2.find_element(By.CSS_SELECTOR,
                                            '#typeIdValue')
            id_input.send_keys(slice_tag)

        elif slice_tag[0] == "4":
            mdmid_radio = driver2.find_element(By.CSS_SELECTOR,
                                               '#bulkClosureForm > div.panel-body > div:nth-child(4) > label:nth-child(3) > input[type=radio]')
            mdmid_radio.click()
            id_input = driver2.find_element(By.CSS_SELECTOR,
                                            '#typeIdValue')
            id_input.send_keys(slice_tag)

        else:
            cluster_radio = driver2.find_element(By.CSS_SELECTOR,
                                                 '#bulkClosureForm > div.panel-body > div:nth-child(4) > label:nth-child(4) > input[type=radio]')
            cluster_radio.click()
            id_input = driver2.find_element(By.CSS_SELECTOR,
                                            '#typeIdValue')
            id_input.send_keys(slice_tag)

        deploy_stage = Select(driver2.find_element(By.CSS_SELECTOR,
                                                   '#DeploymentStage'))
        deploy_stage.select_by_value("Acceptance")

        mitigation = driver2.find_element(By.CSS_SELECTOR,
                                          '#MitigationStepsTaken')
        mitigation.send_keys("Device in production")

        how_fixed = Select(driver2.find_element(By.CSS_SELECTOR,
                                                '#HowFixed'))
        how_fixed.select_by_value("By Design")

        fault_class = Select(driver2.find_element(By.CSS_SELECTOR,
                                                  '#faultClass'))
        try:
            fault_class.select_by_value("15")
            time.sleep(1)
        except selenium.common.exceptions.NoSuchElementException:
            pass

        mitigation_class = Select(driver2.find_element(By.CSS_SELECTOR,
                                                       '#mitigationClass'))
        try:
            mitigation_class.select_by_value("39")
        except selenium.common.exceptions.NoSuchElementException:
            pass

        resolution = driver2.find_element(By.CSS_SELECTOR,
                                          '#ResolutionComments')
        resolution.send_keys("Device in production")

        customer_sla = driver2.find_element(By.CSS_SELECTOR, '#bulkClosureForm > div.panel-body > div:nth-child(16) > label:nth-child(3) > input[type=radio]')
        customer_sla.click()
        auto_resolve = driver2.find_element(By.CSS_SELECTOR, '#ifRootCauseRequiredYes > label:nth-child(2) > input[type=radio]')
        auto_resolve.click()
        time.sleep(30)
        driver2.quit()



    else:

        aznetcim = "https://aznetcim.azurewebsites.net/"
        driver2 = webdriver.Edge()
        driver2.get(aznetcim)

        login = driver2.find_element(By.CSS_SELECTOR,
                                     "body > div.container-fluid.body-content > div > div > a > svg > text")
        login.click()

        bulk_update = driver2.find_element(By.CSS_SELECTOR, "#main_nav > ul:nth-child(1) > li:nth-child(4) > a")
        bulk_update.click()
        triage = driver2.find_element(By.CSS_SELECTOR,
                                      "#main_nav > ul:nth-child(1) > li.dropdown.open > ul > li:nth-child(2) > a")
        triage.click()

        incident_id = driver2.find_element(By.CSS_SELECTOR, "#idTextarea")
        incident_id.send_keys(ticket_id)

        defect_drop = Select(driver2.find_element(By.CSS_SELECTOR, "#defectType"))
        defect_drop.select_by_value("Pre-RTEG ICM")

        checklist_drop = Select(driver2.find_element(By.CSS_SELECTOR, "#ChecklistType"))
        checklist_drop.select_by_value("Capacity Build")

        property_drop = Select(driver2.find_element(By.CSS_SELECTOR, "#PropertyType"))
        if deployment_id == "Pilotfish":
            deployment_id = "PF"
        elif deployment_id == "AzureAll":
            deployment_id = "Azure"
        elif deployment_id == "AzureDNS":
            deployment_id = "Azure"
        elif deployment_id == "os update":
            deployment_id = "OS Update"
        else:
            pass
        property_drop.select_by_value(deployment_id)

        no_devices = driver2.find_element(By.CSS_SELECTOR, "#NoOfDevices")
        try:
            no_devices.send_keys("1")
        except:
            pass

        stage = Select(driver2.find_element(By.CSS_SELECTOR, "#triageDeploymentValue"))
        try:

            if deploy_stage == "un":
                deploy_stage = "Undetermined"
            elif deploy_stage == "pre":
                deploy_stage = "Pre Serial Validation"
            elif deploy_stage == "ser":
                deploy_stage = "Serial Validation"
            elif deploy_stage == "os preload":
                deploy_stage = "OS PreLoad"
            elif deploy_stage == "init":
                deploy_stage = "Init Config"
            elif deploy_stage == "os update":
                deploy_stage = "OS Update"

            else:
                pass
            stage.select_by_value(deploy_stage)
        except:
            print(selenium.common.exceptions)
            pass

        tsg = driver2.find_element(By.CSS_SELECTOR, "#rdtsgNo")
        tsg.click()

        steps_taken = driver2.find_element(By.CSS_SELECTOR, "#StepsTaken")
        steps_taken.send_keys("Reviewed Icm and verified PNAAS")

        current_status = driver2.find_element(By.CSS_SELECTOR, "#CurrentStatus")
        current_status.send_keys(f"Failing at {deploy_stage}")

        ticket_transferred = driver2.find_element(By.XPATH,
                                                  '/html/body/div[2]/div/form/div[2]/div[11]/div[2]/label/input')
        ticket_transferred.click()

        next_step = driver2.find_element(By.CSS_SELECTOR, "#NextSteps")
        next_step.send_keys("Needs further investigation")

        hours = driver2.find_element(By.CSS_SELECTOR, "#hours")
        hours.send_keys("00")

        min = driver2.find_element(By.CSS_SELECTOR, "#mins")
        min.send_keys("10")

        tag = Select(driver2.find_element(By.CSS_SELECTOR, "#Tags"))
        tag.select_by_value("CBIHT")

        noofdevices = driver2.find_element(By.CSS_SELECTOR, "#NoOfDevices")
        noofdevices.send_keys("1")

        #                              driver.find_element(By.CSS_SELECTOR,"#CompletionETA")
        eta = driver2.find_element(By.CSS_SELECTOR, "#CompletionETA")
        eta.send_keys(tomorrow.strftime("%m-%d-%Y"))

        time.sleep(20)
        driver.quit()
        driver2.quit()
