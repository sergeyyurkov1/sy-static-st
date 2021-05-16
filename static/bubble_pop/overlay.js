function Overlay(x, y, w, h) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  
  // Creates an overlay
  this.overlay = createGraphics(this.w, this.h);

  this.displayOverlay = function () {

    image(this.overlay, this.x, this.y);
    this.overlay.clear();
    
  }
  
  this.bindImage = function (x, y, img, tinted=false) {
    if (img) {
      push();
      imageMode(CENTER);
      this.overlay.image(img, x, y);
      if (tinted == true) {
        this.overlay.tint(255, 50);
      }
      pop();
    } else {
      return false;
    }
  } 

  this.setFont = function (font, size, posX, posY) {
    this.overlay.textFont(font);
    this.overlay.textSize(size);
    this.overlay.textAlign(posX, posY);
  }

  this.displayText = function (txt, col, x, y) {
    this.overlay.fill(col);
    this.overlay.text(txt, x, y);
  }

  this.clearText = function () {
    this.overlay.textSize(0);
  }
}