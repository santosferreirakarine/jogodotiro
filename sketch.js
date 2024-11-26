let player;
let bullets = [];
let enemies = [];
let score = 0;
let maxEnemies = 30;
let gameWon = false;
let gameOver = false;
let playerDead = false; // Novo estado para indicar se o jogador morreu
let timeLimit = 20; // Tempo limite em segundos
let startTime;

// Variáveis para a imagem de fundo
let bgImg;
let restartButton; // Variável para o botão de reiniciar

function preload() {
  bgImg = loadImage('fundo espacial.jpg'); // Certifique-se de ter a imagem fundo.jpg
}

function setup() {
  createCanvas(800, 600);
  player = new Player();
  startTime = millis();
  
  // Criação do botão "Recomeçar"
  restartButton = createButton('Recomeçar');
  restartButton.position(width / 2 - 50, height / 2 + 50);
  restartButton.size(100, 40);
  restartButton.mousePressed(restartGame);
  restartButton.hide(); // Esconde o botão inicialmente
}

function draw() {
  // Se o jogo acabou, mostrar fundo preto
  if (gameWon || gameOver || playerDead) {
    background(0); // Fundo preto quando o jogo terminar
    textSize(32);
    fill(255);
    textAlign(CENTER, CENTER);
    if (gameWon) {
      text("Parabéns, você venceu! 🎉🎉", width / 2, height / 2); // Emojis de vitória
    } else if (gameOver) {
      text("Que pena, não foi dessa vez! 😞", width / 2, height / 2); // Emoji de derrota
    } else if (playerDead) {
      text("Você morreu! 💀☠️", width / 2, height / 2); // Emojis de morte
    }
    
    restartButton.show(); // Exibe o botão de recomeçar
    noLoop(); // Para o loop do jogo
    return;
  }

  background(bgImg); // Exibe o fundo padrão

  // Calcula o tempo restante
  let elapsedTime = (millis() - startTime) / 1000;
  let timeLeft = timeLimit - int(elapsedTime);

  // Verifica condições de vitória ou derrota
  if (timeLeft <= 0 && score < maxEnemies) {
    gameOver = true;
  }

  if (score >= maxEnemies) {
    gameWon = true;
  }

  // Exibe informações do jogo
  fill(255);
  textSize(20);
  text(`Tempo restante: ${timeLeft}s`, 10, 30);
  text(`Inimigos derrotados: ${score}`, 10, 60);

  // Atualiza o jogador
  player.show();
  player.move();

  // Atualiza as balas
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].show();
    bullets[i].move();

    // Remove a bala se sair da tela
    if (bullets[i].offscreen()) {
      bullets.splice(i, 1);
    } else {
      // Verifica colisão com inimigos
      for (let j = enemies.length - 1; j >= 0; j--) {
        if (bullets[i].hits(enemies[j])) {
          enemies.splice(j, 1); // Remove o inimigo
          bullets.splice(i, 1); // Remove a bala
          score++;
          break;
        }
      }
    }
  }

  // Atualiza os inimigos
  if (frameCount % 60 === 0) {
    enemies.push(new Enemy());
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    enemies[i].show();
    enemies[i].move();

    // Verifica se algum inimigo tocou a nave ou passou da tela
    if (enemies[i].collidesWithPlayer(player)) {
      playerDead = true; // O jogador morre
    }

    // Verifica se o inimigo passou do fundo da tela sem ser destruído
    if (enemies[i].y > height && !enemies[i].isDestroyed) {
      playerDead = true; // O jogador morre se o inimigo passar sem ser destruído
    }

    // Remove inimigos que saem da tela
    if (enemies[i].offscreen()) {
      enemies.splice(i, 1);
    }
  }
}

function mousePressed() {
  bullets.push(new Bullet(player.x, player.y));
}

// Função para reiniciar o jogo
function restartGame() {
  player = new Player();
  bullets = [];
  enemies = [];
  score = 0;
  gameWon = false;
  gameOver = false;
  playerDead = false;
  startTime = millis();
  restartButton.hide(); // Esconde o botão de recomeçar
  loop(); // Reinicia o loop do jogo
}

// Classe do jogador
class Player {
  constructor() {
    this.x = width / 2;
    this.y = height - 40;
    this.size = 40;
  }

  show() {
    fill(0, 0, 255); // Azul intenso
    noStroke();
    triangle(
      this.x - this.size / 2,
      this.y + this.size / 2,
      this.x + this.size / 2,
      this.y + this.size / 2,
      this.x,
      this.y - this.size / 2
    );
  }

  move() {
    this.x = constrain(mouseX, 0, width);
  }
}

// Classe das balas
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 12; // Tamanho do foguete
    this.speed = 7;
    this.smoke = []; // Efeito de fumaça
  }

  show() {
    // Fumaça (efeito visual)
    for (let i = 0; i < this.smoke.length; i++) {
      let smokeParticle = this.smoke[i];
      smokeParticle.show();
      smokeParticle.update();
      if (smokeParticle.alpha <= 0) {
        this.smoke.splice(i, 1);
      }
    }

    // Cor do foguete (amarelo)
    fill(255, 255, 0); // Amarelo
    noStroke();
    
    // Desenhando o foguete como um triângulo
    triangle(
      this.x, this.y - this.size, 
      this.x - this.size / 2, this.y + this.size / 2, 
      this.x + this.size / 2, this.y + this.size / 2
    );
    
    // Efeito de fumaça
    this.smoke.push(new Smoke(this.x, this.y));
  }

  move() {
    this.y -= this.speed; // Movimento para cima
  }

  offscreen() {
    return this.y < 0; // Verifica se saiu da tela
  }

  hits(enemy) {
    let d = dist(this.x, this.y, enemy.x, enemy.y);
    if (d < this.size + enemy.size / 2) {
      enemy.isDestroyed = true; // Marca o inimigo como destruído
      return true;
    }
    return false;
  }
}

// Partículas de fumaça
class Smoke {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alpha = 255;
    this.size = random(5, 10);
  }

  show() {
    fill(255, 255, 255, this.alpha); // Fumaça branca semi-transparente
    noStroke();
    ellipse(this.x, this.y, this.size);
  }

  update() {
    this.alpha -= 5; // A fumaça vai ficando mais transparente
    this.y += 2; // Fumaça subindo
    this.size += 0.1; // A fumaça vai aumentando
  }
}

// Classe dos inimigos (monstros)
class Enemy {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.size = 40; // Tamanho base do monstro
    this.speed = 2; // Velocidade de descida
    this.isDestroyed = false; // Flag para marcar se o inimigo foi destruído
  }

  show() {
    push();
    translate(this.x, this.y);
    rectMode(CENTER);

    // Corpo do monstro
    fill(255, 0, 0); // Vermelho
    rect(0, 0, this.size, this.size * 0.6);

    // Olhos do monstro
    fill(255); // Branco
    ellipse(-this.size * 0.2, -this.size * 0.2, this.size * 0.3); // Olho esquerdo
    ellipse(this.size * 0.2, -this.size * 0.2, this.size * 0.3); // Olho direito

    // Pupilas
    fill(0); // Preto
    ellipse(-this.size * 0.2, -this.size * 0.2, this.size * 0.1); // Pupila esquerda
    ellipse(this.size * 0.2, -this.size * 0.2, this.size * 0.1); // Pupila direita
    pop();
  }

  move() {
    this.y += this.speed; // Movimento descendente
  }

  offscreen() {
    return this.y > height; // Verifica se o inimigo saiu da tela
  }

  collidesWithPlayer(player) {
    let d = dist(this.x, this.y, player.x, player.y);
    return d < this.size / 2 + player.size / 2;
  }
}

