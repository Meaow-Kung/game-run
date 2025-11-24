const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let W = canvas.width, H = canvas.height;

function resizeCanvas() {
  const container = document.getElementById('gameContainer');
  const rect = container.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  W = canvas.width;
  H = canvas.height;
  ctx.scale(dpr, dpr);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let running = false;
let gameOver = false;
let score = 0;
let speed = 6;
let obstacles = [];
let spawnTimer = 0;

const player = {
  x: 110,
  y: 0,
  w: 60,
  h: 60,
  vy: 0,
  gravity: 0.9,
  jumpForce: -16,
  grounded: false,
  doubleJumpUsed: false
};

const groundY = () => H/(window.devicePixelRatio||1) - 140;

function spawnObstacle() {
  const w = 30 + Math.random()*50;
  const h = 30 + Math.random()*90;
  obstacles.push({
    x: (W/(window.devicePixelRatio||1)) + 50,
    y: groundY() - h,
    w, h
  });
}

function isCollide(a,b){
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function resetGame(){
  running = false;
  gameOver = false;
  score = 0;
  speed = 6;
  obstacles = [];
  player.y = groundY() - player.h;
  player.vy = 0;
  updateScore();
  document.getElementById('startPanel').classList.remove('hidden');
  document.getElementById('gameOverPanel').classList.add('hidden');
  document.getElementById('btnRestart').classList.add('hidden');
}

function startGame(){
  running = true;
  document.getElementById('startPanel').classList.add('hidden');
  requestAnimationFrame(loop);
}

function endGame(){
  running = false;
  gameOver = true;
  document.getElementById('btnRestart').classList.remove('hidden');
  document.getElementById('finalScore').textContent = "คะแนนสุดท้าย: " + Math.floor(score);
  document.getElementById('gameOverPanel').classList.remove('hidden');
}

function updateScore(){
  document.getElementById('score').textContent = "คะแนน: " + Math.floor(score);
}

function loop(){
  if(!running) return;

  ctx.clearRect(0,0,W,H);

  // draw ground
  ctx.fillStyle = "#0b2a3f";
  ctx.fillRect(0, groundY(), W, H);

  // physics player
  player.vy += player.gravity;
  player.y += player.vy;

  if(player.y + player.h >= groundY()){
    player.y = groundY() - player.h;
    player.vy = 0;
    player.grounded = true;
    player.doubleJumpUsed = false;
  }

  // draw player
  ctx.fillStyle = "#0bf551ff";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // spawn obstacle
  spawnTimer--;
  if(spawnTimer <= 0){
    spawnObstacle();
    spawnTimer = 70 + Math.random()*60;
  }

  // move obstacles
  for(let i = obstacles.length-1; i>=0; i--){
    obstacles[i].x -= speed;
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].w, obstacles[i].h);

    if(isCollide(player, obstacles[i])) endGame();
    if(obstacles[i].x + obstacles[i].w < 0) obstacles.splice(i,1);
  }

  score += 0.1;
  updateScore();

  requestAnimationFrame(loop);
}

function jump(){
  if(gameOver) return;
  if(!running) startGame();
  if(player.grounded){
    player.vy = player.jumpForce;
    player.grounded = false;
  } else if(!player.doubleJumpUsed){
    player.vy = player.jumpForce * 0.9;
    player.doubleJumpUsed = true;
  }
}

document.getElementById('btnJump').addEventListener('click', jump);
document.getElementById('btnRestart').addEventListener('click', resetGame);
document.getElementById('restartBtn2').addEventListener('click', resetGame);

window.addEventListener('keydown', e=>{
  if(e.code === "Space" || e.code === "ArrowUp") jump();
});

resetGame();