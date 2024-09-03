const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');

// Ajuste del tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables iniciales
const playerSize = 80;
const invaderSize = 45;
const bulletSize = 10;
const invaderSpeedBase = 22;
let bulletSpeed = 35;
const invaderRowCount = 2;
const invaderColumnCount = 5;
const spawnInterval = 9000;
const shootingInterval = 150; // Intervalo de disparo manual en milisegundos (NO USADO)
const bulletReloadTime = 8000; // Tiempo de recarga de balas en milisegundos
const maxBullets = 12; // Número máximo de balas disponibles por recarga

let player, invaders, bullets, score, lastSpawnTime, invaderSpeed, invaderSpawnInterval, gameRunning;
let currentBullets = maxBullets; // Balas actuales disponibles
let flashBackground = false;
let flashText = false;
let flashTextTimer = 0;

// Cargar imágenes invasor especial
const specialInvaderImage = new Image();
specialInvaderImage.src = 'GOLDEN FREDYY.PNG'; // Cambia esta URL por la imagen que desees
const specialInvaderSpeed = 40;
const specialInvaderSize = 55;
const specialInvaderInterval = 40000;

// Cargar imágenes jugador 
const playerImage = new Image();
playerImage.src = 'PURPLE GUY.PNG';

//Si es en telefono
function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

// Cargar imágenes enemigos
const invaderImages = [
    new Image(),
    new Image(),
    new Image(),
    new Image()
];
invaderImages[0].src = 'BONNIE.PNG'; // Cambia estas URLs por las de tus imágenes
invaderImages[1].src = 'CHICA.PNG';
invaderImages[2].src = 'FOXY.PNG';
invaderImages[3].src = 'FREDDY.PNG';

// Inicialización del juego
function initializeGame() {
    player = {
        x: canvas.width / 2 - playerSize / 2,
        y: canvas.height - playerSize - 10,
        width: playerSize,
        height: playerSize
    };

    invaders = [];
    bullets = [];
    score = 0;
    lastSpawnTime = 0;
    
    // Ajustar velocidades según el dispositivo
    if (isMobileDevice()) {
        invaderSpeed = invaderSpeedBase * 0.7; // Velocidad reducida para móvil
        bulletSpeed = bulletSpeed * 0.8;       // Velocidad de bala reducida para móvil
        playerSpeed = 20;                      // Ajusta la velocidad del jugador en móvil
    } else {
        invaderSpeed = invaderSpeedBase;
        bulletSpeed = 35;
        playerSpeed = 30;                      // Ajusta la velocidad del jugador en escritorio
    }
    
    invaderSpawnInterval = spawnInterval;
    gameRunning = true;
    currentBullets = maxBullets;
    restartButton.style.display = 'none';
    spawnInvaders();
    setTimeout(spawnSpecialInvader, 15000);
    reloadBullets();
}


// Función para recargar balas cada 5 segundos
function reloadBullets() {
    setInterval(() => {
        currentBullets = maxBullets;
        updateBulletCounter();  // Actualiza el contador de balas en la pantalla
    }, bulletReloadTime);
}

function updateBulletCounter() {
    const bulletCounter = document.getElementById('bulletCounter');
    bulletCounter.textContent = `Balas: ${currentBullets}`;
}

// Función para dibujar los objetos
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar el jugador
    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    // Dibujar los invasores
    for (const invader of invaders) {
        ctx.drawImage(invader.image, invader.x, invader.y, invader.width, invader.height);
    }

    // Dibujar las balas
    ctx.fillStyle = 'red';
    for (const bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Mostrar el marcador
    document.getElementById('score').textContent = `PUNTOS: ${(score)}`;
}


// Función para mover invasores y balas, y actualizar el puntaje
function move() {
    // Mover invasores
    for (let i = invaders.length - 1; i >= 0; i--) {
        let invader = invaders[i];
        invader.x += invader.dx;

        // Cambiar dirección si el invasor toca los bordes
        if (invader.x + invader.width > canvas.width || invader.x < 0) {
            invader.dx = -invader.dx;
            invader.y += invaderSize;
        }

        // Verificar si los invasores llegaron al fondo
        if (invader.y + invader.height > canvas.height) {
            if (invader.image === specialInvaderImage) {
                score = Math.max(0, score - 100);
                invaders.splice(i, 1);
            } else {
                gameRunning = false;
            }
        }
    }

    // Mover balas
    for (let i = bullets.length - 1; i >= 0; i--) {
        let bullet = bullets[i];
        bullet.y -= bulletSpeed;

        if (bullet.y < 0) {
            bullets.splice(i, 1);
        }
    }

    if (gameRunning) {
        score += 1;
    }
}

// Función de detección de colisiones
function collisionDetection(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Función para generar invasores
function spawnInvaders() {
    const rows = Math.ceil(Math.random() * invaderRowCount);
    const columns = Math.ceil(Math.random() * invaderColumnCount);
    const xSpacing = (canvas.width - (columns * invaderSize)) / (columns + 1);
    const ySpacing = (canvas.height / 3 - (rows * invaderSize)) / (rows + 1);

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const randomImage = invaderImages[Math.floor(Math.random() * invaderImages.length)];
            
            invaders.push({
                x: xSpacing + col * (invaderSize + xSpacing) + Math.random() * (xSpacing - 10),
                y: ySpacing + row * (invaderSize + ySpacing) + Math.random() * (ySpacing - 10),
                width: invaderSize,
                height: invaderSize,
                dx: invaderSpeed,
                image: randomImage
            });
        }
    }

    invaderSpeed = invaderSpeedBase + (rows * columns / 10);
    invaderSpawnInterval = Math.max(500, invaderSpawnInterval - 50);
    setTimeout(spawnInvaders, invaderSpawnInterval);
}


// Función para generar el invasor especial
function spawnSpecialInvader() {
    if (gameRunning) {
        invaders.push({
            x: canvas.width / 2 - specialInvaderSize / 2,
            y: 0,
            width: specialInvaderSize,
            height: specialInvaderSize,
            dx: specialInvaderSpeed,
            image: specialInvaderImage
        });

        setTimeout(spawnSpecialInvader, specialInvaderInterval);
    }
}

// Iniciar la generación de invasores especiales después de 30 segundos
setTimeout(spawnSpecialInvader, 500000);

// Función para disparar
function shoot() {
    if (currentBullets > 0) {
        bullets.push({
            x: player.x + player.width / 2 - bulletSize / 2,
            y: player.y,
            width: bulletSize,
            height: bulletSize
        });
        currentBullets--; // Disminuir el contador de balas disponibles
        updateBulletCounter();  // Actualiza el contador de balas en la pantalla
    }
}

canvas.addEventListener('touchend', function(event) {
    shoot(); // Dispara cuando se levanta el dedo
});



// Función para actualizar el estado del juego
function updateGame() {
    if (gameRunning) {
        move();

        // Verificar colisiones entre balas e invasores
        for (let i = bullets.length - 1; i >= 0; i--) {
            let bullet = bullets[i];
            for (let j = invaders.length - 1; j >= 0; j--) {
                let invader = invaders[j];
                if (collisionDetection(bullet, invader)) {
                    if (invader.image === specialInvaderImage) {
                        flashBackground = true;
                        flashText = true;
                        flashTextTimer = Date.now();
                        score += 500;
                        invaders = [];
                    } else {
                        score += 10;
                    }
                    invaders.splice(j, 1);
                    bullets.splice(i, 1);
                    break;
                }
            }
        }

        draw();
        requestAnimationFrame(updateGame);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ESTAS CONDENADO A MORIR. UNA VEZ, Y OTRA VEZ, Y ETERANMENTE UNA VEZ MAS', canvas.width / 2, canvas.height / 2);
        restartButton.style.display = 'block';
    }

    // Manejar el efecto de fondo rojo
    if (flashBackground) {
        canvas.style.backgroundColor = 'red';
        setTimeout(() => {
            canvas.style.backgroundColor = '';
            flashBackground = false;
        }, 100);
    }

    // Manejar el efecto de texto blanco
    if (flashText && Date.now() - flashTextTimer < 500) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 50px Consolas';
        ctx.fillText('IT´S ME', canvas.width / 2, canvas.height / 2 + 50);
    }
}

// Control del jugador
document.addEventListener('keydown', (event) => {
    if (gameRunning) {
        if (event.key === 'ArrowLeft' || event.key === 'a') {
            player.x -= 30;
        } else if (event.key === 'ArrowRight' || event.key === 'd') {
            player.x += 30;
        } else if (event.key === ' ') {
            shoot();
        }

        // Limitar movimiento del jugador a los bordes del canvas
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }
});

// Botón de reinicio
restartButton.addEventListener('click', () => {
    initializeGame();
    updateGame();
});

// Iniciar el juego
initializeGame();
updateGame();
