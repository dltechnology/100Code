age = input("What is your current age?")


End_Age = 90
Month = 12
Weeks = 52
Days = 365

x = (End_Age * Days) - (int(age) * Days)
y = (End_Age * Weeks) - (int(age) * Weeks)
z = (End_Age * Month) - (int(age) * Month)


print(f"You have {x} days, {y} weeks, and {z} months left.")

