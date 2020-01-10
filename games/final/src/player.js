/* player
 * game's player, can be moved with the arrow keys. The player is 
 * always at the center of the screen. The player can not move through walls,
 * but the player can pick up and move walls.
 * 
 * To add: Player will be able to shoot and collect collectibles
 */ 
var player = function(x, y){
    this.position = new createVector(x, y);
    this.size = 60;

    // track direction pointing, start pointing up
    this.angle = 0;
    this.velocity = new createVector(0, 0);
    this.acceleration = new createVector(0, 0);
    this.drag = 0.8;

    // offset for drawing appropriate sprite
    this.spriteOffsetX = 0;
    this.spriteOffsetY = 0;

    // index of wall list highlighting
    this.highlightIndex = -1;

    // index of wall selected, -1 if none picked up
    this.wallIndex = -1;
    // a timer to track if can pickup/put down again 
    this.pickupTimer = 0;

    // timer to track if player can shoot again
    this.shootTimer = 0;

    // ---------------------------------------------
    // ---------------------------------------------
    // calculate the x, y where placing a block, and if
    // that position is legal
    this.getPlacePos = function(){
        // calculate where location of rectangle ahead of player will be
        var aheadVector = createVector(cos(this.angle - HALF_PI)*this.size, sin(this.angle - HALF_PI)*this.size);
        // get the X and Y for grid value of where to draw rect
        this.rectX = round((this.position.x + aheadVector.x - (this.position.x + aheadVector.x) % 40)/40 );
        this.rectY = round((this.position.y + aheadVector.y - (this.position.y + aheadVector.y) % 40)/40 );

        // if place is colliding with player, move until not colliding
        if(abs(this.rectX*40 + 20 - this.position.x) <= this.size/2 + 20 && abs(this.rectY*40 + 20 - this.position.y) <= this.size/2 + 20){
            // add to y if x overlap closer
            if(abs(this.rectX*40 + 20 - this.position.x) < abs(this.rectY*40 + 20 - this.position.y)){
                if(this.rectY*40 + 20 > this.position.y){
                    this.rectY += 1;
                }else{
                    this.rectY -= 1;
                }
            }
            // add to x if y overlap closer
            else{
                if(this.rectX*40 + 20 > this.position.x){
                    this.rectX += 1;
                }else{
                    this.rectX -= 1;
                }
            }
            
        }

        // check if position is within game boundary
        if(this.rectX !== -1 && this.rectX <= (game.maxX -20)/40 && this.rectY !== -1 && this.rectY <= (game.maxY -20)/40){
            this.validPosition = true;
        }else{
            this.validPosition = false;
        }

        // check that not placing on another wall
        for(var i = 0; i < game.walls.length; i++){
            if(game.walls[i].health > 0  && i != this.wallIndex && this.rectX*40 + 20 == game.walls[i].x && this.rectY*40 + 20 == game.walls[i].y){
                this.validPosition = false;
            }
        }

        // also check that not placing on adversary that is still alive
        for(var i = 0; i < game.adversaries.length; i++){
            if(game.adversaries[i].health > 0 && game.adversaries[i].collidesWith(this.rectX*40 + 20, this.rectY*40 + 20, 40)){
                this.validPosition = false;
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw player's sprite
    this.draw = function(){
        // if player has picked up wall, show that 
        if(this.wallIndex !== -1){
            this.getPlacePos();
            // draw position where would be putting down wall
            push();
            strokeWeight(4);
            noFill();
            // draw as green if in bounds, otherwise draw as red
            translate(width/2 - this.position.x, width/2 - this.position.y);
            if(this.validPosition){
                stroke(20, 201, 35);

                // if player is placing a turret, show the range of that turret
                if(game.walls[this.wallIndex] instanceof turret || game.walls[this.wallIndex] instanceof lighningTurret){
                    ellipse(this.rectX*40 + 20, this.rectY*40 + 20, game.walls[this.wallIndex].range, game.walls[this.wallIndex].range);
                }

            }else{
                stroke(201, 20, 35);
            }
            rect(this.rectX*40, this.rectY*40, 40, 40);

            strokeWeight(1);
            pop();
        }

        push();
        // always draw player in center of screen
        translate(width/2, height/2);
        rotate(this.angle);
        fill(255, 0, 0);
        stroke(0, 0, 0);
        //image(images[1].get(this.spriteOffsetX*300, this.spriteOffsetY*300, 300, 300),-this.size/2, -this.size/2, this.size, this.size);        
        image(imageDict['character'][this.spriteOffsetY][this.spriteOffsetX],-this.size/2, -this.size/2, this.size, this.size);

        // draw wall in player's hand
        if(this.wallIndex != -1){
            game.walls[this.wallIndex].drawInHand();
        }

        pop();

    };

    // ---------------------------------------------
    // ---------------------------------------------
    // handle movement of player
    this.move = function(){
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

        if(!(xDir === 0 && yDir === 0)){
            this.angle = this.velocity.heading() + HALF_PI;
        }

        // highlight wall that is in front of player
        var aheadVector = createVector(this.position.x + cos(this.angle - HALF_PI)*this.size/2, this.position.y + sin(this.angle - HALF_PI)*this.size/2);
        // get the X and Y for grid value of where to draw rect
        var rectX = round((aheadVector.x - (aheadVector.x) % 40)/40 );
        var rectY = round((aheadVector.y - (aheadVector.y) % 40)/40 );

        this.highlightIndex = -1;
        
        // check for colllision with walls
        for(var i = 0; i < game.walls.length; i++){
            // only check collisions with non-picked up blocks and health > 0 blocks
            if(!game.walls[i].pickedUp && game.walls[i].health > 0){
                // check for collision of y portion of velocity vector
                // if collide, set y velocity to zero
                if(game.walls[i].collidesWith(this.position.x, this.position.y + this.velocity.y, this.size)){
                    this.velocity.y = 0; 
                }

                // check for collision with x portion of velocity. 
                // if collide, set x velocity to zero
                if(game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y, this.size)){
                    this.velocity.x = 0; 
                }

                // check collide both
                if(game.walls[i].collidesWith(this.position.x + this.velocity.x, this.position.y + this.velocity.y, this.size)){
                    this.velocity.x = 0; 
                    this.velocity.y = 0; 
                }
            }
            
            // check if can highlight block, but only if block not picked up
            // also check that wall is of wall type or turret
            if(game.walls[i].health > 0 && game.walls[i].collidesWith(aheadVector.x, aheadVector.y, this.size/4) && this.wallIndex === -1 
                && (game.walls[i] instanceof wall || game.walls[i] instanceof turret || game.walls[i] instanceof lighningTurret)){
                this.highlightIndex = i;
            }
        }
        
        // also make sure player does not leave map 
        if(this.position.x + this.velocity.x < 0 || this.position.x + this.velocity.x > game.maxX){
            this.velocity.x = 0;
        }
        if(this.position.y + this.velocity.y < 0 || this.position.y + this.velocity.y > game.maxY){
            this.velocity.y = 0;
        }

        // update position after checking collisions
        this.position.add(this.velocity);

        if(this.highlightIndex != -1){
            game.walls[this.highlightIndex].highlightTimer = 5;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // handle picking up of blocks
    this.pickup = function(){
        // only handle change if timer expired
        if(this.pickupTimer === 0){
            // if player presses shift and does not have a wall picked up,
            // then they pick up a wall
            if (game.keyArray[SHIFT] === 1 && this.highlightIndex !== -1 && this.wallIndex === -1) {
                // set state of wall and player's wall and start timer
                this.wallIndex = this.highlightIndex;
                game.walls[this.wallIndex].pickedUp = true;
                this.pickupTimer = 30;

                // when player has picked up a wall, they move slower
                this.drag = 0.6;

                // update sprite
                this.spriteOffsetX = 1;
            }
            // if player presses shift and has a wall picked up, then they
            // place that wall
            else if(game.keyArray[SHIFT] === 1 && this.wallIndex !== -1 && this.validPosition){
                // update wall's state
                game.walls[this.wallIndex].pickedUp = false;
                game.walls[this.wallIndex].x = this.rectX*40 + 20;
                game.walls[this.wallIndex].y = this.rectY*40 + 20;

                // reset state and start timer
                this.wallIndex = -1;
                this.pickupTimer = 30;

                // when player has put down a wall, they move faster 
                this.drag = 0.825;  

                // update sprite
                this.spriteOffsetX = 0;
            }
        }

        // update pickup timer
        if(this.pickupTimer > 0){
            this.pickupTimer--;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // if player shoots, handle creating a new laser
    this.shoot = function(){
        // but the player can not shoot while picking up a wall
        if(this.shootTimer === 0 && this.wallIndex === -1){
            // shoot if press spacebar and can shoot again
            if (game.keyArray[32] === 1) {
                this.shootTimer = 15;
                
                // update player's sprite
                this.spriteOffsetX = 0;
                this.spriteOffsetY = 1;

                // add a new laser based on where player's laser gun is
                var laserVector = createVector(this.position.x + cos(this.angle - HALF_PI/3)*this.size/4, this.position.y + sin(this.angle - HALF_PI/3)*this.size/4);
                game.lasers.push(new laser(laserVector.x, laserVector.y, this.angle, true));
            }
        }

        // update timer
        if(this.shootTimer > 0){
            this.shootTimer--;

            // reset player's sprite
            if(this.shootTimer === 5){
                this.spriteOffsetX = 0;
                this.spriteOffsetY = 0;
            }
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update player state according to arrow key presses
    this.update = function(){
        this.move();
        this.pickup();
        this.shoot();
    };
};