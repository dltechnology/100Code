from turtle import Turtle

class Scoreboard(Turtle):
    def __init__(self):
        super().__init__()
        self.color("white")
        self.penup()
        self.ht()
        self.l_score = 0
        self.r_score = 0


    def update_scoreboard(self):
        self.goto(-100, 200)
        self.write(self.l_score, align="center", font=(80))
        self.goto(100, 200)
        self.write(self.r_score, align="center", font=(80))

    def l_point(self):
        self.clear()
        self.l_score += 1
        self.update_scoreboard()

    def r_point(self):
        self.clear()
        self.r_score += 1
        self.update_scoreboard()