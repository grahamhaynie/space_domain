/* Base - 
 * The player attempst to defend the base, while adversaries
 * try to attack the base. When adversaries reach the base,
 * they cause it damage. A base can not move, and has a pre-defined
 * health that when depleted, is destroyed. The player can
 * not walk through the base.
 */
 var base = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 40;

    // health of base
    this.health = 100;
    this.maxHealth = 100;

    // track when base has been defeated
    this.defeated = false;

    // show timer for tutorial
    this.showRedBorder = false;

    // ---------------------------------------------
    // ---------------------------------------------
    // draw according to cx, cy where the cx, cy are 
    // the center x, y coordinate of the game - so that
    // base is only drawn when on the screen
    this.draw = function(cx, cy){
        push();
        translate(width/2 - cx + this.x, width/2 - cy + this.y);

        // draw base for now as rectangle
        if(this.showRedBorder){
            strokeWeight(4);
            stroke(201, 20, 35);
        }else{
            stroke(0, 0, 0);
        }
        fill(255, 255, 255);
        rect(-this.size/2, -this.size/2, this.size, this.size);
        strokeWeight(1);
        stroke(0, 0, 0);
        // draw health bar
        fill(0, 0, 0);
        rect(-this.size/4, -this.size/8, this.size/2, this.size/4);
        fill(20, 201, 35);
        rect(-this.size/4, -this.size/8, this.size/2 * this.health/this.maxHealth, this.size/4);
        pop();
    };

    // ---------------------------------------------
    // ---------------------------------------------    
    // update base's state
    this.update = function(){
        // track when base has been defeated
        if(this.health <= 0 && !this.defeated){
            this.defeated = true;
            game.numberBases--;
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