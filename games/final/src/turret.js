/* Turret -
 * A turret will look for an adversary until one comes within 
 * its range. When that adversary comes into its range, it will lock on
 * and fire at a pre-defined rate until the adversary is either dead or 
 * out of its range. A turret can take damage from adversaries, and can 
 * shoot unlimited lasers until it is destroyed. A turret can also be moved
 * by a player.
 */
var turret = function(x, y){
    this.x = x;
    this.y = y;
    this.size = 40;

    // to highlight if player is about to select current turret
    this.highlightTimer = 0;

    // track if turret is picked up, do not shoot or track enemy
    this.pickedUp = false;

    // the health of the turret
    this.health = 100;
    
    // offset for accessing sprite map of base and turret
    this.spriteOffsetXBase = 0;
    this.spriteOffsetYBase = 0;
    this.spriteOffsetXTurret = 0;

    // angle of turret
    this.turretAngle = 0;
    // range of turret
    this.range = 250;

    // state of turret
    // 0 = searching, no enemy in range
    // 1 = found an enemy, locked on 
    this.turretState = 0;

    // only attempt to track a new adversary every 30 frames
    this.trackTimer = 0;

    // track index of adversary shooting
    this.targetIndex = -1;

    // timer for when can shoot again
    this.shootTimer = 15;

    // show timer for tutorial
    this.showRedBorder = false;

    // ---------------------------------------------
    // ---------------------------------------------
    // draw according to cx, cy where the cx, cy are 
    // the center x, y coordinate of the game - so that
    // only drawn when on the screen
    this.draw = function(cx, cy){
        push();
        translate(width/2 - cx + this.x, width/2 - cy + this.y);
        // base
        image(imageDict['wall'][this.spriteOffsetYBase][this.spriteOffsetXBase], -this.size/2, -this.size/2, this.size, this.size);
        // highlight
        if(this.highlightTimer > 0 || this.showRedBorder){
            strokeWeight(4);
            if(this.highlightTimer > 0){
                stroke(20, 201, 35);
            }else{
                stroke(201, 20, 35);
            }
            noFill();
            rect(-this.size/2 + 2, -this.size/2 + 2, this.size - 4, this.size - 4);
            strokeWeight(1);
        }
        // turret
        rotate(this.turretAngle);
        image(imageDict['turret'][0][this.spriteOffsetXTurret], -this.size/2, -this.size/2, this.size, this.size);
        
        pop();

    };

    // ---------------------------------------------
    // ---------------------------------------------
    // if drawing in player's hand, assume that already been rotated and translated
    this.drawInHand = function(){
        fill(82, 74, 63);
        stroke(0, 0, 0);
        fill(82, 74, 63);
        // base
        image(imageDict['wall'][this.spriteOffsetYBase][this.spriteOffsetXBase], -this.size/2, -this.size*1.5, this.size, this.size);
        // turret
        image(imageDict['turret'][0][this.spriteOffsetXTurret], -this.size/2, -this.size*1.5, this.size, this.size);
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // if the turret is in the searching state, this function is used to 
    // find a new adversary in range to lock on to
    this.turretSearch = function(){

        if(this.trackTimer === 0){
            // if adversary distance becomes less than the range of turret, lock on to that adversary
            for(var i = 0; i < game.adversaries.length; i++){
                if(game.adversaries[i].health > 0 && dist(game.adversaries[i].position.x, game.adversaries[i].position.y, this.x, this.y) < this.range/2){
                    this.turretState = 1;
                    this.targetIndex = i;
                }
            }
        }

        if(this.trackTimer > 0){
            this.trackTimer--;
        }

    };

    // ---------------------------------------------
    // ---------------------------------------------
    // if the turret has locked on to an enemy, shoot that enemy
    this.turretShoot = function(){
        // check that adversary still exists and has health > 0
        if(this.targetIndex !== -1 && game.adversaries[this.targetIndex].health > 0){
            // only shoot at defined rate
            if(this.shootTimer > 0){
                this.shootTimer--;
                if(this.shootTimer === 0){
                    // calculate angle of adversary and set current angle to be that angle
                    var dx = game.adversaries[this.targetIndex].position.x - this.x;
                    var dy = game.adversaries[this.targetIndex].position.y - this.y;
                    this.turretAngle = createVector(-dx, -dy).heading() - HALF_PI;

                    // shoot laser in direction of adversary
                    game.lasers.push(new laser(this.x + cos(this.turretAngle - HALF_PI)*this.size/2, this.y + sin(this.turretAngle - HALF_PI)*this.size/2, this.turretAngle, false));

                    this.shootTimer = 15;
                }
            }
        }
        // if adversary no longer exists or is defeated, go back to searching state
        else{
            this.turretState = 0;
            this.trackTimer = 30;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update turret's state
    this.update = function(){
        if(this.highlightTimer > 0){
            this.highlightTimer--;
        }

        // update base sprite
        if(this.health > 80){
            this.spriteOffsetXBase = 0;
        }else if(this.health <= 80 && this.health > 50){
            this.spriteOffsetXBase = 1;
        }else if(this.health <= 50 && this.health > 20){
            this.spriteOffsetXBase = 2;
        }else if(this.health <= 20){
            this.spriteOffsetXBase = 3;
        }

        // do not shoot if picked up
        if(!this.pickedUp){
            // if no enemy found, search
            if(this.turretState === 0){
                this.turretSearch();
            }
            // if enemy locked on, shoot
            else if(this.turretState === 1){
                this.turretShoot();
            }
        }else{
            this.turretState = 0;
            this.targetIndex = -1;
        }
    };

    // ---------------------------------------------
    // ---------------------------------------------    
    // check collision of something with an x, y with turret base
    // return true if the otherX, otherY collide with this turret,
    // otherwise return false
    this.collidesWith = function(otherX, otherY, otherSize){
        if(abs(otherX - this.x) < this.size/2 + otherSize/2 && abs(otherY - this.y) < this.size/2 + otherSize/2){
            return true;
        }else {
            return false;
        }
    };

};
