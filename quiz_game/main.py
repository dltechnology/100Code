#Create a model for a question in the quiz.
#Question objext what does it have
#text attribute
#answer attribute
#the constructor code will take two pieces of data and add to corresponding a
from data import question_data
from question_model import Question
from quiz_brain import QuizBrain


question_bank = []
question_count = len(question_data)
questions_correct = 0
print(question_count)

for questions in question_data:
    #for each of these questions create a variable called question text
    question_text = questions["question"]
    question_answer = questions["correct_answer"]
    new_question = Question(question_text, question_answer)
    question_bank.append(new_question)

quiz = QuizBrain(question_bank)
quiz.next_question()