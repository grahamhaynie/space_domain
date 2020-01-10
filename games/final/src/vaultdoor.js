/* vaultdoor
 * an object created for animating the transition between two menu screens,
 * where doors appear to come from the left and right of the screen, and
 * meet up in the middle, then retract
 */
var vaultdoor = function(){
    this.x = -75;
    this.xDir = 1;

    // ---------------------------------------------
    // ---------------------------------------------
    // reset vault door
    this.reset = function(){
        this.x = -75;
        this.xDir = 1;
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // draw as two vault doors coming in from left and right side
    this.draw = function(){

        fill(214, 214, 214);
        strokeWeight(5);
        stroke(0, 0, 0);

        // draw first door
        beginShape();
        vertex(-50, 0);
        // split into groups of 200
        for(var i = 0; i < height/200; i++){
            vertex(0 + this.x, i*200 + 0);
            vertex(25 + this.x, i*200 + 25);
            vertex(25 + this.x, i*200 + 75);
            vertex(this.x, i*200 + 100);
            vertex(this.x - 25, i*200 + 125);
            vertex(this.x - 25, i*200 + 175);
            vertex(this.x , i*200 + 200);
        }
        vertex(-50 + this.x, height);
        vertex(-50, height);
        endShape(CLOSE);

        // draw second door
        beginShape();
        vertex(width + 50, 0);
        // split into groups of 200
        for(var i = 0; i < height/200; i++){
            vertex(width - this.x, i*200 + 0);
            vertex(width - this.x + 25, i*200 + 25);
            vertex(width - this.x + 25, i*200 + 75);
            vertex(width - this.x, i*200 + 100);
            vertex(width - this.x - 25, i*200 + 125);
            vertex(width - this.x - 25, i*200 + 175);
            vertex(width - this.x , i*200 + 200);
        }
        vertex(width + 50 - this.x, height);
        vertex(width + 50 , height);
        endShape(CLOSE);

        strokeWeight(1);
    };

    // ---------------------------------------------
    // ---------------------------------------------
    // update x so that door appears to open and close
    this.update = function(){
        if(this.xDir === 1){
            if(this.x < width/2){
                this.x+= 10;
            }else{
                this.xDir = -1;
            }
        }else{
            if(this.x > -50){
                this.x-= 10;
            }
        }
    };

}