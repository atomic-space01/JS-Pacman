const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreEl');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Boundary {
	static width = 40;
	static height = 40;
	constructor({position, image}) {
		this.position = position;
		this.width = 40;
		this.height = 40;
		this.image = image;
	}

	draw() {
		// c.fillStyle = 'blue';
		// c.fillRect(this.position.x, this.position.y, this.width, this.height);
		c.drawImage(this.image, this.position.x, this.position.y);
	}
}

class Player {
	constructor({position, velocity}) {
		this.position = position;
		this.velocity = velocity;
		this.radius = 15;
		this.radians = 0.75;
		this.openRate = 0.12;
		this.rotation = 0;
	}

	draw() {
		c.save();
		c.translate(this.position.x, this.position.y);
		c.rotate(this.rotation);
		c.translate(- this.position.x, - this.position.y);
		c.beginPath();
		c.arc(
			this.position.x, this.position.y, 
			this.radius, this.radians, Math.PI * 2 - this.radians
			);
		c.lineTo(this.position.x, this.position.y);
		c.fillStyle = 'yellow';
		c.fill();
		c.closePath();
		c.restore();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;
		if (this.radians < 0 || this.radians > 0.75) this.openRate = - this.openRate;
		this.radians += this.openRate;
	}
}

class Ghost {
	static speed = 2;
	constructor({position, velocity, color = 'red'}) {
		this.position = position;
		this.velocity = velocity;
		this.color = color;
		this.radius = 15;
		this.prevCollisions = [];
		this.speed = 5;
		this.scared = false;
	}

	draw() {
		c.beginPath();
		c.arc(
			this.position.x, this.position.y, 
			this.radius, 0, Math.PI * 2
			);
		c.fillStyle = this.scared ? 'blue' : this.color;
		c.fill();
		c.closePath();
	}

	update() {
		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

	}
}

class Pellet {
	constructor({position}) {
		this.position = position;
		this.radius = 3;
	}

	draw() {
		c.beginPath();
		c.arc(
			this.position.x, this.position.y, 
			this.radius, 0, Math.PI * 2
			);
		c.fillStyle = 'white';
		c.fill();
		c.closePath();
	}
}

class PowerUp {
	constructor({position}) {
		this.position = position;
		this.radius = 8;
	}

	draw() {
		c.beginPath();
		c.arc(
			this.position.x, this.position.y, 
			this.radius, 0, Math.PI * 2
			);
		c.fillStyle = 'white';
		c.fill();
		c.closePath();
	}
}


const keys = {
	w: {
		pressed: false
	},
	a: {
		pressed: false
	},
	s: {
		pressed: false
	},
	d: {
		pressed: false
	}
}

let score = 0;
let lastKey = '';

const map = [
	['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
	['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
	['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
	['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
	['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
	['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
	['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
	['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
	['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
	['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
	['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3']

];

function createImage(src) {
	const image = new Image();
	image.src = src;
	return image;
}

const ghosts = [
	new Ghost({
		position: {
			x: Boundary.width * 6 +  Boundary.width / 2,
			y: Boundary.height + Boundary.height / 2
		},
		velocity: {
			x: Ghost.speed,
			y: 0
		}
	}),
	new Ghost({
		position: {
			x: Boundary.width * 6 +  Boundary.width / 2,
			y: Boundary.height + Boundary.height / 2
		},
		velocity: {
			x: Ghost.speed,
			y: 0
		},
		color: 'pink'
	})
];

const pellets = [];
const boundaries = [];
const powerUps = [];
const player = new Player({
	position: {
		x: Boundary.width +  Boundary.width / 2,
		y: Boundary.height + Boundary.height / 2
	},
	velocity: {
		x: 0,
		y: 0
	}
});

map.forEach((row, i) => {
	row.forEach((symbol, j) => {
		switch(symbol) {
			case '-':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeHorizontal.png')
				}));
				break;
			case '|':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeVertical.png')
				}));
				break;
			case '1':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeCorner1.png')
				}));
				break;
			case '2':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeCorner2.png')
				}));
				break;
			case '3':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeCorner3.png')
				}));
				break;
			case '4':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeCorner4.png')
				}));
				break;
			case 'b':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/block.png')
				}));
				break;
			case '[':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/capLeft.png')
				}));
				break;
			case ']':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/capRight.png')
				}));
				break;
			case '_':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/capBottom.png')
				}));
				break;
			case '^':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/capTop.png')
				}));
				break;
			case '+':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeCross.png')
				}));
				break;
			case '5':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeConnectorTop.png')
				}));
				break;
			case '6':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeConnectorRight.png')
				}));
				break;
			case '7':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeConnectorBottom.png')
				}));
				break;
			case '8':
				boundaries.push(new Boundary({
					position : {
						x: Boundary.width * j,
						y: Boundary.height * i
					},
					image: createImage('./gameAssets/pipeConnectorLeft.png')
				}));
				break;
			case '.':
				pellets.push(
					new Pellet({
						position: {
							x: j * Boundary.width + Boundary.width / 2,
							y: i * Boundary.height + Boundary.height / 2
						}
					}));
				break;
			case 'p':
				powerUps.push(
					new PowerUp({
						position: {
							x: j * Boundary.width + Boundary.width / 2,
							y: i * Boundary.height + Boundary.height / 2
						}
					}));
				break;
		}
	});
});

function circleCollidesWithRect({circle, rect}) {
	const padding = Boundary.width / 2 - circle.radius - 1;
	return (
		circle.position.y - circle.radius + circle.velocity.y 
		<= rect.position.y + rect.height + padding &&
		circle.position.x + circle.radius + circle.velocity.x 
		>= rect.position.x - padding &&
		circle.position.y + circle.radius + circle.velocity.y
		>= rect.position.y - padding &&
		circle.position.x - circle.radius + circle.velocity.x 
		<= rect.position.x + rect.width + padding
		)
}

let anime;
function animate() {
	anime = requestAnimationFrame(animate);
	c.clearRect(0, 0, canvas.width, canvas.width);
	
	// player moves
	if (keys.w.pressed && lastKey === 'w') {
		for (let i = 0; i < boundaries.length; ++i) {
			const boundary = boundaries[i];
			if (
				circleCollidesWithRect({
					circle: {...player, velocity : {
						x: 0,
						y: -5
					}},
					rect: boundary
				})
			) {
				player.velocity.y = 0;
				break;
			} else {
				player.velocity.y = -5;
			}
		}	
	} else if (keys.a.pressed && lastKey === 'a') {
		for (let i = 0; i < boundaries.length; ++i) {
			const boundary = boundaries[i];
			if (
				circleCollidesWithRect({
					circle: {
						...player,
						velocity: {
							x: -5,
							y: 0
						}
					},
					rect: boundary
				})
				) {
				player.velocity.x = 0;
				break;
			} else {
				player.velocity.x = -5;
			}
		}
	}  else if (keys.s.pressed && lastKey === 's') {
		for (let i = 0; i < boundaries.length; ++i) {
			const boundary = boundaries[i];
			if (
				circleCollidesWithRect({
					circle: {...player, velocity : {
						x: 0,
						y: 5
					}},
					rect: boundary
				})
				) {
				player.velocity.y = 0;
				break;
			} else {
				player.velocity.y = 5;
			}
		}
	}  else if (keys.d.pressed && lastKey === 'd') {
		for (let i = 0; i < boundaries.length; ++i) {
			const boundary = boundaries[i];
			if (
				circleCollidesWithRect({
					circle: {
						...player, velocity : {
							x: 5,
							y: 0
						}
					},
					rect: boundary
				}) 
				) {
				player.velocity.x = 0;
				break;
			} else {
				player.velocity.x = 5;
			}
		}
	}

	// detect collisions between ghists and player
	for (let i = ghosts.length - 1; i >= 0; --i) {
		const ghost = ghosts[i];
		// ghost touches player
		if (Math.hypot(ghost.position.x - player.position.x, 
			ghost.position.y - player.position.y) 
			< ghost.radius + player.radius) {

			if (ghost.scared) {
				ghosts.splice(i, 1);
			} else {
				cancelAnimationFrame(anime);
				console.log("You've lost");
			}
		}
	}

	// win condition goes here
	if (pellets.length <= 1) {
		cancelAnimationFrame(anime);
	}

	// power ups go
	for (let i = powerUps.length - 1; i >= 0; --i) {
		const powerUp = powerUps[i];
		powerUp.draw();
		// player collides with powerUp
		if (
			Math.hypot(
				powerUp.position.x - player.position.x,
				powerUp.position.y - player.position.y
				) < 
				powerUp.radius + player.radius
			) {
			powerUps.splice(i, 1);

			// make ghosts scare
			ghosts.forEach(ghost => {
				ghost.scared = true;

				setTimeout(() => {
					ghost.scared = false;
				}, 5000);
			});
		}
	}

	//drawing and eating pellets
	for (let i = pellets.length - 1; i > 0; --i) {
		const pellet = pellets[i];
		if (Math.hypot(pellet.position.x - player.position.x, 
			pellet.position.y - player.position.y) 
			< pellet.radius + player.radius) {
				pellets.splice(i, 1);
				score += 10;
				scoreEl.innerHTML = score;
				console.log(pellets.length);
		} else {
			pellet.draw();
		}
	}

	boundaries.forEach(boundary => {
		boundary.draw();
		// detecting collision between boundaries and player
		if (
			circleCollidesWithRect({
				circle: player,
				rect: boundary
			})
			) {
			player.velocity.x = 0;
			player.velocity.y = 0;
		}
	});
	player.update();

	ghosts.forEach((ghost, i) => {
		ghost.update();

		const collisions = [];
		boundaries.forEach(boundary => {
			if (
				!collisions.includes('right') &&
				circleCollidesWithRect({
					circle: {
						...ghost,
						velocity: {
							x: 5,
							y: 0
						}
					},
					rect: boundary
				})
				) {
				collisions.push('right');
			}
			if (
				!collisions.includes('left') &&
				circleCollidesWithRect({
					circle: {
						...ghost,
						velocity: {
							x: -5,
							y: 0
						}
					},
					rect: boundary
				})
				) {
				collisions.push('left');
			}
			if (
				!collisions.includes('top') &&
				circleCollidesWithRect({
					circle: {
						...ghost,
						velocity: {
							x: 0,
							y: -5
						}
					},
					rect: boundary
				})
				) {
				collisions.push('top');
			}
			if (
				!collisions.includes('down') &&
				circleCollidesWithRect({
					circle: {
						...ghost,
						velocity: {
							x: 0,
							y: 5
						}
					},
					rect: boundary
				})
				) {
				collisions.push('down');
			}
		});
		if (collisions.length > ghost.prevCollisions.length) {
			ghost.prevCollisions = collisions;
		}
		if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {

			if (ghost.velocity.x > 0) ghost.prevCollisions.push('right');
			else if (ghost.velocity.x < 0) ghost.prevCollisions.push('left');
			else if (ghost.velocity.y > 0) ghost.prevCollisions.push('down');
			else if (ghost.velocity.y < 0) ghost.prevCollisions.push('top');

			const pathways = ghost.prevCollisions.filter(collision => {
				return !collisions.includes(collision);
			});

			const direction = pathways[Math.floor(Math.random() * pathways.length)];
			switch(direction) {
				case 'down':
					ghost.velocity.y = ghost.speed;
					ghost.velocity.x = 0;
					break;
				case 'top':
					ghost.velocity.y = -ghost.speed;
					ghost.velocity.x = 0;
					break;
				case 'right':
					ghost.velocity.y = 0;
					ghost.velocity.x = ghost.speed;
					break;
				case 'left':
					ghost.velocity.y = 0;
					ghost.velocity.x = -ghost.speed;
					break;
			}

			ghost.prevCollisions = [];
		}
	});

	if (player.velocity.x > 0) {
	} else if (player.velocity.x < 0) {
		player.rotation = Math.PI;
	} else if (player.velocity.y > 0) {
		player.rotation = Math.PI / 2;
	} else if (player.velocity.y < 0) {
		player.rotation = Math.PI * 2;
	}
}


animate();

// eventListeners
addEventListener('keydown', ({code}) => {
	switch(code) {
		case 'KeyW':
			keys.w.pressed = true;
			lastKey = 'w';
			break
		case 'KeyA':
			keys.a.pressed = true;
			lastKey = 'a';
			break
		case 'KeyS':
			keys.s.pressed = true;
			lastKey = 's';
			break
		case 'KeyD':
			keys.d.pressed = true;
			lastKey = 'd';
			break
	}
});

addEventListener('keyup', ({code}) => {
	switch(code) {
		case 'KeyW':
			keys.w.pressed = false;
			break
		case 'KeyA':
			keys.a.pressed = false;
			break
		case 'KeyS':
			keys.s.pressed = false;
			break
		case 'KeyD':
			keys.d.pressed = false;
			break
	}
});
