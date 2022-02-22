from turtle import Turtle
from scoreboard import Scoreboard

STARTING_POSITION = (0, -280)
MOVE_DISTANCE = 10
FINISH_LINE_Y = 280


class Player(Turtle):
    def __init__(self):
        super().__init__()
        self.color("black")
        self.penup()
        self.shape("turtle")
        self.goto(0, -280)
        self.left(90)

    def move_forward(self):
        self.forward(10)

    def level_up(self):
        self.goto(STARTING_POSITION)
        self.clear()
        Scoreboard().increase_score()


    def player_at_finish(self):
        if self.ycor() > FINISH_LINE_Y:
            return True
        else:
            return False

