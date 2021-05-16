let isfullScreen;

// Event listener to detect entering and exiting fullscreen to update interface accordingly
// ----------------------------------------------------------------------------------------
document.addEventListener("fullscreenchange", onFullScreenChange, false);
document.addEventListener("webkitfullscreenchange", onFullScreenChange, false);
document.addEventListener("mozfullscreenchange", onFullScreenChange, false);

// Updates global var isfullScreen
function onFullScreenChange() {

  var fullScreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

  if (fullScreenElement != null) {
    isfullScreen = true
  }
  if (fullScreenElement == null) {
    isfullScreen = false
  }

}

// --------------------------------------------------------------------------------------------------
let canvasDiv = document.getElementById("gamesHome");
let canvasWidth = canvasDiv.offsetWidth
let canvasHeight = canvasDiv.offsetHeight

let interval

let boundaryWidth = 1;

let numBalls = canvasWidth/10;
// let numBalls = 35;

let balls = []; // needs to be global

let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body;
let engine, world;

let text_pos_x, text_pos_y;

// let time_counter = 0;

let changeDirection = false

// let gameOver;

// let click;

let turned = false;

let donut_images = [];

let bubble_sounds = [];
let donut_sounds = [];

// let colors = ["#814134", "#f8a4b8", "#c2f2d0", "#ffcb85"]
let colors = ['hsla(10,42%,35%,0.8)', 'hsla(345,85%,80%,0.8)', 'hsla(138,65%,85%,0.8)', 'hsla(34,100%,76%,0.8)']

// Preload assets for use in P5.js
// --------------------------------------------------------------------------------------------------
function preload() {

  font = loadFont('/static/bubble_pop/fonts/Arista20AlternateRegular-jy89.ttf');
  font2 = loadFont('/static/bubble_pop/fonts/GamegirlClassic-9MVj.ttf');
  font3 = loadFont('/static/bubble_pop/fonts/BotsmaticOutline-anZg.ttf');

  loadImage('/static/bubble_pop/images/expand-32.png', function (i) {
    fs_icon = i;
  });
  loadImage('/static/bubble_pop/images/expand-32 (1).png', function (i) {
    fs_icon_2 = i;
  });

  for (let i = 1; i <= 8; i++) {
    loadImage("/static/bubble_pop/images/donut" + " (" + i + ").png", function (d) {
      let dd = d;
      dd.resize(32, 0);
      donut_images.push(dd);
    });
  }

  for (let i = 1; i <= 2; i++) {
    loadSound(`/static/bubble_pop/sounds/donut (${i}).mp3`, function (s) {
      donut_sounds.push(s);
    });
  }

  for (let i = 1; i <= 17; i++) {
    loadSound(`/static/bubble_pop/sounds/bubble (${i}).mp3`, function (s) {
      bubble_sounds.push(s);
    });
  }

}

// Game setup
// ----------
function setup() {

  resetGame();

}

function resetGame(dev_width=800, dev_height=600) {

  // gameOver = false;

  clearInterval(interval);

  pixelDensity(1);
  frameRate(60);

  time_counter = 0;
  click = 0;
  
  time_ = "";
  score_ = 0;
  score_str = "";

  // P5.js Canvas initialization
  // ---------------------------
  let canvas;

  canvas = createCanvas(dev_width, dev_height, WEBGL);

  canvas.parent("gamesHome");

  text_pos_x = canvas.height/3;
  text_pos_y = canvas.height/2;

  canvas3Title = new Overlay(0, 0, canvas.width, canvas.height);
  canvas4Subtitle = new Overlay(0, 0, canvas.width, canvas.height);
  canvas5ScoreTime = new Overlay(0, 0, canvas.width, canvas.height);

  // Matter Engine initialization
  // ----------------------------
  engine = Engine.create();
  
  world = engine.world;
  world.gravity.y = 0;
  
  Engine.run(engine);
  
  // Game boundaries
  bottom = new Boundary(canvas.width/2, canvas.height-boundaryWidth, canvas.width, boundaryWidth);
  right = new Boundary(canvas.width-boundaryWidth, canvas.height/2, boundaryWidth, canvas.height);
  left = new Boundary(boundaryWidth, canvas.height/2, boundaryWidth, canvas.height);
  top_ = new Boundary(canvas.width/2, boundaryWidth, canvas.width, boundaryWidth);

  // Start screen
  // ------------
  // Title
  if (isMobile()) {
    canvas3Title.setFont(font, 50, CENTER, CENTER);
    canvas4Subtitle.setFont(font2, 16, CENTER, CENTER);
    canvas5ScoreTime.setFont(font2, 12, CENTER, CENTER);
  } else {
    canvas3Title.setFont(font, 70, CENTER, CENTER);
    canvas4Subtitle.setFont(font2, 16, CENTER, CENTER);
    canvas5ScoreTime.setFont(font2, 20, CENTER, CENTER);
  }

  // Place bubbles
  for (let n = 0; n < numBalls; n++) {
    let b = new Ball(random(width), random(height), random(25, 35), colors);
    balls.push(b)

  }
  
  // PROCESSOR INTENSIVE
  // Burst bubbles on start
  // ----------------------
  // for (let n = 0; n < numBalls; n++) {
  //   let c = 20;
  //   let a = n * 137.5;
  //   let r = c * sqrt(n);
  //   let x = r * cos(a) + width / 2;
  //   let y = r * sin(a) + height / 2;
    
  //   let b = new Ball(x, y, random(25, 35), colors);
  //   balls.push(b)
  // }
  
}

// Functions
// --------------------------------------------------------------------------------------------------

// https://www.geeksforgeeks.org/javascript-detecting-a-mobile-browser/
function isMobile() {
  if (navigator.userAgent.match(/Android/i) 
    || navigator.userAgent.match(/webOS/i) 
    || navigator.userAgent.match(/iPhone/i) 
    || navigator.userAgent.match(/iPad/i) 
    || navigator.userAgent.match(/iPod/i) 
    || navigator.userAgent.match(/BlackBerry/i) 
    || navigator.userAgent.match(/Windows Phone/i)) {
    return true;
  } else {
    return false;
  }
}

// Enter or exit fullscreen
function goFullscreen() {
  let fs = fullscreen();
  fullscreen(!fs);
}

// P5.js functions
// --------------------------------------------------------------------------------------------------

// Readjusts interface on screen change
function windowResized() {
  if (isfullScreen == false || !isMobile()) {
    resetGame();
  } else {
    resetGame(windowWidth, windowHeight);
  }
  
}
function deviceTurned() {
  if (isfullScreen == false || !isMobile()) {
    resetGame();
  } else {
    resetGame(windowWidth, windowHeight);
  }
  
}

// Adds pesky donuts when mouse is carelessly dragged across screen
function mouseDragged() {
  balls.push(new Ball(mouseX, mouseY, random(24, 32), colors, donut_images[int(random(0, donut_images.length))]));
}

// Adds more bubbles when mobile device is shaken
function deviceShaken() {
  balls.push(new Ball(mouseX, mouseY, random(25, 35), colors));
}

// Game start
// ----------
function mousePressed() {

  // If fullscreen button is pressed enter or exit fullscreen mode
  // Button location
  if (mouseX > canvas.width/2-16 &&
    mouseX < canvas.width/2+16 &&
    mouseY > canvas.height-100 &&
    mouseY < canvas.height-100+32 && isMobile()) {
      click = 0
      goFullscreen();
    
    }

  // Starts timer
  click = click + 1;
  if (click == 1) {
    clearInterval(interval);
    interval = setInterval(gameTimer, 1000);
  }

  background(253, 245, 201);

  // Closes start menu
  canvas3Title.clearText();
  canvas4Subtitle.clearText();

  // Handles popping mechanic and removal from the world for the physics engine
  for (let i = balls.length - 1; i >= 0; i--) {
    if (balls[i].containsMouse(mouseX, mouseY)) {
      if (balls[i].donut_image) {
        donut_sounds[int(random(0, donut_sounds.length))].play();
      } else {
        bubble_sounds[int(random(0, bubble_sounds.length))].play();
      }
      balls[i].removeFromWorld();
      balls.splice(i, 1);
      score_ = score_ + 1;
    }
  }

  return false;
}

function gameTimer() {
  time_counter = time_counter + 1;
  var min = floor(time_counter / 60);
  var sec = time_counter % 60;
  time_ = nf(min, 2) + ':' + nf(sec, 2);

  return false;
}

function displayScore() {
  alert("You scored " + score_ + " and played for " + time_ + "!\n\n\"It's not a bug, it's a feature!\" ;)");
}

// Game loop
// --------------------------------------------------------------------------------------------------
function draw() {

  // Takes origin point from top-left corner and puts it at the center of the screen
  translate(-width/2, -height/2, 0);

  // Resets background
  background(253, 245, 201);
  
  // Shows borders
  bottom.show();
  right.show();
  left.show();
  top_.show();

  // Gives bubbles momentum so that they bounce around
  for (let i = 0; i < balls.length; i++) {
    balls[i].show();
    balls[i].apply_force();
  }

  // Title Overlay
  // -------------
  canvas3Title.displayOverlay();

  canvas3Title.displayText('Bubble Pop!', 0, width/2-3, text_pos_x);
  canvas3Title.displayText('Bubble Pop!', 255, width/2, text_pos_x);

  // Sets text position based on device type
  if ( (isMobile()) && (fs_icon !== null) ) {
    canvas3Title.bindImage(width/2-16-2, height-100, fs_icon_2, false);
    canvas3Title.bindImage(width/2-16, height-100, fs_icon, false);
  }

  // Animates the title
  if (text_pos_x > (height / 3 + 10)) {
    changeDirection = true;
  } else if (text_pos_x <= (height / 3 - 10)) {
    changeDirection = false;
  }
  if (text_pos_x >= 0 && changeDirection == false) {
    text_pos_x = text_pos_x + 0.3;
  } else if (changeDirection == true) {
    text_pos_x = text_pos_x - 0.3;
  }

  // Subtitle Overlay
  // ----------------
  canvas4Subtitle.displayOverlay();

  // Sets text position based on device type
  if (isMobile()) {
    canvas4Subtitle.displayText('tap to play', 0, width/2-3, text_pos_y);
    canvas4Subtitle.displayText('tap to play', 255, width/2, text_pos_y);
  } else {
    canvas4Subtitle.displayText('click to play', 0, width/2-3, text_pos_y);
    canvas4Subtitle.displayText('click to play', 255, width/2, text_pos_y);
  }

  // Animates the subtitle
  if (text_pos_y > (text_pos_y + 10)) {
    changeDirection = true;
  } else if (text_pos_y <= (text_pos_y - 10)) {
    changeDirection = false;
  }
  if (text_pos_y >= 0 && changeDirection == false) {
    text_pos_y = text_pos_y + 0.3;
  } else if (changeDirection == true) {
    text_pos_y = text_pos_y - 0.3;
  }

  // Score and Time Overlay
  // ----------------------
  canvas5ScoreTime.displayOverlay();

  // Formats score and time string
  if (time_) {
    time_ = time_;
  } else {
    time_ = "00:00"
  }
  if (score_ < 0) {
    score_str = nf(score_, 4);
  } else {
    score_str = nf(score_, 5);
  }

  // Sets text position based on device type
  if (isMobile()) {
    canvas5ScoreTime.displayText(`Score: ${score_str}\nTime: ${time_}`, 0, width/2-1, 49);
    canvas5ScoreTime.displayText(`Score: ${score_str}\nTime: ${time_}`, 255, width/2, 50); // offsets the tint
  } else {
    canvas5ScoreTime.displayText(`Score: ${score_str}            Time: ${time_}`, 0, width/2-1, 49);
    canvas5ScoreTime.displayText(`Score: ${score_str}            Time: ${time_}`, 255, width/2, 50); // offsets the tint
  }

  // Check if bubbles are off screen therefore inaccessible to the player; if yes, remove them from the world
  for (let i = balls.length - 1; i >= 0; i--) {
    if (balls[i].isOffscreen()) {
      balls[i].removeFromWorld();
      balls.splice(i, 1);
      // console.log("Oh, crabcakes! A few bubbles flew off the screen...");
    }
  }

  // Game over
  // ---------
  if (balls.length == 0) {
    // gameOver = true;

    if (isMobile()) {
      resetGame(windowWidth, windowHeight);
    } else {
      displayScore();
      resetGame();
    }

  }
  
}