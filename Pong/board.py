from turtle import Turtle

class PlayField(Turtle):
    def __init__(self):
        super().__init__()
        self.penup()
        self.ht
        self.pencolor("white")
        self.goto(-400, -320)
        self.pendown()
        self.goto(-400, 320)
        self.goto(400, 320)
        self.goto(400, -320)
        self.goto(-400, -320)