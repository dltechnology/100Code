# Break down the process of using a vape pen

#While inhaling the vape pen if there is enough juice and battery then puffable
class VapePen:
    """Models a typical vape pen"""
    def power_on(self):
        battery = 0
        juice = 0
        puff = 0
        ready_to_puff = True

        while ready_to_puff:
            if battery > 0 and juice > 0:
                take_puff = input("Take puff?")
                if take_puff == "yes":
                    puff += 1
                    juice -= 5
                    battery -= 10
                    print(f"You took {puff} puff, there's {juice}% juice left, and the battery is at {battery}%")
                else:
                    ready_to_puff = False
                    print("Turning off vape")
            elif battery < 5:
                print(f"The battery is at {battery}%")
                response = input("Battery is low. Do you want to recharge?")
                if response == "yes":
                    battery = 100
                else:
                    ready_to_puff = False
                    print(battery, juice, puff)
            elif juice < 1:
                refill = input("Juice is low. Do you want to refill?")
                if refill == "yes":
                    juice = 100
                else:
                    ready_to_puff = False
                    print(battery, juice, puff)




