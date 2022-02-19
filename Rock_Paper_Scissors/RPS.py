# Rock, Paper, Scissors game in Python
from random import randint
choices = ["rock", "paper", "scissors"]
playGame = True

while playGame == True:
    computer = choices[randint(0,2)]
    player = input("Choose rock, paper, or scissors: ").lower()

    if computer == player:
        print("It's a tie!")

    elif player == "rock":
        if computer == "scissors":
            print("You win! Rock smashes scissors!")
        else:
            print("You Lose! Paper covers rock")

    elif player == "paper":
        if computer == "rock":
            print("You win! Paper covers rock!")
        else:
            print("You lose...scissors cuts paper")

    elif player == "scissors":
        if computer == "paper":
            print("You win! Scissors shreds paper!")
        else:
            print("You Lose! Rock breaks scissors!")

    else:
        print("Not a valid play try again!")
        continue

    keepPlaying = input("Want to play again?").lower()
    if keepPlaying != "yes":
        playGame = False
        print("Thanks for playing!")
    
