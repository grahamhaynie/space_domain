//---------------------------------------------------
//---------------------------------------------------
// store information about the game in an object
var gameObject = function(){
    // gameState keeps track of game state
    // 0 = currently performing starting animation
    // 1 = starting menu
    // 2 = starting menu dissapear animation
    // 3 = help menu
    // 4 = game
    // 5 = game over 
    this.gameState = 0;
    // keep track of player score
    this.score = 0;
    // keep track of fuel
    this.fuel = 0;
    // structures for starting animation
    // define rectangles as a list for each name letter
    this.rectanglesG = [];
    this.rectanglesH = [];
    // define balls as a list, keep ballsize constant
    this.ballsize = 8;
    this.balls = [];
    // keep list of stars
    this.stars = [];
    // keep list of blocks
    this.blocks = [];
    // keep track of keys
    this.keyArray = [];
    // need an offset for stars and blocks, to make everything appear
    // a little above center of screen
    this.offset = 50;
    // count how many frames of gameplay have passed, 
    // to make game harder over time
    this.frameCount = 0;
    // keep a game over message
    this.gameOverMsg = "";
};

// instantiate gameObject for global usage
var game = new gameObject();

//---------------------------------------------------
//---------------------------------------------------
// define ball object
var ball = function(){
    // if ball position is fixed (intersects with rectangle),
    // do not move it
    this.stuck = false;
    // track if ball is out of screen
    this.outOfScreen = false;

    // getters for tracking if ball's position
    this.getStuck = function(){
        return this.stuck;
    };
    this.getOutOfScreen = function(){
        return this.outOfScreen;
    };

    // generate the ball, acts as a constructor
    // but want to call again so not a constructor
    this.generate = function(){
        //define speed of ball
        this.speed = random(10, 45);

        // assign to one of the four edges of the window
        var edge = floor(random(0,4));
        if(edge === 0){ // top
            this.x = random(-width/2 + game.ballsize/2, width/2 - game.ballsize/2);
            this.y = -width/2 + game.ballsize/2;
        }else if(edge === 1){ // right 
            this.x = width/2-game.ballsize/2;
            this.y = random(-width/2 + game.ballsize/2, width/2 - game.ballsize/2);
        }else if(edge === 2){ // bottom
            this.x = random(-width/2 + game.ballsize/2, width/2 -game.ballsize/2);
            this.y = width/2 - game.ballsize/2;
        }else if(edge === 3){ // left 
            this.x = -width/2 + game.ballsize/2;
            this.y =  random(-width/2 + game.ballsize/2, width/2-game.ballsize/2);
        }
        // keep track of coordinates originate from
        this.originalX = this.x;
        this.originalY = this.y;
    };

    // draw the ball
    this.draw = function(){
        noStroke(); // turn off outlines
        fill(255, 255, 255); //white
        ellipse(this.x, this.y, game.ballsize, game.ballsize);
    };

    // update the ball's position
    this.update = function(){

        // test intersection with rectangles, if intersect
        // freeze ball
        for(var i = 0; i < game.rectanglesG.length; i++){
            if(game.rectanglesG[i].ballIntersect(this)){
                this.stuck = true;
                game.stuckBalls++;
            }
        }
        for(var i = 0; i < game.rectanglesH.length; i++){
            if(game.rectanglesH[i].ballIntersect(this)){
                this.stuck = true;
                game.stuckBalls++;
            }
        }
        // if ball is not stuck, update position
        if(this.stuck === false){
            // direct balls to 0 axis for x and y (center of canvas)
            //if at 0 for x and y, reset
            if(abs(this.x) - this.speed<= 0 && abs(this.y) - this.speed <= 0){
                this.generate();
            }else{
                // otherwise increment x and y according to speed
                if(this.x > 0){
                    this.x -= this.speed;
                }else{
                    this.x += this.speed;
                }
                if(this.y > 0){
                    this.y -= this.speed;
                }else{
                    this.y += this.speed;
                }

            }
        }
    };

    // fling balls towards edges of window
    this.fling = function(){
        // only update if still on screen
        if(!this.outOfScreen){
            var length = sqrt(this.originalX*this.originalX + this.originalY*this.originalY);
            var incX = this.originalX/length;
            var incY = this.originalY/length;
            
            // move ball back towards original direction coming from 
            this.x -= this.speed*incX;
            this.y -= this.speed*incY;

            // check if ball is out of screen
            if(abs(this.x) > width/2 + game.ballsize || abs(this.y) > height/2 + game.ballsize){
                this.outOfScreen = true;
            }
        }
        
    };

};

//---------------------------------------------------
//---------------------------------------------------
// define rectangle as having x, y, w, h
var rectangle = function(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    // test if ball falls in area
    this.ballIntersect = function(ball){
        // get distance from ball's x to middle of rectangle
        var distX = abs(ball.x  - this.x - this.w/2);
        var distY = abs(ball.y - this.y - this.h/2);

        // if both distances are less than width, intersects
        if(distX  < this.w/2  && distY < this.h/2 ){
            return true;
        }else{
            return false;
        }
        
    };

    // test if mouse x and y falls within rect
    this.mouseIntersect = function(x, y){
        var distX = abs(x - this.x - this.w/2);
        var distY = abs(y - this.y - this.h/2);
        // if both distances are less than width, intersects
        if(distX  < this.w/2  && distY < this.h/2 ){
            return true;
        }else{
            return false;
        }
    };
};

//---------------------------------------------------
//---------------------------------------------------
// define starting button, can only be drawn and has fixed
// coordinates
var startButton = function(){
    this.draw = function(){
        noStroke(); // turn off outlines
        fill(0, 255, 0); //green
        triangle(-70, -10, -40, 0, -70, 10);
    };
};

//---------------------------------------------------
//---------------------------------------------------
// define star object, which starts at the center of screen
// and moves directly outward
var star = function(){

    // generate new, random star
    this.generate = function(){
        this.x = 0;
        this.y = -game.offset;
        // keep track of previous value to make it seem
        // like star is shooting outwards
        this.px = this.x;
        this.py = this.y;
        // give star x and y direction, as well as speed 
        this.xDir = random(-5, 5);
        this.yDir = random(-5, 5);
        this.speed = random(3, 5);
    };

    // draw stars as a line using current and
    // previous coordinates
    this.draw = function(){
        // try not to cram middle of screen
        if(abs(this.px) > 5 && abs(this.py) > 5){
            stroke(255);
            line(this.px, this.py, this.x, this.y);
        }
    };

    // update star
    this.update = function(){
        // move star outward
        this.px = this.x;
        this.py = this.y;
        this.x += this.xDir*this.speed;
        this.y += this.yDir*this.speed;

        // check if star has left the screen, if so
        // bring back to middle
        if(abs(this.x) > width/2 || abs(this.y) > height/2 + game.offset){
            this.generate();
        }
    };
};

//---------------------------------------------------
//---------------------------------------------------
// define blocks that move from the center of the screen
// to the bottom edge of the screen, could be either 
// fuel or asteroids
var block = function(){

    // blocks start at 0,0 and move to bottom of screen, so give 
    // a "target" at bottom edge
    this.generate = function(){
        // x and y are the center of the block
        this.x = 0;
        this.y = -game.offset;
        this.size = height/25;
        this.targetX = random(-width/2, width/2);
        this.targetY = height/2;
        this.speed = random(2, 4);
        // randomly choose if fuel or not (1 in 10 chance)
        var chance = round(random(0, 10));
        if(chance === 7){
            this.isFuel = true;
        }else{
            this.isFuel = false;
        }
    };

    // blocks move towards "target", then go back 
    this.update = function(){
        // calculate distance from "target"
        // x and y 
        var distX = abs(this.targetX - this.x);
        var distY = abs(this.targetY - this.y);
        var distL = sqrt(distX*distX + distY*distY);

        // only want to move block towards bottom 
        // edge of screen (pos/neg x and pos y)
        // update x relative to distance from "target"
        // so that goes in intended direction
        if(this.targetX > 0){
            this.x += distX*this.speed/distL;
        }else{
            this.x -= distX*this.speed/distL;
        }
        this.y += this.speed;

        // if exit screen, re-generate and 
        // add to player score
        if(this.x - this.size > width/2 || this.y - this.size > height/2 ){
            this.generate();   
            game.score++;
        }
    };

    // draw block as either block or fuel
    this.draw = function(){
        // measure distance from coordinates of origin
        var distX = abs(this.targetX - this.x);
        var distY = abs(this.targetY - this.y);
        var distL = sqrt(distX*distX + distY*distY);
        // want to calculate distance from center so can update size
        // and color (only for asteroids) relative to distance from center
        var distTotal = sqrt(this.targetX*this.targetX + this.targetY*this.targetY);
        var sizeMod = 25 - 7* distL/distTotal;

        if(this.isFuel){
            noStroke();
            fill(77, 245, 71);
            // draw, using size relative to distance
            ellipse(this.x, this.y, sizeMod, sizeMod);
        }else{
            noStroke();
            // update color relative to distance
            var color = 160 - 100*distL/distTotal;
            fill(color, color, color);
            // update size according to distance as well
            ellipse(this.x , this.y, sizeMod, sizeMod);
            
        }
    };
    
};

//---------------------------------------------------
//---------------------------------------------------
// fighter that the user controls with left and right
// arrows
var fighter = function(){

    this.size = width/12;
    // x is the center of the fighter
    this.x = 0;
    // y is fixed and does not change
    this.y = height/2 - this.size/2;

    // draw fighter
    this.draw = function(){
        noStroke();
        fill(255, 0, 0);
        quad(this.x - this.size/3, this.y + this.size/3,
                this.x - this.size/3 + 3, this.y - this.size/3,
                this.x + this.size/3 - 3, this.y - this.size/3,
                this.x + this.size/3, this.y + this.size/3);
    };

    // move the fighter left if left arrow pressed,
    // and vice versa for right
    this.move = function(){
        if (game.keyArray[LEFT_ARROW] === 1 && this.x - 5 > - width/2 + this.size/2) {
            this.x -= width/120;
        }
        if (game.keyArray[RIGHT_ARROW] === 1 && this.x + 5 < width/2 - this.size/2) {
            this.x += width/120;
        }
    };

    // check if block collides with fighter
    this.blockCollide = function(b){
        // do so by checking if distance from center of block 
        // to center of fighter is less than sum of 
        // fighter "width" + block "width"
        var distX = abs(b.x - this.x);
        var distY = abs(b.y - this.y);
        var distCenter = sqrt(distX*distX + distY*distY);
            if(distCenter < (this.size/3 + b.size/2)){
            return true;
        }else{
            return false;
        }
    };
};

//---------------------------------------------------
//---------------------------------------------------
// handle key presses
function keyPressed() {
    game.keyArray[keyCode] = 1;
};

function keyReleased() {
    game.keyArray[keyCode] = 0;
}; 

//---------------------------------------------------
//---------------------------------------------------
// handle mouse events
mouseReleased = function(){
    // if on menu screen and click the "G", move to the 
    // after-menu animation (game state 2)
    if(game.gameState === 1){
        for(var i = 0; i < game.rectanglesG.length; i++){
            // have to adjust to correct coordinate system
            if(game.rectanglesG[i].mouseIntersect(mouseX - width/2, mouseY - height/2)){
                game.gameState = 2;
            }
        }

    }

    // if on help screen and click, move to game state 4
    // to start the game
    else if(game.gameState === 3 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        game.gameState = 4;
    }

    // if on game over screen and click, re-draw menu by going 
    // back to state 0, have to call setup so everything gets
    // re-initialized
    else if(game.gameState === 5 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        setup();
        game.gameState = 0;
    }
    
};

//---------------------------------------------------
//---------------------------------------------------
// initialize variables
setup = function()
{
    var canvas = createCanvas(600, 600);
    canvas.parent('sketch-holder');
    
    frameRate(30);

    // create rectangles to form name object
    // G
    game.rectangelsG = [];
    game.rectanglesG.push(new rectangle(-150, -75, 125, 25));
    game.rectanglesG.push(new rectangle(-150, -50, 25, 125));
    game.rectanglesG.push(new rectangle(-150, 50, 125, 25));
    game.rectanglesG.push(new rectangle(-50, -10, 25, 60));
    game. rectanglesG.push(new rectangle(-75, -10, 25, 25));
    // H
    game.rectanglesH = [];
    game.rectanglesH.push(new rectangle(25, -75, 25, 150));
    game.rectanglesH.push(new rectangle(125, -75, 25, 150));
    game.rectanglesH.push(new rectangle(50, -10, 100, 25));
    
    // create balls on four edges of canvas
    game.stuckBalls = 0;
    game.balls = [];
    for (var i=0; i < 2500; i++) {
        game.balls.push(new ball());
        game.balls[i].generate();
    }

    // define start and help button
    game.startBut = new startButton();
    
    // create stars
    game.stars = [];
    for(var j = 0; j < 400; j++){
        game.stars.push(new star());
        game.stars[j].generate();
    }

    // create blocks
    // start with 10 blocks - later will add more 
    game.blocks = [];
    for(var b = 0; b < 10; b++){
        game.blocks.push(new block());
        game.blocks[b].generate();
    }

    // create player fighter
    game.playerFighter = new fighter();

    //give player fuel
    game.fuel = 1000;
    // set frameCount to 0
    game.frameCount = 0;
};

//---------------------------------------------------
//---------------------------------------------------
// draw acts as the game loop in processing js
draw = function() {
    // set (0, 0) to be the center of the screen
    translate(width/2, height/2);
    
    background(0, 0, 0); // black

    // handle intro animation
    if(game.gameState === 0){
        // draw the balls, along the way acquiring the number of
        // stuck balls
        var stuckBalls = 0;
        for (var i=0; i< game.balls.length; i++) {
            game.balls[i].draw();
            game.balls[i].update();
            if(game.balls[i].getStuck()){
                stuckBalls++;
            }
        }
        // if all balls are stuck, move to menu screen
        if(stuckBalls === game.balls.length){
            game.gameState = 1;
        }

    }

    // handle menu screen
    else if(game.gameState === 1){
        // draw balls
        for (var i=0; i< game.balls.length; i++) {
            game.balls[i].draw();
            game.balls[i].update();
        }
        //draw start button and help button
        game.startBut.draw();
    }
    
    // handle after-start button animation clicked
    else if(game.gameState === 2){
        // fling balls outwards and keep track of balls out of screen
        // while drawing
        var ballsOut = 0;
        for (var i=0; i< game.balls.length; i++) {
            game.balls[i].draw();
            game.balls[i].fling();
            if(game.balls[i].getOutOfScreen()){
                ballsOut++;
            }
        }

        // if balls have all left the screen
        if(ballsOut === game.balls.length){
            //setup();
            //gameState = 0;
            game.gameState = 3;
        }

    }

    //display help menu
    else if(game.gameState === 3){
        textSize(25);
        fill(255, 0, 0);
        text("! Approaching Hyperspeed !", -180, -100);
        fill(0, 255, 0);
        text("Use Left/Right Arrows to move,", -180, -50);
        text("Try to dodge the Grey asteroids.", -180, 0);
        text("You can only carry so much fuel,", -180, 50);
        text("so collect the green orbs for more.", -180, 100);
        text("Click anywhere to start...", -180, 150);
    }

    // handle game
    else if(game.gameState === 4){
        // decrement fuel each turn
        game.fuel--;

        // if run out of fuel, game is over
        if(game.fuel <= 0){
            game.gameState = 5;
            game.gameOverMsg = "You ran out of fuel.";
        }

        // draw stars
        for(var s=0; s < game.stars.length; s++){
            game.stars[s].draw();
            game.stars[s].update();
        }
        // draw blocks
        for(var b = 0; b < game.blocks.length; b++){
            game.blocks[b].draw();
            game.blocks[b].update();
            
            // check if each block collides
            if(game.playerFighter.blockCollide(game.blocks[b])){
                // if it collides into a block, game over,
                // if collides into emerald get 100 fuel points
                // can only get a maximum of 1000 fuel
                if(game.blocks[b].isFuel){
                    game.fuel += 100;
                    game.blocks[b].generate();
                    if(game.fuel > 1000){
                        game.fuel = 1000;
                    }
                }else{
                    game.gameState = 5;
                    game.gameOverMsg = "You hit an asteroid.";
                }
            }
        }

        // draw fighter
        game.playerFighter.draw();
        game.playerFighter.move();

        // draw scoreboard
        noStroke();
        fill(77, 245, 71);
        textSize(20);
        text("Score: " + game.score, -width/2 + 40, -height/2 + 40);

        // draw fuel bar
        text("Fuel: ", 0, -height/2 + 40);
        fill(77, 245, 71);
        rect(width/2 - 150, -height/2 + 20, game.fuel/10, 25);
        stroke(200, 200, 200);
        noFill();
        rect(width/2 - 150, -height/2 + 20, 100, 25);

        // increment frameCount every frame, add another block
        // 5 seconds
        frameCount++;
        if(frameCount % 150 === 0){
            game.blocks.push(new block());
            game.blocks[b].generate();
        }
    }
    // handle game over state
    else if(game.gameState === 5){
        textSize(30);
        fill(255, 0, 0);
        noStroke();
        text("Game Over!", -75, -40);
        text(game.gameOverMsg, -120, 0);
        textSize(25);
        fill(77, 245, 71);
        text("Score: " + game.score, -45, 40);
        text("Click to Return to Menu", -120, 80);
    }
};