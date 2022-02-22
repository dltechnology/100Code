from turtle import Turtle

FONT = ("Arial", 24, "normal")


class Scoreboard(Turtle):
    def __init__(self):
        super().__init__()
        self.level = 1
        self.penup()
        self.ht()
        self.color("black")
        self.goto(-280, 250)




    def update_scoreboard(self):

        self.clear()
        self.write(f"Level {self.level}", font=FONT)

    def increase_score(self):
        self.clear()
        self.level += 1
        self.write(f"Level {self.level}", font=FONT)

    def game_over(self):
        self.goto(0, 0)
        self.color("red")
        self.write("Turtle Soup Anyone?", align="center", font=FONT)

