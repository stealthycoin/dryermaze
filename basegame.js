
var game = (function() {
    var WIDTH;
    var HEIGHT;
    var FPS = 40//FPS count
    var canvas; //game canvas
    var ctx;

    var bodies = [];
    var cm;
    //timing variables
    var clock;
    return {
	resize: function() {
	    WIDTH = $(window).width();
	    HEIGHT = $(window).height();
	    
	    $("#game_area")[0].width = WIDTH;
	    $("#game_area")[0].height = HEIGHT;	
	},
	
	init: function() {
	    console.log("init");
      
	    //screen setup
	    $(window).bind("resize", game.resize);
	    game.resize();
  
	    canvas = document.getElementById('game_area');
	    ctx = canvas.getContext("2d");

	    //add bodies
	    bodies.push(new Body($V([600,300]), 10, 5, "red"));
	    bodies[0].setVelocity($V([1,0]));
	    bodies.push(new Body($V([600,600]), 90, 13, "green"));
	    //bodies[1].setVelocity($V([-1,-1]));
            
	    //setup the game loop
	    clock = new Timer();
	    lastTime = clock.getMilliseconds();
	    game.update();
	},

	update: function() {
	    //update clock
	    var last_time = clock.getMilliseconds();
	    var current_time = clock.update().getMilliseconds();
	    var dt = current_time - last_time; //delta time

	    //update bodies
	    //apply gravity between all object pairs
	    bodies.map(function (a) {
		bodies.map(function (b) {
		    if (a !== b) { //unless you like infinite force vectors
			var mag = a.mass * b.mass / (a.p.distanceFrom(b.p) * a.p.distanceFrom(b.p)); //clearly
			var v = a.p.subtract(b.p).toUnitVector().multiply(-mag); //I think this is obvious
			a.applyForce(v);
			console.log("Nope");
			
			if (a.p.distanceFrom(b.p) <= (a.r + b.r))
			{
			    alert("Collision detected");
			}

		    }
		})});


	    bodies.map(function (e) { e.update(dt); });
	    cm = $V([0,0]);
	    var bigM = 0;
	    bodies.map(function(e){
		cm = cm.add(e.p.multiply(e.mass));
		bigM += e.mass;
	    });
	    cm = cm.multiply(1/bigM);
	    //draw game state here
	    game.draw();

	    //call update again. Math to yield here based on FPS TODO
	    setTimeout(function() {
		game.update();
	    }, 10);
	},

	draw: function() {
	    //fill in background
	    ctx.fillStyle = "#CCCCDF";
	    ctx.fillRect(0,0,WIDTH,HEIGHT);
	    
	    //draw the bodies
	    bodies.map(function (e) { e.draw(ctx); });
	    ctx.beginPath();
	    ctx.fillStyle = "black"
	    ctx.arc(cm.elements[0], 
		    cm.elements[1], 
		    3, 0, 2 * Math.PI, false);
	    ctx.fill();
	}
    }
})();
