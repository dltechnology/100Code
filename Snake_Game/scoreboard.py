from turtle import Turtle

class ScoreBoard(Turtle):
    def __init__(self):
        super().__init__()
        self.score = 0
        self.penup()
        self.ht()
        self.color("white")
        self.goto(0, 275)
        self.update_scoreboard()

    def update_scoreboard(self):
        self.write(f"Score = {self.score}", align="center", font=(12))

    def increase_score(self):
        self.score += 1
        self.clear()
        self.write(f"Score = {self.score}", align="center", font=(12))


    def game_over(self):
        self.goto(0, 0)
        self.write("GameOver", font=20, align="center")
