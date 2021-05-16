function Ball(x, y, r, colors, donut_image=false) {

  this.options = {
    density: 0.001,
    friction: 0,
    frictionAir: 0,
    restitution: 0.6,
    setInertia: Infinity,
  }
  
  /*collisionFilter: {
    group: 1
  }*/

  this.x = x;
  this.y = y;
  this.r = r;

  this.donut_image = donut_image;

  this.body = Bodies.circle(this.x, this.y, this.r, this.options);

  this.color = colors[int(random(0, colors.length))];

  World.add(world, this.body);
  
  this.show = function () {
    var pos = this.body.position;
    var angle = this.body.angle;
    
    push();
    
    if (this.donut_image) {
      translate(pos.x, pos.y);
      rotate(angle);
      ellipseMode(CENTER);
      
      noStroke();
      texture(this.donut_image);
      ellipse(0, 0, this.r*2); // 0, 0 because translate()
    
    } else {
      translate(pos.x, pos.y);
      // rotate(angle);
      ellipseMode(CENTER);
      
      noStroke();
      fill(this.color);
      ellipse(0, 0, this.r*2); // 0, 0 because translate()

    }

    pop();
  }
  
  this.containsMouse = function (mouseX, mouseY) {
    let d = dist(mouseX, mouseY, this.body.position.x, this.body.position.y);
    return (d < (this.r * 2));
  }

  this.isOffscreen = function () {
    if (this.body.position.x < 0 || this.body.position.y < 0 || this.body.position.x > canvas.width || this.body.position.y > canvas.height) {
      return true;
    } else {
      return false;
    }
  }
  
  this.removeFromWorld = function () {
    World.remove(world, this.body);
  }

  this.apply_force = function () {
    Body.applyForce(this.body, {x: this.body.position.x, y: this.body.position.y},
                               {x: random(-0.003, 0.003), y: random(-0.003, 0.003)});
  }
}