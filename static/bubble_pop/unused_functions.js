// Make more bubbles
// -----------------

// function mouseWheel() {
//     // balls.push(new Ball(mouseX, mouseY, random(25, 35), colors));
// balls.push(new Ball(mouseX, mouseY, random(24, 32), colors, donut_images[int(random(0, donut_images.length))]));
//     //if (mouseButton === CENTER) {}
// }

// function mouseDragged() {
//     balls.push(new Ball(mouseX, mouseY, random(25, 35), colors));
//     if (mouseButton === CENTER) {
//         balls.push(new Ball(mouseX, mouseY, random(24, 32), colors, donut_images[int(random(0, donut_images.length))]));
//     }
// }

// --------------------------------------------------------------------------------------------------
// function deviceTurned() {
//     // turned = !turned
//     // redraw();
// }

// "Turbo-clicking" penalty
// ------------------------
// function doubleClicked() {
//     score_ -= 2;
// }

// Other
// --------------------------------------------------------------------------------------------------
// alert(screen.orientation.type);
// screen.orientation.lock("portrait-primary");

// window.addEventListener("load", goFullscreen);

// let screen_height = screen.height;
// let screen_width = screen.width;
// let screen_height = 600;
// let screen_width = 800;

// let donuts = [];

// let music_loop;

// loadImage('images/tint2.png', function (i) {
//   img_tint = i;
//   img_tint.resize(screen_width, screen_height);
// });

// fs_icon.resize(32, 32);

// for (let i = 1; i <= 2; i++) {
//   loadSound("music/blippy-trance-by-kevin-macleod-from-filmmusic-io.mp3", function (m) {
//     music_loop = m;
//   });
// }

// if (music_loop.isPlaying()) {
//   music_loop.stop();
// } else {
//   music_loop.loop();
// }

// if (isMobile()) {
//   canvas = createCanvas(displayWidth, displayHeight, WEBGL);
// } else {
//   canvas = createCanvas(800, 600, WEBGL);
// }

// bottom.removeBody();
// right.removeBody();
// left.removeBody();
// top_.removeBody();

// let d_t = new Donut(random(width), random(height), donut_images[int(random(0, donut_images.length))]);
// donuts.push(d_t);

// console.log(isFullScreen)

// if (isFullScreen % 2 == 0) {
//     resetGame();
// } else {
//     resetGame(displayWidth, displayHeight);
// }

// resizeCanvas(displayWidth, displayHeight);

// let needsImage = true;
// needsImage = false;

// for (const prop of Object.getOwnPropertyNames(balls[i])) {
//   delete balls[i][prop];
// }


// function mouseReleased() {
//   return true;
// }

// top_.updateBody(windowWidth/2, boundaryWidth, windowWidth, boundaryWidth);

// for (let i = 0; i < donuts.length; i++) {
//   donuts[i].show();
//   donuts[i].move();
// }

// if (needsImage) {
//   img = img_tint;
// } else {
//   img = null;
// }
// Title screen tint
// ------------------------------------------
// if (img !== null) {
//   canvas2Tint.bindImage(0, 0, img, true);
// }

// canvas2Tint.displayOverlay();
// canvas2Tint = new Overlay(0, 0, canvas.width, canvas.height);

// (screen_width < screen_height) && turned == false

// if (mouseReleased()) {
//   displayScore();
// }

// let img, img_tint;

// CSS
// ---
/*button {
  background-color: Transparent;
  border-radius: 10;
  padding: 10;
  padding: 10;
  width: 100;
  height: 25
}*/