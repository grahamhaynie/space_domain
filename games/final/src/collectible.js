/* collectible - 
 * A collectible has an x, y, and dissapears when 
 * collected by the player. 
 */
var collectible = function(x, y){

    this.position = new createVector(x, y);
    this.size = 20;

    // give random sprite position and angle
    this.spriteOffsetX = round(random(0, 2));
    this.angle = random(0, 2*PI);

    // ---------------------------------------------
    // ---------------------------------------------
    // draw according to cx, cy where the cx, cy are 
    // the center x, y coordinate of the game - so that
    // only drawn when on the screen
    this.draw = function(cx, cy){
        push();
        translate(width/2 - cx + this.position.x, width/2 - cy + this.position.y);
        rotate(this.angle);
        image(imageDict['collectible'][0][this.spriteOffsetX], -this.size/2, -this.size/2, this.size, this.size);
        pop();
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update state of collectible
    this.update = function(playerX, playerY){
        this.angle += 0.01;

        // if distance to player is less than 100, gradually move towards player
        if(abs(this.position.x - playerX) < 150 && abs(this.position.y - playerY) < 150){
            var dx = this.position.x - playerX;
            var dy = this.position.y - playerY;
            
            var velocity = new createVector(-dx, -dy);
            velocity.normalize();
            velocity.mult(1.5);
            this.position.add(velocity);
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // check collision of something with an x, y with collectible
    // return true if the otherX, otherY collide with this.
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.position.x) < otherSize/3 && abs(otherY - this.position.y) < otherSize/3){
            return true;
        }else {
            return false;
        }
    };
};