from flask import Flask
import random

random_number = random.randint(1,9)
#
# is_playing = True
#
#
# # while is_playing:
#
#
app = Flask(__name__)
#
# # create a variable that holds a hrandom #
# # using that variable a random site from 1-9 will be chosen
#
#
# # if the number is higher show the higher website if the number is lower show the lower website
# # if correct show the correct website
#
#
#
# @app.route("/")
# def hello_world():
#     return '<h1>Guess a number between 0 and 9</h1> \
#            <img src="https://media2.giphy.com/media/l378khQxt68syiWJy/giphy.gif?cid=ecf05e47xuj3dulrozktdzbx9bel6rhxmqjbbr93uubdvgdl&rid=giphy.gif&ct=g">'
#
#
# @app.route(f"/{random_number}")
# def winner():
#     print("You found me!")
#
#
# @app.route()
# def too_low():
#     print("Too Low")
#
# def too_high():
#     print("Too High")
#
#
#
#
# if __name__ == "__main__":
#     app.run(debug=True)

#
# #------------------------------------------#
@app.route('/')
def home():
    return "<h1>Guess a number between 0 and 9</h1>" \
           "<img src='https://media.giphy.com/media/3o7aCSPqXE5C6T8tBC/giphy.gif'/>"


@app.route("/<int:guess>")
def guess_number(guess):
    if guess > random_number:
        return "<h1 style='color: purple'>Too high, try again!</h1>" \
               "<img src='https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif'/>"

    elif guess < random_number:
        return "<h1 style='color: red'>Too low, try again!</h1>"\
               "<img src='https://media.giphy.com/media/jD4DwBtqPXRXa/giphy.gif'/>"
    else:
        return "<h1 style='color: green'>You found me!</h1>" \
               "<img src='https://media.giphy.com/media/4T7e4DmcrP9du/giphy.gif'/>"


if __name__ == "__main__":
    app.run(debug=True)