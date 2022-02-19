from turtle import Turtle, Screen
david = Turtle()
screen = Screen()
angle = 0


def move_forward():
    david.forward(10)


def move_backwards():
    david.backward(10)


def clock_wise():
    david.right(10)


def counter_clock_wise():
    david.left(10)


def clear_screen():
    david.home()
    david.reset()


screen.listen()
screen.onkey(key="w", fun=move_forward)
screen.onkey(key="a", fun=counter_clock_wise)
screen.onkey(key="s", fun=move_backwards)
screen.onkey(key="d", fun=clock_wise)
screen.onkey(key="c", fun=clear_screen)

screen.exitonclick()
