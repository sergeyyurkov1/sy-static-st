(function () {
    var defaultOnTouchStartHandler = fabric.Canvas.prototype._onTouchStart;
    fabric.util.object.extend(fabric.Canvas.prototype, {
        _onTouchStart: function (e) {
            var target = this.findTarget(e);
            if (this.allowTouchScrolling && !target && !this.isDrawingMode) {
                return;
            }

            defaultOnTouchStartHandler.call(this, e);
        }
    });
})();





















backgroundColor_ = "#e9e9ed";

const appDimensions = () => {
    const doc = document.documentElement;
    doc.style.setProperty("--app-height", `${window.innerHeight}px`);
    doc.style.setProperty("--app-width", `${window.innerWidth}px`);
}
window.addEventListener("resize", appDimensions);
appDimensions();

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
    isPanning = false;

    ele.style.touchAction = "none";
    ele.style.cursor = "auto !important"

    ele.removeEventListener("mousedown", mouseDownHandler);
}

// panPan
const ele = document.getElementById("canvasContainer");
let pos = { top: 0, left: 0, x: 0, y: 0 };
const mouseDownHandler = function (e) {
    ele.style.cursor = "grabbing";
    ele.style.userSelect = "none";

    pos = {
        left: ele.scrollLeft,
        top: ele.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
};
const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
};
const mouseUpHandler = function () {
    ele.style.cursor = "grab";
    ele.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
};

document.getElementById("pencilButton").addEventListener("click", togglePencil);
function togglePencil() {
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.shadow = "none";
    // canvas.freeDrawingBrush.inverted = true;
    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = width;

    canvas.isDrawingMode = true;
    isPanning = false;

    ele.style.touchAction = "none";
    ele.style.cursor = "auto !important"

    // ele.removeEventListener("mousedown", mouseDownHandler);
}


document.getElementById("panButton").addEventListener("click", togglePan);
function togglePan() {
    canvas.isDrawingMode = false;
    isPanning = true;

    ele.style.touchAction = "auto";
    ele.style.cursor = "grab !important";

    // ele.addEventListener("mousedown", mouseDownHandler);
}


const socket = io("/drawing");

$(window).on("hidden.bs.modal", serializeCanvas);
canvas.on("mouse:up", serializeCanvas);
// canvas.on("mouse:move", serializeCanvas);
// canvas.on("object:added", serializeCanvas);
// canvas.on("object:modified", serializeCanvas);
// canvas.on("object:removed", serializeCanvas);
function serializeCanvas() {
    // canvasJSON = canvas.toJSON();
    canvasJSON = JSON.stringify(canvas);
    // console.log(canvasJSON);
    sendCanvas(canvasJSON);
}

function sendCanvas(canvasJSON) {
    socket.emit("json", canvasJSON);
    console.log("--> canvas sent");
    receiveCanvas();
}
function receiveCanvas() {
    socket.on("json", function (arg, callback) {
        updateCanvas(arg);
    });
}
function updateCanvas(newCanvas) {
    console.log(newCanvas);
    canvas.clear();
    // setTimeout(console.log("Waiting..."), 5000);
    // var canvas = new fabric.Canvas();
    canvas.loadFromJSON(JSON.parse(newCanvas));
    canvas.renderAll();
    console.log("Done!");
}













$(window).on("load", function () {
    // $("#exampleModal").modal({ "backdrop": "static", "keyboard": false, "show": false }); // { "backdrop": "static", "keyboard": false, "show": true }
    $("#exampleModal").modal("show"); // { "backdrop": "static", "keyboard": false, "show": true }
});

document.addEventListener("DOMContentLoaded", function () {
    //The first argument are the elements to which the plugin shall be initialized
    //The second argument has to be at least a empty object or a object with your desired options
    OverlayScrollbars(document.querySelectorAll("#canvasContainer"), { className: "os-theme-block-dark" });
});

$(window).on("shown.bs.modal", function () {
    let uuid = self.crypto.randomUUID().split("-", 1);

    $("#room-id").val(uuid).attr("readonly", "readonly");

    // socket.on("connect", function () {
    socket.emit("hello", "Connected!");
    console.log("Connected!");
    // });

    document.getElementById("copyToClipboard").addEventListener("click", copyToClipboard);
    function copyToClipboard() {
        var room_id = document.getElementById("room-id");

        room_id.select();
        room_id.setSelectionRange(0, 99999); /* for mobile devices */

        navigator.clipboard.writeText(room_id.value);
    }

});
