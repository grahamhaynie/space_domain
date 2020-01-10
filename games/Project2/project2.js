// ---------------------------------------------
// ---------------------------------------------
/* gameObject is an object to hold the 
    * state of the game - or the data 
    * for this specific instance of the game
    */
var gameObject = function(){
    // create a setup that can be called to initialized game
    this.setup = function(){
        // tilemap to contain map information
        this.tilemap = [
        "wwwwwwwwwwwwwwwwwwww",
        "w   a             cw",
        "w      c           w",
        "w   wwwwwww  wwwwwww",
        "w  wwc         a   w",
        "w   w              w",
        "w      awwww  www  w",
        "w        w      w  w",
        "w  cw    w c    w  w",
        "wwwwwww  wwwwwwww  w",
        "w   a w  w      w  w",
        "w  c  w  w  c   w  w",
        "w  w  w  w      w  w",
        "w  w  w  www  www  w",
        "w  w               w",
        "w  w               w",
        "w  www   c wwwwww  w",
        "w p           c    w",
        "wc                 w",
        "wwwwwwwwwwwwwwwwwwww",];
        // list to contain the wall objects
        this.walls = [];
        // list to contain collectible objects
        this.collectibles = [];
        // keep track of number of collectibles collected
        this.numCollected = 0;
        // keep track of adversaries
        this.adversaries = [];

        // keep track of keys currently pressed
        this.keyArray = [];

        // keep track of frames passed
        this.frameCount = 0;

        // keep track of "state" of game
        // 0 = menu
        // 1 = game
        // 2 = game over transition
        // 3 = game over menu
        this.state = 0;
    };
};

// instantiate game object 
var game = new gameObject();


// ---------------------------------------------
// ---------------------------------------------
/* define a wall as having an x, and a y
    * where x, y is the upper left corner of the wall
    * and is drawn as a box ***
    */
var wall = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 20;

    // draw wall as a 20x20 rectangle with some 
    // brick like textures
    this.draw = function(){
        push();
        translate(this.x, this.y);
        noStroke();
        fill(73, 78, 82);
        rect(0, 0, this.size, this.size);
        fill(0, 0, 0);
        rect(4, 0, 2, 20);
        rect(14, 0, 2, 20);
        rect(0, 4, 20, 2);
        rect(0, 14, 20, 2);
        pop();
    };

    // check collision of player or 
    // adversary with wall
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
/* define a collectible as having an x and y, 
    * where x, y is the upper left corner of the wall
    * as well as a state to track if it has been
    * collected or not 
    */
var collectible = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 15;
    this.collected = false;

    // draw collectible as a fuel cannister
    this.draw = function(){
        stroke(0, 0, 0);
        fill(7, 179, 179);
        ellipse(this.x + 10, this.y + 10, this.size, this.size);
        noFill();
        ellipse(this.x + 10, this.y + 10, 5, 5);
    }

    // check collision of player with collectible, 
    // if a collision occurs, mark it as collected
    // and increment game object's counter
    this.checkCollected = function(playerX, playerY){
        if(abs(playerX - this.x) <= this.size && abs(playerY - this.y) <= this.size
            && !this.collected){
            this.collected = true;
            game.numCollected++;
        }
    };
    
};

// ---------------------------------------------
// ---------------------------------------------
/* An adversary is defined as having a fixed position,
    * and wanders randomly. If a player touches an  
    * adversary, the game is over. Adveraries move in a 
    * random direction, however if they encounter a wall
    * they go back 
    */
var adversary = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 20;
    // to keep track of explosion size
    this.explodeSize = 0;

    // draw adversary as a purple diamond
    this.draw = function(){
        // update coordinate system to direction
        // moving in, so drawing becomes simpler
        push();
        if(this.direction == 'E'){
            translate(this.x + 20, this.y);
            rotate(HALF_PI);
        }else if(this.direction == 'S'){
            translate(this.x + 20, this.y + 20);
            rotate(PI);
        }
        else if(this.direction == 'W'){
            translate(this.x, this.y + 20);
            rotate(3*HALF_PI);
        }else{ // if north or no direction
            translate(this.x, this.y);
        }

        // draw arms
        noStroke();
        fill(0, 0, 0);
        rect(2, 2, 3, 6);
        rect(16, 2, 3, 6);
        // draw body
        fill(194, 14, 207);
        quad(this.size/2, 0, 
                this.size, this.size/2, 
                this.size/2, this.size, 
                0, this.size/2);
        // draw eyes
        fill(7, 179, 179);
        ellipse(8, 8, 2, 2);
        ellipse(10, 6, 2, 2);
        ellipse(12, 8, 2, 2);
        pop();
    }

    // check collision with player, if adversary 
    // and player collide, set game to be over
    this.checkCollision = function(playerX, playerY){
        if(abs(playerX - this.x) < this.size - 5 && abs(playerY - this.y) < this.size - 5){
            return true;
        }else{
            return false;
        }
    };

    // adversaries must wander as game goes on, this 
    // is called every frame
    this.update = function(){
        var xIncrement = 0;
        var yIncrement = 0; 

        // try all four directions, if reach 4 directions
        // and cannnot move, then do not try to move
        var tried = ['N', 'E', 'S', 'W'];
        // first attempt a random direction, then if cannnot 
        // go that direction remove it from the list and
        // randomly pick another one until exhausted all 
        this.direction = tried[round(random(0, tried.length))];

        while(xIncrement === 0 && yIncrement === 0 && tried.length > 0){
            // north
            if(this.direction === 'N'){
                yIncrement = -20;
            }
            // east
            else if(this.direction === 'E'){
                xIncrement = 20;
            }
            // south
            else if(this.direction === 'S'){
                yIncrement = 20;
            }
            // west
            else if(this.direction === 'W'){    
                xIncrement = -20;
            }

            // check collision with walls
            for(var i = 0; i < game.walls.length; i++){
                if(game.walls[i].collidesWith(this.x + xIncrement, this.y +yIncrement)){
                    xIncrement = 0;
                    yIncrement = 0;
                    // remove direction from list and try another
                    tried.splice(tried.indexOf(this.direction), 1);
                    this.direction = tried[round(random(0, tried.length))]; 
                }
            } 
            
            // check collision with adversaries
            for(var i = 0; i < game.adversaries.length; i++){
                if(game.adversaries[i].checkCollision(this.x + xIncrement, this.y + yIncrement)){
                    xIncrement = 0;
                    yIncrement = 0;
                    tried.splice(tried.indexOf(this.direction), 1);
                    this.direction = tried[round(random(0, tried.length))];
                }
            }
        }
        
        // if check that all walls do not collide, then
        // can succesfully move that direction
        this.x += xIncrement;
        this.y += yIncrement;

    };

    // want robots to "explode", cool fade out animation
    // draw explosion as expanding circles
    this.explode = function(){
        // draw normally, and overfill with effects
        this.draw();
        noStroke();
        // orange
        fill(222, 123, 47);
        ellipse(this.x + 10, this.y + 10, this.explodeSize, this.explodeSize);
        // red
        fill(212, 30, 51);
        ellipse(this.x + 10, this.y + 10, this.explodeSize - 10, this.explodeSize - 10);
        //yellow 
        fill(255, 244, 28);
        ellipse(this.x + 10, this.y + 10, this.explodeSize - 20, this.explodeSize -20);

        this.explodeSize++;
    }

}

// ---------------------------------------------
// ---------------------------------------------
/* A Player is defined as having a fixed tile position,
    * and can be moved with arrow keys. A player can collect
    * collectibles, is harmed by adversaries, and cannot
    * move through walls.
    * A player has an x and y where x, y is the upper left
    * corner of the player's position
    */
var player = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 20;
    // track last direction so can draw easily
    this.lastDirection = 'N';
    // to keep track of explosion size
    this.explodeSize = 0;

    // draw player as square****
    this.draw = function(){
        push();
        // rotate and translate drawing according to 
        // direction
        if(this.lastDirection == 'N'){
            translate(this.x, this.y);
        }else if(this.lastDirection == 'E'){
            translate(this.x + 20, this.y);
            rotate(HALF_PI);
        }else if(this.lastDirection == 'S'){
            translate(this.x + 20, this.y + 20);
            rotate(PI);
        }
        else if(this.lastDirection == 'W'){
            translate(this.x, this.y + 20);
            rotate(3*HALF_PI);
        }   
        // draw tread
        noStroke();
        fill(0, 0, 0);
        rect(this.size/4 + 2, 5, this.size/2 - 4, 14);
        // draw body
        fill(48, 48, 47);
        rect(this.size/4, this.size/3, this.size/2, this.size/2);
        rect(0, this.size/3 + 3, this.size, this.size/4);
        rect(0, this.size/4, 3, 10);
        rect(17, this.size/4, 3, 10);
        // lights
        fill(255, 0, 0);
        rect(this.size/3, this.size/4 + 3, 2, 2);
        rect(this.size/3 + 4, this.size/4 + 3, 2, 2);
        
        pop();
    };

    // update player with arrow keys
    // the layer can move up, down, left, right
    this.update = function(){
        var xDir = 0;
        var yDir = 0;
        if (game.keyArray[LEFT_ARROW] === 1) {
            xDir = -5;
            this.lastDirection = 'W';
        }
        if (game.keyArray[RIGHT_ARROW] === 1) {
            xDir = 5;
            this.lastDirection = 'E';
        }
        if(game.keyArray[UP_ARROW] === 1){
            yDir = -5;
            this.lastDirection = 'N';
        }
        if(game.keyArray[DOWN_ARROW] === 1){
            yDir = 5;
            this.lastDirection = 'S';
        }
        // check for collision with walls, if collide
        // change x and y increment for this movement to 0 ******
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i].collidesWith(this.x + xDir, this.y + yDir)){
                // reverse direction
                xDir = -xDir;
                yDir = -yDir;
                // check if reversed direction collides with a wall, 
                // because if does do not change
                for(var i = 0; i < game.walls.length; i++){
                    if(game.walls[i].collidesWith(this.x + xDir, this.y + yDir)){
                        xDir = 0;
                        yDir = 0;
                    }
                }
            }
        }


        // check for collision with collectibles, 
        // call collectible's collision checker
        for(var i = 0; i < game.collectibles.length; i++){
            game.collectibles[i].checkCollected(this.x + xDir, this.y + yDir);
        }

        this.x += xDir;
        this.y += yDir;
    };

    // want robot to "explode", cool fade out animation
    // draw explosion as expanding circles
    this.explode = function(){
        // draw normally, and overfill with effects
        this.draw();
        noStroke();
        // orange
        fill(222, 123, 47);
        ellipse(this.x + 10, this.y + 10, this.explodeSize, this.explodeSize);
        // red
        fill(212, 30, 51);
        ellipse(this.x + 10, this.y + 10, this.explodeSize - 10, this.explodeSize - 10);
        //yellow 
        fill(255, 244, 28);
        ellipse(this.x + 10, this.y + 10, this.explodeSize - 20, this.explodeSize -20);

        this.explodeSize++;
    }
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
            // if encounter a collectible, 
            // create a collectible by adding to that list
            else if(this.tilemap[y][x] == "c"){
                this.collectibles.push(new collectible(x*20, y*20));
            }
            // if encounter an adversary, create by
            // adding to list
            else if(this.tilemap[y][x] == "a"){
                this.adversaries.push(new adversary(x*20, y*20));
            }
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
    // if click mouse during game over state, move 
    // to menu state and reset everything as necessary
    else if(game.state === 3 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        game.state = 0;
        game.setup();
        game.readTileMap();
    }
}   

// ---------------------------------------------
// ---------------------------------------------
/* setup the game by instantiating necessary objects
    * this function gets once per game iteration (for)
    */
var setup = function(){
    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');
    
    frameRate(30);
    game.setup();
    game.readTileMap();
};


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
        textSize(20);
        fill(73, 78, 82);
        text("101101110011101...", 100, 70);
        text("You must escape the robot factory,", 50, 100);
        text("collect all of the blue discs to", 70, 130);
        text("delete the memory of the evil purple", 50, 150);
        text("robots, who will hurt you if touched.", 55, 180);
        text("Use the arrow keys to move your robot.", 30, 210);
        text("Your robot is particularly sensitive", 50, 240);
        text("to the walls, and will bounce off ", 70, 270);
        text("of them slightly when touched", 80, 300);
        text("Click to start.", 150, 350);
    }
    // handle game play
    else if(game.state === 1){
        // draw floor "tiles"
        stroke(160, 160, 160);
        for(var i = -20; i < 20; i++){
            line(0, i*20, 400 -i*20, 400);
            line(400 - i*20, 0, 0, 400 - i*20);
        }

        // draw walls
        for(var i = 0; i < game.walls.length; i++){
            game.walls[i].draw();
        }
        
        // draw collectibles, but only the ones that have
        // not been collected
        for(var i = 0; i < game.collectibles.length; i++){
            if(!game.collectibles[i].collected){
                game.collectibles[i].draw();
            }
        }

        // draw adversaries
        for(var i = 0; i < game.adversaries.length; i++){
            // if player runs into adversary, game is over
            game.adversaries[i].draw();
            if(game.adversaries[i].checkCollision(game.player.x, game.player.y)){
                game.state = 2;
                game.gameOverTimer = 0;
                game.gameOverMsg = "Game Over!";
            }
            // only want to update adversaries every 5 frames
            if(game.frameCount % 5 ===0){
                game.adversaries[i].update();
            }
        }
        // if player has collected all collectibles, 
        // move to game over state
        if(game.numCollected == game.collectibles.length){
            game.state = 2;    
            game.gameOverMsg = " You win! ";
            game.gameOverTimer = 0;
        }

        // draw the player
        game.player.draw();
        game.player.update();
    }
    // handle game over transition
    else if(game.state === 2){
    
        // draw floor "tiles"
        stroke(160, 160, 160);
        for(var i = -20; i < 20; i++){
            line(0, i*20, 400 -i*20, 400);
            line(400 - i*20, 0, 0, 400 - i*20);
        }
        // walls
        for(var i = 0; i < game.walls.length; i++){
            game.walls[i].draw();
        }
        // collectibles
        for(var i = 0; i < game.collectibles.length; i++){
            if(!game.collectibles[i].collected){
                game.collectibles[i].draw();
            }
        }
        // adversaries
        for(var i = 0; i < game.adversaries.length; i++){
            // if game is won, draw explosions
            if(game.numCollected == game.collectibles.length){
                game.adversaries[i].explode();
            }
            // otherwise draw normally
            else{
                game.adversaries[i].draw();
            }
        }
        

        // if player won, draw normally
        if(game.numCollected == game.collectibles.length){
            game.player.draw();
        }
        // otherwise, draw explosion
        else{
            game.player.explode();
        }

        // want to "freeze" for a second
        game.gameOverTimer++;
        if(game.gameOverTimer === 40){
            game.state = 3;
        }
    }
    // handle game over menu state
    else if(game.state === 3){
        noStroke();
        textSize(30);
        fill(73, 78, 82);
        text(game.gameOverMsg, 120, 100);
        text("Click to Return", 100, 200);
        text(" to Menu", 140, 240);
    }

};  