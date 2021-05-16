from flask import Flask, request, render_template
from markupsafe import escape
import os

app = Flask(__name__, template_folder="templates")

@app.route("/<app>", methods=["GET"])
def serve(app) :
    if request.method == "GET" :
        return render_template( f"{escape(app)}.html" )

# if __name__ == "__main__":
#     app.run(debug=False)