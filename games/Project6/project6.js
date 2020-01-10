// ---------------------------------------------
// ---------------------------------------------
/* the animation object is used to contain all of the parts
    * of the animation.
    */
var animationObject = function(){
    // keep moving objects
    this.fountains = [];
    this.fishes = [];
    this.bubbles = [];
    this.birds = [];

    // keep non-moving objects
    this.sandParticles = [];

    // keep track of frames
    this.frameCount = 0;
};

// instatiate animation object
var animation = new animationObject(); 

// ---------------------------------------------
// ---------------------------------------------
/* water Object
    * the water object is a rectangle that is drawn 
    * with a set color, that changes every frame 
    * so as to go from one color to another. When a new
    * color is reached, another target color is picked, 
    * this process repeats throughout the animation. Perlin
    * noise is used to animate water motion
    */ 
var waterObj = function(x, y, w, h){
    this.a = random(1500);
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    // current color
    this.c1 = random(0, 255);
    this.c2 = random(0, 255);
    this.c3 = random(0, 255);
    // target color
    this.nextc1 = random(0, 255);
    this.nextc2 = random(0, 255);
    this.nextc3 = random(0, 255);
    this.frameCount = 0;
    this.colorThresh = 120;
    
    // draw backgorund rectangle
    this.draw1 = function(){
        push();
        translate(this.x, this.y);
        fill(this.c1, this.c2, this.c3);
        noStroke();

        rect(0, 0, this.w, this.h);
        pop();
    };

    // draw perlin noise cloudiness to water
    this.draw2 = function() {
        push();
        translate(this.x, this.y);
        fill(this.c1, this.c2, this.c3);
        noStroke();

        if(this.frameCount % this.colorThresh === 0){
            this.nextc1 = random(0, 255);
            this.nextc2 = random(0, 255);
            this.nextc3 = random(0, 255);
        }else{
            this.c1 += (this.nextc1 - this.c1)/(this.colorThresh/2);
            this.c2 += (this.nextc2 - this.c2)/(this.colorThresh/2);
            this.c3 += (this.nextc3 - this.c3)/(this.colorThresh/2);
        }

        // draw perlin noise object
        var n1 = this.a;  
        for (var x=0; x<=this.w; x+=8) {
            var n2 = 0;
            for (var y=0; y<=this.h; y+=8) {
                var c = map(noise(n1,n2),0,1,0,255);
                fill(c, c, c,100);
                rect(x,y,8,8);
                n2 += 0.05; // step size in noise
            }
            n1 += 0.02; // step size in noise
        }
        this.a -= 0.005;  // speed of clouds
        pop();

        this.frameCount--;
    };
};

// ---------------------------------------------
// ---------------------------------------------
/* monteCarlo 
    * return a monte carlo distribution of all color
    * ranges for a single value (0 - 255)
*/
var monteCarlo = function() {
    var v1 = random(0, 255);
    var v2 = random(0, 255);
    while (v2 > v1) {
        v1 = random(0, 255);
        v2 = random(0, 255);
    }
    return(v1);
};

// ---------------------------------------------
// ---------------------------------------------
/* particleObj 
    * a particle has an x, y position and is defined
    * with a velocity dependent on w, h so that it stays
    * within a certain boundary
    */
var particleObj = function(x, y, w, h) {
    this.position = new createVector(x, y);
    this.velocity = new createVector(random(-w, w), random(-h, -h));
    this.size = random(2, 4);
    this.position.y -= (18 - this.size);
    this.c1 = monteCarlo();
    this.c2 = monteCarlo();
    this.c3 = monteCarlo();
    this.gravity = new createVector(0, 0.02);
    this.timeLeft = 255;
    
    // update vectors
    this.update = function(){
        this.velocity.add(this.gravity);
        this.position.add(this.velocity);
        this.timeLeft--;
    };
    
    // draw particle, color depends on the time left
    // translate x, y to particle's position
    this.draw = function() {
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(this.c1, this.c2, this.c3, this.timeLeft);
        ellipse(0, 0, this.size, this.size*2);
        noFill();
        pop();
    };
};

// ---------------------------------------------
// ---------------------------------------------
/* fountainObj 
    * a fountain is a particle system that generates particles
    * from a set x, y origin. A width and height are used to
    * generate particles within a set boundary
    */ 
var fountainObj = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.w = w;
    this.h = h;
    
    // execute is like draw and update in one, as it updates the particles 
    // of the fountain and calls the draw for each particle. old particles
    // are erased from memory
    this.execute = function(){
        if( this.particles.length < 300){
            this.particles.push(new particleObj(this.x, this.y, this.w, this.h));
        }
        for (var i=0; i<this.particles.length; i++) {
            if ((this.particles[i].timeLeft > 0) && 
                (this.particles[i].position.y < this.y)) {
                this.particles[i].draw();
                this.particles[i].update();
            }
            else {
                this.particles.splice(i, 1);
            }
        } 
    };
};

// ---------------------------------------------
// ---------------------------------------------
/* bloodObj
    * a bloodObj is like a fountainObj, but particles move outward
    * as opposed to upward and down. Again, width and height are
    * used to generate particles within a set boundary
    */ 
var bloodObj = function(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.w = w;
    this.h = h;
    
    // execute is like draw and update in one, as it updates the particles 
    // of the fountain and calls the draw for each particle. old particles
    // are erased from memory
    this.execute = function(){
        if( this.particles.length < 300){
            this.particles.push(new particleObj(this.x, this.y, this.w, this.h));
            this.particles[this.particles.length - 1].gravity = new createVector(random(-0.05, 0.05), random(-0.05, 0.05));
            this.particles[this.particles.length - 1].c1 = 200;
            this.particles[this.particles.length - 1].c2 = 40;
            this.particles[this.particles.length - 1].c3 = 40;
        }
        for (var i=0; i<this.particles.length; i++) {
            if (this.particles[i].timeLeft > 0) {
                this.particles[i].draw();
                this.particles[i].update();
            }
            else {
                this.particles.splice(i, 1);
            }
        } 
    };
};

// ---------------------------------------------
// ---------------------------------------------
/* subdivider 
    * a subdivider takes a set of coordinates, and 
    * subdivides them a set number of iterations. 
    * once subidivision is complete, the object can 
    * be drawn, and is marked as such so as to not 
    * re-do calculations already done
    */
var subdivider = function(points){
    this.points = points;
    this.p2 = [];
    this.iterations = 0;
    this.maxIterations = 5;
    
    // determine if the distance between x, y and 
    // any of the points in the points array is less 
    // than 10, if so return true
    this.pointDist = function(x, y) {
        var result = false;
        for (var i = 0; i < this.points.length; i++) {
            if (dist(x, y, this.points[i].x, this.points[i].y) < 10) {
                result = true;  
            }    
        }    
        return result;
    };   
    
    // split the points of points by finding the points
    // halfway along the line from point to point, add 
    // those to p2. 
    this.splitPoints = function() {
        this.p2.splice(0, this.p2.length);
        for (var i = 0; i < this.points.length - 1; i++) {
            this.p2.push(new createVector(this.points[i].x, this.points[i].y));
            this.p2.push(new createVector((this.points[i].x + this.points[i+1].x)/2, (this.points[i].y +
    this.points[i+1].y)/2));
        }  
        this.p2.push(new createVector(this.points[i].x, this.points[i].y));
        this.p2.push(new createVector((this.points[0].x + this.points[i].x)/2, (this.points[0].y +
    this.points[i].y)/2));
    };  
    
    // calculate the average of the points in p2, then 
    // set the points of those to such. Add those 
    // calculated averages to points
    this.average = function() {
        for (var i = 0; i < this.p2.length - 1; i++) {
            var x = (this.p2[i].x + this.p2[i+1].x)/2;
            var y = (this.p2[i].y + this.p2[i+1].y)/2;
            this.p2[i].set(x, y);
        } 
        var x = (this.p2[i].x + this.points[0].x)/2;
        var y = (this.p2[i].y + this.points[0].y)/2;
        this.points.splice(0, this.points.length);
        for (i = 0; i < this.p2.length; i++) {
            this.points.push(new createVector(this.p2[i].x, this.p2[i].y));   
        }    
    };    
    
    // subdivide by splitting points then averaging
    this.subdivide = function() {
        this.splitPoints();
        this.average();
    };
    
    // draw the shape if have gone through 5 iterations
    // of subdivision. otherwise, continue to subdivide
    this.draw = function() {
        if(this.iterations === this.maxIterations){
            beginShape();
            for (var i = 0; i < this.points.length; i++) {
                vertex(this.points[i].x, this.points[i].y);   
            }    
            vertex(this.points[0].x, this.points[0].y);
            endShape();
        }
        if (this.iterations < this.maxIterations) {
            this.subdivide();
            this.iterations++;
        } 
    };
    
};

// ---------------------------------------------
// ---------------------------------------------
/* bubble 
    * a bubble is defined as a sphere with a size, that
    * wobbles upwards from its starting position until it
    * reaches the top of the water, then dissapears
    */
var bubble = function(x, y, size){
    this.position = new createVector(x, y);
    this.velocity = new createVector(0, random(-0.7, -1));
    this.size = size;
    this.frameCount = 0;

    this.draw = function(){
        push();
        translate(this.position.x, this.position.y);

        noFill();
        stroke(255, 255, 255, 200);
        strokeWeight(0.5);
        ellipse(0, 0, this.size, this.size);

        pop();
    };
    
    this.update = function(){
        // update vectors
        this.position.add(this.velocity);

        // add random wobble
        if(this.frameCount % 5 === 0){
            this.position.x += random(-2, 2);
        }

        // check if out of water
        if(this.position.y < 200 + this.size){
            // remove from bubbles list
            var thisIndex = 0;
            for(var i = 0; i < animation.bubbles.length; i++){
                if(animation.bubbles[i] == this){
                    thisIndex = i;
                }
            }

            animation.bubbles.splice(thisIndex, 1);
        }

        this.frameCount++;
    };
};

// ---------------------------------------------
// ---------------------------------------------
/* bezierObj 
    * a bezier object is defined as having a length - 
    * the total horizontal length of the curve from x 
    * to x, a velocity - rate of change of control points,
    * a width - how wide the line is, and a boolean to 
    * indicate if the curve is vertical or not. The center
    * points move along a line perpendicular to the 
    * line from the end points. 
    */
var bezierObj = function(len, velocity, width, vertical){
    this.len = len;
    this.width = width;
    this.vertical = vertical;
    if(this.vertical){
        this.cx1 = 0;
        this.cx1Dir = 5*velocity;
        this.cx2 = 0;
        this.cx2Dir = -5*velocity;
    }else{
        this.cy1 = 0;
        this.cy1Dir = 5*velocity;
        this.cy2 = 0;
        this.cy2Dir = -5*velocity;
    }
    
    // draw either vertically or horizontally
    this.draw = function(x, y) {
        push();
        translate(x, y);
        if(this.vertical){
            beginShape();
            vertex(0, 0);
            bezierVertex(this.cx1, this.len/4,   this.cx2, 3*this.len/4, 0, this.len);
            bezierVertex(this.cx2 - this.width, 3*this.len/4, this.cx1 - this.width, this.len/4, 0, 0);
            endShape();
        }else{
            beginShape();
            vertex(0, 0);
            bezierVertex(this.len/4, this.cy1, 3*this.len/4, this.cy2, this.len, 0);
            bezierVertex(3*this.len/4, this.cy2 - this.width, this.len/4, this.cy1 - this.width, 0, 0);
            endShape();
        }
        pop();
    };
    
    // update horizontally or vertically according to direction
    this.update = function(){
        // vertical
        if(this.vertical){
            this.cx1 += this.cx1Dir;
            if(this.cx1 > this.len || this.cx1 < - this.len){
                this.cx1Dir *= -1;
            }
            this.cx2 += this.cx2Dir;
            if(this.cx2 > this.len || this.cx2 < - this.len){
                this.cx2Dir *= -1;
            }
        }
        // not vertical
        else{
            this.cy1 += this.cy1Dir;
            if(this.cy1 > this.len || this.cy1 < - this.len){
                this.cy1Dir *= -1;
            }
            this.cy2 += this.cy2Dir;
            if(this.cy2 > this.len || this.cy2 < - this.len){
                this.cy2Dir *= -1;
            }
        }
    };
};


// ---------------------------------------------
// ---------------------------------------------
/* fish
    * a fish moves from left to right, and wraps around when 
    * reaching the right side. Fish will eat other fish 
    * smaller than them when they collide. Fish change color
    * as time goes on, and bounce off the top and bottom of
    * the fish tank. When a fish is eaten, it is re-generated
    * to preserve memory, and blood and bubbles eminate from 
    * the area of its demise.
    */
var fish = function(x, y){
    this.position = new createVector(x, y);
    this.size = random(15, 25);
    this.velocity = new createVector(random(0.1, 0.6), random(-0.3, 0.3));
    // give a random color and next color
    this.c1 = random(0, 255);
    this.c2 = random(0, 255);
    this.c3 = random(0, 255);
    this.nextc1 = random(0, 255);
    this.nextc2 = random(0, 255);
    this.nextc3 = random(0, 255);

    // keep counter so know when to choose new colors
    this.frameCount = 0;
    this.colorThresh = 120;

    this.eatTimer = 0;
    this.eatSwitch = 1;
    this.deadTimer = 0;
    this.dead = false;

    // create a bezier object for tail
    // want it to move at speed proportional to x velocity
    this.bez = new bezierObj(this.size, this.velocity.x/this.size*20, this.size/5, false);

    // create subdivider instance for closed mouth
    this.points1 = [];
    this.points1.push(new createVector(-this.size/2 - 4, -this.size/2 - 6));
    this.points1.push(new createVector(0 , -this.size/2 + 2));
    this.points1.push(new createVector(this.size/2 - 4, -this.size/2));
    this.points1.push(new createVector(this.size/2, 0));
    this.points1.push(new createVector(this.size/2 - 4, this.size/2));
    this.points1.push(new createVector(-this.size/2, this.size/2 - 4));
    this.sub1 = new subdivider(this.points1);
    // now create subdivider instance for open mouth
    this.points2 = [];
    this.points2.push(new createVector(-this.size/2 - 4, -this.size/2 - 6));
    this.points2.push(new createVector(0 , -this.size/2 + 2));
    this.points2.push(new createVector(this.size/2 - 4, -this.size/2));
    this.points2.push(new createVector(0, 0));
    this.points2.push(new createVector(this.size/2 - 4, this.size/2));
    this.points2.push(new createVector(-this.size/2, this.size/2 - 4));
    this.sub2 = new subdivider(this.points2);

    this.draw = function(){
        push();
        
        translate(this.position.x, this.position.y);
        stroke(0, 0, 0);
        fill(this.c1, this.c2, this.c3);

        // if just died, draw blood fountain
        if(this.deadTimer > 0){
            this.blood.execute();
        }
        // otherwise draw normally
        else{
            // if eating other fish, draw by 
            // alternating between closed and open 
            // mouth forms
            if(this.eatTimer > 0){
                if(this.eatTimer % 15 === 0){
                    this.eatSwitch *= -1;
                }
                if(this.eatSwitch === 1){
                    this.sub1.draw();
                }else{
                    this.sub2.draw();
                }
            }else{
                // draw closed mouth
                this.sub1.draw();
            }

            // draw eyes
            fill(0, 0, 0);
            ellipse(-this.size/10, -this.size/8, this.size/10, this.size/10);
            //ellipse(0, -this.size/3, this.size/10, this.size/10);
            
            // draw tail after pop because has its own pop
            fill(this.c1, this.c2, this.c3);
            this.bez.draw(-this.size/2 - 1 - this.size, 0);
            this.bez.update();
        
        }

        pop();

    };


    // check collision of something with an x, y with advesary
    // return true if the otherX, otherY collide with this advesary, otherwise false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.position.x) < this.size/2 + otherSize/2 && abs(otherY - this.position.y) < this.size/2 + otherSize/2){
                return true;
        }else {
            return false;
        }
    };

    // get the amount of collision with the other object
    this.getCollideAmount = function(otherX, otherY, otherSize){
        return abs(otherX - this.position.x) + abs(otherY - this.position.y);
    }

    this.update = function(){

        // decrease timers 
        if(this.eatTimer > 0){
            this.eatTimer--;
        }
        if(this.deadTimer > 0){
            this.deadTimer--;
        }

        // if dying, and reach bottom of timer, go back to off screen
        // and "re-generate" to make it seem like a new ffish
        if(this.deadTimer === 0 && this.dead){
            this.position.x = - 50;
            this.velocity = new createVector(random(0.1, 0.6), random(-0.3, 0.3));
            this.dead = false;
            this.c1 = random(0, 255);
            this.c2 = random(0, 255);
            this.c3 = random(0, 255);
        }
        
        
        // check that do not go out of water
        if(this.position.y + this.velocity.y - this.size/2 < 205 ||
            this.position.y + this.velocity.y + this.size/2 > 385){
            this.velocity.y *= -1;
            this.position.add(this.velocity);
        }

        // if go to right of screen, go back to left side by wrapping around
        // and re-assign velocity
        if(this.position.x + this.velocity.x > 400 + this.size*2){
            this.position.x = -this.size;
            this.velocity = new createVector(random(0.1, 0.6), random(-0.3, 0.3));
        }

        // check for collision with other fish
        // first find index of "this" in array
        
        for(var i = 0; i < animation.fishes.length; i++){
            // if collide x, and size is bigger, "eat" other fish
            if(animation.fishes[i] != this &&  animation.fishes[i].collidesWith(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.size)){
                if(this.size > animation.fishes[i].size && !animation.fishes[i].dead && animation.fishes[i].getCollideAmount(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.size) < 15){
                    this.eatTimer = 60;
                    // mark other fish as dead, give it a new blood fountain
                    animation.fishes[i].deadTimer = 30;
                    animation.fishes[i].dead = true;
                    animation.fishes[i].blood = new bloodObj(0, animation.fishes[i].size, 0.1, 0.1);
                    // and add some bubbles
                    for(var j = 0; j < animation.fishes[i].size/4; j++){
                        animation.bubbles.push(new bubble(animation.fishes[i].position.x, animation.fishes[i].position.y, animation.fishes[i].size/5));
                    }

                    // swap positions in array so eating fish appears on top
                    var thisIndex = 0;
                    for(var j = 0; j < animation.fishes.length; j++){
                        if(animation.fishes[j] == this){
                            thisIndex = j;
                        }
                    }
                    var temp = animation.fishes[i];
                    animation.fishes[i] = animation.fishes[thisIndex];
                    animation.fishes[thisIndex] = temp;

                }
            }

        }

        // update vectors
        this.position.add(this.velocity);

        //update colors
        if(this.frameCount % this.colorThresh === 0){
            this.nextc1 = random(0, 255);
            this.nextc2 = random(0, 255);
            this.nextc3 = random(0, 255);
        }else{
            this.c1 += (this.nextc1 - this.c1)/(this.colorThresh/2);
            this.c2 += (this.nextc2 - this.c2)/(this.colorThresh/2);
            this.c3 += (this.nextc3 - this.c3)/(this.colorThresh/2);
        }
        this.frameCount++;
    };
}


// ---------------------------------------------
// ---------------------------------------------
/* bird
    * a bird is defined with a position and velocity. 
    * birds fly in a random direction for a fixed 
    * amount of time, and then chooses a new direction
    * after that amount of time. When a bird collides 
    * with another bird, it bounces off that bird. Birds
    * will also bounce off the edges of the screen, and
    * the top of the fish tank.
    */
var bird = function(x, y){
    this.position = new createVector(x, y);
    this.size = random(10, 15);
    // give a random color and eye color
    this.c1 = random(0, 255);
    this.c2 = random(0, 255);
    this.c3 = random(0, 255);
    this.ec1 = random(0, 255);
    this.ec2 = random(0, 255);
    this.ec3 = random(0, 255);

    // give velocity to wander
    this.velocity = new createVector(random(-0.5, 0.5), random(-0.5, 0.5));

    // keep frame counter for wandering feature
    this.frameCount = 0;

    // create subdivider instance for closed mouth
    this.points1 = [];
    this.points1.push(new createVector(this.size, this.size));
    this.points1.push(new createVector(0, this.size/2));
    this.points1.push(new createVector(-this.size, this.size));
    this.points1.push(new createVector(-this.size/2, 0));
    this.points1.push(new createVector(-this.size, -this.size));
    this.points1.push(new createVector(0, -this.size/2));
    this.points1.push(new createVector(this.size, -this.size));
    this.points1.push(new createVector(this.size/2, 0));
    this.body = new subdivider(this.points1);
    
    // create a bezier object for tail
    // want it to move at a random speed
    this.tentacleSpeed = random(0.1, 0.4);
    this.bez1 = new bezierObj(this.size, this.tentacleSpeed, this.size/5, true);
    
    this.draw = function(){

        push();
        translate(this.position.x, this.position.y);

        // draw tentacles
        fill(this.c1, this.c2, this.c3);
        stroke(0, 0, 0);
        this.bez1.draw(0, this.size/1.5);

        // draw body
        this.body.draw();

        // draw eye
        stroke(0, 0, 0);
        fill(255, 255, 255);
        ellipse(0, 0, this.size/1.5, this.size/3);
        noStroke();
        fill(this.ec1, this.ec2, this.ec3);
        ellipse(0, 0, this.size/3.2, this.size/3.2);

        pop();
    };

    // check collision of something with an x, y with advesary
    // return true if the otherX, otherY collide with this advesary, otherwise false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.position.x) < this.size + otherSize && abs(otherY - this.position.y) < this.size + otherSize){
                return true;
        }else {
            return false;
        }
    };

    this.update = function(){
        // update tail bezier
        this.bez1.update();

        // every once and a while change direction
        if(this.frameCount % 300 === 0){
            this.velocity = new createVector(random(-0.5, 0.5), random(-0.5, 0.5));
        }

        // check collision with other birds
        for(var i = 0; i < animation.birds.length; i++){
            // if collide y, bounce off
            if(animation.birds[i] != this && animation.birds[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                this.velocity.y *= -1; 
                animation.birds[i].velocity.y *= -1;
            }
            // if collide x, bounce off
            if(animation.birds[i] != this && animation.birds[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                this.velocity.x *= -1; 
                animation.birds[i].velocity.x *= -1;
            }

        }

        // make sure staying within boundaries
        if(this.position.x + this.size > 400 || this.position.x - this.size < 0){
            this.velocity.x *= -1;
        }
        if(this.position.y + this.size > 200 - this.bez1.len || this.position.y - this.size < 0){
            this.velocity.y *= -1;
        }

        // update vectors
        this.position.add(this.velocity);

        this.frameCount++;
    };
}

// ---------------------------------------------
// ---------------------------------------------
/* this function is used as the draw function for the      
    * animation object, which draws all of the objects 
    * contained in animationObject in their current states
    */
animationObject.prototype.draw = function(){  
    // fountains
    for(var i = 0; i < this.fountains.length; i++){
        this.fountains[i].execute();
    }

    // water
    this.water.draw1();

    // bubbles
    for(var i =0; i < this.bubbles.length; i++){
        this.bubbles[i].draw();
    }

    // fish
    for(var i =0; i < this.fishes.length; i++){
        this.fishes[i].draw();
    }

    // birds
    for(var i =0; i < this.birds.length; i++){
        this.birds[i].draw();
    }

    noStroke();
    // draw sand as rectangle with random particles inside
    fill(213, 219, 121);
    rect(0, 385, 400, 10);
    for(var i = 0; i < animation.sandParticles.length; i++){
        if(i % 2 === 0){
            fill(0, 0, 0, 100);
        }else{
            fill(200, 200, 200, 150);
        }
        rect(animation.sandParticles[i].x, animation.sandParticles[i].y, 2, 2);
    }

    // draw transparent part of water 
    this.water.draw2();

    // draw fish tank frame
    fill(0, 0, 0);
    rect(0, 190, 5, 210);
    rect(0, 395, 400, 5);
    rect(395, 190, 5, 210);
    
};

// ---------------------------------------------
// ---------------------------------------------
/* this function updates the state of the animation
    * object each iteration, by updating the individual
    * object within the animationObject
    */
animationObject.prototype.update = function(){  
    // bubbles
    for(var i =0; i < this.bubbles.length; i++){
        this.bubbles[i].update();
    }

    // add random bubbles 
    if(this.frameCount % 30 === 0 && this.bubbles.length < 100){
        this.bubbles.push(new bubble(random(0, 400), 420, random(1, 5)));
        this.bubbles.push(new bubble(random(0, 400), 420, random(1, 5)));
        this.bubbles.push(new bubble(random(0, 400), 420, random(1, 5)));
    }
    
    // fish
    for(var i =0; i < this.fishes.length; i++){
        this.fishes[i].update();
    }

    // birds
    for(var i =0; i < this.birds.length; i++){
        this.birds[i].update();
    }

    this.frameCount++;
};

// ---------------------------------------------
// ---------------------------------------------
/* setup the animations's by adding some objects
    */
var setup = function(){

    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');

    angleMode(RADIANS);
    frameRate(60);

    animation.fountains.push(new fountainObj(100, 210, 0.3, 1.3));
    animation.fountains.push(new fountainObj(300, 210, 0.3, 1.3));
    animation.water = new waterObj(0, 200, 400, 200);
    
    // add some fish
    for(var i = 0; i < 10; i++){
        animation.fishes.push(new fish(random(20, 380), random(250, 350)));
    }

    // add sand particles
    for(var i = 0; i < 300; i++){
        animation.sandParticles.push(new createVector(random(5, 395), random(385, 395)));
    }

    // add some birds
    animation.birds.push(new bird(100, 110));
    animation.birds.push(new bird(150, 90));
    animation.birds.push(new bird(200, 100));
    animation.birds.push(new bird(250, 120));
    animation.birds.push(new bird(300, 80));
};


// ---------------------------------------------
// ---------------------------------------------
// the main draw loop, call the draw of the animationObject
var draw = function(){
    background(177, 227, 226);
    animation.draw();
    animation.update();
};