/* boot -
 * A boot is a drawing of the player's bootsteps, that is drawn and dissapears with time
 */
var boot = function(x, y, orientation, angle){
    this.x = x;
    this.y = y;
    this.size = 25;

    // alternate orientation of boots (2 sprites)
    this.orientation = orientation;

    this.angle = angle;

    // ---------------------------------------------
    // ---------------------------------------------
    // draw according to cx, cy where the cx, cy are 
    // the center x, y coordinate of the game - so that
    // boots are only drawn when they are on the screen
    this.draw = function(cx, cy){
        push();
        translate(width/2 - cx + this.x, width/2 - cy + this.y);
        rotate(this.angle);
        if(this.orientation === 1){
            image(imageDict['boot'][0][0], -this.size/2, -this.size/2, this.size, this.size);
        }else{
            image(imageDict['boot'][1][0], -this.size/2, -this.size/2, this.size, this.size);
        }
        pop();
    };
}