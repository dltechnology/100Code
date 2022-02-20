from turtle import Turtle, Screen
import random

screen = Screen()
screen.setup(width=600, height=600)

wenkai = "#0ABAB5"
shreya = "#0ABAB5"
louis = "#0ABAB5"
david = "#0ABAB5"
abby = "#0ABAB5"
phoebe = "light sea green"

colors = [wenkai, shreya, david, abby, phoebe, louis]

y = [-110, -60, -10, 40, 90, 140]

all_turtles = []

is_race_on = True

for i in range(0, 6):
    new_turtle = Turtle(shape="turtle")
    new_turtle.penup()
    new_turtle.shapesize(3)
    new_turtle.color(colors[i])
    new_turtle.goto(x=-225, y=y[i])
    all_turtles.append(new_turtle)


while is_race_on:
    for turtle in all_turtles:
        if turtle.xcor() > 220:
            is_race_on = False
        rand_dist = random.randint(0, 20)
        turtle.forward(rand_dist)




#
# print(user_bet)
#
# david = Turtle(shape="turtle")
# david.penup()
# david.shapesize(3)
# david.goto(x=-225, y=-160)
# david.color("lime green")
#
#
# phoebe = Turtle(shape="turtle")
# phoebe.penup()
# phoebe.shapesize(3)
# phoebe.color("light sea green")
# phoebe.goto(x=-225, y=110)
#
#
# wenkai = Turtle(shape="turtle")
# wenkai.penup()
# wenkai.shapesize(3)
# wenkai.color("navy blue")
# wenkai.goto(x=-225, y=60)
#
#
# shreya = Turtle(shape="turtle")
# shreya.penup()
# shreya.shapesize(3)
# shreya.color("light blue", "lavender")
# shreya.goto(x=-225, y=10)
#
#
# abby = Turtle(shape="turtle")
# abby.penup()
# abby.shapesize(3)
# abby.color("pink")
# abby.goto(x=-225, y=-40)
#
#
# louis = Turtle(shape="turtle")
# louis.penup()
# louis.shapesize(3)
# louis.color("white", "black")
# louis.goto(x=-225, y=-90)
#
#




screen.exitonclick()