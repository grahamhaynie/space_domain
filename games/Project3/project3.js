// ---------------------------------------------
// ---------------------------------------------
/* GameObject - 
* this is an object to hold the 
* state of the game - or the data 
* for this specific instance of the game
*/

var gameObject = function(){
    // create a setup that can be called to initialized game
    this.setup = function(){
        // tilemap to contain map information, 50x50
        // w = wall
        // p = player
        // a = adversary
        this.tilemap = [
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
        "w                                                w",
        "w p                                              w",
        "w                                                w",
        "w                                                w",
        "w     wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww      w",
        "w     w                                   w      w",
        "w     w                                   w      w",
        "w     w                                   w      w",
        "w                                                w",
        "w                                                w",
        "w              a                  a              w",
        "w                                                w",
        "w     w                                   w      w",
        "w     w                                   w      w",
        "w     w                                   w      w",
        "w     wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww      w",
        "w                                                w",
        "w    a                                      a    w",
        "w                 a                              w",
        "w                                                w",
        "w                                                w",
        "w                                                w",
        "w                                                w",
        "w                         a                      w",
        "w       a                                        w",
        "w                                                w",
        "w                                           a    w",
        "wwwwwww      wwwwwww                             w",
        "w                  w                             w",
        "w                  w                             w",
        "w                  w    a                        w",
        "w                  w                  a          w",
        "w       a          w                             w",
        "w                  w                             w",
        "wwwwwwwwwwwwwwwwwwww          wwwwwwwwwwwwwwwwwwww",
        "w                             w                  w",
        "w    a                        w                  w",
        "w                     a       w           a      w",
        "w                                                w",
        "w                                                w",
        "w                                                w",
        "w                                                w",
        "w     wwwwwwwwwwwwwwwww       w      a           w",
        "w                             w                  w",
        "w    a                        w                  w",
        "w                       a     w                  w",
        "w                             w                  w",
        "w                             w              a   w",
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
        ];
        // list to contain the walls
        this.walls = [];

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
        
        // these are for drawing the game over animation
        this.gameOverMsg = "";
        this.gameOverTimer = 0;
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
    */
var wall = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 20;

    // draw wall as a 20x20 rectangle with some 
    // brick like textures.
    // cx, cy are the center of the frame
    this.draw = function(cx, cy){
        push();
        // draw relative to center of frame
        var centerX = width/2 - cx;
        var centerY = width/2 - cy;
        translate(centerX, centerY);
        noStroke();
        fill(73, 78, 82);
        rect(this.x, this.y, this.size, this.size);
        fill(0, 0, 0);
        rect(this.x +4, this.y, 2, 20);
        rect(this.x + 14, this.y, 2, 20);
        rect(this.x, this.y + 4, 20, 2);
        rect(this.x, this.y + 14, 20, 2);
        pop();
    };

    // check collision of something with an x, y with wall
    // return true if the otherX, otherY collide with this wall,
    // otherwise return false
    this.collidesWith = function(otherX, otherY){
        if(abs(otherX - this.x) < this.size && abs(otherY - this.y) < this.size){
            return true;
        }else {
            return false;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
/* Collectible -
* a collectible has an x, y position in the map.
* the powerUp flag in the constructor is used to 
* define this collectible's instance as a powerUp
* or a regular collectible. Whether or not the 
* collectible has been collected is stored here as well.
*/
var collectible = function(x, y, powerUp){
    this.x = x;
    this.y = y;
    this.size = 15;
    this.collected = false;
    this.isPower = powerUp;

    // draw collectible as a disc
    // cx, cy = center of frame, so collectible
    // can be drawn in right location relative to tilemap
    this.draw = function(cx, cy){
        push();
        translate(width/2 - cx, height/2 - cy);
        // if not power up, draw as blue disc
        if(!this.isPower){
            stroke(0, 0, 0);
            fill(7, 179, 179);
            ellipse(this.x + 10, this.y + 10, this.size, this.size);
            noFill();
            ellipse(this.x + 10, this.y + 10, 5, 5);
        }
        // if power up, draw as red disc
        else{
            stroke(0, 0, 0);
            fill(184, 35, 35);
            ellipse(this.x + 10, this.y + 10, this.size, this.size);
            noFill();
            ellipse(this.x + 10, this.y + 10, 5, 5);
        }
        pop();
    }

    // check collision of player with collectible, 
    // if a collision occurs, mark it as collected
    // and increment game object's counter
    this.checkCollected = function(playerX, playerY){
        if(abs(playerX - this.x) <= 18 && abs(playerY - this.y) <= 18
            && !this.collected){
            this.collected = true;
            game.numCollected++;
            return true;
        }
    };
    
};

// ---------------------------------------------
// ---------------------------------------------
/* Adversary -
* an adversary has an x, y in the tilemap. 
* an adversary will start with a random direction, and 
* travel that direction either until a fixed amount of
* time expires, or a wall is encountered. In that case,
* the adversary bounces back the opposite direction of
* collision (180 degrees) and picks a new random direction.
* The adversary will chase the player if in a certain
* radius, but if the empowered player is in that radius
* it will flee the player. 
* If the adversary is defeated by a player, it explodes.
*/ 
var adversary = function(x, y){
    this.position = createVector(x, y);
    this.size = 20;
    // if chasing is true, either fleeing/chasing player
    // since fleeing is handled as opposite direction of chasing
    this.chasing = false;

    // want to send it random direction every 3 seconds
    this.frameCounter = 0;

    // track direction pointing, start pointing up
    this.angle = random(0, 2*PI);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(random(-1, 1), random(-1, 1));
    this.drag = 0.8;

    // keep track of when defeated so can add explosion animation
    this.explodeTimer = 0;
    this.defeated = false;
    this.explodeSize = 0;
    
    // cx, cy = center of frame
    // want to draw robot relative to center of frame so can appear
    // on correct position of tilemap
    this.draw = function(cx, cy){
        // adjust coordinates
        push();
        translate(width/2 + this.position.x - cx + this.size/2, height/2 + this.position.y - cy + this.size/2);
        rotate(this.angle);

        noStroke();

        fill(255, 0, 0);
        ellipse(0, 0, 5, 5);

        fill(0, 0, 0);
        rect(-8, -8, 3, 6);
        rect(6, -8, 3, 6);
        // draw body
        fill(194, 14, 207);
        quad(0, -10, this.size/2, 0, 0, this.size/2, -10, 0);
        // draw eyes
        fill(7, 179, 179);
        ellipse(-2, -2, 2, 2);
        ellipse(0, -4, 2, 2);
        ellipse(2, -2, 2, 2);

        // if exploding, draw as expanding circles of orange, red, and yellow
        if(this.explodeTimer > 0){
            // orange
            fill(222, 123, 47);
            ellipse(0, 0, this.explodeSize, this.explodeSize);
            // red
            fill(212, 30, 51);
            ellipse(0, 0, this.explodeSize - 10, this.explodeSize - 10);
            //yellow 
            fill(255, 244, 28);
            ellipse(0, 0, this.explodeSize - 20, this.explodeSize -20);

            this.explodeSize++;
            this.explodeTimer--;
        }

        pop();

    };

    // update position and velocity 
    // so that if roaming - pick createVector, go that way
    // if player in certain radius - chase that player
    this.update = function(){
        // if not chasing, call wander function and check if player
        // is near so can update state
        if(!this.chasing){
            this.wander();
            // check if player is within vicinity, if so chase
            var distX = game.player.position.x - this.position.x;
            var distY = game.player.position.y - this.position.y;
            if(sqrt(distX*distX + distY*distY) < 100){
                this.chasing = true;
            }
        }else{
            this.chase();
        }

        // update vectors 
        this.velocity.add(this.acceleration);
        this.velocity.mult(this.drag);
        this.position.add(this.velocity);

        this.angle = this.velocity.heading() + HALF_PI;
        
        // check for collision with walls, if collide turn around
        // and generation new acceleration vector
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i].collidesWith(this.position.x, this.position.y)){
                this.acceleration = createVector(random(-1, 1), random(-1, 1));
                this.velocity.mult(-1);
                this.position.add(this.velocity);
            }
        }
        this.frameCounter++;
    };

    // wander - if wandering,
    // every 90 frames choose a new acceleration vector randomly
    this.wander = function(){
        if(this.frameCounter % 90 === 0){
            this.acceleration = createVector(random(-1, 1), random(-1, 1));
        }
    };

    // chase - if chasing, get vector pointing at player
    // and use that for acceleration. if player is empowered
    // reverse that vector and travel the opposite direction 
    // of the player.
    this.chase = function(){
        // calculate x and y distance to player
        var distX = game.player.position.x - this.position.x;
        var distY = game.player.position.y - this.position.y;

        // now if player is within vicinity, chase
        if(sqrt(distX*distX + distY*distY) < 100){
            this.acceleration = createVector(distX, distY);
            this.acceleration.normalize();
        }else{
            this.chasing = false;
        }

        // however if player is empowered, flee
        if(game.player.empoweredTimer > 0){
            this.acceleration.mult(-1);
        }

    };

    // check collision with player, if adversary 
    // and player collide, set game to be over
    this.checkCollision = function(playerX, playerY){
        if(abs(playerX - this.position.x) < this.size - 5 && abs(playerY - this.position.y) < this.size - 5){
            return true;
        }else{
            return false;
        }
    };
};

// ---------------------------------------------
// ---------------------------------------------
/* A Player 
* a player is defined as having an x, y which are also 
* to be used as the center of the frame. The player can 
* be empowered to defeat enemies. The player can collect
* collectibles. The player moves according to vectors
* which are calculated by adding the current direction 
* the the ones the user adds with the arrow keys. The player
* bounces off walls.
*/ 
var player = function(x, y){
    this.position = createVector(x, y);
    this.size = 20;

    // keep track of how long player has been empowered.
    this.empoweredTimer = 0;

    // track direction pointing, start pointing up
    this.angle = 0;
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.drag = 0.825;

    // keep track of timers for drawing
    this.explodeTimer = 0;
    this.explodeSize = 0;

    // draw player according to position, and direction
    this.draw = function(){
        push();

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
        rotate(this.angle);

        // draw if not empowered as normal
        if(this.empoweredTimer === 0){
            // draw tread
            noStroke();
            fill(0, 0, 0);
            rect(this.size/4 - 8, -5, this.size/2 - 4, 14);
            // draw body
            fill(48, 48, 47);
            rect(this.size/4 - 10, this.size/3 - 10, this.size/2, this.size/2);
            rect(-10, this.size/3 - 7, this.size, this.size/4);
            rect(-10, this.size/4 - 10, 3, 10);
            rect(7, this.size/4 - 10, 3, 10);
            // lights
            fill(255, 0, 0);
            rect(this.size/3 - 10, this.size/4 - 7, 2, 2);
            rect(this.size/3 -6 , this.size/4 - 7, 2, 2);            
        }
        // draw as red if empowered
        else{
            // draw tread
            noStroke();
            fill(0, 0, 0);
            rect(this.size/4 - 8, -5, this.size/2 - 4, 14);
            // draw body
            fill(184, 35, 35);
            rect(this.size/4 - 10, this.size/3 - 10, this.size/2, this.size/2);
            rect(-10, this.size/3 - 7, this.size, this.size/4);
            rect(-10, this.size/4 - 10, 3, 10);
            rect(7, this.size/4 - 10, 3, 10);
            // lights
            fill(7, 179, 179);
            rect(this.size/3 - 10, this.size/4 - 7, 2, 2);
            rect(this.size/3 -6 , this.size/4 - 7, 2, 2);
        }

        // if robot is exploding, draw as expanding circles
        if(this.explodeTimer > 0){
            // orange
            fill(222, 123, 47);
            ellipse(0, 0, this.explodeSize, this.explodeSize);
            // red
            fill(212, 30, 51);
            ellipse(0, 0, this.explodeSize - 10, this.explodeSize - 10);
            //yellow 
            fill(255, 244, 28);
            ellipse(0, 0, this.explodeSize - 20, this.explodeSize -20);

            this.explodeSize++;
            this.explodeTimer--;
        }
        pop();
    };

    // update player with arrow keys
    // the player can move in any cardinal direction, or any
    // combination of them. Since vectors are used, the
    // movement of the player is smooth.
    this.update = function(){
        // generate movement vector to add to player's current
        // but since doing every frame make sure to add
        // zero if no input is provided.
        var xDir = 0;
        var yDir = 0;
        if (game.keyArray[LEFT_ARROW] === 1) {
            xDir = -1;
        }
        if (game.keyArray[RIGHT_ARROW] === 1) {
            xDir = 1;
        }
        if(game.keyArray[UP_ARROW] === 1){
            yDir = -1;
        }
        if(game.keyArray[DOWN_ARROW] === 1){
            yDir = 1;
        }

        // update vectors
        this.acceleration = createVector(xDir, yDir);
        this.velocity.add(this.acceleration);
        this.velocity.mult(this.drag);
        this.position.add(this.velocity);

        this.angle = this.velocity.heading() + HALF_PI;

        // check for collision with walls, if collide
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i].collidesWith(this.position.x, this.position.y)){
                var opp = this.velocity.mult(-1);
                this.position.add(this.velocity);

            }
        }
        
        // check for collision with collectibles, 
        // call collectible's collision checker
        for(var i = 0; i < game.collectibles.length; i++){
            if(game.collectibles[i].checkCollected(this.position.x + xDir, this.position.y + yDir)){
                // if collectable is a power up, empower player
                if(game.collectibles[i].isPower){
                    this.empoweredTimer = 120;
                }
            }
        }

        // if player is empowered, decrease countdown timer
        if(this.empoweredTimer > 0){
            this.empoweredTimer--;
        }

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
            if(this.tilemap[y][x] == "w"){
                this.walls.push(new wall(x*20, y*20));
            }
            // if encounter a player, create the player
            // note that there should only be one, so 
            // no checks for that.
            else if(this.tilemap[y][x] == "p"){
                this.player = new player(x*20, y*20);
            } 
            // if encounter adversary, create new one
            // add to adversary list
            else if(this.tilemap[y][x] == "a"){
                this.adversaries.push(new adversary(x*20, y*20));
            }
            // if encounter a blank space, have a small chance of making it 
            // a collectible
            else{
                var collect_chance = round(random(1, 20))
                if(collect_chance === 7){
                    // if encounter a collectible, 
                    // create a collectible by adding to that list
                    // collectibles have a random chance of being a powerup
                    var power_chance = round(random(1,10));
                    if(power_chance < 3){
                        this.collectibles.push(new collectible(x*20, y*20, true));
                    }else{
                        this.collectibles.push(new collectible(x*20, y*20, false));
                    } 
                } 
                
            }                               
        }
    }
};

// ---------------------------------------------
// ---------------------------------------------
// draw things that need to be drawn from the 
// gameObject function
gameObject.prototype.draw = function(){  
    // draw floor "tiles", keep constant so that floor
    // tiles do not move as game's frame moves
    stroke(160, 160, 160);
    for(var i = -20; i < 20; i++){
        line(0 , i*20, 400 -i*20, 400);
        line(400 - i*20, 0, 0, 400 - i*20);
    }

    // draw walls, but only those that appear within current
    // frame
    for(var i = 0; i < this.walls.length; i++){
        if(this.walls[i].x >= this.centerX - width/2 - 20&&
            this.walls[i].x <= this.centerX + width/2 + 20&&
            this.walls[i].y >= this.centerY - width/2 - 20&& 
            this.walls[i].y <= this.centerY + width/2 + 20){
            this.walls[i].draw(this.centerX, this.centerY);
        }
    }
    
    // draw collectibles, but only the ones that have
    // not been collected
    for(var i = 0; i < this.collectibles.length; i++){
        if(!this.collectibles[i].collected){
            this.collectibles[i].draw(game.centerX, game.centerY);
        }
    }

    // draw adversaries, but only those that are not defeated
    // or the ones that are exploding currently.
    for(var i = 0; i < this.adversaries.length; i++){
        if(!this.adversaries[i].defeated && this.adversaries[i].explodeTimer == 0){
            this.adversaries[i].draw(game.centerX, game.centerY);
        }else if(this.adversaries[i].explodeTimer > 0){
            this.adversaries[i].draw(game.centerX, game.centerY);
        }
    }

    // draw player
    this.player.draw();

};

// ---------------------------------------------
// ---------------------------------------------
// update game's drawing state in this function
gameObject.prototype.update = function(){  

    // update the player
    this.player.update();

    // update center of map
    this.adjustCenter();

    // check if player collides with adversary
    for(var i = 0; i < this.adversaries.length; i++){
        if(this.adversaries[i].checkCollision(this.player.position.x, 
        this.player.position.y) && !this.adversaries[i].defeated){ 
            // if player collides and is powered up, defeat adversary
            if(this.player.empoweredTimer > 0){
                this.adversaries[i].defeated = true;
                this.adversaries[i].explodeTimer = 45;
            }
            // otherwise game is over, so set game state
            // and make player "explode" (animation)
            else{
                this.player.explodeTimer = 45;
                this.gameOverMsg = "You lose!";
                this.state = 2;
                this.gameOverTimer = 45;
            }
        }
        // only want to update undefeated adversaries
        if(!this.adversaries[i].defeated && this.adversaries[i].explodeTimer == 0){
            this.adversaries[i].update();
        }
    }

    // if player collects all collectibles, player wins
    if(this.numCollected == this.collectibles.length){
        this.state = 2;
        this.gameOverMsg = "You win!";
        this.gameOverTimer = 45;
        // make remaining adversaries explode
        for(var i = 0; i < this.adversaries.length; i++){
            if(!this.adversaries[i].defeated){
                this.adversaries[i].defeated = true;
                this.adversaries[i].explodeTimer = 45;
            }
        }
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
}

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
/* setup the game by instantiating necessary objects
    * this function gets once per game iteration 
    */
var setup = function(){
    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');

    angleMode(RADIANS);
    frameRate(30);
    
    game.setup();
    // push dummy adversary and discs to menu so can 
    // display on menu screen
    game.collectibles.push(new collectible(15, 175, false));
    game.collectibles.push(new collectible(15, 235, true));
    game.adversaries.push(new adversary(350, 110));

    // parse tilemap
    game.readTileMap();
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

        // then remove dummy items from lists
        game.adversaries.shift();
        game.collectibles.shift();
        game.collectibles.shift();
    }
    // if in game over menu, click to go back to game
    if(game.state === 3 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        game.state = 0;
        // explicitly call setup so game gets re-generated
        setup();
    }
}   

// ---------------------------------------------
// ---------------------------------------------
/* the draw loop, responsible for game drawing
    * and performing actions that must occur
    * every turn
    * this function gets called every frame
    */
var draw = function(){
    // every frame
    // set background to grey
    background(210, 212, 214); 

    // every frarme increase frame counter
    game.frameCount++;

    // handle menu  
    if(game.state === 0){
        textSize(30);
        fill(73, 78, 82);
        noStroke();
        text("Robot Factory II", 100, 50);
        textSize(20);
        text("Use the arrow keys to move your", 50, 100);
        text("robot. Try to avoid the evil purple", 45, 130);
        text("robots, who will try to destroy you.", 45, 160);
        text("You must collect all the discs to wipe", 45, 190);
        text("their memories and escape. The red", 45, 220);
        text("dics will temporarily give you the", 45, 250);
        text("ability to defeat the evil robots.", 45, 280);
        text("Click to start.", 150, 350);
        // draw player on menu
        game.player.draw();

        // draw dummy adversary and discs on menu
        game.adversaries[0].draw(200, 200);
        game.collectibles[0].draw(200, 200);
        game.collectibles[1].draw(200, 200);
        
    }
    // handle game play
    else if(game.state === 1){
        // every frame, draw and update drawing state
        game.draw();
        game.update();
    }

    // game over animation
    else if(game.state === 2){
        game.draw();
        game.gameOverTimer--;
        if(game.gameOverTimer === 0){
            game.state = 3;
        }
    }

    // game over menu
    else if(game.state === 3){
        textSize(30);
        fill(73, 78, 82);
        noStroke();
        text("Game Over!", 120, 50);
        textSize(25);
        text(game.gameOverMsg, 150, 90);
        text("Score: " + game.numCollected, 150, 130);
        text("Click to play again", 100, 300);
    }

};  
