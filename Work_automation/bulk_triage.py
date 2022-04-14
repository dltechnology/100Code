import selenium.common.exceptions
from selenium.webdriver.common.by import By
import time
from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.alert import Alert
import pyperclip
from datetime import date, timedelta

aznetcim = "https://aznetcim.azurewebsites.net/"
aznetcim_driver = webdriver.Edge()
aznetcim_driver.set_window_position(1000, 0)
aznetcim_driver.get(aznetcim)
time.sleep(2)
login = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                     "body > div.container-fluid.body-content > div > div > a > svg > text")
login.click()
time.sleep(1)


def manual_triage(deployment_id):
    today = date.today()
    delta = timedelta(days=1)
    tomorrow = today + delta
    deploy_stage = input("Where is it failing?")

    defect_drop = Select(aznetcim_driver.find_element(By.CSS_SELECTOR, "#defectType"))
    defect_drop.select_by_value("Pre-RTEG ICM")

    checklist_drop = Select(aznetcim_driver.find_element(By.CSS_SELECTOR, "#ChecklistType"))
    checklist_drop.select_by_value("Capacity Build")

    property_drop = Select(aznetcim_driver.find_element(By.CSS_SELECTOR, "#PropertyType"))
    if deployment_id == "Pilotfish":
        deployment_id = "PF"
    elif deployment_id == "AzureAll":
        deployment_id = "Azure"
    elif deployment_id == "AzureDNS":
        deployment_id = "Azure"
    elif deployment_id == "os update":
        deployment_id = "OS Update"
    elif deployment_id == "os preload":
        deployment_id = "OS PreLoad"
    else:
        pass
    property_drop.select_by_value(deployment_id)

    stage = Select(aznetcim_driver.find_element(By.CSS_SELECTOR, "#triageDeploymentValue"))
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
    except selenium.common.exceptions.NoSuchElementException:
        print(selenium.common.exceptions.NoSuchElementException)
        pass

    tsg = aznetcim_driver.find_element(By.CSS_SELECTOR, "#rdtsgNo")
    tsg.click()

    steps_taken = aznetcim_driver.find_element(By.CSS_SELECTOR, "#StepsTaken")
    steps_taken.send_keys("Reviewed Icm and verified PNAAS")

    current_status = aznetcim_driver.find_element(By.CSS_SELECTOR, "#CurrentStatus")
    current_status.send_keys(f"Failing at {deploy_stage}")

    ticket_transferred = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                                      '#newautoTriageListDiv > div > div > div:nth-child(10) > '
                                                      'div:nth-child(3) > label > input[type=radio]')
    ticket_transferred.click()

    next_step = aznetcim_driver.find_element(By.CSS_SELECTOR, "#NextSteps")
    next_step.send_keys("Needs further investigation")

    hours = aznetcim_driver.find_element(By.CSS_SELECTOR, "#hours")
    hours.send_keys("00")

    minutes = aznetcim_driver.find_element(By.CSS_SELECTOR, "#mins")
    minutes.send_keys("10")

    tag = Select(aznetcim_driver.find_element(By.CSS_SELECTOR, "#Tags"))
    tag.select_by_value("CBIHT")

    noofdevices = aznetcim_driver.find_element(By.CSS_SELECTOR, "#NoOfDevices")
    noofdevices.send_keys("1")

    #                              driver.find_element(By.CSS_SELECTOR,"#CompletionETA")
    eta = aznetcim_driver.find_element(By.CSS_SELECTOR, "#CompletionETA")
    eta.send_keys(tomorrow.strftime("%m-%d-%Y"))

    time.sleep(20)
    Alert(aznetcim_driver).accept()


def bulk_triage(ticket_id):
    bulk_update = aznetcim_driver.find_element(By.CSS_SELECTOR, "#main_nav > ul:nth-child(1) > li:nth-child(4) > a")
    bulk_update.click()
    time.sleep(1)
    bulk_triage_menu = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                                    "#main_nav > ul:nth-child(1) > li.dropdown.open > ul > "
                                                    "li:nth-child(3) > a")
    bulk_triage_menu.click()
    time.sleep(1)
    incident_box = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                                "#idTextarea")
    incident_box.send_keys(ticket_id)
    time.sleep(1)
    check_auto = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                              'body > div.container-fluid.body-content > div.field-set.bulktraigeform '
                                              '> div:nth-child(8) > input')
    check_auto.click()
    time.sleep(3)
    try:
        cbiht_tag = Select(aznetcim_driver.find_element(By.CSS_SELECTOR, '#autoTriageTags'))
        cbiht_tag.select_by_visible_text("CBIHT")
    except selenium.common.exceptions.NoSuchElementException:
        manual_triage_menu = aznetcim_driver.find_element(By.CSS_SELECTOR, '#gotoTriageChecklistbtn')
        manual_triage_menu.click()
        return "manual triage"


def transfer_fpn(ticket_id):
    diary_entry = aznetcim_driver.find_element(By.CSS_SELECTOR, '#main_nav > ul:nth-child(1) > li:nth-child(3) > a')
    diary_entry.click()
    icm = aznetcim_driver.find_element(By.CSS_SELECTOR, '#tabmenubulkId')
    icm.click()
    ticket_box = aznetcim_driver.find_element(By.CSS_SELECTOR, '#incidentId')
    ticket_box.send_keys(ticket_id)
    get_data = aznetcim_driver.find_element(By.CSS_SELECTOR, '#incidentIdSubmit')
    get_data.click()
    time.sleep(3)
    Alert(aznetcim_driver).accept()
    time.sleep(5)
    transfer_select = Select(aznetcim_driver.find_element(By.CSS_SELECTOR, '#owningTeam'))
    transfer_select.select_by_visible_text('CLOUDNET\AzureFirstPartyNetwork-DeploymentsOnly')

    time.sleep(30)
    aznetcim_driver.quit()


def get_cbiht_tag(hostname):
    aznetmeta = f"https://aznetmeta.trafficmanager.net/netgraph/Readdevice?hostname={hostname}"
    aznetmeta_driver = webdriver.Edge()
    aznetmeta_driver.get(aznetmeta)
    nokia = ""

    # ------------------------------------- Security Clicking ------------------------------------------------------ #

    advance_button = aznetmeta_driver.find_element(By.CSS_SELECTOR, "#details-button")
    advance_button.click()
    continue_button = aznetmeta_driver.find_element(By.CSS_SELECTOR, "#proceed-link")
    continue_button.click()
    login = aznetmeta_driver.find_element(By.NAME, "MSIT-ADFS-Federation")
    login.click()
    login2 = aznetmeta_driver.find_element(By.CSS_SELECTOR, "#bySelection div div span ")
    login2.click()
    time.sleep(2)

    # ------------------------------------- Find's elements -------------------------------------------------- #

    try:
        slice_tag = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                  "#folder0 > div.opened > div:nth-child(5) > span:nth-child(2)") \
            .text.strip().replace(";", ",")
    except:
        slice_tag = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                  "#folder0 > div.opened > div:nth-child(5) > span:nth-child(2)") \
            .text.strip().replace(";", ",")
    try:
        hostname_tag = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                     "#folder0 > div.opened > div:nth-child(15) > span:nth-child(2)") \
            .text.strip()
    except:
        hostname_tag = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                     "#folder0 > div.opened > div:nth-child(15) > span:nth-child(2)") \
            .text.strip()
    try:
        datacenter_tag = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                       "#folder0 > div.opened > div:nth-child(11) > span:nth-child(2)") \
            .text.strip()
    except:
        datacenter_tag = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                       "#folder0 > div.opened > div:nth-child(11) > span:nth-child(2)") \
            .text.strip()
    try:
        deployment_id = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                      "#folder0 > div.opened > div:nth-child(9) > span:nth-child(2)") \
            .text.strip()
    except:
        deployment_id = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                                      "#folder0 > div.opened > div:nth-child(9) > span:nth-child(2)") \
            .text.strip()
    try:
        hwsku = aznetmeta_driver.find_element(By.CSS_SELECTOR,
                                              '#folder0 > div.opened > div:nth-child(16) > span:nth-child(2)')
        nokia = hwsku.text.split("-")
    except:
        pass

    # ------------------------------------- Changes the deployment ID to the name------------------------------------ #

    if int(deployment_id) == 2:
        deployment_id = "AzureAll"
    elif int(deployment_id) == 3:
        deployment_id = "Fabric"
    elif int(deployment_id) == 4:
        deployment_id = "PF"
    elif int(deployment_id) == 8:
        deployment_id = "Exchange"
    elif int(deployment_id) == 19:
        deployment_id = "AzureDNS"
    elif int(deployment_id) == 16:
        deployment_id = "FOPE"
    elif int(deployment_id) == 11:
        deployment_id = "Sharepoint"
    elif int(deployment_id) == 26:
        deployment_id = "Tycoon"
    else:
        pass

    # ------------------------------------- Prints out the tag to be used on ICM ----------------------------------- #

    cbiht_tag = f"CBIHT | {deployment_id} | {datacenter_tag} | {slice_tag} | {hostname_tag}"
    if nokia[0].lower() == "nokia":
        cbiht_tag += f" | {nokia[0]}"
    else:
        pass
    print(cbiht_tag)
    pyperclip.copy(cbiht_tag)
    aznetmeta_driver.quit()
    return deployment_id, datacenter_tag, slice_tag, hostname_tag


def phynet_deploy(deployment_id, datacenter_tag, slice_tag, hostname_tag):
    phynet_deploy = "https://phynet-alt.trafficmanager.net/Deploy"
    phynet_driver = webdriver.Edge()
    phynet_driver.set_window_position(-1000, 0)
    phynet_driver.maximize_window()
    phynet_driver.get(phynet_deploy)

    # ------------------------------------- Security Clicking ------------------------------------------------------ #

    login = phynet_driver.find_element(By.NAME, "MSIT-ADFS-Federation")
    login.click()
    login2 = phynet_driver.find_element(By.CSS_SELECTOR, "#bySelection div div span ")
    login2.click()
    time.sleep(5)

    # -------------------------------------Selecting dropdowns ------------------------------------------------------ #
    deploy_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#EgDropdown"))

    if deployment_id == "PF":
        deployment_id = "Pilotfish"
    else:
        pass
    deploy_drop.select_by_value(deployment_id)

    if datacenter_tag == "LON24AzSet1":
        datacenter_tag = "Lon24Azset1"
    elif datacenter_tag == "dub21azset1":
        datacenter_tag = "DUB21AZSet1"
    elif datacenter_tag == "LON23AzSet1":
        datacenter_tag = "Lon23Azset1"

    else:
        pass
    try:
        datacenter_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#DcDropdown"))
        datacenter_drop.select_by_value(datacenter_tag)
    except selenium.common.exceptions.NoSuchElementException:
        try:
            datacenter_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#DcDropdown"))
            datacenter_drop.select_by_value(datacenter_tag.lower())
        except:
            try:
                datacenter_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#DcDropdown"))
                datacenter_drop.select_by_value(datacenter_tag.upper())
            except:
                pass

    slice_tag_split = slice_tag.split(",")

    for i in slice_tag_split:
        try:
            slice_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#SliceDropdown"))
            slice_drop.select_by_value(i)
            time.sleep(1)
        except:
            try:
                print(slice_tag)
                slice_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#SliceDropdown"))
                slice_drop.select_by_value(i.upper())
                time.sleep(1)
            except:
                try:
                    print(slice_tag)
                    slice_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#SliceDropdown"))
                    slice_drop.select_by_value(i.lower())
                    time.sleep(1)
                except:
                    pass

    try:
        deploy_drop = Select(phynet_driver.find_element(By.CSS_SELECTOR, "#EgDropdown"))
        deploy_drop.select_by_value(deployment_id)
    except selenium.common.exceptions.NoSuchElementException:
        print(deployment_id)

    search = phynet_driver.find_element(By.CSS_SELECTOR, "#DeviceTable_filter > label > input")
    search.send_keys(hostname_tag)

    get_stats = phynet_driver.find_element(By.CSS_SELECTOR, "#GetStats")
    get_stats.click()
    time.sleep(30)
    phynet_driver.quit()

def transfer_hardware(ticket_id):
        # aznetcim = "https://aznetcim.azurewebsites.net/"
        # aznetcim_driver = webdriver.Edge()
        # aznetcim_driver.get(aznetcim)
        #
        # login = aznetcim_driver.find_element(By.CSS_SELECTOR,
        #                              "body > div.container-fluid.body-content > div > div > a > svg > text")
        # login.click()
        diary_entry = aznetcim_driver.find_element(By.CSS_SELECTOR, '#main_nav > ul:nth-child(1) > li:nth-child(3) > a')
        diary_entry.click()
        icm = aznetcim_driver.find_element(By.CSS_SELECTOR, '#tabmenubulkId')
        icm.click()
        ticket_box = aznetcim_driver.find_element(By.CSS_SELECTOR, '#incidentId')
        ticket_box.send_keys(ticket_id)
        get_data = aznetcim_driver.find_element(By.CSS_SELECTOR, '#incidentIdSubmit')
        get_data.click()
        time.sleep(3)
        Alert(aznetcim_driver).accept()
        time.sleep(5)
        transfer_select = Select(aznetcim_driver.find_element(By.CSS_SELECTOR
                                                      , '#owningTeam'))
        transfer_select.select_by_visible_text('CLOUDNET\HardwareProxy')

        time.sleep(30)
        aznetcim_driver.quit()

def close(ticket_id, slice_tag, hostname):
    # aznetcim = "https://aznetcim.azurewebsites.net/"
    # aznetcim_driver = webdriver.Edge()
    # aznetcim_driver.get(aznetcim)
    #
    # login = aznetcim_driver.find_element(By.CSS_SELECTOR,
    #                              "body > div.container-fluid.body-content > div > div > a > svg > text")
    # login.click()

    bulk_update = aznetcim_driver.find_element(By.CSS_SELECTOR, "#main_nav > ul:nth-child(1) > li:nth-child(4) > a")
    bulk_update.click()
    closure = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                   '#main_nav > ul:nth-child(1) > li.dropdown.open > ul > li:nth-child(4) > a')
    closure.click()
    time.sleep(1)

    incident_id = aznetcim_driver.find_element(By.CSS_SELECTOR, "#idTextarea")
    incident_id.send_keys(ticket_id)
    closure_name = aznetcim_driver.find_element(By.CSS_SELECTOR, "#closureDeviceName")
    closure_name.send_keys(hostname)
    if "FID" in slice_tag:
        fid_radio = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                         '#bulkClosureForm > div.panel-body > div:nth-child(4) > '
                                         'label:nth-child(5) > input[type=radio]')
        fid_radio.click()
        id_input = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                        '#typeIdValue')
        id_input.send_keys(slice_tag)

    elif slice_tag[0] == "4":
        mdmid_radio = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                           '#bulkClosureForm > div.panel-body > div:nth-child(4) > label:nth-child(3) > input[type=radio]')
        mdmid_radio.click()
        id_input = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                        '#typeIdValue')
        id_input.send_keys(slice_tag)

    else:
        cluster_radio = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                             '#bulkClosureForm > div.panel-body > div:nth-child(4) > label:nth-child(4) > input[type=radio]')
        cluster_radio.click()
        id_input = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                        '#typeIdValue')
        id_input.send_keys(slice_tag)

    deploy_stage = Select(aznetcim_driver.find_element(By.CSS_SELECTOR,
                                               '#DeploymentStage'))
    deploy_stage.select_by_value("Acceptance")

    mitigation = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                      '#MitigationStepsTaken')
    mitigation.send_keys("Device in production")

    how_fixed = Select(aznetcim_driver.find_element(By.CSS_SELECTOR,
                                            '#HowFixed'))
    how_fixed.select_by_value("By Design")

    fault_class = Select(aznetcim_driver.find_element(By.CSS_SELECTOR,
                                              '#faultClass'))
    try:
        fault_class.select_by_value("15")
        time.sleep(1)
    except selenium.common.exceptions.NoSuchElementException:
        pass

    mitigation_class = Select(aznetcim_driver.find_element(By.CSS_SELECTOR,
                                                   '#mitigationClass'))
    try:
        mitigation_class.select_by_value("39")
    except selenium.common.exceptions.NoSuchElementException:
        pass

    resolution = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                      '#ResolutionComments')
    resolution.send_keys("Device in production")

    customer_sla = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                        '#bulkClosureForm > div.panel-body > div:nth-child(16) > label:nth-child(3) > input[type=radio]')
    customer_sla.click()
    auto_resolve = aznetcim_driver.find_element(By.CSS_SELECTOR,
                                        '#ifRootCauseRequiredYes > label:nth-child(2) > input[type=radio]')
    auto_resolve.click()
    time.sleep(30)
    aznetcim_driver.quit()

