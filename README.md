# CS452 Project 1: Breakout Game

## Team Members

Bryan Lim  
Mustapha Jom

## Controls

- "space" to start the game
- "left arrow" to move the paddle left
- "right arrow" to move the paddle right

## The scoring system

The scoring system is as such:

- Player gets 1 point for every brick he destroys
- The game is over once the player's ball hits the bottom of the screen

## The win condition

Win Condition:

- The player wins once his score equals to all the bricks generated (Once he destroys all the bricks)

## How the game was implemented

The first thing we did was to implement the vertex and fragment shader to display a black canvas and work from there.
After getting a black canvas, we then worked on the individual classes for paddle, ball and brick. Here's a clearer explanation of the classes:

- **Paddle Class:**

  - The `Paddle` class represents the player-controlled paddle. It handles paddle movement, including left, right, and stopping.
  - The `update` method updates the paddle's position and ensures it stays within the canvas boundaries.
  - The 'moveLeft', 'moveRight' and 'stop' methods are used to move the paddle left, right, and stop it respectively and handled by the handleKey events
  - The `render` method renders the paddle as a white rectangle on the canvas.

- **Ball Class:**

  - The `Ball` class represents the game ball. It has properties for position, speed, and radius.
  - The `update` method updates the ball's position and reflects it when it hits the canvas boundaries.
  - The `render` method renders the ball as a white circle/

- **Brick Class:**

  - The `Brick` class represents the bricks that the player must break. Each brick has properties like position, size, and color.
  - The `render` method renders the bricks as filled rectangles with a black border using WebGL. The color of each brick is randomized from an array of colours provided

After implementing the individual classes, the next challenge was working on the collision mechanism for the ball with objects. The collision mechanism we used is as such:

- With the paddle, the relative position of the ball with respect to the paddle is accounted for and the ball is reflected accordingly, with the x and y speed values changed accordingly.
- With the brick, we just reflected the y speed.

Although this may not provide us with the most realistic collision mechanism, it is sufficient for the purposes of this game and would be definitely be a future improvement. (Note some bugs may be faced with the collision mechanism, but it is not a major issue for most runs of the games)

A nifty feature we implemented that added value was the sound effect when the ball hits the brick. This was done by using the HTML5 audio element and playing the sound effect when the ball hits the brick.

The last thing implemeted would be the flow of the game such starting the game with a message telling the player to press Space to start. Once the game starts, the score the player has is displayed and when he wins or loses another message is displayed telling him the status
