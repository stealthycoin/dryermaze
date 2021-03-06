//A simple timer class
var Timer = function() {
    this.date = new Date();
}

Timer.prototype.update = function() {
    var d = new Date();
    this.date = d;
    return this;
}

Timer.prototype.getMilliseconds = function() {
    return this.date.getTime();
}

Timer.prototype.getSeconds = function() {
    return Math.round(this.date.getTime() / 1000);
}



/*
 * Begin Union-Find for maze generation
 * Naieve implementation because the timeframe I have to make this
 */

function UnionFind() {
    this.count = 0;
    this.sets = [];
}

UnionFind.prototype.makeSet = function(x) {
    this.sets = new Array(x);
    for (var i = 0 ; i < x ; i++) {
	this.sets[i] = i;
    }
    this.count = x;
};

UnionFind.prototype.find = function(x) {
    if (x !== this.sets[x]) {
	this.sets[x] = this.find(this.sets[x]);
    }
    return this.sets[x];
};

UnionFind.prototype.union = function(x,y) {
    xroot = this.find(x);
    yroot = this.find(y);
    this.sets[xroot] = yroot;
    this.count--;
};

UnionFind.prototype.log = function() {
    console.log(this.sets);
}

/*
 * Begin Bar object
 * Bars simple represent a percentange of something
 */

function Bar(width, height, max, color, border) {
    this.width = width;
    this.height = height;
    this.max = max;
    this.color = color;
    this.border = border;
    this.current = 0;
    this.borderWidth = 2;
}

Bar.prototype.update = function(qty) {
    var leftover = Math.min(0,this.current + qty);
    this.current += qty;
    this.current = Math.max(0,Math.min(this.current, this.max));
    return leftover;
};

Bar.prototype.draw = function(ctx) {
    var progress = this.current / this.max * this.width;
    ctx.lineWidth = this.borderWidth;
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.border;

    ctx.beginPath();
    ctx.rect(0,0,progress,this.height);
    ctx.fill();

    ctx.beginPath();
    ctx.rect(0,0,this.width,this.height);
    ctx.stroke();
};


/*
 * Recolor an image
 */

function recolorImage(img, color) {
    //recolor
    var c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext("2d");
    ctx.drawImage(img,0,0);
    
    var data = ctx.getImageData(0,0,img.width,img.height);

    for (var j = 0; j < img.height; j++) {
	for (var i = 0; i < img.width; i++) {
	    var index = i*4*data.width+j*4;
	    
	    var colorVector = $V([data.data[index],
				  data.data[index+1],
				  data.data[index+2]]);
	    //average the colors
	    colorVector = colorVector.add(color).x(0.5);
	    data.data[index] = colorVector.e(1);
	    data.data[index+1] = colorVector.e(2);
	    data.data[index+2] = colorVector.e(3);
	}
    }

    ctx.putImageData(data,0,0);
    var newImg = document.createElement("img");
    newImg.src = c.toDataURL("image/png");

    return newImg;
}

/*
 * Partition a set of walls into a smaller set
 * takes in a set of walls and partitions them into a pair of smaller sets.
 * Then based on the size it may repeat the process. 
 */

function opposite(wall) {
    if (wall === world.RIGHT)  return world.LEFT;
    if (wall === world.LEFT)   return world.RIGHT;
    if (wall === world.BOTTOM) return world.TOP;
    if (wall === world.TOP)    return world.BOTTOM;
}

function divideMaze(set, tiles, level) {
    //divide up the level into subsections
    var boundarySet = set;
    do {
	//test placing a boundary
	do {
	    var random = world.random() % boundarySet.length;
	    var wallLoc = boundarySet[random];
	    var wall = Math.pow(2,world.random() % 4);
	    var wallLoc2 = level.tiles[wallLoc].throughWall(wall);
	} while (level.tiles[wallLoc].hasWall(wall) === true || isNaN(wallLoc2));

	level.tiles[wallLoc].addWall(wall);
	level.tiles[wallLoc2].addWall(opposite(wall));

	var searchA = bfs.bfs(wallLoc, level);
	var searchB = bfs.bfs(level.tiles[wallLoc].throughWall(wall), level);

	level.tiles[wallLoc].removeWall(wall);
	level.tiles[wallLoc2].removeWall(opposite(wall));
    } while (searchA.size < 10 || searchB.size < 10);
    
    level.tiles[wallLoc].addWall(wall);
    level.tiles[wallLoc2].addWall(opposite(wall));
    
    var sets = []; //groupings of connected components

    if (searchA.size > 100) {
	var r = divideMaze(searchA.m,tiles,level);
	level.tiles = r.tiles;
	sets = sets.concat(r.sets);
    }
    else {
	sets.push(searchA.m);
    }
    if (searchB.size > 100) {
	var r = divideMaze(searchB.m,tiles,level);
	level.tiles = r.tiles;
	sets = sets.concat(r.sets);
    }
    else {
	sets.push(searchB.m);
    }
    
    return {tiles:tiles,sets:sets};
}

function collisionR(rect1, rect2){
    //top left point
    if(rect1.x > rect2.x && rect1.x < rect2.w + rect2.x 
       && rect1.y > rect2.y && rect1.y < rect2.h + rect2.y){	
	return true;
    }
    //top right point
    if(rect1.x + rect1.width > rect2.x && rect1.x + rect1.width < rect2.x + rect2.w 
       && rect1.y > rect2.y && rect1.y < rect2.h + rect2.y){	
	return true;
    }
    //bottom left point
    if(rect1.x > rect2.x && rect1.x < rect2.w + rect2.x
       && rect1.y + rect1.h  > rect2.y + rect2.h && rect1.y +rect1.h  < rect2.y){	
	return true;
    }
    //bottom right point
    if(rect1.x + rect1.width > rect2.x && rect1.x + rect1.width < rect2.x + rect2.w 
       && rect1.y + rect1.h  > rect2.y + rect2.h && rect1.y +rect1.h  < rect2.y){
	return true;
    }
    return false;
};
