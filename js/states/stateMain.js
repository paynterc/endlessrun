var StateMain = {
	pwidth: 32,
	pheight: 32,
	preload: function() {
        game.load.image("ground", "images/main/ground.png");
        game.load.image("hero", "images/main/hero.png");
        game.load.image("bar", "images/main/powerbar.png");
        game.load.image("block", "images/main/block.png");
        game.load.image("bird", "images/main/bird.png");
        game.load.image("playAgain", "images/main/tryagain.png");
    },
    create: function() {
    	// Clicklock prevents the user from clicking
    	this.clickLock = false;
    	
        this.power = 0;
        //turn the background sky blue
        game.stage.backgroundColor = "#00ffff";
        //add the ground
        this.ground = game.add.sprite(0, game.height -32, "ground");
        //add the hero in 
        this.hero = game.add.sprite(game.width * .2, this.ground.y - this.pheight, "hero");
        //add the power bar just above the head of the hero
        this.powerBar = game.add.sprite(this.hero.x, this.hero.y, "bar");
        this.powerBar.width = 0;
        //start the physics engine
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //enable the hero for physics
        game.physics.enable(this.hero, Phaser.Physics.ARCADE);
        game.physics.enable(this.ground, Phaser.Physics.ARCADE);

        
        this.hero.body.gravity.y = 200;
        this.hero.body.collideWorldBounds = true;
        this.ground.body.immovable = true;
        this.startY = this.hero.y;
        
        //set listeners
        game.input.onDown.add(this.mouseDown, this);
        
        // Some notes about groups:
        // Each group has a .children property which is just an array of the objects inside the group, so you can treat this just like a normal array:
        // for (var i = 0; len = group.children.length; i < len; i++) {  console.log(group.children[i]);}
        // Also, the .z property of each sprite corresponds to that sprite's index in the group for easy reference.
        // Groups have also a forEach method that you can use to iterate their members. See makeBlocks below.
        this.blocks = game.add.group();
        this.makeBlocks();
        this.makeBird();
        
    },
    mouseDown: function() {
    	if (this.clickLock == true) {
            return;
        }
    
    	// If player isn't on the ground, no jumping for you.
		if (this.hero.y != this.startY) {
				return;
		}
    	game.input.onDown.remove(this.mouseDown, this);
        this.timer = game.time.events.loop(Phaser.Timer.SECOND / 1000, this.increasePower, this);
        game.input.onUp.add(this.mouseUp, this);
    },
    mouseUp: function() {
    	game.input.onUp.remove(this.mouseUp, this);
        this.doJump();
        game.time.events.remove(this.timer);
        this.power = 0;
        this.powerBar.width = 0;
		game.input.onDown.add(this.mouseDown, this);
    },
    increasePower: function() {
        this.power++;
        this.powerBar.width = this.power;
        if (this.power > this.pwidth) {
            this.power = this.pwidth;
        }
    },
    doJump: function() {
        this.hero.body.velocity.y = -this.power * 16;
    },
    makeBlocks: function() {
		//remove all the blocks from the group
        this.blocks.removeAll();
        var wallHeight = game.rnd.integerInRange(1, 4);
        for (var i = 0; i < wallHeight; i++) {
            var block = game.add.sprite(0, -i * 64, "block");
            this.blocks.add(block);
        }
        this.blocks.x = game.width - this.blocks.width
        this.blocks.y = this.ground.y - 64;
        //
        //Loop through each block
        //and apply physics
        this.blocks.forEach(function(block) {
            //enable physics
            game.physics.enable(block, Phaser.Physics.ARCADE);
            //set the x velocity to -160
            block.body.velocity.x = -150;
            //apply some gravity to the block
            //not too much or the blocks will bounce
            //against each other
            block.body.gravity.y = 4;
            //set the bounce so the blocks
            //will react to the runner
            block.body.bounce.set(1,1);
        });
    },
    makeBird: function() {
        //if the bird already exists 
        //destroy it
        if (this.bird) {
            this.bird.destroy();
        }
        //pick a number at the top of the screen
        //between 10 percent and 40 percent of the height of the screen
        var birdY = game.rnd.integerInRange(game.height * .1, game.height * .4);
        //add the bird sprite to the game
        this.bird = game.add.sprite(game.width + 100, birdY, "bird");
        //enable the sprite for physics
        game.physics.enable(this.bird, Phaser.Physics.ARCADE);
        //set the x velocity at -200 which is a little faster than the blocks
        var bvelocity = game.rnd.integerInRange(100, 250) * -1;
        this.bird.body.velocity.x = bvelocity;
        //set the bounce for the bird
        this.bird.body.bounce.set(2, 2);
    },
    delayOver: function() {
        this.clickLock = true;
        game.time.events.add(Phaser.Timer.SECOND, this.gameOver, this);
    },
    gameOver: function() {
        game.state.start("StateOver");
    },
    update: function() {
    	this.powerBar.y=this.hero.y;
    	
    	game.physics.arcade.collide(this.hero, this.ground);
    	
    	//collide the hero with the blocks
        game.physics.arcade.collide(this.hero, this.blocks, this.delayOver, null, this);
        
        //colide the blocks with the ground
        game.physics.arcade.collide(this.ground, this.blocks);
        
        // collide with the bird
        game.physics.arcade.collide(this.hero, this.bird, this.delayOver, null, this);
        
        //when only specifying one group, all children in that
        //group will collide with each other
        game.physics.arcade.collide(this.blocks);
    	
    	//get the first child
        var fchild = this.blocks.getChildAt(0);
        //if off the screen reset the blocks
        if (fchild.x < -game.width) {
            this.makeBlocks();
        }
        


        //if the bird has flown off screen
		//reset it
		if (this.bird && this.bird.x < 0) {
			 this.makeBird();
		}
    	
    }
}