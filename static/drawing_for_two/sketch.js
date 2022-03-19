// Fix Fabric.js touch events
// (function () {
//     var defaultOnTouchStartHandler = fabric.Canvas.prototype._onTouchStart;
//     fabric.util.object.extend(fabric.Canvas.prototype, {
//         _onTouchStart: function (e) {
//             var target = this.findTarget(e);
//             if (this.allowTouchScrolling && !target && !this.isDrawingMode) {
//                 return;
//             }

//             defaultOnTouchStartHandler.call(this, e);
//         }
//     });
// })();

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
let weight = document.getElementById("weight");

let c = document.getElementById("c");

fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.selectable = false;

var canvas = new fabric.Canvas("c", { isDrawingMode: true, width: 1000, height: 1000, allowTouchScrolling: true, backgroundColor: backgroundColor_ });

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
};

document.getElementById("eraserButton").addEventListener("click", toggleEraser);
function toggleEraser() {
    // canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.shadow = "none";
    // canvas.freeDrawingBrush.inverted = true;
    canvas.freeDrawingBrush.color = backgroundColor_;
    canvas.freeDrawingBrush.width = width;

    canvas.isDrawingMode = true;

    // ele.style.touchAction = "none";
    // ele.style.cursor = "auto !important"

    // ele.removeEventListener("mousedown", mouseDownHandler);
}

// panPan
// const ele = document.getElementById("canvasContainer");
// let pos = { top: 0, left: 0, x: 0, y: 0 };
// const mouseDownHandler = function (e) {
//     ele.style.cursor = "grabbing";
//     ele.style.userSelect = "none";

//     pos = {
//         left: ele.scrollLeft,
//         top: ele.scrollTop,
//         // Get the current mouse position
//         x: e.clientX,
//         y: e.clientY,
//     };

//     document.addEventListener("mousemove", mouseMoveHandler);
//     document.addEventListener("mouseup", mouseUpHandler);
// };
// const mouseMoveHandler = function (e) {
//     // How far the mouse has been moved
//     const dx = e.clientX - pos.x;
//     const dy = e.clientY - pos.y;

//     // Scroll the element
//     ele.scrollTop = pos.top - dy;
//     ele.scrollLeft = pos.left - dx;
// };
// const mouseUpHandler = function () {
//     ele.style.cursor = "grab";
//     ele.style.removeProperty("user-select");

//     document.removeEventListener("mousemove", mouseMoveHandler);
//     document.removeEventListener("mouseup", mouseUpHandler);
// };

document.getElementById("pencilButton").addEventListener("click", togglePencil);
function togglePencil() {
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.shadow = "none";
    // canvas.freeDrawingBrush.inverted = true;
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = width;

    canvas.isDrawingMode = true;

    // ele.style.touchAction = "none";
    // ele.style.cursor = "auto !important"

    // ele.removeEventListener("mousedown", mouseDownHandler);
}


// document.getElementById("panButton").addEventListener("click", togglePan);
// function togglePan() {
//     canvas.isDrawingMode = false;

//     ele.style.touchAction = "auto";
//     ele.style.cursor = "auto !important"; // grab

//     // ele.addEventListener("mousedown", mouseDownHandler);
// }

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
let singleMode;

const socket = io("/drawing");

socket.on("connect", function () {
    console.log("Connected!");
});
socket.on("joined", function (arg) {
    alert(`${arg}参加啦！`);
});
socket.on("json", function (arg, callback) {
    if (arg != canvasJSON) {
        updateCanvas(arg);
    }
});

function updateCanvas(newCanvas) {
    canvas.clear();
    canvas.loadFromJSON(JSON.parse(newCanvas));
    // canvas.renderAll();
    console.log("Canvas updated!");
}

// On app load
// ------------------------------------------------------------------------------------------
$(window).on("load", function () {
    $("#exampleModal").modal({ "backdrop": "static", "keyboard": false, "show": false });
    $("#exampleModal").modal("show");
});

document.addEventListener("DOMContentLoaded", function () {
    OverlayScrollbars(document.querySelectorAll("#canvasContainer"), { className: "os-theme-block-dark" });
});

let canvasJSON = ""

function serializeCanvas() {
    canvasJSON = JSON.stringify(canvas);
    console.log("Canvas serialized!");
    sendCanvas(canvasJSON);
}

function sendCanvas(canvasJSON) {
    req = { canvas: canvasJSON, room: uuid }
    socket.emit("json", req);
    console.log("Canvas sent!");
}

canvas.on("path:created", serializeCanvas);
// canvas.on("canvas:cleared", serializeCanvas); // problematic for now

$(window).on("shown.bs.modal", function () {
    // Generate room ID
    document.getElementById("generate").addEventListener("click", generateRoomId);
    function generateRoomId() {
        uuid = self.crypto.randomUUID().split("-", 1)[0];
        $("#room-id").val(uuid); // .attr("readonly", "readonly")

        // Select and copy room id to clipboard
        var room_id = document.getElementById("room-id");
        room_id.select();
        room_id.setSelectionRange(0, 99999); /* for mobile devices */
        navigator.clipboard.writeText(room_id.value);
    }

    // Step 1 - Create room
    $("#create-button").click(createRoom);
    function createRoom() {
        username = String($("#create-username").val());
        if (username === "" || username.trim() === "") {
            username = "Unnamed";
        }
        uuid = String($("#room-id").val());
        if (uuid == "") {
            $("#exampleModal").modal("hide");
            alert("进入了单用户模式")
        } else {
            socket.emit("join", { username: username, room: uuid });

            $("#exampleModal").modal("hide");
        }
    }
})