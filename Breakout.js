var gl;
var program;
var canvas;

var paddle;
var ball;
var bricks = [];

var paddleWidth = 100;
var brickRows = 3;
var brickCols = 7;
var brickWidth = 75;
var brickHeight = 20;

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
  initializeBricks();

  document.addEventListener("keydown", handleKeyPress);
  document.addEventListener("keyup", handleKeyRelease);

  requestAnimationFrame(render);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  paddle.update();
  ball.update();
  checkCollisions();

  paddle.render();
  ball.render();
  renderBricks();

  if (ball.position.y + ball.radius > canvas.height) {
    alert("Game Over!");
    document.location.reload();
  } else if (bricks.every((brick) => brick.isBroken)) {
    alert("You Win!");
    document.location.reload();
  } else {
    requestAnimationFrame(render);
  }
}

function handleKeyPress(event) {
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
      }
    }
  }
}

class Paddle {
  constructor() {
    this.width = paddleWidth;
    this.height = 10;
    this.position = {
      x: (canvas.width - this.width) / 2,
      y: canvas.height - this.height - 10,
    };
    this.speed = 5;
  }

  moveLeft() {
    this.position.x -= this.speed;
    if (this.position.x < 0) {
      this.position.x = 0;
    }
  }

  moveRight() {
    this.position.x += this.speed;
    if (this.position.x + this.width > canvas.width) {
      this.position.x = canvas.width - this.width;
    }
  }

  stop() {
    // Stop paddle movement
  }

  update() {
    // Paddle logic (if any)
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
    this.speed = { x: 2, y: -2 };
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

      var u_resolution = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(u_resolution, canvas.width, canvas.height);

      var u_color = gl.getUniformLocation(program, "u_color");
      gl.uniform4fv(u_color, [0.5, 0.5, 0.9, 1.0]);

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

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
}

function renderBricks() {
  for (var i = 0; i < bricks.length; i++) {
    if (!bricks[i].isBroken) {
      bricks[i].render();
    }
  }
}

// Start the game by calling init() in the HTML file.
