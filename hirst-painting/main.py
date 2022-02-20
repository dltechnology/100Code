##This code will not work in repl.it as there is no access to the colorgram package here.###
#We talk about this in the video tutorials##
# import colorgram
#
# rgb_colors = []
# colors = colorgram.extract('Capture.jpg', 50)
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
    (148, 78, 40), (62, 13, 31), (54, 27, 14), (13, 11, 24), (157, 168, 44), (200, 162, 97), (138, 66, 94),
    (72, 31, 119), (217, 66, 129), (242, 219, 210), (221, 209, 56), (16, 38, 24), (193, 210, 225), (60, 106, 126),
    (67, 110, 82), (227, 77, 48), (236, 210, 217), (97, 36, 83), (33, 176, 191), (74, 185, 213), (78, 81, 20),
    (112, 188, 149), (120, 41, 25), (244, 250, 247), (100, 231, 204), (31, 87, 45), (200, 141, 169), (71, 164, 119),
    (222, 179, 171), (217, 177, 189), (203, 208, 41), (124, 222, 230), (113, 116, 174), (182, 187, 212), (20, 89, 97)
              ]

david = Turtle()
screen = Screen()
screen.colormode(255)


x = -375
y = -375


def start_position():
    david.penup()
    david.pensize(10)
    david.setpos(x, y)
    david.speed("fastest")


def make_dots(matrix):
    for columns in range(matrix):
        for row in range(matrix):
            rand_color = (random.choice(color_list))
            david.dot(20, rand_color)
            david.forward(25)
        global y
        y += 25
        move_up()


def move_up():
    david.ht()
    david.home()
    david.setpos(x, y)


start_position()
make_dots(20)
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