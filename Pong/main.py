from turtle import Turtle, Screen
from pong_paddles import Paddle
from ball import Ball
import time
from scoreboard import Scoreboard
from board import PlayField

screen = Screen()
screen.screensize(canvwidth=800, canvheight=600)
screen.title("Let's play some Pong!")
screen.bgcolor("black")
screen.tracer(0)
scoreboard = Scoreboard()

r_Paddle = Paddle(350, 0)
l_Paddle = Paddle(-350, 0)
ball = Ball()
field = PlayField()
screen.listen()
screen.onkeypress(r_Paddle.go_up, "Up")
screen.onkeypress(r_Paddle.go_down, "Down")
screen.onkeypress(l_Paddle.go_up, "w")
screen.onkeypress(l_Paddle.go_down, "s")

speed = .1



game_is_on = True
while game_is_on:
    time.sleep(speed)
    screen.update()
    ball.move()
    scoreboard.update_scoreboard()
    if ball.ycor() > 300 or ball.ycor() < -300:
        ball.bounce_y()

    # collision with right paddle
    if ball.distance(r_Paddle) < 50 and ball.xcor() > 340 or ball.distance(l_Paddle) < 50 and ball.xcor() < -340:
        ball.bounce_x()
        speed /= 10

        print(speed)

    if ball.xcor() > 380:
        ball.reset_position()
        scoreboard.l_point()


    if ball.xcor() < -380:
        ball.reset_position()
        scoreboard.r_point()


screen.exitonclick()
