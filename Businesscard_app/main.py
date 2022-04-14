from flask import Flask, render_template

app = Flask("__name__")


@app.route("/")
def home():
    return render_template("index.html")

# Render HTML webpage instead of returning strings
#


if __name__ == "__main__":
    app.run(debug=True)