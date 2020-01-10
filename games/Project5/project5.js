/* gameObject   
    * the gameObject is the top level object, which holds the state of the game 
    * and lists containing objects that are unique but of the same type.
    */
var gameObject = function(){
    // create a setup that can be called to initialized game
    this.setup = function(){
        
        // list to contain the balls player throws
        this.balls = [];

        // contain rigid walls
        this.walls = [];
        // create 4 walls
        this.walls.push(new wall(100, 100));
        this.walls.push(new wall(240, 80));
        this.walls.push(new wall(80, 200));
        this.walls.push(new wall(280, 180));

        // track frames to add more adversaries
        this.frameCount = 0;
        
        // list to contain menu items for drawing only
        // add a wall, and a ball, and a ship of each kind
        this.menuItems = [];
        this.menuItems.push(new wall(0, 0));
        this.menuItems.push(new ball(0, 0, 0, 0, 10));
        this.menuItems.push(new adversary(0, 0));
        this.menuItems[2].powerup = false;
        this.menuItems[2].inhibitor = false;
        this.menuItems[2].triple = false;
        this.menuItems.push(new adversary(0, 0));
        this.menuItems[3].powerup = true;
        this.menuItems[3].inhibitor = false;
        this.menuItems[3].triple = false;
        this.menuItems.push(new adversary(0, 0));
        this.menuItems[4].powerup = false;
        this.menuItems[4].inhibitor = true;
        this.menuItems[4].triple = false;
        this.menuItems.push(new adversary(0, 0));
        this.menuItems[5].powerup = false;
        this.menuItems[5].inhibitor = false;
        this.menuItems[5].triple = true;

        // list to contain adversaries
        this.adversaries = [];
        // add some adversaries
        for(var i = 0; i < 10; i++){
            this.adversaries.push(new adversary(random(-50, 0), i*30 + 40));
        }

        // keep track of keys currently pressed
        this.keyArray = [];

        // fountains for drawing
        this.fountains = [];

        // keep track of number left
        this.numLeft = this.adversaries.length;

        // keep track of "state" of game
        // 0 = menu
        // 1 = game
        // 3 = game over menu
        this.state = 0;

        this.player = new player(200, 380);
    };
};

// instantiate game object for global usage, everything
// else gets encapsulated in this instance
var game = new gameObject();

// ---------------------------------------------
// ---------------------------------------------
/* Wall -
    * a wall has an x, y (center) that does not chance
    * a wall is drawn as a 20x20 box.
    */
    var wall = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 20;

    // draw wall as a 20x20 rectangle with some decoration
    this.draw = function(menu, x, y){
        push();
        // if specified, draw in particular location
        if(menu){
            translate(x, y);
        }else{
            translate(this.x, this.y);
        }
        stroke(0, 0, 0);
        fill(156, 84, 17);
        rect(-this.size/2, -this.size/2, this.size, this.size);
        line(-this.size/2 + 1, -this.size/2 + 1, this.size/2 - 1, this.size/2 - 1);
        line(this.size/2 - 1, -this.size/2 + 1, -this.size/2 + 1, this.size/2 - 1);
        pop();
    };

    // check collision of something with an x, y with wall
    // return true if the otherX, otherY collide with this wall,
    // otherwise return false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.x) < this.size/2 + otherSize/2 && abs(otherY - this.y) < this.size/2 + otherSize/2){
            return true;
        }else {
            return false;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
// monteCarlo probability distribution function 
// is used by special effects (particleObj)
var monteCarlo = function() {
    var v1 = random(220, 255);
    var v2 = random(220, 255);
    while (v2 > v1) {
        v1 = random(220, 255);
        v2 = random(220, 255);
    }
    return(v1);
};

// ---------------------------------------------
// ---------------------------------------------
// particleObj is used by special effects
// a particle is defined as having an x, y position
// and a timeLeft - a time to live before destruction
// the drawing of the particle is dependent on the time left
var particleObj = function(x, y, timeLeft) {
    this.position = new createVector(x, y);
    this.velocity = new createVector(random(-0.3, 0.3), random(-1.3, -1.5));
    this.size = random(2, 4);
    this.position.y -= (18 - this.size);
    this.c1 = monteCarlo();
    this.timeLeft = timeLeft;
    this.gravity = new createVector(0, 0.02);
    
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
        fill(this.c1, this.c1, this.c1, this.timeLeft);
        ellipse(0, 0, this.size, this.size*2);
        pop();
    };
};

// ---------------------------------------------
// ---------------------------------------------
// a fountainObj utilizes the already defined particle
// to draw a "fountain" of particles
// the time passed to the fountain is used to determine 
// how long to generate particles for 
var fountainObj = function(x, y, time) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.time = time;
    // timeLeft is used by other functions to determine if the fountain
    // is done or not - so that it does not get erased too early
    this.timeLeft = time;
    
    // execute is like draw and update in one, as it updates the particles 
    // of the fountain and calls the draw for each particle. old particles
    // are erased from memory
    this.execute = function(){
        if (this.time > 0) {
            this.particles.push(new particleObj(this.x, this.y, 255));
            this.timeLeft = 255;
        }
        for (var i=0; i<this.particles.length; i++) {
            if ((this.particles[i].timeLeft > 0) && 
                (this.particles[i].position.y < this.y)) {
                this.particles[i].draw(this.angle);
                this.particles[i].update();
            }
            else {
                this.particles.splice(i, 1);
            }
        } 
        this.time--;
        this.timeLeft--;
    };
};

// ---------------------------------------------
// ---------------------------------------------
/* 
    * adversary
    * An adversary is defined with an x, y position
    * where x, y is the center of the screen. Adversaries
    * move with a random velocity, which can change if they 
    * run into another adversary, a wall, a border, or if they
    * are dodging a ball. Adversaries can predict and dodge balls
    * coming right at them, but not ones that are to bounce off
    * a wall and hit them. When defeated, a fountain appears in
    * their position
    */
    var adversary = function(x, y){
    this.position = new createVector(x, y);
    this.size = 20;
    this.health = 3;

    // random chance of being powerup, triple, or inhibitor 
    var chance = round(random(1, 10));
    if(chance === 1){
        this.powerup = true;
    }else if(chance === 3){
        this.inhibitor = true;
    }else if(chance === 7){
        this.triple = true;
    }

    // create random velocity
    this.velocity = new createVector(random(0.2, 0.6), random(-1, 1));
    
    // time dodging
    this.dodgeTimer = 0;
    this.dodged = false;

    // wall dodging
    this.wallTimer = 0;
    this.wallHit = false;
    
    // use menu switch to indicate if drawing for gameplay or for 
    // menu/gui purposes
    this.draw = function(menu, x, y){
        push();
        // if drawing on menu, draw relative to provided x,y
        if(menu){
            translate(x, y);
        }else{
            // adjust coordinates so 0, 0 is center of drawing space for this adversary
            translate(this.position.x, this.position.y);
        }

        // draw boat bottom
        fill(156, 84, 17);
        noStroke();
        rect(-5, 4, 10, 6);
        triangle(-10, 4, -4, 4, -4, 10);
        triangle(10, 4, 4, 4, 4, 10);
        // mast
        rect(-2, 2, 4, 3);
        rect(-1, -10, 2, 2);
        // water cut
        stroke(20, 33, 219);
        line(-6, 10, 6, 10);
        // sail
        fill(255, 255, 255);
        stroke(0, 0, 0);
        strokeWeight(0.2);
        quad(-9, 2, 9, 2, 7, -8, -7, -8);
        strokeWeight(1);
        
        // draw sail lines with color depending on if powerup, inhibitor, or not
        if(this.powerup){
            stroke(199, 112, 54);
        }else if(this.inhibitor){
            stroke(21, 163, 59);
        }else if(this.triple){
            stroke(214, 2, 179);
        }else{
            stroke(0, 0, 255);
        }
        // sail lines - use these to show advesary health
        line(-6, -6, 6, 0);
        if(this.health > 2){
            line(0, -7, 0, 1);
        }
        if(this.health > 1){
            line(-6, 0, 6, -6);
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

    this.update = function(){
        // countdown dodge timer, if reach zero make new random velocity
        if(this.dodgeTimer > 0){
            this.dodgeTimer--;
        }
        if(this.dodgeTimer === 0 && this.dodged){
            this.velocity = new createVector(random(0.2, 0.6), random(-1, 1));
            this.dodged = false;
        }

        // to dodge a wall, want to go straight down
        if(this.wallTimer > 0){
            this.wallTimer--;
        }
        if(this.wallTimer === 0 && this.wallHit){
            this.velocity = new createVector(random(0.2, 0.6), random(-1, 1));
            this.wallHit = false;
        }

        // if close to a ball, pick a new random velocity
        for(var i = 0; i < game.balls.length; i++){
            if(game.balls[i].collidesWithFuture(this.position.x, this.position.y, this.velocity.x, this.velocity.y, this.size)){
                this.velocity.x = -1.5;
                this.dodgeTimer = 30;
                this.dodged = true;
            }
        }

        // check for collision with other adversaries that are not defeated
        for(var i = 0; i < game.adversaries.length; i++){
            // check collide x
            if(game.adversaries[i] != this && game.adversaries[i].health > 0 && game.adversaries[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                // slow down so that speed is same as other adversary
                this.velocity.x *= -1;
                this.dodgeTimer = 30;
                this.dodged = true;
            }
            // check collide y
            if(game.adversaries[i] != this && game.adversaries[i].health > 0 && game.adversaries[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                this.velocity.y *= -1; 
                game.adversaries[i].velocity.y *= -1;
            }
        }

        // check for collisions with walls
        for(var i = 0; i < game.walls.length; i++){
            // check collide x
            // if collide x, go back, then try to avoid by going straight down
            if(game.walls[i] != this  && game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                this.velocity = new createVector(0, 1);
                this.wallTimer = 30;
                this.wallHit = true;
            }
            // check collide y
            if(game.walls[i] != this && game.walls[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                this.velocity.y *= -1; 
            }
        }

        // if hit top of screen or border wall, reverse y direction
        if(this.position.y + this.velocity.y < 10 || this.position.y + this.velocity.y > 340){
            this.velocity.y *= -1;
        }

        // update position
        this.position.add(this.velocity);

        // if out of screen, game is over
        if(this.position.x > 410){
            game.state = 2;
            game.won = false;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
/* ball
    * a ball is defined with an x, y (where x, y is its center)
    * and with a velocity (vx, vy). The size is also passed, so 
    * that smaller or larger ones can be created. A ball updates
    * its position according to that velocity, and will bounce off
    * of adversaries, walls, and the deck at the bottom of the screen.
    */
var ball = function(x, y, vx, vy, size){
    // construct with a position, and a velocity
    this.position = new createVector(x, y);
    this.velocity = new createVector(vx, vy);
    this.size = size;

    // threshold for predicting future collisions
    this.collisionThresh = 10;

    // draw ball as a circular cannonball
    this.draw = function(menu, x, y){
        push();
        // if menu switch is true, want to draw at given x, y
        if(menu){
            translate(x, y);
        }else{
            // draw relative to center of ball
            translate(this.position.x, this.position.y);
        }
        stroke(60, 184, 11);
        strokeWeight(2);
        fill(0, 0, 0);
        ellipse(0, 0, this.size, this.size);
        pop();
    };

    // check collision of something with an x, y with ball
    // return true if the otherX, otherY collide with this ball, otherwise false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.position.x) < this.size/2 + otherSize/2 && abs(otherY - this.position.y) < this.size/2 + otherSize/2){
            return true;
        }else {
            return false;
        }
    };

    // update vectors 
    this.update = function(){

        // check if collide with adversarys
        for(var i = 0; i < game.adversaries.length; i++){
            // only check adversaries that are undefeated 
            if(game.adversaries[i].health > 0){
                
                // if collide, decrease adversary health and change velocity heading
                var collide = false;
                // check collide with x
                if(game.adversaries[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                    collide = true;
                    this.velocity.x *= -1;
                }
                // check collide with y
                if(game.adversaries[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                    collide = true;
                    this.velocity.y *= -1;
                }

                // need collide switch so if hit from corner, don't do double damage
                if(collide){
                    // decrease health of adversary
                    game.adversaries[i].health--;
                    // if defeat adversary, indicate game counter such 
                    if(game.adversaries[i].health === 0){
                        game.numLeft--;
                        game.fountains.push(new fountainObj(game.adversaries[i].position.x, game.adversaries[i].position.y, 60));

                        // if destroy powerup advesary, boost player's shoot speed temporarily
                        if(game.adversaries[i].powerup){
                            game.player.shootSpeed *= 0.5;
                            game.player.powerTimer = 151;
                        }
                        // if destroy triple shooting powerup ship, make player temporarily
                        // shoot 3 cannonballs
                        else if(game.adversaries[i].triple){
                            game.player.tripleTimer = 151;
                        }
                        // if destroy inhibitor adversary, harm player's shoot speed temporarily
                        else if(game.adversaries[i].inhibitor){
                            game.player.shootSpeed *= 2;
                            game.player.inhibitTimer = 151;
                        }
                    }
                }
            }
        }

        // check if collide with wall, if so bounce off wall
        for(var i = 0; i < game.walls.length; i++){
            // check collide with x
            if(game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                this.velocity.x *= -1;
            }
            // check collide with y
            if(game.walls[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                this.velocity.y *= -1;
            }
        }

        // if collide with another ball, bounce off
        for(var i = 0; i < game.balls.length; i++){
            // check collide with x
            if(game.balls[i] != this && game.balls[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                this.velocity.x *= -1;
                game.balls[i].velocity.x *= -1;
            }
            // check collide with y
            if(game.balls[i] != this && game.balls[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                this.velocity.y *= -1;
                game.balls[i].velocity.y *= -1;
            }
        }

        // if come back over line, with postive velocity, revert
        if(this.velocity.y > 0 && this.position.y + this.velocity.y > 350 - this.size/2){
            this.velocity.y *= -1;
        }

        // update position with potentially modidified velocity
        this.position.add(this.velocity);

    };

    // check future collision of something with an x, y with ball
    // by checking collision of 10*velocity + position of both
    this.collidesWithFuture = function(otherXp, otherYp, otherXv, otherYv, otherSize){
        if(abs(otherXp + this.collisionThresh*otherXv - this.position.x - this.velocity.x*this.collisionThresh) < this.size/2 + otherSize/2 
            && abs(otherYp + this.collisionThresh*otherYv - this.position.y - this.velocity.y*this.collisionThresh) < this.size/2 + otherSize/2 ){
            return true;
        }else {
            return false;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
/* player
*  a player is defined with an x, y which does not 
* change. A player is a cannon that can rotate left
* or right to a ceratian angle. When the player presses
* the up arrow key, they shoot a ball (or 3 balls if powered)
*/
var player = function(x, y) {
    this.position = new createVector(x, y);
    this.size = 20;

    // store angle in degrees
    this.angle = 0;

    // timer to track when ball can be shot again
    this.ballTimer = 0;
    this.shootSpeed = 30;
    // timers to track if player is inhibited, powered up, or not 
    this.powerTimer = 0;
    this.inhibitTimer = 0;
    this.tripleTimer = 0;
    
    // need to have acceleration for angle
    this.angleAcceleration = 0;
    this.angleVelocity = 0;
    this.angleDrag = 0.85;

    // speed to launch new ball at
    this.ballspeed = 5;

    this.draw = function(menu, x, y){
        push();
        if(menu){
            translate(x, y);
        }else{
            // draw according to current position
            translate(this.position.x, this.position.y);
        }
        rotate(radians(this.angle));
        stroke(0, 0, 0);
        strokeWeight(0.5);
        // draw cannon wheels
        fill(138, 92, 28);
        rect(-this.size/2, -2, this.size, 4);
        rect(-this.size/2 + 6, -this.size/2 + 4, 8, 12);
        rect(-this.size/2 + 1, -this.size/2 + 2, 2, 16);
        rect(this.size/2 - 3, -this.size/2 + 2, 2, 16);
        // draw cannon body
        fill(0, 0, 0);

        // draw cannon body depending on if powered up or not
        // if powered up, draw long body
        if(this.powerTimer > 0){
            rect(-3, -20, 6, 30);
            rect(-2, 8, 4, 4);
        }
        // if inhibited, add a green glow to body
        else if(this.inhibitTimer > 0){
            stroke(60, 184, 11);
            rect(-3, -15, 6, 25);
            noStroke();
            rect(-2, 8, 4, 4);
        }
        // if triple mode is activated, draw 3 barrels
        else if(this.tripleTimer > 0){
            rect(-3, -15, 6, 25);
            rect(-2, 8, 4, 4);
            rotate(radians(-30));
            rect(-2, -15, 4, 17);
            rotate(radians(60));
            rect(-2, -15, 4, 17);
            rotate(radians(-30));
        }
        // otherwise draw normally
        else{
            rect(-3, -15, 6, 25);
            rect(-2, 8, 4, 4);
        }
        pop();
    };

    // update player by updating vectors
    this.update = function(){
        this.angleAcceleration = 0;

        // update angle according to key array
        if (game.keyArray[LEFT_ARROW] === 1) {
            this.angleAcceleration = -1;
        }
        if (game.keyArray[RIGHT_ARROW] === 1) {
            this.angleAcceleration = 1;
        }

        // use acceleration and velocity to update angle
        this.angleVelocity += this.angleAcceleration;
        this.angleVelocity *= this.angleDrag;
        this.angle += this.angleVelocity;

        // do not allow angle to exceed L/R threshold
        if(this.angle < - 80){
            this.angle = -80;
        }
        if(this.angle > 80){
            this.angle = 80;
        }

        // launch ball if player presses up key
        if (game.keyArray[UP_ARROW] === 1 && this.ballTimer === 0) {
        
            // if triple timer is activated, shoot 3 smaller balls
            if(this.tripleTimer > 0){
                // do not shoot left most ball when angle is less than -55
                if(this.angle > -55){
                    game.balls.push(new ball(this.position.x + cos(radians(this.angle - 120))*20, this.position.y + sin(radians(this.angle - 120))*20, 
                        cos(radians(this.angle - 120))*this.ballspeed, sin(radians(this.angle - 120))*this.ballspeed, 5));
                }
                game.balls.push(new ball(this.position.x + cos(radians(this.angle - 90))*20, this.position.y + sin(radians(this.angle - 90))*20, 
                    cos(radians(this.angle - 90))*this.ballspeed, sin(radians(this.angle - 90))*this.ballspeed, 5));
                // do not shoot right most ball when angle is greater than 55
                if(this.angle < 55){
                    game.balls.push(new ball(this.position.x + cos(radians(this.angle - 60))*20, this.position.y + sin(radians(this.angle - 60))*20, 
                        cos(radians(this.angle - 60))*this.ballspeed, sin(radians(this.angle - 60))*this.ballspeed, 5));
                }
            }
            // otherwise shoot one normal ball
            else{
                game.balls.push(new ball(this.position.x + cos(radians(this.angle - 90))*20, this.position.y + sin(radians(this.angle - 90))*20, 
                    cos(radians(this.angle - 90))*this.ballspeed, sin(radians(this.angle - 90))*this.ballspeed, 10));
            }


            this.ballTimer = this.shootSpeed;
        }

        // update ball timer 
        if(this.ballTimer > 0){
            this.ballTimer--;
        }

        // update powerup timer 
        if(this.powerTimer > 0){
            this.powerTimer--;
            if(this.powerTimer === 1){
                this.shootSpeed = 30;
            }
        }

        // update triple timer
        // update powerup timer 
        if(this.tripleTimer > 0){
            this.tripleTimer--;
        }

        // update inhibitor timer 
        if(this.inhibitTimer > 0){
            this.inhibitTimer--;
            if(this.inhibitTimer === 1){
                this.shootSpeed = 30;
            }
        }

    };
};

// ---------------------------------------------
// ---------------------------------------------
// draw things that need to be drawn from the 
// gameObject function
gameObject.prototype.draw = function(){  

    // increase frame count
    this.frameCount++;

    // draw menu
    if(this.state === 0){
        background(182, 227, 225);
        // draw menu text first
        textSize(20);
        fill(148, 100, 24);
        text("Pirrrate Battle", 140, 25);
        fill(0, 0, 0);
        textSize(15);
        text("Ahoy therrre, matey! We need yerrr help. The ", 40, 50);
        text("royal fleet is settin sail to our treasurrre, and we need", 15, 70);
        text("you to sink all theirrr ships. We have one cannon,", 15, 90);
        text("which you can rotate with the Left/Right arrrrow keys.", 15, 110);
        text("Use the UP arrrrow key to shoot a cannonball.", 15, 130);
        text("The cannon shoots currrsed cannonballs, which", 15, 150);
        text("bounce off enemy ships and boxes floatin in the sea.", 15, 170);
        text("You must sink all of theirrr ships comin from the West", 15, 190);
        text("beforrre they can make it East. They can take thrrree", 15, 210);
        text("shots each. Some of the ships becursed, and will hurrrt", 15, 230);
        text("you when destroyed: blue sails do nothing, green sails", 15, 250);
        text("will make you shoot slowerrr, orrrange sails will make", 15, 270);
        text(" you shoot fasterrr, and purrrple sails will make you", 15, 290);
        text("shoot thrrree shots at once.", 15, 310);
        text("Click to Start", 150, 380);
        // then draw menu items
        this.player.angle = 70;
        this.player.draw(true, 100, 370);
        this.player.angle = 0;
        this.menuItems[0].draw(true, 50, 340);
        this.menuItems[1].draw(true, 150, 350);
        this.menuItems[2].draw(true, 280, 320);
        this.menuItems[3].draw(true, 350, 350);
        this.menuItems[4].draw(true, 300, 370);
        this.menuItems[5].draw(true, 320, 340);
    }
    // draw gameplay 
    else if(this.state === 1 || this.state === 2){

        background(30, 185, 212);

        // draw deck
        stroke(0, 0, 0);
        strokeWeight(2);
        line(0, 350, 400, 350);
        strokeWeight(0.5);
        fill(171, 135, 79);
        rect(0, 350, 400, 50);
        // draw planks
        for(var i = 0; i < 5; i++){
            line(0, 360 + i*10, 400, 360 + i*10);    
            for(var j = 0; j < 5; j++){
                if(i % 2 === 0){
                    line(j*80 + i*5, 350 + i*10, j*80 + i*5, 360 + i*10);
                }else{
                    line(j*80 + 40 + i*5, 350 + i*10, j*80 + 40 + i*5, 360 + i*10);
                }
            }
        }
        strokeWeight(1);

        // draw walls
        for(var i = 0; i < this.walls.length; i++){
            this.walls[i].draw(false, 0, 0);
        }

        // draw adversaries, but only those that are not defeated
        for(var i = 0; i < this.adversaries.length; i++){
            if(this.adversaries[i].health > 0){
                this.adversaries[i].draw(false, 0, 0);
            }
        }

        // if length fountains > 0, and if fountain[i] time left > 0 then draw
        // push fountain every time player defeated
        if(this.fountains.length > 0){
            for(var i = 0; i < this.fountains.length; i++){
                if(this.fountains[i].timeLeft > 0){
                    this.fountains[i].execute();
                }
            }
        }

        // draw player
        this.player.draw(false, 0, 0);

        // draw balls, but only appear in current frame
        // and only those that haven't been eaten
        for(var i = 0; i < this.balls.length; i++){
            this.balls[i].draw(false, 0, 0);
        }

        // if game over, draw menu
        if(this.state === 2){
            noStroke();
            fill(148, 100, 24);
            textSize(30);
            text("Game over!", 120, 30);
            textSize(20);
            fill(0, 0, 0);
            if(this.won){
                text("Avast! You got them all!", 100, 140);
                text("Grreat job", 100, 170)
            }else{
                text("Sorrry matey, they got", 100, 140);
                text("all the treasurrre...", 100, 170)
            }
            text("Click to return to menu", 100, 320);
        }


    }

};


//---------------------------------------------------
//---------------------------------------------------
/* handle key presses
    * each time key is pressed, record it
    */
    var keyPressed = function() {
    game.keyArray[keyCode] = 1;
};
// upon releasing a key that was previously recorded 
// as pressed, record it as released
var keyReleased = function() {
    game.keyArray[keyCode] = 0;
};

// ---------------------------------------------
// ---------------------------------------------
// update game's drawing state in this function
gameObject.prototype.update = function(){  
    if(this.state === 1){
        // update the player
        this.player.update();

        // update balls
        for(var i = 0; i < this.balls.length; i++){

            // only update if in screen
            if(this.balls[i].position.x > -20 && this.balls[i].position.x < 420 && this.balls[i].position.y > -20 && this.balls[i].position.y < 420){
                this.balls[i].update();
            }
            // otherwise set x, y to position adversaries won't collide with
            else{
                this.balls[i].position = new createVector(500, 500);
            }
        }

        // update adversaries that have not been defeated
        for(var i = 0; i < this.adversaries.length; i++){
            if(this.adversaries[i].health > 0){
                this.adversaries[i].update();
            }
        }

        // if player has defeated all adversaries, game is over
        if(this.numLeft === 0){
            game.state = 2;
            game.won = true;
        }

    }

};

// ---------------------------------------------
// ---------------------------------------------
/* setup the game by instantiating necessary objects
* this function gets once per game iteration 
*/
var setup = function(){
    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');

    angleMode(RADIANS);
    frameRate(30);

    // insantiate new game state
    game.setup();

};


//---------------------------------------------------
//---------------------------------------------------
/* handle mouse click events, depending on the state
    * of the game
    */
mouseReleased = function(){
    // if click mouse during menu, move to game
    if(game.state === 0 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        game.state = 1;
    }
    // if click in game over menu, move to menu
    // and re-initialize objects
    if(game.state === 2 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        game.state = 0;
        setup();
    }
}; 

// ---------------------------------------------
// ---------------------------------------------
var draw = function(){

    // every frame, draw and update drawing state
    game.draw();
    game.update();
    
};