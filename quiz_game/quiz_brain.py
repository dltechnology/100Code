# asking user next question
#hecking if answer was right
#checking if end of quiz

# attribures, question # = 0 question list
#method next_question() pull up next question on the list depending on # we;re on


class QuizBrain:
    # Everytime QuizBrain is called question_number set to 0 and question_bank will be called
    def __init__(self, q_list):
        self.question_number = 0
        self.question_list = q_list
        self.correct = 0

    def next_question(self):
        more_questions = True
        while more_questions:
            current_question = self.question_list[self.question_number]
            self.question_number += 1
            answer = input(f"Q{self.question_number}: {current_question.text} (True/False)?:")
            if answer == current_question.answer:
                self.correct += 1
                print(f"You got it right!\nThe correct answer is: {current_question.answer}.\nYour current score"
                      f" is: {self.correct}/{len(self.question_list)}")
            else:
                print(f"You got it wrong...\nThe correct answer is: {current_question.answer}.\nYour current score"
                      f" is: {self.correct}/{len(self.question_list)}")
            if self.question_number == len(self.question_list):
                more_questions = False
                print(f"You got {self.correct} right out of {len(self.question_list)}")

    def still_has_questions(self):
