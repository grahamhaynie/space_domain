/* menuPlayer
 * a dummy player that can be drawn on the menu, so that the player 
 * can test out the controls
 * a menuPlayer can be rotated with the arrow keys
 */ 
var menuPlayer = function(x, y){
    this.position = createVector(x, y);
    this.size = 60;

    // dummy wall for drawing
    this.dummyWall = new wall(0, 0);

    // track direction pointing, start pointing up
    this.angle = 0;

    // offset for drawing appropriate sprite
    this.spriteOffsetX = 0;
    this.spriteOffsetY = 0;

    // timer for when can do shoot animation again
    this.shootTimer = 0;

    // lasers to draw
    this.lasers = [];

    // timer for when can do pickup animation again
    this.pickupTimer = 0;  
    this.pickup = false;

    // ---------------------------------------------
    // ---------------------------------------------
    // reset menu player's state
    this.reload = function(){
        this.angle = 0;
        this.shootTimer = 0;
        this.lasers = [];
        this.pickupTimer = 0;  
        this.pickup = false;
        this.spriteOffsetX = 0;
        this.spriteOffsetY = 0;
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw at appropriate position and rotation using sprite
    this.draw = function(){
        push();
        // always draw player in center of screen
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        fill(255, 0, 0);
        stroke(0, 0, 0);
        image(imageDict['character'][this.spriteOffsetY][this.spriteOffsetX],-this.size/2, -this.size/2, this.size, this.size);
        
        // if pickup animation, draw a wall
        if(this.pickup){
            this.dummyWall.drawInHand();
        }
        pop();

        // draw lasers
        for(var i = 0; i < this.lasers.length; i++){
            this.lasers[i].draw(width/2, height/2);
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update player state
    this.update = function(){
        // just want to record direction looking in, so player
        // can just look in particular direction
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
        if(!(xDir === 0 && yDir === 0)){
            this.direction = createVector(xDir, yDir);

            this.angle = this.direction.heading() + HALF_PI;
        }

        // if player presses shift, toggle on/off the pickup animation
        // but make sure timer is zero and not shooting
        if(game.keyArray[SHIFT] === 1 && this.pickupTimer === 0 && this.shootTimer === 0){
            if(this.spriteOffsetX === 0){
                this.spriteOffsetX = 1;
                this.pickup = true;
                this.pickupTimer = 15;
            }else{
                this.spriteOffsetX = 0;
                this.pickup = false;
                this.pickupTimer = 15;
            }
        }

        // if player presses space, shoot a laser, but player
        // can not have a block picked up in animation
        if(game.keyArray[32] === 1 && this.pickupTimer === 0 &&  !this.pickup && this.shootTimer === 0){
            // create laser
            var laserVector = createVector(this.position.x + cos(this.angle - HALF_PI/3)*this.size/4, this.position.y + sin(this.angle - HALF_PI/3)*this.size/4);
            this.lasers.push(new laser(laserVector.x, laserVector.y, this.angle));
            this.shootTimer = 15;

            // update sprite
            this.spriteOffsetX = 0;
            this.spriteOffsetY = 1;
        }

        // decrement timers
        if(this.pickupTimer > 0){
            this.pickupTimer--;
        }
        if(this.shootTimer > 0){
            this.shootTimer--;

            // reset sprite
            if(this.shootTimer === 5){
                this.spriteOffsetX = 0;
                this.spriteOffsetY = 0;
            }
        }

        // update lasers
        for(var i = 0; i < this.lasers.length; i++){
            this.lasers[i].update();
            // if laser is out of canvas, remove from laser list
            if(this.lasers[i].position.x < -20 || this.lasers[i].position.x > this.width + 20 ||
                this.lasers[i].position.y < -20 || this.lasers[i].position.y > this.height + 20){
                    this.lasers.splice(i, 1);
                }
        }
    };
};