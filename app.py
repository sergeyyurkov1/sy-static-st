from flask import Flask, request, render_template
from markupsafe import escape

from flask import request

flask_app = Flask(__name__, template_folder="templates")

@flask_app.route("/<app>", methods=["GET"])
def serve(app) :
    if request.method == "GET" :
        if not "." in app:
            return render_template( f"{escape(app)}.html" )
        else:
            return f"{escape(app)}"

# Sockets part of the application
# -------------------------------
from flask_socketio import SocketIO, emit, join_room, leave_room

socketio = SocketIO(flask_app) # , logger=True, engineio_logger=True

# from collections import deque

canvases = {}

@socketio.on("leave", namespace="/drawing")
def on_leave(data):
    print(data)
    socketId = request.sid
    username = data["username"]
    room = str(data["room"])
    
    user = f"{username}%%{socketId}"
    try:
        drawers.remove(user)
    except ValueError:
        print("No drawers!")

    if not room == "":
        emit("left", user, broadcast=True, room=room)
    
        leave_room(room)
        
        print(f"User {username} left room {room} -->")

    # disconnect()


# def undo(room):
#     for i in reversed(canvases[room][:-1]):
#         yield i

# @socketio.on("undo", namespace="/drawing")
# def handle_message(data):
    # room = str(data)
    
    # import copy
    # canvases_room = copy.deepcopy(canvases[room])
    
    # u = undo(room)
    # try:
    #     res = next(u)
    # except StopIteration:
    #     print("Stopped!")
    #     res = canvases[room][0]

    # print(f"--------- {canvases[room].index(res)} ---------")

    # emit("json", res, json=True, broadcast=True, room=room)

drawers = []

@socketio.on("is_drawing", namespace="/drawing")
def handle_message(data):
    room = str(data["room"])
    is_drawing = data["is_drawing"]
    socketId = request.sid
    username = data["username"]
    if is_drawing == True:
        drawers.append(f"{username}%%{socketId}")
    else:
        try:
            drawers.remove(f"{username}%%{socketId}")
        except ValueError:
            pass

    import json
    res = json.dumps({"drawers": drawers, "is_drawing": is_drawing})
    if not room == "":
        emit("is_drawing", res, json=True, broadcast=True, room=room)

@socketio.on("json", namespace="/drawing")
def handle_message(data):
    room = str(data["room"])
    canvas = data["canvas"]
    canvases[room].append(canvas)
    emit("json", canvases[room][-1], json=True, broadcast=True, room=room)

@socketio.on("join", namespace="/drawing")
def on_join(data):
    socketId = request.sid
    username = data["username"]
    room = str(data["room"])
    user = f"{username}%%{socketId}"
    join_room(room)
    if room not in canvases:
        canvases[room] = [] # deque()
    print(f"User {username} joined room {room} -->")
    if len(canvases[room]) != 0:
        emit("json", canvases[room][-1], json=True, broadcast=True, room=room)
        emit("joined", user, broadcast=True, room=room)
    else:
        emit("joined", user, broadcast=True, room=room)

if __name__ == "__main__":
    socketio.run(flask_app, host="0.0.0.0") # , host="0.0.0.0"