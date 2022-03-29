let buttons, functions;
window.addEventListener("DOMContentLoaded", (event) => {
    buttons = document.getElementsByClassName("tools");
    functions = document.getElementsByClassName("functions");
});

// Init
// ------------------------------------------------------------------------------------------
let uuid;
const backgroundColor_ = "#e9e9ed";

const appDimensions = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--app-height", `${window.innerHeight}px`);
    doc.style.setProperty("--app-width", `${window.innerWidth}px`);
}
window.addEventListener("resize", appDimensions);
appDimensions();

// Fabric.js canvas init
// ------------------------------------------------------------------------------------------
let lastClicked;

let weight = document.getElementById("weight");

let c = document.getElementById("c");

fabric.Object.prototype.transparentCorners = false;
// fabric.Object.prototype.selectable = false;

var canvas = new fabric.Canvas("c", { isDrawingMode: false, width: 1000, height: 1000, allowTouchScrolling: true, backgroundColor: backgroundColor_ });

canvas.selection = false;

width = parseInt(document.getElementById("weight").value, 10) || 0;
canvas.freeDrawingBrush.width = width;

color = document.getElementById("color").value;
canvas.freeDrawingBrush.color = color;

document.getElementById("color").onchange = function () {
    color = this.value;
    canvas.freeDrawingBrush.color = color;
};
document.getElementById("weight").onchange = function () {
    width = parseInt(this.value, 10) || 0;
    canvas.freeDrawingBrush.width = width;
};
document.getElementById("clearButton").onclick = function () {
    canvas.clear();
    canvas.backgroundColor = backgroundColor_;
    serializeCanvas();

    $("#deleteButton").css("display", "none");
};

document.getElementById("eraserButton").addEventListener("click", function () {
    lastClicked = this;

    canvas.isDrawingMode = true;

    buttons.forEach((element) => {
        if (element !== this) {
            element.style.backgroundColor = "#343a40";
        }
    });
    this.style.backgroundColor = "black";

    canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);

    canvas.freeDrawingBrush.width = width;

    $("#deleteButton").css("display", "none");
});

document.getElementById("pencilButton").addEventListener("click", function () {
    lastClicked = this;

    canvas.isDrawingMode = true;

    buttons.forEach((element) => {
        if (element !== this) {
            element.style.backgroundColor = "#343a40";
        }
    });
    this.style.backgroundColor = "black";

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = width;

    $("#deleteButton").css("display", "none");
});

document.getElementById("panButton").addEventListener("click", function () {
    lastClicked = this;

    canvas.isDrawingMode = false;
    buttons.forEach((element) => {
        if (element !== this) {
            element.style.backgroundColor = "#343a40";
        }
    });
    this.style.backgroundColor = "black";
    // $("#deleteButton").css("display", "inline-block");
});

document.getElementById("deleteButton").addEventListener("click", deleteObject);
function deleteObject() {
    canvas.remove(canvas.getActiveObject());
    serializeCanvas();
}

// TODO: undo functionality
// document.getElementById("undoButton").onclick = function () {
//     socket.emit("undo", uuid);
// }

document.getElementById("saveButton").onclick = function () {
    canvas.renderAll();
    let a = document.createElement("a");
    a.style.display = "none";
    a.href = canvas.toDataURL("png");
    a.download = "drawing.png";
    document.body.appendChild(a);
    a.click();
}

// Socket init and events
// ------------------------------------------------------------------------------------------
const Toast = Swal.mixin({
    toast: true,
    position: 'top',
    showConfirmButton: false,
    timer: 3000,
    // timerProgressBar: true,
    // didOpen: (toast) => {
    //     toast.addEventListener('mouseenter', Swal.stopTimer)
    //     toast.addEventListener('mouseleave', Swal.resumeTimer)
    // }
})

const socket = io("/drawing", {
    closeOnBeforeunload: false
});

let canvasJSON = ""

let isDrawing;

canvas.on("mouse:down", stopDrawing);
// canvas.on("object:moving", stopDrawing);
// canvas.on("object:rotating", stopDrawing);
// canvas.on("object:scaling", stopDrawing);
function stopDrawing() {
    if (canvas.isDrawingMode === true) {
        req = { is_drawing: true, username: username, room: uuid }
        socket.emit("is_drawing", req);
    }
}

canvas.on("mouse:up", function () {
    req = { is_drawing: false, username: username, room: uuid }
    socket.emit("is_drawing", req);
});
socket.on("is_drawing", function (arg) {
    drawers = JSON.parse(arg)["drawers"];
    is_drawing = JSON.parse(arg)["is_drawing"]
    if (is_drawing == false) {
        // canvas.isDrawingMode = true;
        canvas.forEachObject(function (obj) {
            obj.selectable = true;
        });
        functions.forEach((element) => {
            element.disabled = false;
            element.children[0].style.color = "white";
        });
        document.getElementById("panButton").click();
        // document.getElementById("pencilButton").style.backgroundColor = "black";
    }
    for (let index = 0; index < drawers.length; index++) {
        if (drawers[index].includes(socketId)) {
            drawers.splice(index, 1);
            canvas.isDrawingMode = true;
            canvas.forEachObject(function (obj) {
                obj.selectable = true;
            });
            functions.forEach((element) => {
                element.disabled = false;
                element.children[0].style.color = "white";
            });
        } else {
            canvas.isDrawingMode = false;
            canvas.forEachObject(function (obj) {
                obj.selectable = false;
            });
            functions.forEach((element) => {
                element.disabled = true;
                element.children[0].style.color = "grey";
            });
        }
    }
    drawers = drawers.map(drawer => drawer.split("%%")[0]);
    if (drawers.length === 0) {
        $("#is-drawing").text("");
    } else if (drawers.length === 1) {
        drawers_string = drawers.join(", ");
        $("#is-drawing").text(`${drawers_string} is drawing...`);
    } else {
        drawers_string = drawers.join(", ");
        $("#is-drawing").text(`${drawers_string} are drawing...`);
    }
});

let socketId;
window.addEventListener("beforeunload", function (e) {
    // e.preventDefault();
    req = { username: username, room: uuid }
    socket.emit("leave", req);
});
// window.addEventListener("unload", function (e) {
//     req = { username: username, room: uuid }
//     console.log(req);
//     socket.emit("leave", req);
// });

socket.on("left", function (arg) {
    if (!arg.includes(socketId)) {
        Toast.fire({
            icon: 'warning',
            title: `${arg.split("%%")[0]}退出了画组`,
            showClass: {
                popup: ''
            }
        })
    }
});

socket.on("connect", function () {
    socketId = socket.id;
    console.log(`Connected! ID=${socketId}`);
});
// socket.on("disconnect", function (arg) {
//     Toast.fire({
//         icon: 'info',
//         title: `${arg}退出了画组`,
//         showClass: {
//             popup: ''
//         }
//     })
// });
socket.on("joined", function (arg) {
    if (!arg.includes(socketId)) {
        Toast.fire({
            icon: 'info',
            title: `${arg.split("%%")[0]}参加啦！`,
            showClass: {
                popup: ''
            }
        })
    }
});
socket.on("json", function (arg, callback) { // TODO: make use of the callback
    if (arg != canvasJSON) {
        updateCanvas(arg);
    }
});

function serializeCanvas() {
    if (uuid === "") {
        return;
    }
    canvasJSON = JSON.stringify(canvas);
    console.log("Canvas serialized!");
    sendCanvas(canvasJSON);
}

function sendCanvas(canvasJSON) {
    req = { canvas: canvasJSON, room: uuid }
    socket.emit("json", req);
    console.log("Canvas sent!");
}

function updateCanvas(newCanvas) {
    canvas.clear();
    canvas.loadFromJSON(JSON.parse(newCanvas));
    // canvas.renderAll(); // not needed for free drawing mode
    console.log("Canvas updated!");
}


// On app load
// ------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    OverlayScrollbars(document.querySelectorAll("#canvasContainer"), { className: "os-theme-block-dark deviant-scrollbars" });
});

$(window).on("load", function () {
    $("#entry-point").modal({ "backdrop": "static", "keyboard": false, "show": false });
    $("#entry-point").modal("show");
});

$(window).on("shown.bs.modal", function () {
    // Generate room ID
    // ----------------
    document.getElementById("generate").addEventListener("click", generateRoomId);
    function generateRoomId() {
        uuid = self.crypto.randomUUID().split("-", 1)[0];
        $("#room-id").val(uuid); // .attr("readonly", "readonly")

        // Select and copy room ID to clipboard
        var room_id = document.getElementById("room-id");
        room_id.select();
        room_id.setSelectionRange(0, 99999); // for mobile devices
        navigator.clipboard.writeText(room_id.value);
    }

    // Create room
    // -----------
    $("#create-button").click(createRoom);
    function createRoom() {
        username = String($("#create-username").val());
        if (username === "" || username.trim() === "") {
            username = "Unnamed";
        }
        uuid = String($("#room-id").val());
        if (uuid == "") {
            $("#entry-point").modal("hide");

            Toast.fire({
                icon: 'info',
                title: '进入了单用户模式',
                showClass: {
                    popup: ''
                }
            })
        } else {
            socket.emit("join", { username: username, room: uuid });

            $("#entry-point").modal("hide");
        }
    }
})

canvas.on("path:created", serializeCanvas);
canvas.on("object:modified", serializeCanvas);
canvas.on("selection:created", function () {
    $("#deleteButton").css("display", "inline-block");
});
canvas.on("selection:cleared", function () {
    $("#deleteButton").css("display", "none");
});

// Problematic
// -----------
// canvas.on("object:added", serializeCanvas);
// canvas.on("object:moving", serializeCanvas);
// canvas.on("object:removed", serializeCanvas);
// canvas.on("object:rotating", serializeCanvas);
// canvas.on("object:scaling", serializeCanvas);
// canvas.on("canvas:cleared", serializeCanvas);