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
// fabric.Object.prototype.selectable = false;

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

    $("#deleteButton").css("display", "none");
};

document.getElementById("eraserButton").addEventListener("click", toggleEraser);
function toggleEraser() {
    canvas.isDrawingMode = true;

    canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
    // canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);

    // canvas.freeDrawingBrush.color = backgroundColor_;
    canvas.freeDrawingBrush.width = width;

    $("#deleteButton").css("display", "none");
}

document.getElementById("pencilButton").addEventListener("click", togglePencil);
function togglePencil() {
    canvas.isDrawingMode = true;

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);

    canvas.freeDrawingBrush.color = color;
    canvas.freeDrawingBrush.width = width;

    $("#deleteButton").css("display", "none");
}

document.getElementById("panButton").addEventListener("click", togglePan);
function togglePan() {
    canvas.isDrawingMode = false;
    $("#deleteButton").css("display", "inline-block");
}

document.getElementById("deleteButton").addEventListener("click", deleteObject);
function deleteObject() {
    canvas.remove(canvas.getActiveObject());
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

const socket = io("/drawing");
let canvasJSON = ""

socket.on("connect", function () {
    console.log("Connected!");
});
socket.on("joined", function (arg) {
    // alert(`${arg}参加啦！`);
    Toast.fire({
        icon: 'info',
        title: `${arg}参加啦！`,
        showClass: {
            popup: ''
        }
    })
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

            // alert("进入了单用户模式");
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
// canvas.on("canvas:cleared", serializeCanvas); // problematic for now