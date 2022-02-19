##This code will not work in repl.it as there is no access to the colorgram package here.###
#We talk about this in the video tutorials##
# import colorgram
#
# rgb_colors = []
# colors = colorgram.extract('wash.jpg', 30)
#
# for color in colors:
#     r = color.rgb.r
#     g = color.rgb.g
#     b = color.rgb.b
#     new_color = (r, g, b)
#     rgb_colors.append(new_color)
#
#
# print(rgb_colors)

import random
from turtle import Turtle, Screen


color_list = [
    (23, 30, 47), (158, 162, 167), (175, 166, 136), (83, 90, 102),
    (104, 96, 87), (163, 169, 167), (61, 23, 45), (51, 60, 82), (103, 86, 92),
    (180, 152, 158), (209, 201, 148), (149, 147, 86), (47, 42, 37), (92, 99, 95), (222, 173, 182),
    (100, 40, 69), (119, 126, 140), (187, 190, 199), (157, 114, 107),
    (186, 195, 192), (151, 114, 120), (70, 69, 49), (181, 196, 200), (220, 176, 170), (79, 56, 54)
]

david = Turtle()
screen = Screen()
screen.colormode(255)


x = -375
y = -375


def start_position():
    david.penup()
    david.pensize(10)
    david.ht()
    david.setpos(x, y)
    david.speed("fastest")


def make_dots(matrix):
    for columns in range(matrix):
        for row in range(matrix):
            rand_color = (random.choice(color_list))
            david.dot(20, rand_color)
            david.forward(50)
        global y
        y += 50
        move_up()


def move_up():
    david.ht()
    david.home()
    david.setpos(x, y)


start_position()
make_dots(10)
#
# # change_dot()
# # make_dots()
# # Move forward and make another dot with random color do this 10 times then go back home and up 1
#
# # Do this until I have 10 rows
#
#
#
# #
# # def color():
# #     david.color("green")
# #     david.begin_fill()
# #     david.shape("circle")
# #     david.end_fill()
# #
# #
# # def start():
# #     david.ht()
# #     david.penup()
# #     david.right(90)
# #     david.forward(250)
# #     david.right(90)
# #     david.forward(250)
# #     david.st()
# #     david.right(180)
# #     next_move()
# #
# #
# # def next_move():
# #     david.forward(50)
# #     color()
# #     david.pendown()
# #     david.penup()
# #     david.forward(50)
# #     color()
# #     david.pendown()
# #     david.penup()
# #     david.forward(50)
# #     color()
# #     david.pendown()
# #     david.penup()
# # start()
# # color()
# #
#
screen.exitonclick()