from flask import Flask, request, render_template
from markupsafe import escape

flask_app = Flask(__name__, template_folder="templates")

@flask_app.route("/<app>", methods=["GET"])
def serve(app) :
    if request.method == "GET" :
        if not "." in app:
            return render_template( f"{escape(app)}.html" )
        else:
            return f"{escape(app)}"


from flask_socketio import SocketIO, send, emit, join_room, leave_room

socketio = SocketIO(flask_app)


@socketio.on("json", namespace="/drawing")
def handle_message(data):
    room = str(data["room"])
    canvas = data["canvas"]
    emit("json", canvas, json=True, broadcast=True, room=room)

@socketio.on("join", namespace="/drawing")
def on_join(data):
    username = data["username"]
    room = str(data["room"])
    join_room(room)
    print(f"User {username} joined room {room}")

if __name__ == "__main__":
    socketio.run(flask_app, host="0.0.0.0")