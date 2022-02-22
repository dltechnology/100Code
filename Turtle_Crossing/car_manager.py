from turtle import Turtle
import random
COLORS = ["red", "orange", "yellow", "green", "blue", "purple"]
STARTING_MOVE_DISTANCE = 5
MOVE_INCREMENT = 10


class CarManager(Turtle):
    def __init__(self):
        super().__init__()
        self.ht()
        # Keeps track of all new cars that is created in a list
        self.all_cars = []
        self.speed_of_cars = STARTING_MOVE_DISTANCE


    def create_cars(self):
        # Create a random chance
        random_chance = random.randint(1, 6)
        # 1 car will be generated about 1 in 6 times
        if random_chance == 1:
            # Create a new car variable
            rand_x = 300
            rand_y = random.randint(-250, 250)
            new_car = Turtle("square")
            new_car.shapesize(stretch_wid=1, stretch_len=2)
            new_car.penup()
            new_car.goto(rand_x, rand_y)
            new_car.color(random.choice(COLORS))
            self.all_cars.append(new_car)

    def move_cars(self):
        for car in self.all_cars:
            car.backward(self.speed_of_cars)

    def increase_speed(self):
        self.speed_of_cars += MOVE_INCREMENT

