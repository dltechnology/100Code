from turtle import Turtle

# create the constants. The starting position will always be the same
# Move distance should stay the same.
# Every direction is the same

STARTING_POSITIONS = [(0, 0), (-20, 0), (-40, 0)]
MOVE_DIST = 20
UP = 90
DOWN = 270
LEFT = 180
RIGHT = 0

# Create the blueprint for your objects. Here we're creating a snake

class Snake:
    # Whenever this blueprint is called to create an object the __init__ is the default setting the object will have.
    # Think of it like a car. A standard car has four wheels, 5 seats, 5 seat belts, a steering wheel, etc.
    # Therefore, when creating a car we can use the standard blueprint and add features to it.

    def __init__(self):
        # creates a Snake.segments variable with an empty list. The self calls the Class name.
        self.segments = []
        # calls the snake_body method which adds a segment to each coordinate on the STARTING POSITION list
        self.snake_body()
        # create a variable call head and assign it to segments list at index 0. This should be the "front" of your
        # snake.
        self.head = self.segments[0]

    # creates a method called add segment. This creates a new variable called new segment which will hold the
    # newly created segment. We call the segments variable that was an empty list add append to it which will add an
    # item to the end of the list. In this case we're adding new_segment.
    def add_segment(self, position):
        new_segment = Turtle("circle")
        new_segment.color("light green")
        new_segment.penup()
        # places the new object to coordinates stated in the variable position.
        new_segment.goto(position)
        # in the variable segments append what was created in new_segment
        self.segments.append(new_segment)

    # add a segment to each coordinate in the STARTING_POSITION list. Loops through each item in the STARTING_POSITION
    # which are the coordinates. Each time it loops through add_segment in position.
    def snake_body(self):
        for position in STARTING_POSITIONS:
            self.add_segment(position)
    # To add another segment to the end of the snake body. Call the add_segment method and put it at the end
    def extend(self):
        self.add_segment(self.segments[-1].position())

    def move_snake(self):
        for seg_num in range(len(self.segments) - 1, 0, -1):
            new_x = self.segments[seg_num - 1].xcor()
            new_y = self.segments[seg_num - 1].ycor()
            self.segments[seg_num].goto(new_x, new_y)
        self.segments[0].forward(MOVE_DIST)

    def up(self):
        if self.head.heading() != DOWN:
            self.segments[0].setheading(UP)

    def down(self):
        if self.head.heading() != UP:
            self.segments[0].setheading(DOWN)

    def left(self):
        if self.head.heading() != RIGHT:
            self.segments[0].setheading(LEFT)

    def right(self):
        if self.head.heading() != LEFT:
            self.segments[0].setheading(RIGHT)

    def reset(self):
        for seg in self.segments:
            seg.goto(1000, 1000)
        self.segments.clear()
        self.snake_body()
        self.head = self.segments[0]

    def play_again(self):
        ws = Turtle()
        play_again = ws.textinput("Want to play again? Yes or No").lower()
        if play_again != "yes":
            self.game_is_on = False





