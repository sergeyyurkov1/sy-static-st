function Boundary(x, y, w, h) {

  this.options = {
    friction: 0,
    isStatic: true,
    restitution: 0.8,
  }

  /*collisionFilter: {
    group: -1
  }*/
  
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;

  this.body = Bodies.rectangle(this.x, this.y, this.w, this.h, this.options);
  
  World.add(world, this.body);

  // this.removeBody = function (new_x, new_y, new_w, new_h) {
  //   // Body.set(this.body,{x: new_x, y: new_y, width: new_w, height: new_h})
  //   // World.remove(world, this.body);

  // }
  
  this.show = function () {
    // let pos = this.body.position;
    // var angle = this.body.angle;
    
    push();
    
    // rotate(angle);
    // rectMode(CENTER);
    strokeWeight(boundaryWidth);
    stroke(0);
    rectMode(CENTER);
    
    //noStroke();
    fill(0);
    //line(pos.x, pos.y, this.w, this.h);
    rect(this.body.position.x, this.body.position.y, this.w, this.h); // 0, 0 because translate()
    
    pop();

  }

}