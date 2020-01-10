/* zapline
 * a line spanning from x1, y1 to x2, y2
 * that is drawn as a line with lightning effects
 * by dividing up the distance into points (a sort of subidivision)
 * and then fuzzing them with some random x, y addition
 */
var zapline = function(x1, y1, x2, y2){
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;

    // count frames
    this.frameCount = 0;

    // points to draw lightning between 
    this.points = [];
    // add some points

    // ---------------------------------------------
    // ---------------------------------------------
    // draw zapline by connecting generated points according to center x and y
    this.draw = function(cx, cy){
        stroke(0, 0, 0, 100);
        strokeWeight(4);
        //line(this.x1, this.y1, this.x2, this.y2);

        // draw points
        stroke(20, 201, 35);
        for(var i = 1; i < this.points.length; i++){
            push();
            translate(width/2 - cx + this.points[i].x, width/2 - cy + this.points[i].y);
            line(0, 0, (this.points[i-1].x - this.points[i].x), (this.points[i-1].y - this.points[i].y));
            pop();
        }
    };
    // ---------------------------------------------
    // ---------------------------------------------
    /* update zap line by creating new set of points, but
     * only do every 5 frames
     * subdivide by taking distance from x1, y1 to x2, y2 
     * and cutting into increments of 10. Then, add a random 
     * value between 0 and 5 to x, then repeat for y. Push this
     * new point onto points.
     */
    this.update = function(){
        this.frameCount++;
        if(this.frameCount % 5 === 0){
            this.points = [];
            var x = this.x1;
            var y = this.y1;
            var i = 0;
            var d = dist(this.x1, this.y1, this.x2, this.y2);
            while(i <= d){
                this.points.push(new createVector(x + random(0, 5), y + random(0, 5)));
                x += (this.x2 - this.x1)/10;
                y += (this.y2 - this.y1)/10;
                i += d/10;
            }
            this.points[this.points.length - 1] = new createVector(this.x2, this.y2);
        }
    };
    
};