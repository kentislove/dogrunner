const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 遊戲設定
const GROUND = 320;
const GRAVITY = 1.1;
const JUMP_POWER = -17;
const DOG_WIDTH = 80;
const DOG_HEIGHT = 80;

// 載入角色圖片
const dogImg = new Image();
dogImg.src = '/static/images/dog.jpg';

// 能力道具顏色與效果
const powerUps = [
    { color: 'red',    effect: 'speed' },
    { color: 'blue',   effect: 'jump' },
    { color: 'green',  effect: 'heal' },
    { color: 'yellow', effect: 'attack' }
];

// 地形
const terrains = [
    { name: '湖畔',    color: '#aee7f9' },
    { name: '山坡',    color: '#e3c08d' },
    { name: '城市',    color: '#b0b0b0' },
    { name: '草原',    color: '#a9e6a1' }
];

// 遊戲狀態
let gameX = 0;
let terrainIdx = 0;
let dog = {
    x: 100,
    y: GROUND,
    vy: 0,
    onGround: true,
    speed: 6,
    jump: JUMP_POWER,
    hp: 3,
    attack: 1
};
let items = [];
let score = 0;

// 生成道具
function spawnItem() {
    let px = canvas.width + Math.random() * 400;
    let py = GROUND + 20 - Math.random() * 60;
    let idx = Math.floor(Math.random() * powerUps.length);
    items.push({
        x: px, y: py, color: powerUps[idx].color, effect: powerUps[idx].effect
    });
}
setInterval(spawnItem, 1800);

// 鍵盤控制
let keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Space' && dog.onGround) {
        dog.vy = dog.jump;
        dog.onGround = false;
    }
    // 吼叫攻擊
    if (e.code === 'KeyX') {
        // 攻擊特效（可擴充）
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(dog.x + DOG_WIDTH, dog.y + DOG_HEIGHT / 2, 70 * dog.attack, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
});
document.addEventListener('keyup', e => keys[e.code] = false);

// 更新邏輯
function update() {
    // 捲軸
    gameX += dog.speed;
    // 地形切換
    if (gameX > (terrainIdx + 1) * 2000) terrainIdx = (terrainIdx + 1) % terrains.length;
    // 跳躍
    if (!dog.onGround) {
        dog.vy += GRAVITY;
        dog.y += dog.vy;
        if (dog.y >= GROUND) {
            dog.y = GROUND;
            dog.vy = 0;
            dog.onGround = true;
        }
    }
    // 移動道具
    for (let i = items.length - 1; i >= 0; i--) {
        items[i].x -= dog.speed;
        // 撞到狗狗
        if (
            items[i].x < dog.x + DOG_WIDTH &&
            items[i].x + 30 > dog.x &&
            items[i].y < dog.y + DOG_HEIGHT &&
            items[i].y + 30 > dog.y
        ) {
            // 吃到道具
            switch (items[i].effect) {
                case 'speed':  dog.speed += 1; break;
                case 'jump':   dog.jump -= 3; break;
                case 'heal':   dog.hp = Math.min(dog.hp + 1, 5); break;
                case 'attack': dog.attack += 0.5; break;
            }
            items.splice(i, 1);
            score += 10;
        } else if (items[i].x < -40) {
            items.splice(i, 1);
        }
    }
}

// 畫面渲染
function draw() {
    // 背景
    ctx.fillStyle = terrains[terrainIdx].color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 地面
    ctx.fillStyle = "#888";
    ctx.fillRect(0, GROUND + DOG_HEIGHT, canvas.width, 80);
    // 狗狗
    ctx.drawImage(dogImg, dog.x, dog.y, DOG_WIDTH, DOG_HEIGHT);
    // 道具
    for (let item of items) {
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 15, 0, 2 * Math.PI);
        ctx.fill();
    }
    // UI
    ctx.fillStyle = '#222';
    ctx.font = '20px sans-serif';
    ctx.fillText("分數: " + score, 20, 30);
    ctx.fillText("HP: " + dog.hp, 20, 60);
}

// 遊戲主循環
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}
dogImg.onload = loop;
