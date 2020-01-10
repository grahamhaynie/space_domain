// ---------------------------------------------
// ---------------------------------------------
// globals used to store state of drawing

// track if hover over button or not
var hover = false;

// track position of zoom slider, start in middle
var zoom = 40;

// ---------------------------------------------
// ---------------------------------------------
// sort dictionary dict by keys from least to greatest
var sortByKeys = function(dict){
    // sort keys
    var sortedKeys = [];
    for(var key in dict) {
        sortedKeys[sortedKeys.length] = key;
    }
    sortedKeys.sort((a, b) => a - b);
    // correspond values in new dictionary to sorted keys in old
    var sortedDict = {};
    for(var i = 0; i < sortedKeys.length; i++){
        sortedDict[sortedKeys[i]] = dict[sortedKeys[i]];
    }
    return sortedDict;
};

// ---------------------------------------------
// ---------------------------------------------
/* cubeObject - 
    * a cube with vertex x, y, z spanning width w, height h, 
    * and depth d in the corresponding plane
    */
var cubeObject = function(x, y, z, w, h, d){

    // define the vertices 
    this.vertices = [
        [x,   y,   z  ], // 0
        [x,   y,   z+d], // 1
        [x,   y+h, z  ], // 2
        [x,   y+h, z+d], // 3
        [x+w, y,   z  ], // 4
        [x+w, y,   z+d], // 5
        [x+w, y+h, z  ], // 6
        [x+w, y+h, z+d]  // 7
    ];

    // define the normal vectors to each face
    // A = vertices that touch the face
    this.normalVerticesA = [
        [x, y + h/2, z + d/2],     // 0
        [x + w, y + h/2, z + d/2], // 1
        [x + w/2, y + h/2, z],     // 2
        [x + w/2, y + h/2, z + d], // 3
        [x + w/2, y, z + d/2],     // 4
        [x + w/2, y + h, z + d/2]  // 5
    ];
    // B = vertices away from face
    this.normalVerticesB = [
        [x - 100, y + h/2, z + d/2],    // 0
        [x + w + 100, y + h/2, z + d/2],// 1
        [x + w/2, y + h/2, z - 100],    // 2
        [x + w/2, y + h/2, z + d + 100],// 3
        [x + w/2, y - 100, z + d/2],    // 4
        [x + w/2, y + h + 100, z + d/2] // 5
    ];

    // the face of the cube, where each item in the 
    // sublists is a node
    this.faces = [
        [0, 1, 3, 2], // left
        [4, 5, 7, 6], // right
        [0, 2, 6, 4], // back
        [1, 3, 7, 5], // front
        [0, 1, 5, 4], // bottom
        [2, 3, 7, 6]  // top
    ];
};

// ---------------------------------------------
// ---------------------------------------------
// draw the face of a cube at given index
var drawCubeFace = function(cube, index){
    stroke(0, 0, 0);
    fill(115, 64, 16);
    beginShape();
    
    // iterate through vertices of current face, make shape
    for(var v = 0; v < cube.faces[index].length; v++){
        vertex(cube.vertices[cube.faces[index][v]][0], cube.vertices[cube.faces[index][v]][1]);
    }
    // end vertex
    vertex(cube.vertices[cube.faces[index][0]][0], cube.vertices[cube.faces[index][0]][1]);
    endShape();
    
};

// ---------------------------------------------
// ---------------------------------------------
/* chairObject - 
    * A 3D chair, made up of shapes
    */
var chairObject = function(){
    // construct a chair with a combination of shapes
    this.shapes = [];
    
    // legs
    this.shapes.push(new cubeObject(-75, 50, -75, 25, 100, 25));
    this.shapes.push(new cubeObject(50, 50, -75, 25, 100, 25));
    this.shapes.push(new cubeObject(50, 50, 50, 25, 100, 25));
    this.shapes.push(new cubeObject(-75, 50, 50, 25, 100, 25));
    
    // leg connectors
    this.shapes.push(new cubeObject(-70, 90, -50, 13, 13, 100));
    this.shapes.push(new cubeObject(-57, 90, -6, 114, 13, 13));
    this.shapes.push(new cubeObject(57, 90, -50, 13, 13, 100));
    
    // seat 
    this.shapes.push(new cubeObject(-75, 25, -75, 150, 25, 150));
    
    // back
    this.shapes.push(new cubeObject(-75, -75, -75, 25, 100, 25));
    this.shapes.push(new cubeObject(50, -75, -75, 25, 100, 25));
    this.shapes.push(new cubeObject(-50, 0, -70, 100, 15, 15));
    this.shapes.push(new cubeObject(-50, -25, -70, 100, 15, 15));
    this.shapes.push(new cubeObject(-50, -50, -70, 100, 15, 15));
    this.shapes.push(new cubeObject(-50, -75, -70, 100, 15, 15));

    // top
    this.shapes.push(new cubeObject(-100, -125, -75, 200, 50, 25));
    
    // sort all of the faces with positive z values by the furthest 
    // to the nearest - so the B value?
    this.sortNormal = function(startIndex, endIndex){
        
        var faces = {};
        for(var s = startIndex; s <= endIndex; s++){
            for(var f = 0; f < this.shapes[s].faces.length; f++){

                // calculate z component of the normal vector to the face
                var z = this.shapes[s].normalVerticesB[f][2] - this.shapes[s].normalVerticesA[f][2];
                
                if(z > 0){
                    faces[this.shapes[s].normalVerticesA[f][2]] = {};
                    faces[this.shapes[s].normalVerticesA[f][2]][s] = f;
                }
                
            }
        }
        faces = sortByKeys(faces);
        this.faces = faces;
    };

    // draw the faces in faces list
    this.drawFaces = function(){
        for(var z in this.faces){
            for(var s in this.faces[z]){
                drawCubeFace(this.shapes[s], this.faces[z][s]);
            }
        }
    };

    // draw the chair by sorting shapes by z values, and 
    // drawing in order of smallest z to largest z
    this.draw = function(){
        
        // draw order depending on where z vector of chair's seat "bottom" vector
        // is facing
        if(this.shapes[7].normalVerticesB[5][2] - this.shapes[7].normalVerticesA[5][2] < 0){
            // draw legs depending on z vector of if chair forward or backward
            // forward
            if(this.shapes[7].normalVerticesB[3][2] - this.shapes[7].normalVerticesA[3][2] > 0){
                this.sortNormal(0, 1);
                this.drawFaces();
                this.sortNormal(4, 6);
                this.drawFaces();
                this.sortNormal(2, 3);
                this.drawFaces();
            }
            // backward
            else{   
                this.sortNormal(2, 3);
                this.drawFaces();
                this.sortNormal(4, 6);
                this.drawFaces();
                this.sortNormal(0, 1);
                this.drawFaces();
            }
            // draw seat
            this.sortNormal(7, 7);
            this.drawFaces();
            
            // draw differntly if facing left or right
            // left
            if(this.shapes[7].normalVerticesB[0][2] - this.shapes[7].normalVerticesA[0][2] < 0){
                // post
                this.sortNormal(8, 8);
                this.drawFaces();
                // lattice
                this.sortNormal(10, 13);
                this.drawFaces();
                // post
                this.sortNormal(9, 9);
                this.drawFaces();
            }
            //right
            else{
                // post
                this.sortNormal(9, 9);
                this.drawFaces();
                // lattice
                this.sortNormal(10, 13);
                this.drawFaces();
                // post
                this.sortNormal(8, 8);
                this.drawFaces();
            }
            // top
            this.sortNormal(14, 14);
            this.drawFaces();
        }else{
            
            // top
            this.sortNormal(14, 14);
            this.drawFaces();
            // draw differntly if facing left or right
            // left
            if(this.shapes[7].normalVerticesB[0][2] - this.shapes[7].normalVerticesA[0][2] < 0){
                // post
                this.sortNormal(8, 8);
                this.drawFaces();
                // lattice
                this.sortNormal(10, 13);
                this.drawFaces();
                // post
                this.sortNormal(9, 9);
                this.drawFaces();
            }
            //right
            else{
                // post
                this.sortNormal(9, 9);
                this.drawFaces();
                // lattice
                this.sortNormal(10, 13);
                this.drawFaces();
                // post
                this.sortNormal(8, 8);
                this.drawFaces();
            }
            // draw seat
            this.sortNormal(7, 7);
            this.drawFaces();

            // draw legs depending on z vector of if chair forward or backward
            // forward
            if(this.shapes[7].normalVerticesB[3][2] - this.shapes[7].normalVerticesA[3][2] > 0){
                this.sortNormal(0, 1);
                this.drawFaces();
                this.sortNormal(4, 6);
                this.drawFaces();
                this.sortNormal(2, 3);
                this.drawFaces();
            }
            // backward
            else{   
                this.sortNormal(2, 3);
                this.drawFaces();
                this.sortNormal(4, 6);
                this.drawFaces();
                this.sortNormal(0, 1);
                this.drawFaces();
            }
        }
        
    };

};

// instantiate the chair Object
var chair = new chairObject();

// ---------------------------------------------
// ---------------------------------------------
// Rotate shape around the y-axis
var rotateY3D = function(theta, vertices) {
    var sinTheta = sin(radians(theta));
    var cosTheta = cos(radians(theta));
    
    for (var n = 0; n < vertices.length; n++) {
        var vertex = vertices[n];
        var x = vertex[0];
        var z = vertex[2];
        vertex[0] = x * cosTheta - z * sinTheta;
        vertex[2] = z * cosTheta + x * sinTheta;
    }
};

// ---------------------------------------------
// ---------------------------------------------
// Rotate shape around the x-axis
var rotateX3D = function(theta, vertices) {
    var sinTheta = sin(radians(theta));
    var cosTheta = cos(radians(theta));
    
    for (var n = 0; n < vertices.length; n++) {
        var vertex = vertices[n];
        var y = vertex[1];
        var z = vertex[2];
        vertex[1] = y * cosTheta - z * sinTheta;
        vertex[2] = z * cosTheta + y * sinTheta;
    }
};

// ---------------------------------------------
// ---------------------------------------------
// rotate the chair's shape's vertices 
var rotateChair = function(dx, dy){
    for (var shapeNum = 0; shapeNum < chair.shapes.length; shapeNum++) {
        // rotate vertices
        rotateY3D(dx, chair.shapes[shapeNum].vertices);
        rotateX3D(dy, chair.shapes[shapeNum].vertices);
        // rotate normalVerticesA
        rotateY3D(dx, chair.shapes[shapeNum].normalVerticesA);
        rotateX3D(dy, chair.shapes[shapeNum].normalVerticesA);
        
        // rotate normalVerticesB
        rotateY3D(dx, chair.shapes[shapeNum].normalVerticesB);
        rotateX3D(dy, chair.shapes[shapeNum].normalVerticesB);
    }
};

// ---------------------------------------------
// ---------------------------------------------
/* If the user rotates the mouse, rotate about the 
    * y and x axis but not the z axis - as the depth should 
    * stay the same and rotating about the x and y axis 
    * will achieve the illusion of rotating an image in 3D space
*/
var mouseDragged = function() {
    // scroll bar for zoom
    if(mouseX > zoom + 5 && mouseX < zoom + 15 && mouseY > 360 && mouseY < 380 && mouseX > 10 && mouseX < 90){
        zoom = mouseX - 10 + (mouseX - pmouseX);
        // enforce limits of zoom bar
        if(zoom < 10){
            zoom = 10;
        }else if(zoom > 70){
            zoom = 70;
        }
    }
    // do not let user drag over reset button
    else if(mouseY < 350){
        var dx = mouseX - pmouseX;
        var dy = mouseY - pmouseY;
        rotateChair(dx, dy);
    }
};

// ---------------------------------------------
// ---------------------------------------------
// if the mouse is hovering over the reset button, highlight it
var mouseMoved = function(){
    if(mouseX > 310 && mouseX < 390 && mouseY > 350 && mouseY < 390){
        hover = true;
    }else{
        hover = false;
    }
};

// ---------------------------------------------
// ---------------------------------------------
// if the player clicks the reset button, call setup function to reset
var mouseClicked = function(){
    if(mouseX > 310 && mouseX < 390 && mouseY > 350 && mouseY < 390){
        setup();
    }
};

// ---------------------------------------------
// ---------------------------------------------
// set an initial state for zoom and rotation
var setup = function(){
    var canvas = createCanvas(400, 400);
    canvas.parent('sketch-holder');

    chair = new chairObject();
    rotateChair(20, -20);
    zoom = 40;
};

// ---------------------------------------------
// ---------------------------------------------
// The main loop to draw all of the assets
var draw = function() {
    push();
    translate(width/2, height/2);
    background(200, 200, 200);

    // adjust to zoom level and draw chair
    scale(zoom/40);
    chair.draw();
    pop();

    push();
    translate(width/2, height/2);
    // draw reset button
    fill(0, 0, 255);
    if(hover){
        stroke(0, 255, 0);
        strokeWeight(5);
    }
    rect(110, 150, 80, 40, 10);
    textAlign(CENTER);
    textSize(22);
    fill(255, 255, 255);
    noStroke();
    text('Reset', 150, 176);
    stroke(0, 0, 0);
    strokeWeight(1);

    // draw zoom bar
    fill(0, 0, 0);
    noStroke();
    text('Zoom:', -150, 150);
    text('-', -190, 195);
    text('+', -110, 195);
    stroke(0, 0, 0);
    strokeWeight(3);
    line(-190, 170, -110, 170);
    strokeWeight(1);
    fill(255, 255, 255);
    rect(-190 + zoom - 5, 160, 10, 20, 5);
    
    // draw instructions
    fill(0, 0, 0);
    noStroke();
    text('Drag chair with mouse to rotate', 0, -180);

    pop();
};