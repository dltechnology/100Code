from turtle import Turtle, Screen
import random

# creates a screen object from the Screen() class
screen = Screen()
# uses the object to set the width and height of the screen/display
screen.setup(width=600, height=600)
# Gave a color to each name
wenkai = "green"
shreya = "blue"
louis = "red"
david = "purple"
abby = "yellow"
phoebe = "light sea green"
# Puts the names and colors in a list
colors = [wenkai, shreya, david, abby, phoebe, louis]

# Set the y cordinates +50
y = [-250, -150, -50, 50, 150, 250]
# create a variable that will hold on the created turtles
all_turtles = []
# Keep the game going
is_race_on = True
# from a number 0-6
for i in range(0, 6):
    # create a new object from Turtle() and give it a turtle shape
    new_turtle = Turtle(shape="turtle")
    # lifts the pen up so a line would not be drawn
    new_turtle.penup()
    # set the new turtles shapesize
    new_turtle.shapesize(3)
    # changes the new turtles color to an item from the colors list.
    # This item is chosen by i which starts at 0 and will loop 6 times.
    # So starting at index 0 then 1 then 2 etc
    new_turtle.color(colors[i])
    # the new turtle will be placed on cordinates x = -225. The screen size is 600.
    # Half is 300 the new turtle will be created 40 pixels away from the edge.
    # The Y cordinate will be chosen from the y list starting at index 0
    new_turtle.goto(x=-260, y=y[i])
    # a new turtle will be added to the all_turtles list.
    all_turtles.append(new_turtle)

# Create a while statement that will keep the game going
while is_race_on:
    # for each item in the all_turtles list
    for turtle in all_turtles:
        # if the turtles x cordinates are greater than 220. It means one of
        # the turtle has reached the other side  and the game ends.
        if turtle.xcor() > 220:
            style = ('Courier', 30, 'italic')
            turtle.write("I win!", font=style, align="right")
            # The game is over change the state of the game
            is_race_on = False
        # the random distance is chosen from a number from 0-20
        rand_dist = random.randint(0, 20)
        # uses the object and a method from the class in this case forward which when 
        # called would move the object forward 1 pixel. we add the rand_dist variable to 
        # get a random number from 0-20 which will move the objects randomly forward 
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