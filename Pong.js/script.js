document.addEventListener('DOMContentLoaded', () => {
    // Elementos do jogo
    const ball = document.querySelector('.ball');
    const playerPaddle = document.getElementById('player-paddle');
    const computerPaddle = document.getElementById('computer-paddle');
    const playerScoreElem = document.getElementById('player-score');
    const computerScoreElem = document.getElementById('computer-score');
    const gameContainer = document.querySelector('.game-container');
    const gameOver = document.querySelector('.game-over');
    const gameResult = document.getElementById('game-result');
    const restartButton = document.querySelector('.restart-button');
    
    // Configuração do jogo
    const gameConfig = {
        ballSpeed: 5,
        ballSpeedMax: 15,
        ballSpeedIncrease: 0.2,
        computerPaddleSpeed: 4.5,
        maxScore: 5
    };
    
    // Estado do jogo
    const gameState = {
        ballX: 0,
        ballY: 0,
        ballDirectionX: 1,
        ballDirectionY: 1,
        playerScore: 0,
        computerScore: 0,
        paddleHeight: parseInt(getComputedStyle(playerPaddle).height),
        paddleWidth: parseInt(getComputedStyle(playerPaddle).width),
        ballSize: parseInt(getComputedStyle(ball).width),
        gameHeight: parseInt(getComputedStyle(gameContainer).height),
        gameWidth: parseInt(getComputedStyle(gameContainer).width),
        isPlaying: true,
        currentBallSpeed: gameConfig.ballSpeed
    };
    
    // Inicializa o jogo
    function initGame() {
        gameState.ballX = gameState.gameWidth / 2 - gameState.ballSize / 2;
        gameState.ballY = gameState.gameHeight / 2 - gameState.ballSize / 2;
        gameState.ballDirectionX = Math.random() > 0.5 ? 1 : -1;
        gameState.ballDirectionY = Math.random() > 0.5 ? 1 : -1;
        gameState.playerScore = 0;
        gameState.computerScore = 0;
        gameState.currentBallSpeed = gameConfig.ballSpeed;
        gameState.isPlaying = true;
        
        playerScoreElem.textContent = '0';
        computerScoreElem.textContent = '0';
        
        ball.style.left = `${gameState.ballX}px`;
        ball.style.top = `${gameState.ballY}px`;
        
        gameOver.style.display = 'none';
        
        // Inicia o loop do jogo
        requestAnimationFrame(gameLoop);
    }
    
    // Loop principal do jogo
    function gameLoop() {
        if (!gameState.isPlaying) return;
        
        // Movimenta a bola
        moveGameElements();
        
        // Checa colisões
        checkCollisions();
        
        // Atualiza a posição dos elementos na tela
        updateGameDisplay();
        
        // Continua o loop
        requestAnimationFrame(gameLoop);
    }
    
    // Movimenta os elementos do jogo
    function moveGameElements() {
        // Movimenta a bola
        gameState.ballX += gameState.ballDirectionX * gameState.currentBallSpeed;
        gameState.ballY += gameState.ballDirectionY * gameState.currentBallSpeed;
        
        // Inteligência artificial do computador
        moveComputerPaddle();
    }
    
    // Movimenta a raquete do computador
    function moveComputerPaddle() {
        const computerPaddleY = parseInt(getComputedStyle(computerPaddle).top);
        const computerPaddleCenter = computerPaddleY + gameState.paddleHeight / 2;
        const ballCenter = gameState.ballY + gameState.ballSize / 2;
        
        // Faz com que o computador siga a bola, mas com alguma imperfeição
        if (computerPaddleCenter < ballCenter - 10) {
            let newPosition = computerPaddleY + gameConfig.computerPaddleSpeed;
            if (newPosition > gameState.gameHeight - gameState.paddleHeight) {
                newPosition = gameState.gameHeight - gameState.paddleHeight;
            }
            computerPaddle.style.top = `${newPosition}px`;
        } else if (computerPaddleCenter > ballCenter + 10) {
            let newPosition = computerPaddleY - gameConfig.computerPaddleSpeed;
            if (newPosition < 0) {
                newPosition = 0;
            }
            computerPaddle.style.top = `${newPosition}px`;
        }
    }
    
    // Verifica colisões
    function checkCollisions() {
        // Colisão com paredes superior e inferior
        if (gameState.ballY <= 0 || 
            gameState.ballY >= gameState.gameHeight - gameState.ballSize) {
            gameState.ballDirectionY *= -1;
        }
        
        // Colisão com a raquete do jogador
        const playerPaddleTop = parseInt(getComputedStyle(playerPaddle).top);
        if (gameState.ballX <= parseInt(getComputedStyle(playerPaddle).left) + gameState.paddleWidth &&
            gameState.ballY + gameState.ballSize >= playerPaddleTop &&
            gameState.ballY <= playerPaddleTop + gameState.paddleHeight &&
            gameState.ballDirectionX < 0) {
            
            gameState.ballDirectionX *= -1;
            
            // Aumenta a velocidade da bola quando há colisão
            if (gameState.currentBallSpeed < gameConfig.ballSpeedMax) {
                gameState.currentBallSpeed += gameConfig.ballSpeedIncrease;
            }
            
            // Ajusta ângulo da bola dependendo de onde ela bate na raquete
            adjustBallAngle(playerPaddleTop);
        }
        
        // Colisão com a raquete do computador
        const computerPaddleTop = parseInt(getComputedStyle(computerPaddle).top);
        if (gameState.ballX + gameState.ballSize >= parseInt(getComputedStyle(computerPaddle).left) &&
            gameState.ballY + gameState.ballSize >= computerPaddleTop &&
            gameState.ballY <= computerPaddleTop + gameState.paddleHeight &&
            gameState.ballDirectionX > 0) {
            
            gameState.ballDirectionX *= -1;
            
            // Aumenta a velocidade da bola quando há colisão
            if (gameState.currentBallSpeed < gameConfig.ballSpeedMax) {
                gameState.currentBallSpeed += gameConfig.ballSpeedIncrease;
            }
            
            // Ajusta ângulo da bola dependendo de onde ela bate na raquete
            adjustBallAngle(computerPaddleTop);
        }
        
        // Pontuação - bola passou pelas raquetes
        if (gameState.ballX <= 0) {
            // Ponto para o computador
            gameState.computerScore++;
            computerScoreElem.textContent = gameState.computerScore;
            resetBall();
            checkGameOver();
        } else if (gameState.ballX >= gameState.gameWidth - gameState.ballSize) {
            // Ponto para o jogador
            gameState.playerScore++;
            playerScoreElem.textContent = gameState.playerScore;
            resetBall();
            checkGameOver();
        }
    }
    
    // Ajusta o ângulo da bola quando colide com a raquete
    function adjustBallAngle(paddleTop) {
        const paddleCenter = paddleTop + gameState.paddleHeight / 2;
        const ballCenter = gameState.ballY + gameState.ballSize / 2;
        const distanceFromCenter = ballCenter - paddleCenter;
        
        // Normaliza a distância para um valor entre -1 e 1
        const normalizedDistance = distanceFromCenter / (gameState.paddleHeight / 2);
        
        // Ajusta a direção Y baseada na distância do centro
        gameState.ballDirectionY = normalizedDistance * 1.5;
    }
    
    // Reinicia a posição da bola após ponto
    function resetBall() {
        gameState.ballX = gameState.gameWidth / 2 - gameState.ballSize / 2;
        gameState.ballY = gameState.gameHeight / 2 - gameState.ballSize / 2;
        gameState.ballDirectionX *= -1;
        gameState.ballDirectionY = Math.random() > 0.5 ? 1 : -1;
        gameState.currentBallSpeed = gameConfig.ballSpeed;
    }
    
    // Verifica se o jogo acabou
    function checkGameOver() {
        if (gameState.playerScore >= gameConfig.maxScore) {
            endGame("Você venceu!");
        } else if (gameState.computerScore >= gameConfig.maxScore) {
            endGame("Computador venceu!");
        }
    }
    
    // Finaliza o jogo
    function endGame(result) {
        gameState.isPlaying = false;
        gameResult.textContent = result;
        gameOver.style.display = 'block';
    }
    
    // Atualiza a exibição do jogo
    function updateGameDisplay() {
        ball.style.left = `${gameState.ballX}px`;
        ball.style.top = `${gameState.ballY}px`;
    }
    
    // Controles do jogador com o teclado
    document.addEventListener('keydown', (e) => {
        const playerPaddleTop = parseInt(getComputedStyle(playerPaddle).top);
        
        if (e.key === 'ArrowUp') {
            let newPosition = playerPaddleTop - 20;
            if (newPosition < 0) {
                newPosition = 0;
            }
            playerPaddle.style.top = `${newPosition}px`;
        } else if (e.key === 'ArrowDown') {
            let newPosition = playerPaddleTop + 20;
            if (newPosition > gameState.gameHeight - gameState.paddleHeight) {
                newPosition = gameState.gameHeight - gameState.paddleHeight;
            }
            playerPaddle.style.top = `${newPosition}px`;
        }
    });
    
    // Controles do jogador com o mouse
    gameContainer.addEventListener('mousemove', (e) => {
        const containerRect = gameContainer.getBoundingClientRect();
        const mousePositionRelative = e.clientY - containerRect.top;
        let newPosition = mousePositionRelative - gameState.paddleHeight / 2;
        
        // Limita a posição da raquete dentro da área do jogo
        if (newPosition < 0) {
            newPosition = 0;
        } else if (newPosition > gameState.gameHeight - gameState.paddleHeight) {
            newPosition = gameState.gameHeight - gameState.paddleHeight;
        }
        
        playerPaddle.style.top = `${newPosition}px`;
    });
    
    // Botão de reiniciar
    restartButton.addEventListener('click', initGame);
    
    // Inicia o jogo
    initGame();
});