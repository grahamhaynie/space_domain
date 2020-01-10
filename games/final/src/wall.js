/* Wall -
* a wall has an x, y (center) that does not chance
* a wall is drawn as a 30x30 box.
*/
var wall = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 40;

    // to highlight if player is about to select current wall
    this.highlightTimer = 0;

    // track if wall is picked up, if picked up do not draw
    this.pickedUp = false;

    // the health of the wall
    this.health = 100;
    
    // offset for accessing sprite map
    this.spriteOffsetX = 0;
    this.spriteOffsetY = 0;

    // show timer for tutorial
    this.showRedBorder = false;

    // ---------------------------------------------
    // ---------------------------------------------
    // draw according to cx, cy where the cx, cy are 
    // the center x, y coordinate of the game - so that
    // walls are only drawn when they are on the screen
    this.draw = function(cx, cy){
        push();
        translate(width/2 - cx + this.x, width/2 - cy + this.y);
        if(this.highlightTimer > 0 || this.showRedBorder){
            strokeWeight(4);
            if(this.highlightTimer > 0){
                stroke(20, 201, 35);
            }else{
                stroke(201, 20, 35);
            }
            noFill();
            image(imageDict['wall'][this.spriteOffsetY][this.spriteOffsetX], -this.size/2, -this.size/2, this.size, this.size);
            rect(-this.size/2 + 2, -this.size/2 + 2, this.size - 4, this.size - 4);
            strokeWeight(1);
        }else{
            image(imageDict['wall'][this.spriteOffsetY][this.spriteOffsetX], -this.size/2, -this.size/2, this.size, this.size);
        }
        pop();
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // if drawing in player's hand, assume that already been rotated and translated
    this.drawInHand = function(){
        fill(82, 74, 63);
        stroke(0, 0, 0);
        fill(82, 74, 63);
        image(imageDict['wall'][this.spriteOffsetY][this.spriteOffsetX], -this.size/2, -this.size*1.5, this.size, this.size);
    };


    // ---------------------------------------------
    // ---------------------------------------------
    // update wall's state
    this.update = function(){
        if(this.highlightTimer > 0){
            this.highlightTimer--;
        }

        // update sprite
        if(this.health > 80){
            this.spriteOffsetX = 0;
        }else if(this.health <= 80 && this.health > 50){
            this.spriteOffsetX = 1;
        }else if(this.health <= 50 && this.health > 20){
            this.spriteOffsetX = 2;
        }else if(this.health <= 20){
            this.spriteOffsetX = 3;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------    
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
