(function () {
  const PIXEL = 3;
  const W = 200;
  const H = 120;
  const GRAVITY = 0.45;
  const JUMP_FORCE = -7.5;
  const GROUND = H - 24;
  const PLAYER_X = 30;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = W * PIXEL + 'px';
  canvas.style.height = H * PIXEL + 'px';

  const prompt = document.querySelector('.game-prompt');
  const container = document.getElementById('gameContainer');
  const scoreEl = document.getElementById('score');
  const restartBtn = document.getElementById('restartBtn');

  let running = false;
  let gameOver = false;
  let player, obstacles, fireflies, bgLayers, score, frameCount, speed;

  const colors = {
    bg: '#0a0f0a',
    ground1: '#0f1a0f',
    ground2: '#1a2e1a',
    tree1: '#1a2e1a',
    tree2: '#2d5a27',
    tree3: '#1a3018',
    trunk: '#3a2a1a',
    trunkDark: '#2a1a0a',
    rock: '#2a2a2a',
    rockLight: '#3a3a3a',
    mushroom: '#6a3030',
    mushroomCap: '#8a4040',
    playerBody: '#4a6a40',
    playerHead: '#d4a754',
    playerEye: '#1a1a1a',
    playerLeg: '#3a4a30',
    firefly: '#d4a754',
    fireflyGlow: '#d4a75440',
  };

  function init() {
    player = { y: GROUND, vy: 0, grounded: true, frame: 0 };
    obstacles = [];
    fireflies = [];
    bgLayers = [
      { trees: generateTrees(40, 0.3, colors.tree1), scroll: 0, speed: 0.15 },
      { trees: generateTrees(25, 0.5, colors.tree2), scroll: 0, speed: 0.35 },
      { trees: generateTrees(15, 0.8, colors.tree3), scroll: 0, speed: 0.7 },
    ];
    score = 0;
    frameCount = 0;
    speed = 1.5;
    gameOver = false;
    restartBtn.classList.add('hidden');
    scoreEl.textContent = '0';
  }

  function generateTrees(count, heightVar, color) {
    const trees = [];
    for (let i = 0; i < count; i++) {
      trees.push({
        x: Math.random() * W * 2,
        h: 20 + Math.random() * 30 * heightVar,
        w: 3 + Math.random() * 4,
        color: color,
      });
    }
    return trees;
  }

  function spawnObstacle() {
    const type = Math.random();
    if (type < 0.5) {
      obstacles.push({ x: W + 10, y: GROUND, w: 8, h: 12, type: 'rock' });
    } else if (type < 0.8) {
      obstacles.push({ x: W + 10, y: GROUND, w: 5, h: 16, type: 'stump' });
    } else {
      obstacles.push({ x: W + 10, y: GROUND, w: 6, h: 10, type: 'mushroom' });
    }
  }

  function spawnFirefly() {
    fireflies.push({
      x: W + 10,
      y: GROUND - 20 - Math.random() * 50,
      w: 3,
      h: 3,
      baseY: GROUND - 20 - Math.random() * 50,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function jump() {
    if (gameOver) return;
    if (!running) {
      running = true;
      prompt.style.display = 'none';
      container.classList.remove('hidden');
      init();
      requestAnimationFrame(loop);
    }
    if (player.grounded) {
      player.vy = JUMP_FORCE;
      player.grounded = false;
    }
  }

  function drawPixelRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  function drawTree(x, h, w, color) {
    const trunkH = h * 0.4;
    const trunkW = Math.max(2, Math.floor(w * 0.3));
    drawPixelRect(x - trunkW / 2, GROUND - trunkH, trunkW, trunkH, colors.trunk);
    drawPixelRect(x - trunkW / 2 - 1, GROUND - trunkH, 1, trunkH, colors.trunkDark);
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const ly = GROUND - trunkH - (i * h * 0.18);
      const lw = w * (1 - i * 0.25);
      drawPixelRect(x - lw / 2, ly - h * 0.15, lw, h * 0.18, color);
    }
  }

  function drawPlayer() {
    const px = PLAYER_X;
    const py = Math.floor(player.y);
    const bobble = player.grounded ? Math.sin(player.frame * 0.15) * 1.5 : 0;

    drawPixelRect(px + 2, py - 12 + bobble, 5, 5, colors.playerHead);
    drawPixelRect(px + 3, py - 11 + bobble, 1, 1, colors.playerEye);

    drawPixelRect(px + 1, py - 7 + bobble, 7, 6, colors.playerBody);

    const legOffset = player.grounded ? Math.sin(player.frame * 0.3) * 2 : -1;
    drawPixelRect(px + 2, py - 1 + bobble, 2, 3 + legOffset, colors.playerLeg);
    drawPixelRect(px + 5, py - 1 + bobble, 2, 3 - legOffset, colors.playerLeg);

    drawPixelRect(px - 1, py - 6 + bobble, 2, 4, colors.playerBody);
  }

  function drawRock(x, y, w, h) {
    drawPixelRect(x, y - h, w, h, colors.rock);
    drawPixelRect(x + 1, y - h, w - 2, 1, colors.rockLight);
  }

  function drawStump(x, y, w, h) {
    drawPixelRect(x, y - h, w, h, colors.trunk);
    drawPixelRect(x, y - h, w, 2, '#5a4a30');
    drawPixelRect(x + 1, y - h + 1, w - 2, 1, '#6a5a40');
  }

  function drawMushroom(x, y, w, h) {
    drawPixelRect(x + 1, y - h + 3, w - 2, h - 3, '#c0b0a0');
    drawPixelRect(x, y - h, w, 4, colors.mushroomCap);
    drawPixelRect(x + 1, y - h, w - 2, 1, colors.mushroom);
    drawPixelRect(x + 2, y - h + 1, 1, 1, '#e0d0c0');
    drawPixelRect(x + w - 3, y - h + 2, 1, 1, '#e0d0c0');
  }

  function drawFirefly(ff) {
    const glow = Math.sin(ff.phase + frameCount * 0.08) * 0.5 + 0.5;
    ctx.globalAlpha = 0.15 + glow * 0.25;
    drawPixelRect(ff.x - 2, ff.y - 2, 7, 7, colors.fireflyGlow);
    ctx.globalAlpha = 0.6 + glow * 0.4;
    drawPixelRect(ff.x, ff.y, 3, 3, colors.firefly);
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    drawPixelRect(0, GROUND, W, H - GROUND, colors.ground1);
    for (let x = 0; x < W; x += 4) {
      const h = Math.sin(x * 0.3) * 1.5 + 1;
      drawPixelRect(x, GROUND - h, 4, h, colors.ground2);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, W, H);

    bgLayers.forEach(function (layer) {
      layer.trees.forEach(function (tree) {
        const tx = ((tree.x - layer.scroll) % (W * 2) + W * 2) % (W * 2) - W * 0.5;
        drawTree(tx, tree.h, tree.w, tree.color);
      });
    });

    drawGround();

    obstacles.forEach(function (o) {
      if (o.type === 'rock') drawRock(o.x, o.y, o.w, o.h);
      else if (o.type === 'stump') drawStump(o.x, o.y, o.w, o.h);
      else drawMushroom(o.x, o.y, o.w, o.h);
    });

    fireflies.forEach(drawFirefly);
    drawPlayer();
  }

  function loop() {
    if (!running) return;

    frameCount++;
    speed = 1.5 + frameCount * 0.0004;

    player.vy += GRAVITY;
    player.y += player.vy;
    if (player.y >= GROUND) {
      player.y = GROUND;
      player.vy = 0;
      player.grounded = true;
    }
    player.frame++;

    bgLayers.forEach(function (layer) {
      layer.scroll += speed * layer.speed;
    });

    if (frameCount % Math.floor(80 - Math.min(speed * 8, 40)) === 0) {
      spawnObstacle();
    }
    if (frameCount % 120 === 0) {
      spawnFirefly();
    }

    obstacles.forEach(function (o) { o.x -= speed; });
    fireflies.forEach(function (ff) {
      ff.x -= speed;
      ff.y = ff.baseY + Math.sin(ff.phase + frameCount * 0.05) * 3;
    });
    obstacles = obstacles.filter(function (o) { return o.x > -20; });
    fireflies = fireflies.filter(function (ff) { return ff.x > -20; });

    obstacles.forEach(function (o) {
      if (
        PLAYER_X + 6 > o.x &&
        PLAYER_X + 1 < o.x + o.w &&
        player.y > o.y - o.h &&
        player.y - 12 < o.y
      ) {
        running = false;
        gameOver = true;
        restartBtn.classList.remove('hidden');
      }
    });

    fireflies.forEach(function (ff, i) {
      if (
        PLAYER_X + 6 > ff.x &&
        PLAYER_X + 1 < ff.x + ff.w &&
        player.y > ff.y &&
        player.y - 12 < ff.y + ff.h
      ) {
        score += 10;
        scoreEl.textContent = score;
        fireflies.splice(i, 1);
      }
    });

    if (frameCount % 15 === 0 && !gameOver) {
      score += 1;
      scoreEl.textContent = score;
    }

    draw();
    if (running) requestAnimationFrame(loop);
  }

  prompt.addEventListener('click', jump);
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      jump();
    }
  });
  canvas.addEventListener('touchstart', function (e) {
    e.preventDefault();
    jump();
  });
  restartBtn.addEventListener('click', function () {
    init();
    running = true;
    requestAnimationFrame(loop);
  });

  init();
})();
