// ---------------------------------------------
// ---------------------------------------------
/* GameObject - 
    * This stores the state of the game, and the 
    * tilemap. When this is initialized, the setup
    * function is called to reset the state of the game
    */
var gameObject = function(){
    // create a setup that can be called to initialized game
    this.setup = function(){
        // tilemap to contain map information, 20x20
        // w = wall
        // p = player
        // a = adversary
        this.tilemap = [
        "wwwwwwwwwwwwwwwwwwww",
        "wp      ww     w   w",
        "w www w w  w w w w w",
        "w w   w w ww w w w w",
        "w w w w      w w   w",
        "w   w   ww w w   w w",
        "www w w w  w ww ww w",
        "w   w w w ww       w",
        "w www w      ww wwww",
        "w     ww           w",
        "w w w       wwww w w",
        "w w wwww    w    w w",
        "w w    w wwww wwww w",
        "w wwww         w   w",
        "w      www www w www",
        "wwww w   w w       w",
        "w    w w w   w www w",
        "w wwww w www w  ww w",
        "w      w     ww    w",
        "wwwwwwwwwwwwwwwwwwww"
        ];
        // list to contain the walls
        this.walls = [];

        // list to contain adversaries
        this.adversaries = [];

        // keep track of keys currently pressed
        this.keyArray = [];
        // have to initialize key array so movement 
        // function can work properly
        this.keyArray[LEFT_ARROW] = 0;
        this.keyArray[RIGHT_ARROW] = 0;
        this.keyArray[UP_ARROW] = 0;
        this.keyArray[DOWN_ARROW] = 0;

        // game's state
        // 0 = start menu, showing game but not updating
        // 1 = game play
        // 2 = game over menu
        this.state = 0;

        // track when game over
        this.gameOverTimer = 0;
        
        // track when player is caught
        this.playerCaughtTimer = 0;

        // contain a graph to ensure A* heuristic can operate
        // graph is a 2d array, where each element in array is
        // another array for x values
        this.graph = new Array(this.tilemap.length);
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

    // draw wall as a 20x20 rectangle 
    this.draw = function(){
        push();
        translate(this.x*20 + 10, this.y*20 + 10);
        noStroke();
        stroke(27, 89, 8);
        fill(25, 128, 51);
        rect(-this.size/2, -this.size/2, this.size, this.size);
        pop();
    };

    // check collision of something with an x, y with wall
    // return true if the otherX, otherY collide with this wall,
    // otherwise return false
    this.collidesWith = function(otherX, otherY){
        if(abs(otherX - this.x) < (this.size-10)/20 && abs(otherY - this.y) < (this.size-10)/20){
            return true;
        }else {
            return false;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
/* Adversary -
    * An adversary can only move in 4 cardinal directions.
    * An adversary is drawn as a sheep, and is animated when moving.
    * Adversaries can only move in the 4 cardinal directions. They move
    * according to their path, which is calculated using A* which utilizes
    * a manhattan distance heuristic. 
    * Initially, adversaries calculate their path with A*, and follow that path.
    * When the player changes position, the adversary re-calculates the A* path
    * to the player. 
    * When adversaries go into the pen at the center of the screen, they are 
    * trapped there until the game is over.
    */ 
var adversary = function(x, y){
    this.position = new createVector(x, y);
    this.size = 20;
    
    this.angle = 0
    this.velocity = new createVector(0, 0);
    this.drag = new createVector(0.8, 0.8);

    // only want to move every 10 frames
    this.moveCounter = 0;
    // keep track of path to take
    this.path = [];

    // track player's previous position, only want to re-calculate A* path if player's position has changed
    this.prevX = -1;
    this.prevY = -1;

    // track if has been stuck in pen
    this.penned = false;
    // timer for rotating while in pen
    this.penTimer = 0;

    // for animation
    this.drawSwitch = 1;
    this.drawCounter = 30;

    this.draw = function(){
        // adjust coordinates
        push();
        // draw relative to position and angle
        translate(this.position.x*20 + 10, this.position.y*20 + 10);
        rotate(this.angle);

        // draw as sheep
        noStroke();
        // head and legs
        fill(0, 0, 0);
        ellipse(0, -this.size/2 + 2, 4, 4);
        // legs, animated
        if(game.state === 1 && game.playerCaughtTimer === 0 && game.gameOverTimer === 0 && !this.penned){
            if(this.drawSwitch === 1){
                ellipse(6, 8, 3, 3);
                ellipse(-6, -6, 3, 3);
            }else{
                ellipse(6, -6, 3, 3);
                ellipse(-6, 8, 3, 3);
            }
        }

        // wool
        fill(220, 220, 220);
        ellipse(0, 1, this.size - 2, this.size - 2);
        
        pop();

        // use timer to switch drawing switch 
        if(this.drawCounter > 0){
            this.drawCounter--;
            // switch the drawing counter 
            if(this.drawCounter === 0){
                this.drawSwitch *= -1;
                this.drawCounter = 30;
            }
        }

    };

    // calculate the manhatan distance between (x1, y1) and (x2, y2)
    this.manhattanDist = function(x1, y1, x2, y2){
        return abs(x2 - x1) + abs(y2 - y1);
    };

    // get valid neighbors of position x, y 
    // aka ones that are not walls, so empty spaces with value 0 in graph
    this.getNeighbors = function(x, y){
        var neighbors = [];
        
        // check left, right, up, and down positions
        if(x-1 >= 0 && game.graph[y][x-1] === 0){
            neighbors.push(new createVector(x-1, y));
        }
        if(x+1 < game.graph[y].length && game.graph[y][x+1] === 0){
            neighbors.push(new createVector(x+1, y));
        }
        if(y-1 >= 0 && game.graph[y-1][x] === 0){
            neighbors.push(new createVector(x, y-1));
        }
        if(y+1 < game.graph.length && game.graph[y+1][x] === 0){
            neighbors.push(new createVector(x, y+1));
        }
        return neighbors;
    };

    // initialize f, g, h, and parent graphs
    this.initGraphs = function(){
        this.fGraph = new Array(game.graph.length);
        this.gGraph = new Array(game.graph.length);
        this.hGraph = new Array(game.graph.length);
        this.parentGraph = new Array(game.graph.length);
        for(var y = 0; y < game.graph.length; y++){
            this.fGraph[y] = new Array(game.graph[y].length);
            this.gGraph[y] = new Array(game.graph[y].length);
            this.hGraph[y] = new Array(game.graph[y].length);
            this.parentGraph[y] = new Array(game.graph[y].length);
            for(var x = 0; x < game.graph[y].length; x++){
                this.fGraph[y][x] = 0;
                this.gGraph[y][x] = 0;
                this.hGraph[y][x] = 0;
                this.parentGraph[y][x] = null;
            }
        }
    };

    // calculate the optimal path to player with A*
    this.calculateAStar = function(){
        // initialize grid
        this.initGraphs();

        // openList and closedList hold x, y positions
        var openList = [];
        var closedList = [];
        // push startNode onto openList
        openList.push(this.position);

        while(openList.length > 0){
            //currentNode = find lowest f in openList
            var lowIndex = 0;
            for(var i = 0; i < openList.length; i++){
                if(this.fGraph[openList[i].y][openList[i].x] < this.fGraph[openList[lowIndex].y][openList[lowIndex].x]){
                    lowIndex = i;
                }
            }
            
            var cur = openList[lowIndex];
            var curIndex = lowIndex;
        
            // if current node is final, return  succesful path
            if(cur.x == game.player.position.x && cur.y == game.player.position.y){
                // reconstruct path by following parent of current
                var path = [];
                var temp = cur;
                path.push(temp);
                while(this.parentGraph[temp.y][temp.x] && !(this.parentGraph[temp.y][temp.x].x == this.position.x && this.parentGraph[temp.y][temp.x].y == this.position.y)){
                    temp = this.parentGraph[temp.y][temp.x];
                    path.unshift(temp);
                }
                this.path = path;
                return;
            }

            // push currentNode onto closedList and remove from openList
            closedList.push(cur);
            openList.splice(curIndex, 1);

            // check all neighbors
            var neighbors = this.getNeighbors(cur.x, cur.y);
            for(var i = 0; i < neighbors.length; i++){
                var neighbor = neighbors[i];
                // check if neighbor is not in closed list
                if(!closedList.includes(neighbor)){
                    // tentative g score is distance from start to neighbor through current
                    var gScore = this.gGraph[cur.y][cur.x] + this.manhattanDist(cur.x, cur.y, neighbor.x, neighbor.y);

                    // if tentative gscore is less than g score of neighbor
                    var betterPath = false;
                    if(openList.includes(neighbor)){
                        if(gScore < this.gGraph[neighbor.y][neighbor.x]){
                            this.gGraph[neighbor.y][neighbor.x] = gScore;
                            betterPath = true;
                        }
                    }
                    // if neighbor not in openset, add neighbor
                    else{
                        this.gGraph[neighbor.y][neighbor.x] = gScore;
                        betterPath = true;
                        openList.push(neighbor);
                    }
                    // the path to neighbor is better than previous one, record it
                    if(betterPath){
                        this.hGraph[neighbor.y][neighbor.x] = this.manhattanDist(neighbor.x, neighbor.y, game.player.position.x, game.player.position.y);
                        this.fGraph[neighbor.y][neighbor.x] = this.gGraph[neighbor.y][neighbor.x] + this.hGraph[neighbor.y][neighbor.x];
                        
                        if(!this.parentGraph[neighbor.y][neighbor.x]){
                            this.parentGraph[neighbor.y][neighbor.x] = cur;
                        }
                    }
                }
            }

        }

    };

    // calculate angle want to face depending on next position
    this.calculateAngle = function(nextPos){
        // right
        if(nextPos.x > this.position.x && nextPos.y == this.position.y){
            this.angle = HALF_PI;
        }
        // left
        else if(nextPos.x < this.position.x && nextPos.y == this.position.y){
            this.angle = 3*HALF_PI;
        }
        // down
        else if(nextPos.y > this.position.y && nextPos.x == this.position.x){
            this.angle = PI;
        }
        // up
        else if(nextPos.y < this.position.y && nextPos.x == this.position.x){
            this.angle = 0;
        }
    };

    // if penned, want to spin about at certain interval
    this.pennedRotate = function(){
        if(this.penTimer === 0){
            this.angle = round(random(0, 3))*HALF_PI;

            this.penTimer = 60;
        }


        if(this.penTimer > 0){
            this.penTimer--;
        }
    }

    // update position and velocity 
    this.update = function(){

        // check ifposition is in pen, if so update state
        if((this.position.x === 9 || this.position.x === 10) && (this.position.y === 9 || this.position.y === 10)){
            this.penned = true;
            this.path = [];
        }

        // only update is move counter expired
        if(this.moveCounter === 0){
            // move by popping first item off list, take that
            if(this.path.length > 0){
                var nextPos = this.path.shift();

                // check that next position is not player 
                if(!(nextPos.x == game.player.position.x && nextPos.y == game.player.position.y)){
                    // check that next position is not another adverary
                    var isAdv = false;
                    for(var i = 0; i < game.adversaries.length; i++){
                        if(game.adversaries[i] != this 
                            && nextPos.x == game.adversaries[i].position.x
                            && nextPos.y == game.adversaries[i].position.y){
                                isAdv = true;
                            }
                    }
                    // can succesfully advance position, next position is not another adversary
                    if(!isAdv){
                        this.calculateAngle(nextPos);
                        this.position = nextPos;
                    }
                }else{
                    game.playerCaughtTimer = 30;
                }
            }

            this.moveCounter = 10;
        }

        // only want to re-calculate A* if player has changed 
        // position, because if player is still in same spot, use
        // already calculated path
        if(game.player.position.x != this.prevX || game.player.position.y != this.prevY){
            
            // do not need to calculate A* if been penned
            if(!this.penned){
                this.prevX = game.player.position.x;
                this.prevY = game.player.position.y;
                this.calculateAStar();
            }
            // if penned, place only in pen
            else{
                this.pennedRotate();
            }
        }

        // update movement counter
        if(this.moveCounter > 0){
            this.moveCounter--;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
/* A Player 
    * A player can move in the 4 cardinal directions.
    * A player is controlled with the arrow keys. They 
    * can not move through walls, and can not go into
    * the pen in the center of the screen. They are faster
    * than adversaries, but will be defeated when encountered
    * by an adversary.
    */ 
var player = function(x, y){
    this.position = new createVector(x, y);
    this.size = 20;

    // track direction pointing, start pointing up
    this.angle = 0;

    // keep timer for when can move again
    this.moveTimer = 0;

    // animate with timer and state
    this.animationTimer = 0;
    this.animationState = -1;

    // draw player according to position, and direction
    this.draw = function(){

        push();
        // draw relative to position and angle
        translate(this.position.x*20 + 10, this.position.y*20 + 10);
        rotate(this.angle);
        
        // draw as dog
        noStroke();

        fill(255, 255, 255);
        
        // animate legs
        if(game.playerCaughtTimer === 0 && game.state === 1){
            if(this.animationState === 1 && this.animationTimer > 0){   
                fill(255, 255, 255);
                ellipse(-3, -6, 2, 8);
                ellipse(3, -6, 2, 8);
            }else if(this.animationState === -1 && this.animationTimer > 0){
                ellipse(-3, 6, 2, 8);
                ellipse(3, 6, 2, 8);
            }
        }

        // body
        fill(24, 26, 25);
        ellipse(0, 0, 8, 16);
        ellipse(3, 4, 3, 6);
        ellipse(-3, 4, 3, 6);
        //head
        ellipse(0, -8, 4, 6); 
        fill(220, 220, 220);
        ellipse(0, -6, 4, 2);
        ellipse(0, -8, 2, 4);

        pop();
    };

    // update player with arrow keys
    this.update = function(){

        // only update if can move again
        if(this.moveTimer === 0){
            var xDir = 0;
            var yDir = 0;
            // can only press 1 key at a time
            if (game.keyArray[LEFT_ARROW] === 1 && game.keyArray[RIGHT_ARROW] === 0 
                && game.keyArray[UP_ARROW] === 0 && game.keyArray[DOWN_ARROW] === 0) {
                xDir = -1;
            }
            if (game.keyArray[RIGHT_ARROW] === 1 && game.keyArray[LEFT_ARROW] === 0 
                && game.keyArray[UP_ARROW] === 0 && game.keyArray[DOWN_ARROW] === 0) {
                xDir = 1;
            }
            if(game.keyArray[UP_ARROW] === 1 && game.keyArray[DOWN_ARROW] === 0 
                && game.keyArray[RIGHT_ARROW] === 0 && game.keyArray[LEFT_ARROW] === 0){
                yDir = -1;
            }
            if(game.keyArray[DOWN_ARROW] === 1 && game.keyArray[UP_ARROW] === 0 
                && game.keyArray[RIGHT_ARROW] === 0 && game.keyArray[LEFT_ARROW] === 0){
                yDir = 1;
            }
            
            if(!(xDir === 0 && yDir === 0)){
                // inidicate whether or not desired position has a wall
                var addflag = true;

                this.direction = new createVector(xDir, yDir);
                // check collision 
                for(var i = 0; i < game.walls.length; i++){
                    if(game.walls[i].collidesWith(this.position.x + this.direction.x, this.position.y + this.direction.y)){
                        addflag = false;
                    }
                }   
                // also check that can't go in pen    
                if((this.position.x + this.direction.x === 9 || this.position.x + this.direction.x === 10) && (this.position.y + this.direction.y === 9 || this.position.y + this.direction.y === 10)){
                    addflag = false;
                }
                if(addflag){
                    // update vectors
                    this.position.add(this.direction);
                    this.moveTimer = 5;

                    this.angle = this.direction.heading() + HALF_PI;
                    
                    // animate
                    if(this.animationTimer === 0){
                        this.animationTimer = 10;
                        this.animationState *= -1;
                    }
                }
            }
        }

        // decrement movement timer 
        if(this.moveTimer > 0){
            this.moveTimer--;
        }

        // decrement animation timer
        if(this.animationTimer > 0){
            this.animationTimer--;
        }
    };

};

// ---------------------------------------------
// ---------------------------------------------
// convert tilemap into objects for game object
gameObject.prototype.readTileMap = function(){

    // generate a random position for the player, somewhere in outer rim of maze
    var randX = round(random(this.tilemap.length -1));
    var randY = round(random(this.tilemap[0].length -1));
    while(this.tilemap[randY][randX] !== " " || ((randX > 4 && randX < 15) && (randY > 4 && randY < 15))){
        randX = round(random(this.tilemap.length -1));
        randY = round(random(this.tilemap[0].length -1));
    }
    this.player = new player(randX, randY);

    // place two adversaries in random empty position, make sure valid position or not in/near pen
    // also make sure to generate a certain distance from player, so A* can run 
    // effectively and game is not impossible
    // position and not in or near pen.
    for(var i = 0; i < 2; i++){
        var randX = round(random(this.tilemap.length -1));
        var randY = round(random(this.tilemap[0].length -1));
        var playerDist = dist(this.player.position.x, this.player.position.y, randX, randY);
        while(this.tilemap[randY][randX] !== " " || 
            ((randX > 6 && randX < 13) && (randY > 6 && randY < 13))
            || (playerDist < 8 || playerDist > 10)){
            randX = round(random(this.tilemap.length -1));
            randY = round(random(this.tilemap[0].length -1));
            playerDist = dist(this.player.position.x, this.player.position.y, randX, randY);
        }
        // push new adversary and update tilemap so don't accidentally 
        // put two adversaries in same spot
        this.adversaries.push(new adversary(randX, randY));
        var temp  = this.tilemap[randY].substr(0, randX) + 'a' + this.tilemap[randY].substr(randX + 1, randX + this.tilemap[randY].length);
        this.tilemap[randY] = temp;
    }

    // x and y are flipped for this loop because when
    // iterating, each line of the tilemap is the y
    // and each character of that line is the x
    for(var y = 0; y < this.tilemap.length; y++){
        // add array for each y element in tilemap
        this.graph[y] = new Array(this.tilemap[y].length);
        for(var x = 0; x < this.tilemap[y].length; x++){
            // if encounter a wall, add to walls list
            if(this.tilemap[y][x] == "w"){
                this.walls.push(new wall(x, y));
            
                // track this for A*
                this.graph[y][x] = -1;
            }
            else{
                // track this for A*
                this.graph[y][x] = 0;
            }                  
        }
    }
};

// ---------------------------------------------
// ---------------------------------------------
// draw things that need to be drawn from the 
// gameObject function
gameObject.prototype.draw = function(){  
    
    // draw walls, but only those that appear within current
    // frame
    for(var i = 0; i < this.walls.length; i++){
        this.walls[i].draw();
    }

    // draw player
    this.player.draw();

    // draw pen
    noFill();
    strokeWeight(4);
    stroke(112, 84, 17);
    rect(180,180, 40, 40);
    strokeWeight(1);

    // draw adversaries
    for(var i = 0; i < this.adversaries.length; i++){
        this.adversaries[i].draw();
    }
    // draw menu, if applicable
    if(this.state === 0){
        stroke(0, 0, 0);
        fill(255, 255, 255);
        rect(100, 100, 200, 200, 20);
        rect(120, 320, 160, 40, 20);
        fill(0, 0, 0);
        textSize(20);
        textAlign(CENTER);
        noStroke();
        text('Round up the sheep!', 200, 130);
        text('Use the arrow keys', 200, 160);
        text('to move the dog, and', 200, 190);
        text('try to get the sheep', 200, 220);
        text('to chase you to the', 200, 250);
        text('pen in the middle.', 200, 280);
        text('Click to start', 200, 345);
    }else if(this.state === 2){
        fill(255, 255, 255);
        stroke(0, 0, 0);
        rect(100, 50, 200, 100, 20);
        rect(100, 320, 200, 40, 20);
        fill(0, 0, 0);
        textSize(20);
        textAlign(CENTER);
        noStroke();
        text('Game over!', 200, 80);
        if(this.gameOverMsg === "win"){
            text("You win!", 200, 110);
        }else if(this.gameOverMsg === "lose"){
            text("You lose!", 200, 110);
        }
        text('Click to try again', 200, 345);
    }

};

// ---------------------------------------------
// ---------------------------------------------
// update game's drawing state in this function
gameObject.prototype.update = function(){  
    if(this.playerCaughtTimer === 0){
        // update the player
        this.player.update();
    }else{
        // if player has been caught, pause for 2 seconds then update
        this.playerCaughtTimer--;

        if(this.playerCaughtTimer === 0){
            this.state = 2;
            this.gameOverMsg = "lose";
        }
    }

    var penCount = 0;
    // update adversaries, keeping track of number penned
    for(var i = 0; i < this.adversaries.length; i++){
        this.adversaries[i].update();
        if(this.adversaries[i].penned){
            penCount++;
        }
    }
    // if all penned, game is over
    if(penCount === this.adversaries.length && this.gameOverTimer === 0){
        this.gameOverTimer = 60;
    }
    // once all animals have been penned, wait for 2 seconds before
    // displaying game over
    if(this.gameOverTimer > 0){
        this.gameOverTimer--;
        if(this.gameOverTimer === 0){
            this.state = 2;
            this.gameOverMsg = "win";
        }
    }

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
    // if click during game over menu, go back to main menu
    else if(game.state === 2 && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height){
        game.state = 0;
        game.setup();
        game.readTileMap();
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
/* setup the game by instantiating necessary objects
    * this function gets once per game iteration 
    */
var setup = function(){

    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');

    game.setup();

    // parse tilemap
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
    background(184, 132, 64); 
    
    if(game.state === 0 || game.state === 2){
        game.draw();
    }else if(game.state === 1){
        game.draw();
        game.update();
    }

};  