Crafty.c("2D", {
	x: 0,
	y: 0,
	w: 0,
	h: 0,
	z: 0,
	
	area: function() {
		return this.w * this.h;
	},
	
	/**
	* Does a rect intersect this
	*/
	intersect: function(x,y,w,h) {
		var rect;
		if(typeof x === "object") {
			rect = x;
		} else {
			rect = {x: x, y: y, w: w, h: h};
		}
		
		return this.x < rect.x + rect.w && this.x + this.w > rect.x &&
			   this.y < rect.y + rect.h && this.h + this.y > rect.y;
	},
	
	pos: function() {
		return {
			x: Math.ceil(this.x),
			y: Math.ceil(this.y),
			w: Math.ceil(this.w),
			h: Math.ceil(this.h)
		};
	},
	
	/**
	* Is object at point
	*/
	isAt: function(x,y) {
		return this.x <= x && this.x + this.w >= x &&
			   this.y <= y && this.y + this.h >= y;
	},
	
	move: function(dir, by) {
		var old = this.pos();
		if(dir.charAt(0) === 'n') this.y -= by;
		if(dir.charAt(0) === 's') this.y += by;
		if(dir === 'e' || dir.charAt(1) === 'e') this.x += by;
		if(dir === 'w' || dir.charAt(1) === 'w') this.x -= by;
		this.trigger("change",old);
	}
});

Crafty.c("gravity", {
	_gravity: 0.2,
	_gy: 0,
	_falling: true,
	_anti: null,
	
	init: function() {
		if(!this.has("2D")) this.addComponent("2D");		
	},
	
	gravity: function(comp) {
		this._anti = comp;
		
		this.bind("enterframe", function() {
			if(this._falling) {
				//if falling, move the players Y
				var old = this.pos();
				this._gy += this._gravity * 2;
				this.y += this._gy;
				this.trigger("change",old);
			} else {
				this._gy = 0; //reset change in y
			}
			
			var obj = this, hit = false;
			Crafty(comp).each(function() {
				//check for an intersection directly below the player
				if(this.intersect(obj.x,obj.y+1,obj.w,obj.h)) {
					hit = this;
				}
			});
			
			if(hit) { //stop falling if found
				if(this._falling) this.stopFalling(hit);
			} else {
				this._falling = true; //keep falling otherwise
			}
		});
		
		return this;
	},
	
	stopFalling: function(e) {
		var old = this.pos(); //snapshot of old position
		if(e) this.y = e.y - this.h ; //move object
		this._gy = 0;
		this._falling = false;
		if(this.__move && this.__move.up) this.__move.up = false;
		this.trigger("change", old);
	}
});

Crafty.c("collision", {
	collision: function(comp, fn) {
		var obj = this;
		//on change, check for collision
		this.bind("change", function() {
			//for each collidable entity
			Crafty(comp).each(function() {
				if(this.intersect(obj)) { //check intersection
					fn.call(obj,this);
				}
			});
		});
		
		return this;
	}
});