from turtle import Screen
import time
from snake import Snake
from food import Food
from scoreboard import ScoreBoard

screen = Screen()
screen.setup(width=600, height=600)
screen.tracer(0)
screen.bgcolor("black")
screen.title("Snek Gamesssssssss")
game_is_on = True

# Create snake body
snake = Snake()
food = Food()
score = ScoreBoard()

screen.listen()
screen.onkey(key="Up", fun=snake.up)
screen.onkey(key="Down", fun=snake.down)
screen.onkey(key="Left", fun=snake.left)
screen.onkey(key="Right", fun=snake.right)


while game_is_on:
    screen.update()
    time.sleep(.1)
    snake.move_snake()

    #detect collison with food
    if snake.head.distance(food) < 15:
        food.refresh()
        snake.extend()
        score.increase_score()
        print("nom, nom, nom")
    #detect collision with wall
    if snake.head.xcor() > 295 or snake.head.xcor() < -295 or snake.head.ycor() > 295 or snake.head.ycor() < -295:
        score.reset()
        snake.reset()


    # detect collision with tail
    for segment in snake.segments:
        if segment == snake.head:
            pass
        elif snake.head.distance(segment) < 10:
            score.reset()
            snake.reset()







screen.exitonclick()


