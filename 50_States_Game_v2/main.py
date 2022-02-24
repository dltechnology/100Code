from turtle import Turtle, Screen
import pandas

# Set the screen
screen = Screen()
screen.title("US States Game")
screen.setup(width=800, height=600)
# Display US graphic
image = "blank_states_img.gif"
screen.addshape(image)
graphic = Turtle()
graphic.shape(image)
correct = []
data = pandas.read_csv("50_states.csv")
pop_up = Screen()
# coverts the dataframe data state series into a list
all_states = data.state.to_list()


print(data.x)
while len(correct) < 50:
    user_input = pop_up.textinput(f"{len(correct)}/50 Correct", "Please type a state name:").title()

    if user_input == "Exit":
        missing_states = [state for state in all_states if state not in correct]
        new_data = pandas.DataFrame(missing_states)
        new_data.to_csv("states_to_learn")
        break

    # This will take the user input and use that to go line by line in the data state column to look for a match.
    # If there's a match the state will be added to correct.
    if user_input in all_states:
        chosen_state = data[data.state == user_input]
        correct.append(user_input)
        write = Turtle()
        write.penup()
        write.goto(int(chosen_state.x), int(chosen_state.y))
        write.ht()
        write.write(user_input)


screen.mainloop()
