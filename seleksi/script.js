const form = document.getElementById("gameForm");
const board = document.getElementById("board");
const ctx = board.getContext("2d");

const bulletSprites = {
  up: new Image(),
  left: new Image(),
  right: new Image(),
};
bulletSprites.up.src =
  "../seleksi/assets client side gaza vs alien/Bullet/bullet.png";
bulletSprites.left.src =
  "../seleksi/assets client side gaza vs alien/Bullet/bullet-left-normal.png";
bulletSprites.right.src =
  "../seleksi/assets client side gaza vs alien/Bullet/bullet-right-normal.png";

const ufoImg = new Image();
ufoImg.src =
  "../seleksi/assets client side gaza vs alien/Enemies/Alien/Alien-CHILL.png";

const backgrounds = {
  bg1: new Image(),
  bg2: new Image(),
};
backgrounds.bg1.src =
  "../seleksi/assets client side gaza vs alien/Background/Theme1/Theme-1-BG.png";
backgrounds.bg2.src =
  "../seleksi/assets client side gaza vs alien/Background/Theme2/Theme-2.png";

let selectedBg = "bg1";

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const bgRadio = document.querySelector('input[name="bg"]:checked');
  selectedBg = bgRadio ? bgRadio.value : "bg1";
  form.style.display = "none";
  board.style.display = "block";
  game.start();
});

//Start of hell
class Bullet {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.speed = 16;
    this.direction = direction;
    this.size = 24;
    this.active = true;
  }

  update() {
    switch (this.direction) {
      case "up":
        this.y -= this.speed;
        break;
      case "left":
        this.x -= this.speed;
        break;
      case "right":
        this.x += this.speed;
        break;
    }
  }

  draw(ctx) {
    const img = bulletSprites[this.direction];
    if (img.complete && img.naturalWidth !== 0) {
      ctx.drawImage(img, this.x, this.y, this.size, this.size);
    } else {
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  isOutOfBounds(board) {
    return (
      this.x < 0 || this.x > board.width || this.y < 0 || this.y > board.height
    );
  }

  collidesWith(obj) {
    return (
      this.x < obj.x + obj.width &&
      this.x + this.size > obj.x &&
      this.y < obj.y + obj.height &&
      this.y + this.size > obj.y
    );
  }
}

class Player {
  constructor(x, y, width, height, color, minY, maxY) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.speed = 32;
    this.minY = minY;
    this.maxY = maxY;
    this.lastShotDirection = null;
  }

  move(dir) {
    switch (dir) {
      case "w":
        if (this.y - this.speed >= this.minY) this.y -= this.speed;
        break;
      case "s":
        if (this.y + this.speed <= this.maxY) this.y += this.speed;
        break;
      case "a":
        if (this.x - this.speed >= 0) this.x -= this.speed;
        break;
      case "d":
        if (this.x + this.speed + this.width <= board.width)
          this.x += this.speed;
        break;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class UFO {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.direction = 1;
  }

  update(board) {
    this.x += this.speed * this.direction;
    if (this.x + this.width >= board.width) {
      this.x = board.width - this.width;
      this.direction = -1;
    }
    if (this.x <= 0) {
      this.x = 0;
      this.direction = 1;
    }
  }

  draw(ctx) {
    if (ufoImg.complete && ufoImg.naturalWidth !== 0) {
      ctx.drawImage(ufoImg, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "#888";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

class GameBoard {
  constructor(ctx, board) {
    this.ctx = ctx;
    this.board = board;
    this.player = new Player(100, 500, 50, 75, "#2ecc40", 400, 550);
    this.bullets = [];
    this.ufo = new UFO(0, 30, 200, 250, 4);
    this.running = false;
    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        this.player.move(key);
        this.draw();
      }
      if (
        ["arrowup", "arrowleft", "arrowright"].includes(e.key.toLowerCase())
      ) {
        const direction = e.key.toLowerCase().replace("arrow", "");
        if (
          !this.player.lastShotDirection ||
          this.player.lastShotDirection !== direction
        ) {
          this.shoot(direction);
          this.player.lastShotDirection = direction;
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (
        ["arrowup", "arrowleft", "arrowright"].includes(e.key.toLowerCase())
      ) {
        this.player.lastShotDirection = null;
      }
    });
  }

  shoot(direction) {
    let bulletX = this.player.x + this.player.width / 2 - 12;
    let bulletY = this.player.y + this.player.height / 2 - 12;
    if (direction === "up") bulletY = this.player.y - 12;
    if (direction === "left") bulletX = this.player.x - 12;
    if (direction === "right") bulletX = this.player.x + this.player.width - 12;
    this.bullets.push(new Bullet(bulletX, bulletY, direction));
    this.draw();
  }

  start() {
    this.running = true;
    this.loop();
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(() => this.loop());
  }

  update() {
    this.bullets.forEach((bullet) => bullet.update());
    this.bullets = this.bullets.filter(
      (bullet) => !bullet.isOutOfBounds(this.board) && bullet.active
    );
    this.ufo.update(this.board);
    this.bullets.forEach((bullet) => {
      if (bullet.active && bullet.collidesWith(this.ufo)) {
        bullet.active = false;
      }
    });
  }

  draw() {
    // Draw background first
    const bgImg = backgrounds[selectedBg];
    if (bgImg.complete && bgImg.naturalWidth !== 0) {
      ctx.drawImage(bgImg, 0, 0, board.width, board.height);
    } else {
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, board.width, board.height);
    }
    this.ufo.draw(this.ctx);
    this.player.draw(this.ctx);
    this.bullets.forEach((bullet) => bullet.active && bullet.draw(this.ctx));
  }
}

const game = new GameBoard(ctx, board);
