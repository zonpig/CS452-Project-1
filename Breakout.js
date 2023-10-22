var gl;
var program;
var canvas;

var paddle;
var ball;
var bricks = [];

var paddleWidth = 100;
var brickRows;
var brickCols;
var brickWidth;
var brickHeight = 20;
var gameStarted = false; // Add a gameStarted variable
var score = 0; // Add a score variable

function init() {
  canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL(canvas);

  if (!gl) {
    alert("WebGL is not available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  paddle = new Paddle();
  ball = new Ball();
  brickRows = Math.ceil(Math.random() * 3) + 5;
  brickCols = Math.ceil(Math.random() * 9) + 6;
  brickWidth = canvas.width / brickCols;
  initializeBricks();

  document.addEventListener("keydown", handleKeyPress);
  document.addEventListener("keyup", handleKeyRelease);

  requestAnimationFrame(render);
}

function startGame() {
  gameStarted = true;
  // Additional game setup logic (if needed)
  hideStartMessage(); // Hide the start message
  showScoreCounter(); // Show the score counter
}

function hideStartMessage() {
  var startMessage = document.getElementById("start-message");
  startMessage.style.display = "none";
}

function showScoreCounter() {
  var scoreCounter = document.getElementById("score");
  scoreCounter.style.display = "block";
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  if (gameStarted) {
    paddle.update();
    ball.update();
    checkCollisions();
    paddle.render();
    ball.render();
    renderBricks();
    updateScore();
  }

  if (gameStarted) {
    if (ball.position.y + ball.radius > canvas.height) {
      alert("Game Over! Your Score: " + score); // Display the score
      document.location.reload();
    } else if (bricks.every((brick) => brick.isBroken)) {
      alert("You Win! Your Score: " + score); // Display the score
      document.location.reload();
    } else {
      requestAnimationFrame(render);
    }
  } else {
    // Request the next frame to keep displaying the start message
    requestAnimationFrame(render);
  }
}

function handleKeyPress(event) {
  if (!gameStarted) {
    // Check for the Space bar to start the game
    if (event.key === " ") {
      startGame();
    }
    return;
  }
  if (event.key === "ArrowLeft") {
    paddle.moveLeft();
  } else if (event.key === "ArrowRight") {
    paddle.moveRight();
  }
}

function handleKeyRelease(event) {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    paddle.stop();
  }
}

function initializeBricks() {
  for (var row = 0; row < brickRows; row++) {
    for (var col = 0; col < brickCols; col++) {
      var x = col * brickWidth;
      var y = row * brickHeight;
      bricks.push(new Brick(x, y));
    }
  }
}

function checkCollisions() {
  if (
    ball.position.x + ball.radius > paddle.position.x &&
    ball.position.x - ball.radius < paddle.position.x + paddleWidth &&
    ball.position.y + ball.radius > paddle.position.y
  ) {
    ball.speed.y *= -1;
  }

  for (let i = 0; i < bricks.length; i++) {
    if (!bricks[i].isBroken) {
      if (
        ball.position.x + ball.radius > bricks[i].position.x &&
        ball.position.x - ball.radius < bricks[i].position.x + brickWidth &&
        ball.position.y + ball.radius > bricks[i].position.y &&
        ball.position.y - ball.radius < bricks[i].position.y + brickHeight
      ) {
        ball.speed.y *= -1;
        bricks[i].isBroken = true;
        score++; // Increment the score
        playBrickHitSound(); // Play the brick hit sound
      }
    }
  }
}

function playBrickHitSound() {
  var brickHitSound = document.getElementById("brick-hit-sound");
  brickHitSound.play();
}

function updateScore() {
  var scoreElement = document.getElementById("score");
  scoreElement.textContent = "Score: " + score;
}

class Paddle {
  constructor() {
    this.width = paddleWidth;
    this.height = 10;
    this.position = {
      x: (canvas.width - this.width) / 2,
      y: canvas.height - this.height - 10,
    };
    this.speed = 8; // Increase the speed for faster movement
    this.dx = 0; // Horizontal velocity for smoother movement
  }

  moveLeft() {
    this.dx = -this.speed;
  }

  moveRight() {
    this.dx = this.speed;
  }

  stop() {
    this.dx = 0;
  }

  update() {
    // Update the paddle's position based on velocity
    this.position.x += this.dx;

    // Clamp the paddle's position to stay within the canvas
    if (this.position.x < 0) {
      this.position.x = 0;
    } else if (this.position.x + this.width > canvas.width) {
      this.position.x = canvas.width - this.width;
    }
  }

  render() {
    gl.useProgram(program);

    var paddleVertices = [
      this.position.x,
      this.position.y,
      this.position.x + this.width,
      this.position.y,
      this.position.x,
      this.position.y - this.height,
      this.position.x + this.width,
      this.position.y - this.height,
    ];

    var u_resolution = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(u_resolution, canvas.width, canvas.height);

    var u_color = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(u_color, [1.0, 1.0, 1.0, 1.0]);

    var a_position = gl.getAttribLocation(program, "a_position");
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(paddleVertices),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

class Ball {
  constructor() {
    this.radius = 8;
    this.position = { x: canvas.width / 2, y: canvas.height - 30 };
    this.speed = { x: 5, y: -5 };
  }

  update() {
    this.position.x += this.speed.x;
    this.position.y += this.speed.y;

    if (
      this.position.x - this.radius < 0 ||
      this.position.x + this.radius > canvas.width
    ) {
      this.speed.x *= -1;
    }
    if (this.position.y - this.radius < 0) {
      this.speed.y *= -1;
    }
  }

  render() {
    gl.useProgram(program);

    var u_resolution = gl.getUniformLocation(program, "u_resolution");
    gl.uniform2f(u_resolution, canvas.width, canvas.height);

    var u_color = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(u_color, [1.0, 1.0, 1.0, 1.0]);

    var a_position = gl.getAttribLocation(program, "a_position");
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(this.createCircleVertices()),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, this.createCircleVertices().length / 2);
  }

  createCircleVertices() {
    var vertices = [];
    var segments = 100;

    for (var i = 0; i <= segments; i++) {
      var angle = (i / segments) * Math.PI * 2;
      var x = this.position.x + this.radius * Math.cos(angle);
      var y = this.position.y + this.radius * Math.sin(angle);
      vertices.push(x, y);
    }

    return vertices;
  }
}

class Brick {
  constructor(x, y) {
    this.width = brickWidth;
    this.height = brickHeight;
    this.position = { x, y };
    this.isBroken = false;
    this.color = getRandomColor(); // Add a color property
  }

  update() {
    // Brick logic (if any)
  }

  render() {
    if (!this.isBroken) {
      gl.useProgram(program);

      var brickVertices = [
        this.position.x,
        this.position.y,
        this.position.x + this.width,
        this.position.y,
        this.position.x,
        this.position.y - this.height,
        this.position.x + this.width,
        this.position.y - this.height,
      ];

      // Define vertices for the border
      var borderVertices = [
        this.position.x,
        this.position.y,
        this.position.x + this.width,
        this.position.y,
        this.position.x + this.width,
        this.position.y - this.height,
        this.position.x,
        this.position.y - this.height,
        this.position.x,
        this.position.y,
      ];

      var u_resolution = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(u_resolution, canvas.width, canvas.height);

      var u_color = gl.getUniformLocation(program, "u_color");

      // Set the color for the brick
      gl.uniform4fv(u_color, this.color); // Use the random color
      var a_position = gl.getAttribLocation(program, "a_position");
      var bufferId = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(brickVertices),
        gl.STATIC_DRAW
      );
      gl.enableVertexAttribArray(a_position);
      gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

      // Draw the brick
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Set the color for the border
      gl.uniform4fv(u_color, [0.0, 0.0, 0.0, 1.0]);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(borderVertices),
        gl.STATIC_DRAW
      );

      // Draw the border
      gl.drawArrays(gl.LINE_STRIP, 0, 5);
    }
  }
}

function getRandomColor() {
  // Array of random colors
  var colors = [
    [1.0, 0.51, 0.337, 1.0], // #ff8156
    [0.99, 1.0, 0.335, 1.0], // #fdff55
    [0.327, 1.0, 0.674, 1.0], // #53ffac
    [0.333, 0.596, 1.0, 1.0], // #5598ff
    [1.0, 0.337, 0.706, 1.0], // #ff56b4
  ];

  // Choose a random color from the array
  var randomColor = colors[Math.floor(Math.random() * colors.length)];

  return randomColor;
}

function renderBricks() {
  for (var i = 0; i < bricks.length; i++) {
    if (!bricks[i].isBroken) {
      bricks[i].render();
    }
  }
}
