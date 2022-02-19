import menu
from menu import MENU, resources

more_coffee = True
customer_deposit = 0
profit = 0


def is_resource_sufficient(order_ingredients):
    """Returns True when order can be made, False if ingredient is insuffienct"""
    for item in order_ingredients:
        if order_ingredients[item] >= resources[item]:
            print(f"Sorry there is not enough {item}")
            return False
    return True


def deposit_coins():
    print(f"There's enough resources that will be ${drink['cost']}")
    quarters = int((input("How many quarters($0.25) do you want to deposit?")))
    dimes = int((input("How many dimes($0.10) do you want to deposit?")))
    nickles = int((input("How many nickles($0.5) do you want to deposit?")))
    pennies = int((input("How many pennies($0.01) do you want to deposit?")))
    quarters = quarters * .25
    dimes = dimes * .10
    nickles = nickles * .05
    pennies = pennies * .01
    customer_deposit = quarters + dimes + nickles + pennies
    return customer_deposit


def is_transaction_successful(money_received, drink_cost):
    if money_received >= drink_cost:
        change = round(money_received - drink_cost, 2)
        print(f"Here is your change {change}")
        global profit
        profit += drink_cost
        return True
    else:
        return False


def make_coffee(drink_name, order_ingredients):
    for item in order_ingredients:
        resources[item] -= order_ingredients[item]
    print(f"Here is your drink {drink_name}. Enjoy!")


while more_coffee:
    customer_bal = 0
    coffee = input("What would you like? (espresso/latte/cappuccino): ")
    if coffee == "off":
        more_coffee = False
    elif coffee == "report":
        print(f"Water: {resources['water']}ml")
        print(f"Milk: {resources['milk']}ml")
        print(f"Coffee: {resources['coffee']}g")
        print(f"Money: ${profit}")
    else:
        drink = MENU[coffee]
        if is_resource_sufficient(drink["ingredients"]):
            payment = deposit_coins()
            is_transaction_successful(payment, drink["cost"])
            make_coffee(coffee, drink["ingredients"])

# TODO take users input and compare that to the dictionary to get recipe.


# TODO ask user to insert coins

# TODO compare the users inputed coins to the cost of the coffee. If correct minus the reources and add the coins to the machine
# if wrong refund money and don't make the order.

# TODO if user inputs report print the current resources available
