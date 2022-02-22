import time
from turtle import Screen
from player import Player
from car_manager import CarManager
from scoreboard import Scoreboard

screen = Screen()
screen.setup(width=600, height=600)
screen.tracer(0)

player = Player()
car_manager = CarManager()
scoreboard = Scoreboard()


screen.listen()
screen.onkey(player.move_forward, "Up")


game_is_on = True
while game_is_on:
    time.sleep(.1)
    screen.update()
    scoreboard.update_scoreboard()
    car_manager.create_cars()
    car_manager.move_cars()
    # detect when turtle collides with car
    for car in car_manager.all_cars:
        if car.distance(player) < 18:
            game_is_on = False
            scoreboard.game_over()
    # When player reaches the other side increase level, speed of cars, and return player to start
    if player.player_at_finish():
        player.level_up()
        car_manager.increase_speed()








# Turtle moves forward when the Up key is pressed. Only move forward.






#Cars and colors are randomly generated along the y-axis and will move right to left

# When turtle hits top screen (end of axis) player levels up and returns to start. The speed of cars is increased.

# If turtle hits a car print GameOver and stop game.

screen.exitonclick()