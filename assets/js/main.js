
game = new Phaser.Game(400, 625, Phaser.CANVAS, '', { preload: preload, create: Main, update: atualizarJogo });

var current_score_display, high_score_display;

function preload() {
    game.load.image('ball', 'assets/images/ball.png');
    game.load.image('hoop', 'assets/images/hoop.png');
	game.load.image('side rim', 'assets/images/side_rim.png');
	game.load.image('front_rim', 'assets/images/front_rim.png');

	game.load.image('background', 'assets/images/fundo-quadra.jpg'); 

	game.load.audio('score', 'assets/audio/correct.mp3');
	game.load.audio('backboard', 'assets/audio/backboard.wav');
	game.load.audio('whoosh', 'assets/audio/whoosh.wav');
	game.load.audio('fail', 'assets/audio/error.mp3');
	game.load.audio('spawn', 'assets/audio/spawn.wav');

}

var hoop,
 	left_rim,
 	right_rim,
 	ball,
 	front_rim,
 	current_score = 0,
 	high_score = 0,
 	high_score_text;

var score_sound,
	backboard,
	whoosh,
	fail,
	spawn;

var moveInTween,
	fadeInTween,
	moveOutTween,
	fadeOutTween;

var collisionGroup;
var fimJogo;

function Main() {
	game.stage.backgroundColor = "#ffffff00"; 
    var bg = game.add.image(0, 0, 'background');
    bg.width = game.width; 
    bg.height = game.height;
    name_game = game.add.text(80, 100, 'Basketball Challenge', { font: '24px Arial', fill: '#fff', fontWeight: 'bold' });

    buttonWidth = 150;
    buttonHeight = 50;
    buttonX = game.world.centerX - buttonWidth / 2;
    buttonY = 150; 

    buttonGraphics = game.add.graphics(0, 0);
    buttonGraphics.beginFill(0xFF260F); 
    buttonGraphics.drawRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 20); 
    buttonGraphics.endFill();

    buttonText = game.add.text(game.world.centerX, buttonY + buttonHeight / 2, 'Iniciar', { font: '20px Arial', fill: '#ffffff' });
    buttonText.anchor.set(0.5);

    buttonGraphics.inputEnabled = true; 
    buttonGraphics.events.onInputDown.add(actionOnClick, this);

    buttonGraphics.events.onInputOver.add(function() {
        game.canvas.style.cursor = 'pointer';
    }, this);
    
    buttonGraphics.events.onInputOut.add(function() {
        game.canvas.style.cursor = 'default'; 
    }, this);

    this.buttonGraphics = buttonGraphics;
    this.buttonText = buttonText;
}
function removerMain() {
    if (name_game) {
        name_game.destroy(); 
        name_game = null;
    }
	if (this.buttonGraphics) {
        this.buttonGraphics.destroy(); 
        this.buttonGraphics = null;
    }
    if (this.buttonText) {
        this.buttonText.destroy();
        this.buttonText = null;
    }
}

function actionOnClick() {
    criarJogo();
	removerMain();
}

function criarJogo() {
	current_score_display = game.add.text(20, 20, 'Pontuação: 0', { font: '24px Arial', fill: '#fff' });

	if(high_score_display == undefined){
		high_score_display = game.add.text(250, 20, 'Recorde: 0', { font: '24px Arial', fill: '#fff' });
	}
	else{
		high_score_display = game.add.text(250, 20, 'Recorde: ' + high_score , { font: '24px Arial', fill: '#fff' });
	}

	game.physics.startSystem(Phaser.Physics.P2JS);

	game.physics.p2.setImpactEvents(true);

  	game.physics.p2.restitution = 0.63;
  	game.physics.p2.gravity.y = 0;

	collisionGroup = game.physics.p2.createCollisionGroup();

	score_sound = game.add.audio('score');
	backboard = game.add.audio('backboard');
	backboard.volume = 0.5;
	whoosh = game.add.audio('whoosh');
	fail = game.add.audio('fail');
	fail.volume = 4.0;
	spawn = game.add.audio('spawn');

	game.stage.backgroundColor = "#ffffff";

	hoop = game.add.sprite(88, 62, 'hoop'); 
	left_rim = game.add.sprite(150, 184, 'side rim'); 
	right_rim = game.add.sprite(249, 184, 'side rim'); 

	game.physics.p2.enable([ left_rim, right_rim], false);

	left_rim.body.setCircle(2.5);
	left_rim.body.static = true;
	left_rim.body.setCollisionGroup(collisionGroup);
	left_rim.body.collides([collisionGroup]);

	right_rim.body.setCircle(2.5);
	right_rim.body.static = true;
	right_rim.body.setCollisionGroup(collisionGroup);
	right_rim.body.collides([collisionGroup]);

	criarBola();

	cursors = game.input.keyboard.createCursorKeys();

	game.input.onDown.add(click, this);
	game.input.onUp.add(release, this);

}


function atualizarJogo() {
    if (ball && ball.body.velocity.y > 0) {
        front_rim = game.add.sprite(148, 182, 'front_rim');
        ball.body.collides([collisionGroup], hitRim, this);
    }

    if (ball && ball.body.velocity.y > 0 && ball.body.y > 188 && !ball.isBelowHoop) {
        ball.isBelowHoop = true;
        ball.body.collideWorldBounds = false;
        var rand = Math.floor(Math.random() * 5);
        if (ball.body.x > 151 && ball.body.x < 249) {
            current_score += 1;
            current_score_display.text = 'Pontuação: ' + current_score; 
            score_sound.play();
        } else {
            fail.play();
			Main();
			
            if (current_score > high_score) {
                high_score = current_score;
            }
			
            current_score = 0;
            high_score_display.text = 'Recorde: ' + high_score; 
            current_score_display.text = 'Pontuação: ' + current_score;
			ball.kill();
			hoop.kill();
			front_rim.kill();
			current_score_display.text = ''
        }
    }

    if (ball && ball.body.y > 1200) {
        game.physics.p2.gravity.y = 0;
        ball.kill();
        criarBola();
    }

}

function hitRim() {
	backboard.play();
}

function criarBola() {
	var xpos;
	if (current_score === 0) {
		xpos = 200;
	} else {
		xpos = 60 + Math.random() * 280;
	}
	spawn.play();
	ball = game.add.sprite(xpos, 547, 'ball');
	game.add.tween(ball.scale).from({x : 0.7, y : 0.7}, 100, Phaser.Easing.Linear.None, true, 0, 0, false);
	game.physics.p2.enable(ball, false);
	ball.body.setCircle(60); 
	ball.launched = false;
	ball.isBelowHoop = false;

}

var location_interval;
var isDown = false;
var start_location;
var end_location;

function click(pointer) {
	var bodies = game.physics.p2.hitTest(pointer.position, [ ball.body ]);
	if (bodies.length) {
		start_location = [pointer.x, pointer.y];
		isDown = true;
		location_interval = setInterval(function () {
			start_location = [pointer.x, pointer.y];
		}.bind(this), 200);
	}

}

function release(pointer) {
	if (isDown) {
		window.clearInterval(location_interval);
		isDown = false;
		end_location = [pointer.x, pointer.y];

		if (end_location[1] < start_location[1]) {
			var slope = [end_location[0] - start_location[0], end_location[1] - start_location[1]];
			var x_traj = -800 * slope[0] / slope[1];
			launch(x_traj);
		}
	}
}

function launch(x_traj) {
	if (ball.launched === false) {
		ball.body.setCircle(24);
		ball.body.setCollisionGroup(collisionGroup);
		ball.launched = true;
		game.physics.p2.gravity.y = 3000;
		game.add.tween(ball.scale).to({x : 0.6, y : 0.6}, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
		ball.body.velocity.x = x_traj;
		ball.body.velocity.y = -1750;
		ball.body.rotateRight(x_traj / 3);
		whoosh.play();
	}

}
