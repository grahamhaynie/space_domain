/* Lighning Turret -
 * A lighning turret will wait until adversary until an adversary comes
 * its range. When an adversary comes into its range, it will shoot a lighning
 * strike in its direction, and if another adversary is close enough will chain
 * the lighning strike towards that adversary, and so on. 
 * It can take damage from adversaries, and can shoot unlimited lighning strikes
 * until destroyed. It can also be moved by a player.
 *
 */
var lighningTurret = function(x, y){
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

    // track when to change sprite
    this.lighningSpriteTimer = 5;

    // range of turret
    this.range = 250;

    // list to contain zap lines
    this.zaplines = [];

    // state of turret
    // 0 = searching, no enemy in range
    // 1 = found an enemy, locked on 
    this.turretState = 0;

    // only attempt to track a new adversary every 30 frames
    this.trackTimer = 0;

    // track index of adversary shooting
    this.targetIndex = -1;

    // timer for when can shoot again
    this.shootTimer = 30;

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
        if(this.highlightTimer > 0){
            strokeWeight(4);
            stroke(20, 201, 35);
            noFill();
            rect(-this.size/2 + 2, -this.size/2 + 2, this.size - 4, this.size - 4);
            strokeWeight(1);
        }
        // turret
        image(imageDict['lightningTurret'][0][this.spriteOffsetXTurret], -this.size/2, -this.size/2, this.size, this.size);
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
        image(imageDict['lightningTurret'][0][this.spriteOffsetXTurret], -this.size/2, -this.size*1.5, this.size, this.size);
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

                    this.zaplines = [];
                    // send lighning bolt towards adversary
                    this.zapTimer = 10;
                    this.zaplines.push(new zapline(this.x, this.y, game.adversaries[this.targetIndex].position.x, game.adversaries[this.targetIndex].position.y));
                    // damange adversary and check if defeated
                    game.adversaries[this.targetIndex].health -= 20;

                    // check if health < 0, if so update sprite
                    if(game.adversaries[this.targetIndex].health <= 0){
                        game.adversaries[this.targetIndex].defeatTimer = 15;
                        game.adversaries[this.targetIndex].defeated = true;
                        game.adversaries[this.targetIndex].spriteOffsetY = 1;
                    }

                    // check for more adversaries, if applicable
                    if(game.adversaries.length > 1){

                        // look for other adversaries, check all to see if in range, making 
                        // sure to only check once, go until no close enough adversaries
                        var found = [];
                        found.push(this.targetIndex);
                        for(var i = 0; i < game.adversaries.length; i++){
                            if(found.length < game.adversaries.length){
                                // check if i is in found
                                var alreadyFound = false;
                                for(var f = 0; f < found.length; f++){
                                    if(i === found[f]){
                                        alreadyFound = true;
                                    }
                                }
                                if(!alreadyFound && !game.adversaries[i].defeated){
                                    var d = dist(game.adversaries[i].position.x, game.adversaries[i].position.y, game.adversaries[this.targetIndex].position.x, game.adversaries[this.targetIndex].position.y);
                                    // make sure in range and not line of length 0
                                    if(d < this.range/2 && d > 0){
                                        this.zaplines.push(new zapline(game.adversaries[this.targetIndex].position.x, game.adversaries[this.targetIndex].position.y, game.adversaries[i].position.x, game.adversaries[i].position.y));
                                        this.targetIndex = i;
                                        found.push(i);
                                        game.adversaries[i].health -= 20;
                                        // check if health < 0, if so update sprite
                                        if(game.adversaries[i].health <= 0){
                                            game.adversaries[i].defeatTimer = 15;
                                            game.adversaries[i].defeated = true;
                                            game.adversaries[i].spriteOffsetY = 1;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    this.shootTimer = 30;
                    this.turretState = 0;
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

        // update zap lines if timer > 0
        if(this.zapTimer > 0){
            this.zapTimer--;
            for(var i = 0; i < this.zaplines.length; i++){
                this.zaplines[i].update();
            }

            // if timer becomes 0 remove zap lines
            if(this.zapTimer === 0){
                this.zaplines = [];
            }
        }

        // update turret sprite
        if(this.lighningSpriteTimer > 0){
            this.lighningSpriteTimer--;

            if(this.lighningSpriteTimer === 0){
                this.lighningSpriteTimer = 5;
                this.spriteOffsetXTurret++;
                if(this.spriteOffsetXTurret > 3){
                    this.spriteOffsetXTurret = 0;
                }
            }
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
