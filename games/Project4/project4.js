// game object to contain all of the game's information
var gameObject = function(){
    // create a setup that can be called to initialized game
    this.setup = function(){
        // tilemap to contain map information, 50x50
        // w = wall
        // p = player
        // a = adversary
        this.tilemap = [
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
        "v                                                v",
        "v        a                                       v",
        "v                                           a    v",
        "v                                                v",
        "v                                                v",
        "v    wwwww                                       v",
        "v     vvv                   wwwww                v",
        "v                            vvv                 v",
        "v             wwwwwwwww                          v",
        "v              vvvvvvv                           v",
        "v     c                                          v",
        "v   wwww                                         v",
        "v   vvvv                                         v",
        "v   vvv              a                           v",
        "v   vv                                 c         v",
        "vw  v                              wwwwwwwww     v",
        "v   v                               vvvvvvv      v",
        "v   v                                            v",
        "v   v           wwwwwww                          v",
        "v  wv            vvvvv                           v",
        "v   v                                            v",
        "v                       a    wwwwwww             v",
        "v                             vvvvv              v",
        "vwwww                                            v",
        "vvvvv            wwwwww                          v",
        "vvvv              vvvv                           v",
        "vvv                                              v",
        "vv    wwwwww                                     v",
        "v      vvvv                                      v",
        "v                                                v",
        "v     a            c           wwwwwwww          v",
        "v              wwwwwwwww        vvvvvv    wwww   v",
        "v               vvvvvvv          vvvv      vv    v",
        "v                vvvvv                  a        v",
        "v                                                v",
        "v  wwwwww                                       wv",
        "v   vvvv                                         v",
        "v                                                v",
        "v                            c                   v",
        "v           wwwwww      wwwwwwww       wwwwww    v",
        "v            vvvv        vvvvvv         vvvv    wv",
        "v                                                v",
        "v                   a                            v",
        "v                                                v",
        "v                        wwwwwww       wwwwwww   v",
        "v                        v     v       v     v   v",
        "v                        v     v       v     v   v",
        "v p                    c v     v       v     v   v",
        "vwwwwwwwww   wwwww     wwv     v       v     v   v"
        ];
        // list to contain the walls
        this.walls = [];

        // list to contain the balls player drops
        this.balls = [];

        // list to contain collectible objects
        this.collectibles = [];
        // keep track of number of collectibles collected
        this.numCollected = 0;
        // list to contain adversaries
        this.adversaries = [];

        // keep track of keys currently pressed
        this.keyArray = [];

        // keep track of frames passed
        this.frameCount = 0;

        // keep track of current x and y of the center of the
        // frame, to keep track of a scrollable tilemap
        this.centerX = width/2;
        this.centerY = width/2;

        // keep track of "state" of game
        // 0 = menu
        // 1 = game
        // 2 = game over animation
        // 3 = game over menu
        this.state = 0;
        this.gameOverTimer = 0;

        // gravity is a force that points straight down
        this.gravity = createVector(0, 0.5);
    };
};

// instantiate game object for global usage, everything
// else gets encapsulated in this instance
var game = new gameObject();

// ---------------------------------------------
// ---------------------------------------------
/* Wall -
 * a wall has an x, y (center). All are the same size, 
 * and have the same texture. 
 * the vertical switch is used to indicate if walls have another wall above them.
 */
 var wall = function(x, y, vertical){
    this.x = x;
    this.y = y;
    this.size = 20;
    this.collideTimer = 0;
    this.vertical = vertical;

    // draw wall as a 20x20 rectangle with some 
    // brick like textures.
    // cx, cy are the center of the frame
    this.draw = function(cx, cy){
        push();
        // draw relative to center of frame
        var centerX = width/2 - cx;
        var centerY = width/2 - cy;
        translate(centerX, centerY);
        stroke(0, 0, 0);
        fill(156, 84, 17);
        rect(this.x, this.y, this.size, this.size);
        if(!vertical){
            fill(5, 110, 30);
            rect(this.x, this.y, this.size, 4);
        }

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
/* ball
 * a ball is constructed with an x, y position
 * and a x, y velocity - that of the player
 * at the moment the ball is dropped
 */
var ball = function(x, y, vx, vy){
    this.position = createVector(x, y);
    this.previousPosition = this.position;
    this.size = 5;

    // keep track of whether or not ball has been eaten by adversary
    this.eaten = false;

    // create vectors for acceleration and velocity
    // where velocity is that of player at time of construction
    // acceleration is gravity
    // also add horizontal drag to simulate rolling resistance
    this.velocity = createVector(vx, vy);
    this.acceleration = game.gravity;
    this.drag = createVector(0.99, 0);

    // have to have a bounce coefficient or will bounce to heavens
    this.bounceCoefficient = -0.6;

    // draw wall as a ellipse 
    // cx, cy are the center of the frame
    this.draw = function(cx, cy){
        push();
        // draw relative to center of frame
        translate(width/2 + this.position.x - cx + this.size/2, height/2 + this.position.y - cy + this.size/2);
        rotate(-this.velocity.heading());
        noStroke();
        fill(156, 22, 20);
        ellipse(0, 0, this.size, this.size);
        fill(17, 122, 13);
        rect(-1, -3, 2, 2);

        pop();
    };

    // update ball according to game's gravity
    this.update = function(){

        // update vectors
        this.velocity.add(this.acceleration);
        this.velocity.x *= this.drag.x;

        // first check bottom of screen, treat as wall
        if(this.position.y > 1000 - this.size){
            this.velocity.y *= this.bounceCoefficient;
            this.position.y = 1000 - this.size/2;
        }

        // check for collision with adversaries
        // if collide with adversary from above - defeat that adversary. 
        // if collide with adversary from side or below - adversary absorbs ball
        for(var i = 0; i < game.adversaries.length; i++){
            // only want to check for adversaries that are undefeated
            if(!game.adversaries[i].defeated){
                // check for collision of y portion of velocity vector
                 // have to adjust by -10 since walls upper left corner is its x,y
                if(game.adversaries[i].collidesWith(this.position.x - 10, this.position.y + this.velocity.y - 10, this.size)){
                    // from below, adversary eat ball
                    if(this.position.y + this.velocity.y - 10 > game.adversaries[i].position.y){
                        this.eaten = true;
                        // want to show adversary as catching ball
                        game.adversaries[i].ballTimer = 30;
                    }else{
                        game.adversaries[i].defeated = true;
                        game.adversaries[i].defeatTimer = 60;
                    }
                    this.eaten = true;
                }

                // check for collision with x portion of velocity. 
                // have to adjust by -8.5 since walls upper left corner is its x,y
                else if(game.adversaries[i].collidesWith(this.position.x + this.velocity.x - 10, this.position.y - 10, this.size)){
                    this.eaten = true;
                    // want to show adversary as catching ball
                    game.adversaries[i].ballTimer = 30;
                }
            }
        }
        
        // check for collisions with walls
        for(var i = 0; i < game.walls.length; i++){
            // check for collision of y portion of velocity vector
            // if collide, set y velocity to zero and check if standing on a wall
            // have to adjust by 8.5 since walls upper left corner is its x,y
            if(game.walls[i].collidesWith(this.position.x - 10, this.position.y + this.velocity.y - 10, this.size)){
                this.velocity.y *= this.bounceCoefficient; 
                if(this.position.y + this.velocity.y < game.walls[i].y){
                    this.position.y = game.walls[i].y- this.size/2;
                }else{
                    this.position.y = game.walls[i].y + game.walls[i].size + this.size/2;
                }
            }

            // check for collision with x portion of velocity. 
            // if collide, set x velocity to zero
            // have to adjust by 8.5 since walls upper left corner is its x,y
            else if(game.walls[i].collidesWith(this.position.x + this.velocity.x - 10, this.position.y - 10, this.size)){
                // if collide continue in same direction so flip bounce coeff.
                this.velocity.x *= this.bounceCoefficient; 
                
            }
        }
        
        // after checking for collisions and updating velocity, set position appropriately
        this.position.add(this.velocity);

    };

    
};

// ---------------------------------------------
// ---------------------------------------------
/* collectible
 *  a collectible has an x, y, and can be collected.
 * that state is stored in this object
 */
var collectible = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 10;

    // keep track of whether or not been collected yet
    this.collected = false;

    // draw relative to center of frame
    this.draw = function(cx, cy){
        push();
        // translate to center of frame
        var centerX = width/2 - cx;
        var centerY = width/2 - cy;
        translate(centerX, centerY);
        // draw banana
        stroke(0, 0, 0);
        strokeWeight(1.2);
        fill(189, 191, 38);
        arc(this.x + 10, this.y + 10, 16, 10, 0, PI + HALF_PI/3);
        line(this.x + 10, this.y + 10, this.x + 18, this.y + 10);
        line(this.x + 4, this.y + 7, this.x + 10, this.y + 10);
        fill(0, 0, 0);
        rect(this.x + 3, this.y + 6, 1, 1);
        pop();
    };

    // check collision of something with an x, y with collectible
    // return true if the otherX, otherY collide with this collectible,
    // otherwise return false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.x) < this.size/2 + otherSize/2 && abs(otherY - this.y) < this.size/2 + otherSize/2){
            return true;
        }else {
            return false;
        }
    };

    // update spin timer according to game's frame counter
    // also check for collision with player
    this.update = function(fc){
        
        // check for collision with player
        if(this.collidesWith(game.player.position.x, game.player.position.y, game.player.size)){
            this.collected = true;
            game.numCollected++;
        }

    };

};

// ---------------------------------------------
// ---------------------------------------------
/* 
 * adversary
 * an adversary has an x, y, a velocity and an 
 * acceleration. It will wander in a random direction for 
 * a set amount of time, then change direction. However,
 * if a player is near the adversary will head toward 
 * the player. If the edge of the screen is near, the
 * adversary will reverse direction, and pick a new one.
 */
var adversary = function(x, y){
    this.position = createVector(x, y);
    this.size = 18;
    // define vectors
    // start pointing random direction
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(random(-1, 1), random(-1, 1));
    this.drag = 0.7;

    // keep track of wadering/chasing state, start wandering
    this.wandering = true;
    this.frameCounter = 0;

    // keep switch for drawing wings
    this.drawSwitch = 1;

    // keep timer for drawing when catch ball
    this.ballTimer = 0;

    // keep track of whether or not adversary has been defeated
    this.defeated = false;
    this.defeatTimer = 0;

    // cx, cy = center of frame
    // want to draw adversary relative to center of frame so can appear
    // on correct position of tilemap
    // fc = frame counter, so can draw flapping wings
    this.draw = function(cx, cy, fc){
        // adjust coordinates so 0, 0 is center of drawing space for this adversary
        push();
        translate(width/2 + this.position.x + this.size/2 - cx, height/2 + this.position.y + this.size/2 - cy);

        // draw monkey
        //wings
        fill(11, 47, 125);
        noStroke();
        if(this.drawSwitch === 1){
            quad(-8, -8, -7, 0, 0, 0, 0, -2);
            quad(8, -8, 7, 0, 0, 0, 0, -2);
        }else{
            quad(-4, -8, -3, 0, 0, 0, 0, -2);
            quad(4, -8, 3, 0, 0, 0, 0, -2);
        }
        if(fc % 5 === 0){
            this.drawSwitch *= -1;
        }
        // body
        noStroke();
        fill(143, 97, 19);
        rect(-4, -4, 8, 8);
        fill(199, 151, 70);
        rect(-2, -2, 4, 4);
        // head
        // draw differently if defeated
        if(this.defeatTimer > 0){
            fill(156, 22, 20);
            ellipse(0, -6, 5, 5);
        }else{
            fill(143, 97, 19);
            rect(-2, -8, 4, 4);
            rect(-3, -9, 2, 2);
            rect(1, -9, 2, 2);
            fill(0, 0, 0);
            rect(-2, -7, 1, 1);
            rect(1, -7, 1, 1);
        }
        // arms, only draw if not catching a ball
        fill(143, 97, 19);
        if(this.ballTimer === 0){
            rect(2, -4, 6, 2);
            rect(7, -4, 2, 4);
            rect(-8, -4, 6, 2);
            rect(-8, -4, 2, 4);
        }
        // legs
        rect(1, 2, 2, 6);
        rect(-3, 2, 2, 6);

        // ball catch, if applicable
        if(this.ballTimer > 0){
            fill(156, 22, 20);
            ellipse(0, 0, 5, 5);
            fill(17, 122, 13);
            rect(-1, -3, 2, 2);
            this.ballTimer--;
        }

        pop();
    };

    // check collision of something with an x, y with adversary
    // return true if the otherX, otherY collide with this adversary,
    // otherwise return false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.position.x) < this.size/2 + otherSize/2 && abs(otherY - this.position.y) < this.size/2 + otherSize/2){
            return true;
        }else {
            return false;
        }
    };

    // chase by making a b-line straight for the player
    this.chase = function(){
        // calculate x and y distance to player
        var distX = game.player.position.x - this.position.x;
        var distY = game.player.position.y - this.position.y;

        // now if player is within vicinity, chase
        if(sqrt(distX*distX + distY*distY) < 100){
            this.acceleration = createVector(distX, distY);
            this.acceleration.normalize();
        }else{
            this.wandering = false;
        }
    };

    // wander by calculating new acceleration vectory after 2 seconds
    this.wander = function(){
        if(this.frameCounter % 60 === 0){
            this.acceleration = createVector(random(-1, 1), random(-1, 1));
        }
    };

    // update position and velocity 
    // so that if roaming - pick createVector, go that way
    // if player in certain radius - chase that player
    this.update = function(){
        // treat case of defeated/not defeated differently
        if(this.defeatTimer > 0){
            // if defeated, want to fall towards boittom of screen
            this.velocity.add(game.gravity);
            this.position.add(this.velocity);

            this.defeatTimer--;
        }else{
            // if not chasing, call wander function and check if player
            // is near so can update state
            if(this.wandering){
                this.wander();
                // check if player is within vicinity, if so chase
                var distX = game.player.position.x - this.position.x;
                var distY = game.player.position.y - this.position.y;
                if(sqrt(distX*distX + distY*distY) < 300){
                    this.wandering = false;
                }
            }else{
                this.chase();
            }
        
            this.velocity.add(this.acceleration);
            this.velocity.mult(this.drag);
            this.position.add(this.velocity);

            var turnAround = false;

            // check for collision with other adversaries
            for(var i = 0; i < game.adversaries.length; i++){
                // only want to check for adversaries that are undefeated and not self
                if(!game.adversaries[i].defeated){
                    if(game.adversaries[i].collidesWith(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.size) && game.adversaries[i] !== this){
                        turnAround = true;
                    }
                }
            }
            /*
            // check for collisions with walls
            for(var i = 0; i < game.walls.length; i++){
                if(game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.size)){
                    turnAround = true;
                }
            }*/

            // check for collision with edge of screen, if so 
            // turn around and choose new direction to wander
            if(this.position.x + this.velocity.x > 980 || this.position.x + this.velocity.x < 0){
                turnAround = true;
            }
            if(this.position.y + this.velocity.y > 980 || this.position.y + this.velocity.y < 0){
                turnAround = true;
            }

            // if adversary is about to run into wall, another adversary, or edge of screen, make sure
            // to turn around, and createa  new acceleration vector
            if(turnAround){
                this.velocity.mult(-1);
                this.position.add(this.velocity);
                this.acceleration = createVector(random(-1, 1), random(-1, 1));
                this.frameCounter = 0;
            }
            this.frameCounter++;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
/* Player
*  A player has an x, y, a velocity and acceleration.
* The player is controlled left/right with the L/R arrow keys
* and then is able to jump with the up arrow key. The down 
* arrow key is used to drop a ball. When a player hits a wall
* from the side, they will not be able to go through it. When 
* they fall onto a platform, they will bounce slightly and not
* go through it. When a player collides with a collectible,
* they collect it. When a player collides with an adversary, 
* the game is over.
*/
var player = function(x, y) {
    this.position = createVector(x, y);
    this.size = 20;

    // keep track of state of jumping
    // 0 = not jumping
    // 1 = hit jump button 
    // 2 = jumping
    this.jump = 0;
    this.jumpForce = createVector(0, -10);
    this.fallCoefficient = 1;

    // keep a timer for when dropped last ball
    this.ballTimer = 0;
    // keep track of number of balls left
    this.ballsLeft = 10;

    // for switching legs when drawing
    this.drawSwitch = 1;

    // need to know if defeated
    this.defeatTimer = 0; 

    // track direction pointing, start pointing right
    this.angle = 0;
    // want to track acceleration and velocity for movement
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.drag = 0.825;

    // draw player according to position, and direction
    // use frame counter to track running
    // if x and y are nonzero, draw at position (for menu stuff)
    this.draw = function(fc, x, y){
        push();
        if(x === 0 && y === 0){
            // draw player at center if need to scroll,
            // otherwise draw at certain position
            var xMod = 0;
            var yMod = 0;
            if(this.position.x < 200 ){   
                xMod = this.position.x - 200;
            }
            if(this.position.x > 800 ){   
                xMod = this.position.x - 800;
            }

            if(this.position.y < 200 ){   
                yMod = this.position.y - 200;
            }
            if(this.position.y > 800 ){   
                yMod = this.position.y - 800;
            }

            // translate then rotate drawing according to 
            // direction, add 10 to make sure 0,0 for these
            // drawings is center of player
            yMod += 10;
            xMod += 10;

            translate(width/2 + xMod, width/2 + yMod);
        }
        else{
            translate(x, y);
        }

        // need to flip so can run in other direction
        if(this.angle === PI){
            scale(-1, 1);
        }   

        // draw deer
        //body
        fill(128, 86, 19);
        noStroke();
        rect(-10, -2, 16, 6);
        rect(-10, -2, 1, -3);
        //legs and feet
        if(this.jump === 2){
            // draw jumping
            rect(-8, 4, -6, 2);
            rect(-4, 4, -6, 2);
            rect(0, 4, 6, 2);
            rect(4, 4, 6, 2);
            fill(43, 30, 10);
            rect(-14, 4, 2, 2);
            rect(8, 4, 2, 2);
        }
        // draw running / standing still
        else{
            if(fc % 5 === 0){
                this.drawSwitch *= -1;
            }

            if(abs(this.velocity.x) > 0.5){
                // draw running by alternating between these two
                if(this.drawSwitch === -1){
                    rect(-8, 4, -6, 2);
                    rect(-6, 4, 2, 6);
                    rect(0, 4, 6, 2);
                    rect(4, 4, 2, 6);
                    fill(43, 30, 10);
                    rect(-14, 4, 2, 2);
                    rect(-6, 8, 2, 2);
                    rect(4, 8, 2, 2);
                    rect(6, 4, 2, 2);
                }else{
                    rect(-10, 4, 2, 6);
                    rect(-4, 4, -6, 2);
                    rect(0, 4, 2, 6);
                    rect(4, 4, 6, 2);
                    fill(43, 30, 10);
                    rect(-10, 8, 2, 2);
                    rect(-12, 4, 2, 2);
                    rect(0, 8, 2, 2);
                    rect(8, 4, 2, 2);
                }
            }
            else{
            // draw standing still
            rect(-10, 4, 2, 6);
            rect(-6, 4, 2, 6);
            rect(0, 4, 2, 6);
            rect(4, 4, 2, 6);
            fill(43, 30, 10);
            rect(-10, 8, 2, 2);
            rect(-6, 8, 2, 2);
            rect(0, 8, 2, 2);
            rect(4, 8, 2, 2);
            }

        }
        // head
        fill(128, 86, 19);
        rect(2, -6, 6, 4);
        // eye
        fill(0, 0, 0);
        rect(4, -5, 1, 1);
        // antlers
        fill(92, 63, 18);
        rect(3, -10, 1, 5);
        rect(0, -8, 6, 1);
        rect(0, -10, 1, 4);

        // draw tomato in mouth if can drop one
        if(this.ballTimer === 0 && game.balls.length < 10){
            fill(156, 22, 20);
            ellipse(8, -2, 4, 4);
        }

        pop();
    };

    // update player's position according to what
    // keys are pressed and the current state of
    // the player and game.
    this.update = function(){
        // if defeated just dead drop
        if(this.defeatTimer > 0){
            this.acceleration = game.gravity;
            this.velocity.add(this.acceleration);
        }
        // otherwise update normally
        else{
            // generate movement vector to add to player's current
            // but since doing every frame make sure to add
            // zero if no input is provided.

            // handle left/right movement
            // as an acceleration vector
            var move = createVector(0, 0);

            if (game.keyArray[LEFT_ARROW] === 1) {
                this.angle = PI;
                move.x += -1;
            }

            if (game.keyArray[RIGHT_ARROW] === 1) {
                this.angle = 0;
                move.x += 1;
            }

            // if player pressess down arrow, and can
            // still drop a ball, and timer has expired,
            // drop a ball with player's x, y, and x velocity
            if(game.keyArray[DOWN_ARROW] === 1 && this.ballTimer === 0){
                if(this.ballsLeft > 0){
                    game.balls.push(new ball(this.position.x + this.size/2 + 5, this.position.y + this.size/2, 
                                            this.velocity.x, 0));
                    this.ballTimer = 30;
                    this.ballsLeft--;
                }
            }
            if(this.ballTimer > 0){
                this.ballTimer--;
            }

            // if player presses up arrow and not currently
            // jumping, they can jump
            if(game.keyArray[UP_ARROW] === 1 && this.jump === 0){
                this.jump  = 1;
            }

            // handle adding jump to acceleration
            // if player just pressed jump, add 
            else if(this.jump === 1){
                move.y = this.jumpForce.y;
                this.jump = 2;
            }
            // if user jumping, y force is zero, and on a platform,
            // restore player's ability to jump again
            else if(this.jump === 2 && this.velocity.y === 0 && this.wallBelow){
                this.jump = 0;
            }

            // add gravity force
            move.add(game.gravity);
            move.y *= this.fallCoefficient;

            // update vectors
            this.velocity.add(move);
            this.velocity.x *= this.drag;

            // check for collisions with walls
            // need to know if wall is below or not, so can restore
            // players ability to jump
            this.wallBelow = false;
            for(var i = 0; i < game.walls.length; i++){
                // check for collision of y portion of velocity vector
                // if collide, set y velocity to zero and check if standing on a wall
                if(game.walls[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                    this.velocity.y = 0; 
                    // if standing on a wall, mark as such
                    if(this.position.y + this.velocity.y < game.walls[i].y){
                        this.wallBelow = true;
                    }
                }

                // check for collision with x portion of velocity. 
                // if collide, set x velocity to zero
                if(game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                    this.velocity.x = 0; 
                }

                // check collide with bof x and y
                // do in order to not get stuck in a corner 
                if(game.walls[i].collidesWith(this.position.x, this.position.y, this.size)){
                    // if so get amount overlapping
                    var overLapX = abs(game.walls[i].x - this.position.x) - this.size/2 - game.walls[i].size/2;
                    var overLapY = abs(game.walls[i].y - this.position.y) - this.size/2 - game.walls[i].size/2;
                    // and add/subtract that value appropriately
                    if(game.walls[i].x < this.position.x){
                        this.position.x -= overLapX;
                    }else{
                        this.position.x += overLapX;
                    }
                    if(game.walls[i].y < this.position.y){
                        this.position.y -= overLapY;
                    }else{
                        this.position.y += overLapY;
                    }
                }

            }
        } 

        // after checking for collisions and updating velocity, set position appropriately
        this.position.add(this.velocity);       

    };
};

// ---------------------------------------------
// ---------------------------------------------
// convert tilemap into objects for game object
gameObject.prototype.readTileMap = function(){
    // x and y are flipped for this loop because when
    // iterating, each line of the tilemap is the y
    // and each character of that line is the x
    for(var y = 0; y < this.tilemap.length; y++){
        for(var x = 0; x < this.tilemap[y].length; x++){
            // if encounter a wall, add to walls list
            // depending on if vertical or not
            if(this.tilemap[y][x] === "w"){
                this.walls.push(new wall(x*20, y*20, false));
            }else if(this.tilemap[y][x] === "v"){
                this.walls.push(new wall(x*20, y*20, true));
            }
            // if encounter a player, create the player
            // note that there should only be one, so 
            // no checks for that.
            else if(this.tilemap[y][x] === "p"){
                this.player = new player(x*20, y*20);

                // also set center of game's view to be that
                // of the player's position
                this.centerX = this.player.position.x;
                this.centerY = this.player.position.y;
            }        
            // if encounter adversary, add to adversaries list  
            else if(this.tilemap[y][x] === "a"){
                this.adversaries.push(new adversary(x*20, y*20));
            }          
            // if encounter collectible, add to collectibles list  
            else if(this.tilemap[y][x] === "c"){
                this.collectibles.push(new collectible(x*20, y*20));
            }          
        }
    }
};

// ---------------------------------------------
// ---------------------------------------------
// draw things that need to be drawn from the 
// gameObject function
gameObject.prototype.draw = function(){  
    // draw menu
    noStroke();
    if(game.state === 0){
        fill(43, 30, 10);
        textSize(25);
        text("Monkeys and Tomatoes", 50, 50);
        textSize(18);
        fill(128, 86, 19);
        text("Everyone knows monkey's like tomatoes,", 30, 75);
        text("right? And deer like bananas? In this game,", 20, 100);
        text("you are a deer and are trying to collect all", 20, 125);
        text("the bananas. The 5 evil flying monkeys, ", 20, 150);
        text("however, are trying to stop you from doing", 20, 175);
        text("so. Luckily, you brought tomatoes to throw!", 20, 200);
        text("The flying monkeys will flee when hit on the", 20, 225);
        text("head, but will catch the tomatoes when hit", 20, 250);
        text("from the side/bottom. Collect all of the 5", 20, 275);
        text("bananas to win!", 20, 300);
        fill(0, 0, 0);
        textSize(16);
        text("Left/Right arrow keys = move       Up = jump", 20, 322);
        text("Down = drop tomato", 20, 345);
        text("Click to start", 150, 380);
        // then draw deer and bananas and tomatoes and adversary
        this.player.draw(0, 370, 120);
        this.drawMonkey.draw(-140, 60);
        // tomato
        fill(156, 22, 20);
        ellipse(380, 195, 5, 5);
        fill(2, 120, 26);
        rect(379, 192, 2, 2);
        //banana
        stroke(0, 0, 0);
        strokeWeight(1.2);
        fill(189, 191, 38);
        var tempX = 150;
        var tempY = 285;
        arc(tempX + 10, tempY + 10, 16, 10, 0, PI + HALF_PI/3);
        line(tempX + 10, tempY + 10, tempX + 18, tempY + 10);
        line(tempX + 4, tempY + 7, tempX + 10, tempY + 10);
        fill(0, 0, 0);
        rect(tempX + 3, tempY + 6, 1, 1);
    }
    // draw gameplay or game over menu
    else if(game.state === 1 || game.state === 2){
        // draw walls, but only those that appear within current
        // frame
        for(var i = 0; i < this.walls.length; i++){
            if(this.walls[i].x >= this.centerX - width/2 - 20 &&
                this.walls[i].x <= this.centerX + width/2 + 20 &&
                this.walls[i].y >= this.centerY - width/2 - 20 && 
                this.walls[i].y <= this.centerY + width/2 + 20){
                    this.walls[i].draw(this.centerX, this.centerY);
            }
        }

        // draw adversaries, but only those that are not defeated
        for(var i = 0; i < this.adversaries.length; i++){
            if(!this.adversaries[i].defeated || this.adversaries[i].defeatTimer > 0){
                this.adversaries[i].draw(this.centerX, this.centerY, this.frameCount);
            }
        }

        // draw collectibles, but only if not collected
        for(var i = 0; i < this.collectibles.length; i++){
            if(this.collectibles[i].x >= this.centerX - width/2 - 20 && this.collectibles[i].x <= this.centerX + width/2 + 20 && this.collectibles[i].y >= this.centerY - width/2 - 20 && this.collectibles[i].y <= this.centerY + width/2 + 20 && !this.collectibles[i].collected){
                this.collectibles[i].draw(this.centerX, this.centerY);
            }
        }

        // draw player
        this.player.draw(this.frameCount, 0, 0);

        // draw balls, but only appear in current frame
        // and only those that haven't been eaten
        for(var i = 0; i < this.balls.length; i++){
            if(this.balls[i].position.x >= this.centerX - width/2 - 20 &&
                this.balls[i].position.x <= this.centerX + width/2 + 20 &&
                this.balls[i].position.y >= this.centerY - width/2 - 20 && 
                this.balls[i].position.y <= this.centerY + width/2 + 20 &&
                !this.balls[i].eaten){
                    this.balls[i].draw(this.centerX, this.centerY);
            }
        }

        // draw bar at top to show number certain game metrics
        stroke(0, 0, 0);
        fill(227, 223, 204);
        rect(0, 0, width-1, 40);
        // draw ball indicator
        noStroke();
        textSize(15);
        fill(156, 22, 20);
        text("Tomatoes:", 8, 15);
        for(var i = 0; i < this.player.ballsLeft; i++){
            if(i < 5){
                fill(156, 22, 20);
                ellipse(15 + 10*i, 23, 5, 5);
                fill(2, 120, 26);
                rect(14 + 10*i, 20, 2, 2);
            }else{
                fill(156, 22, 20);
                ellipse(-35 + 10*i, 33, 5, 5);
                fill(2, 120, 26);
                rect(-36 + 10*i, 30, 2, 2);
            }
        }
        // draw enemies left
        noStroke();
        fill(143, 97, 19);
        text("Monkeys Left:", 100, 15);
        var enemyCounter = 0;
        for(var i = 0; i < this.adversaries.length; i++){
            if(!this.adversaries[i].defeated){
                // use monkey generated just for drawing, don't update so no frame count passed
                this.drawMonkey.draw(100 - enemyCounter*20, 182);
                enemyCounter++;
            }
        }
        // draw collectibles bar
        fill(166, 163, 18);
        noStroke();
        text("Bananas:", 270, 15);
        noFill();
        // draw empty holes, fill holes with collectbile when collected
        var collectbileCount = 0;
        for(var i = 0; i < this.collectibles.length; i++){
            fill(0, 0, 0);
            arc(280 + i*20, 25, 16, 10, 0, PI + HALF_PI/3);
            if(this.collectibles[i].collected){
                stroke(0, 0, 0);
                fill(189, 191, 38);
                arc(280 + collectbileCount*20, 26, 15, 9, 0, PI + HALF_PI/3);
                collectbileCount++;
            }
        }
    }
    // game over menu
    else if(game.state === 3){
        fill(0, 0, 0);
        textSize(30);
        text(this.gameOverMsg, 110, 60);
        textSize(20);
        fill(43, 30, 10);
        if(this.gameOverMsg === "You Win!"){
            text("You sure showed those monkeys!", 50, 100);
        }else{
            text("Now the monkey's are eating", 50, 100);
            text("all of your tomatoes :(", 50, 130);
        }

        fill(0, 0, 0);
        text("Click to return to starting screen", 60, 380);
    }

};

// ---------------------------------------------
// ---------------------------------------------
/* update game's center view, so that if player is not 
 * in a corner the player is at the center of the screen. 
 * if the player is in a corner, they are not in the center of the 
 * screen but move "freely" until they leave the corner again
*/
gameObject.prototype.adjustCenter = function(){     
    // update X
    if(game.player.position.x > 200 && game.player.position.x < 800){
        game.centerX = game.player.position.x;
    }else if(game.player.position.x < 200){
        game.centerX = 200;
    }else if(game.player.position.x > 800){
        game.centerX = 800;
    }
     // update y
     if(game.player.position.y > 200 && game.player.position.y < 800){
        game.centerY = game.player.position.y;
    }else if(game.player.position.y < 200){
        game.centerY = 200;
    }else if(game.player.position.y > 800){
        game.centerY = 800;
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

        // track if game needs to be over, in lose 
        var doGameLost = false; 

        // update balls, but only those that have not
        // been eaten
        for(var i = 0; i < this.balls.length; i++){
            if(!this.balls[i].eaten){
                this.balls[i].update();
            }
        }

        // update adversaries that have not been defeated
        for(var i = 0; i < this.adversaries.length; i++){
            if(!this.adversaries[i].defeated || this.adversaries[i].defeatTimer > 0){
                this.adversaries[i].update();
            }

            // if player has run into adversary, game is over
            if(this.adversaries[i].collidesWith(this.player.position.x, this.player.position.y, this.player.size)){
                doGameLost = true;
            }
        }

        // update collectibles that have not been collected
        for(var i = 0; i < this.collectibles.length; i++){
            if(!this.collectibles[i].collected){
                this.collectibles[i].update(this.frameCount);
            }
        }

        // update center of map
        this.adjustCenter();

        // if player has collected all of collectibles, game is over
        if(this.numCollected === this.collectibles.length){
            this.state = 2;
            this.player.velocity = createVector(-1, 0);
            this.gameOverMsg = "You Win!";
            this.gameOverTimer = 60;
            // go through and "defeat" rest of adversaries so they fall off screen
            for(var i = 0; i < this.adversaries.length; i++){
                if(!this.adversaries[i].defeated || this.adversaries[i].defeatTimer > 0){
                    this.adversaries[i].defeatTimer = 60;
                    this.adversaries[i].defeated = true;
                }
            }
        }

        // if player falls out of screen, player has lost
        if(this.player.position.y > 1000){
            doGameLost = true;
        }

        // update player's state since they lost
        if(doGameLost){
            game.state = 2;
            this.gameOverMsg = "You lose!";
            this.gameOverTimer = 60;
            // go through and "defeat" rest of adversaries so they fall off screen
            for(var i = 0; i < this.adversaries.length; i++){
                if(!this.adversaries[i].defeated || this.adversaries[i].defeatTimer > 0){
                    this.adversaries[i].defeatTimer = 60;
                    this.adversaries[i].defeated = true;
                }
            }
            // also defeat player
            this.player.defeatTimer = 60;
            this.player.defeated = true;
        }

    }else if(this.state === 2){

        // update balls, but only those that have not
        // been eaten
        for(var i = 0; i < this.balls.length; i++){
            if(!this.balls[i].eaten){
                this.balls[i].update();
            }
        }

        // update adversaries that have not been defeated
        for(var i = 0; i < this.adversaries.length; i++){
            if(!this.adversaries[i].defeated || this.adversaries[i].defeatTimer > 0){
                this.adversaries[i].update();
            }
        }

        this.player.update();
        
        this.gameOverTimer--;
        if(this.gameOverTimer === 0){
            this.state = 3;
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
    // parse tilemap
    game.readTileMap();

    // create monkey just for drawing 
    game.drawMonkey = new adversary(0, 0);
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
    if(game.state === 3 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        game.state = 0;
        setup();
    }
}; 

 // ---------------------------------------------
// ---------------------------------------------
var draw = function(){

    // set background to sky color
    background(188, 245, 244); 
    // draw grass
    fill(110, 191, 107);
    stroke(0, 0, 0);
    strokeWeight(0.5);
    rect(-10, 350, 420, 120);
    // draw sun
    fill(230, 237, 100);
    ellipse(380, 20, 100, 100);


    // every frarme increase frame counter
    game.frameCount++;

    // every frame, draw and update drawing state
    game.draw();
    game.update();
    
};