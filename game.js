class PlayerNameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PlayerNameScene' });
    }

    create() {
        this.add.text(400, 200, 'ASTEROIDS GAME', {
            fontSize: '48px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 280, 'Enter Your Name:', {
            fontSize: '32px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Create input field
        this.playerName = '';
        this.nameText = this.add.text(400, 340, '|', {
            fontSize: '32px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 420, 'Press ENTER to start', {
            fontSize: '24px',
            fill: '#aaa',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 460, 'Press H for High Scores', {
            fontSize: '18px',
            fill: '#aaa',
            align: 'center'
        }).setOrigin(0.5);

        // Handle keyboard input
        this.input.keyboard.on('keydown', this.handleKeyInput, this);
    }

    handleKeyInput(event) {
        if (event.keyCode === 8) { // Backspace
            this.playerName = this.playerName.slice(0, -1);
            this.nameText.setText(this.playerName + '|');
        } else if (event.keyCode === 13) { // Enter
            if (this.playerName.length > 0) {
                this.scene.start('AsteroidGame', { playerName: this.playerName });
            }
        } else if (event.key.toLowerCase() === 'h') { // High scores
            this.scene.start('HighScoresScene');
        } else if (event.key.length === 1 && this.playerName.length < 15) {
            this.playerName += event.key.toUpperCase();
            this.nameText.setText(this.playerName + '|');
        }
    }
}

class HighScoresScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HighScoresScene' });
    }

    init(data) {
        this.returnScene = data.returnScene || 'PlayerNameScene';
    }

    async create() {
        this.add.text(400, 50, 'HIGH SCORES', {
            fontSize: '48px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Load and display scores
        const scores = await this.loadScores();
        
        if (scores.length === 0) {
            this.add.text(400, 200, 'No scores yet!', {
                fontSize: '32px',
                fill: '#aaa',
                align: 'center'
            }).setOrigin(0.5);
        } else {
            scores.forEach((score, index) => {
                const y = 120 + (index * 40);
                this.add.text(400, y, `${index + 1}. ${score.name} - ${score.score} pts (${score.time}s)`, {
                    fontSize: '24px',
                    fill: index < 3 ? '#ffff00' : '#fff',
                    align: 'center'
                }).setOrigin(0.5);
            });
        }

        this.add.text(400, 550, 'Press SPACE to return', {
            fontSize: '24px',
            fill: '#aaa',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            if (this.returnScene === 'AsteroidGame') {
                this.scene.start('PauseScene');
            } else {
                this.scene.start(this.returnScene);
            }
        });
    }

    async loadScores() {
        try {
            // Try to load from server first
            const response = await fetch('/api/scores');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.log('Server not available, using localStorage');
        }

        // Fallback to localStorage
        try {
            return JSON.parse(localStorage.getItem('asteroidScores') || '[]');
        } catch (error) {
            console.log('Could not load scores:', error);
            return [];
        }
    }
}

class PauseScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PauseScene' });
    }

    init(data) {
        this.currentScore = data.score || 0;
        this.playerName = data.playerName || 'PLAYER';
        this.gameTime = data.gameTime || 0;
    }

    create() {
        // Semi-transparent overlay
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

        this.add.text(400, 150, 'GAME PAUSED', {
            fontSize: '48px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Show current game stats
        this.add.text(400, 220, `Player: ${this.playerName}`, {
            fontSize: '24px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 250, `Current Score: ${this.currentScore}`, {
            fontSize: '24px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 280, `Time: ${this.gameTime}s`, {
            fontSize: '24px',
            fill: '#ffff00',
            align: 'center'
        }).setOrigin(0.5);

        // Control instructions
        this.add.text(400, 340, 'Press ESC to resume', {
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 380, 'Press H for High Scores', {
            fontSize: '24px',
            fill: '#aaa',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 420, 'Press Q to quit to main menu', {
            fontSize: '24px',
            fill: '#aaa',
            align: 'center'
        }).setOrigin(0.5);

        // Handle input
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        this.input.keyboard.on('keydown', this.handleKeyInput, this);
    }

    handleKeyInput(event) {
        if (event.keyCode === 27) { // ESC
            this.scene.stop();
            this.scene.resume('AsteroidGame');
        } else if (event.key.toLowerCase() === 'h') { // High scores
            this.scene.start('HighScoresScene', { returnScene: 'AsteroidGame' });
        } else if (event.key.toLowerCase() === 'q') { // Quit to menu
            this.scene.stop();
            this.scene.stop('AsteroidGame');
            this.scene.start('PlayerNameScene');
        }
    }
}

class AsteroidGame extends Phaser.Scene {
    constructor() {
        super({ key: 'AsteroidGame' });
    }

    init(data) {
        this.playerName = data.playerName || 'PLAYER';
        this.gameStartTime = new Date();
    }

    preload() {
        console.log('Preload phase started');
        // No assets to preload - we'll draw everything with graphics
    }

    create() {
        console.log('Create phase started');
        
        // Create starfield background
        for (let i = 0; i < 100; i++) {
            const star = this.add.graphics();
            star.fillStyle(0xffffff);
            star.fillCircle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), 1);
        }

        // Create player ship
        this.player = this.add.graphics();
        this.player.x = 400;
        this.player.y = 300;
        this.player.angle = 0;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.lives = 1;
        this.drawPlayer();

        // Create groups
        this.asteroids = this.add.group();
        this.bullets = this.add.group();

        // Create initial asteroids
        for (let i = 0; i < 5; i++) {
            this.createAsteroid();
        }

        // Input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        // UI
        this.score = 0;
        this.add.text(16, 16, 'Player: ' + this.playerName, {
            fontSize: '24px',
            fill: '#fff'
        });
        this.scoreText = this.add.text(16, 46, 'Score: 0', {
            fontSize: '24px',
            fill: '#fff'
        });
        this.livesText = this.add.text(16, 76, 'Lives: 1', {
            fontSize: '24px',
            fill: '#fff'
        });

        console.log('Game setup complete');
    }

    drawPlayer() {
        this.player.clear();
        this.player.lineStyle(2, 0xffffff);
        this.player.beginPath();
        this.player.moveTo(15, 0);
        this.player.lineTo(-10, -8);
        this.player.lineTo(-5, 0);
        this.player.lineTo(-10, 8);
        this.player.closePath();
        this.player.strokePath();
    }

    update(time, delta) {
        this.handleInput(delta);
        this.updatePlayer(delta);
        this.updateBullets(delta);
        this.updateAsteroids(delta);
        this.checkCollisions();
        this.wrapObjects();
    }

    handleInput(delta) {
        // Pause game
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
            this.pauseGame();
            return;
        }

        // Rotation
        if (this.cursors.left.isDown) {
            this.player.angle -= 200 * (delta / 1000);
        }
        if (this.cursors.right.isDown) {
            this.player.angle += 200 * (delta / 1000);
        }

        // Thrust
        if (this.cursors.up.isDown) {
            const angleRad = Phaser.Math.DegToRad(this.player.angle);
            this.player.velocityX += Math.cos(angleRad) * 300 * (delta / 1000);
            this.player.velocityY += Math.sin(angleRad) * 300 * (delta / 1000);
        }

        // Shoot
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.shootBullet();
        }
    }

    pauseGame() {
        // Calculate current game time
        const currentTime = new Date();
        const gameTime = Math.floor((currentTime - this.gameStartTime) / 1000);
        
        this.scene.pause();
        this.scene.launch('PauseScene', { 
            score: this.score,
            playerName: this.playerName,
            gameTime: gameTime
        });
    }

    updatePlayer(delta) {
        // Apply friction
        this.player.velocityX *= 0.99;
        this.player.velocityY *= 0.99;

        // Update position
        this.player.x += this.player.velocityX * (delta / 1000);
        this.player.y += this.player.velocityY * (delta / 1000);
    }

    shootBullet() {
        const angleRad = Phaser.Math.DegToRad(this.player.angle);
        const bullet = this.add.graphics();
        bullet.fillStyle(0xffffff);
        bullet.fillCircle(0, 0, 3);
        bullet.x = this.player.x + Math.cos(angleRad) * 20;
        bullet.y = this.player.y + Math.sin(angleRad) * 20;
        bullet.velocityX = Math.cos(angleRad) * 400;
        bullet.velocityY = Math.sin(angleRad) * 400;
        bullet.life = 2000; // 2 seconds
        
        this.bullets.add(bullet);
    }

    updateBullets(delta) {
        this.bullets.children.entries.forEach(bullet => {
            bullet.x += bullet.velocityX * (delta / 1000);
            bullet.y += bullet.velocityY * (delta / 1000);
            bullet.life -= delta;
            
            if (bullet.life <= 0) {
                bullet.destroy();
            }
        });
    }

    createAsteroid() {
        const asteroid = this.add.graphics();
        
        // Position away from center
        let x, y;
        do {
            x = Phaser.Math.Between(50, 750);
            y = Phaser.Math.Between(50, 550);
        } while (Phaser.Math.Distance.Between(x, y, 400, 300) < 150);
        
        asteroid.x = x;
        asteroid.y = y;
        asteroid.velocityX = Phaser.Math.Between(-100, 100);
        asteroid.velocityY = Phaser.Math.Between(-100, 100);
        asteroid.size = 3;
        asteroid.rotation = 0;
        asteroid.rotationSpeed = Phaser.Math.Between(-2, 2);
        
        this.drawAsteroid(asteroid);
        this.asteroids.add(asteroid);
    }

    drawAsteroid(asteroid) {
        asteroid.clear();
        asteroid.lineStyle(2, 0xaaaaaa);
        
        const radius = asteroid.size * 10;
        const points = [];
        
        // Create irregular asteroid shape
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const variance = Phaser.Math.FloatBetween(0.8, 1.2);
            points.push({
                x: Math.cos(angle) * radius * variance,
                y: Math.sin(angle) * radius * variance
            });
        }

        asteroid.beginPath();
        asteroid.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            asteroid.lineTo(points[i].x, points[i].y);
        }
        asteroid.closePath();
        asteroid.strokePath();
    }

    updateAsteroids(delta) {
        this.asteroids.children.entries.forEach(asteroid => {
            asteroid.x += asteroid.velocityX * (delta / 1000);
            asteroid.y += asteroid.velocityY * (delta / 1000);
            asteroid.rotation += asteroid.rotationSpeed * (delta / 1000);
        });
    }

    checkCollisions() {
        // Bullet-asteroid collisions
        this.bullets.children.entries.forEach(bullet => {
            this.asteroids.children.entries.forEach(asteroid => {
                const distance = Phaser.Math.Distance.Between(bullet.x, bullet.y, asteroid.x, asteroid.y);
                if (distance < asteroid.size * 10) {
                    this.destroyAsteroid(asteroid);
                    bullet.destroy();
                    this.score += asteroid.size * 20;
                    this.scoreText.setText('Score: ' + this.score);
                }
            });
        });

        // Player-asteroid collisions
        this.asteroids.children.entries.forEach(asteroid => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, asteroid.x, asteroid.y);
            if (distance < asteroid.size * 10 + 10) {
                this.playerHit();
            }
        });
    }

    destroyAsteroid(asteroid) {
        const size = asteroid.size;
        const x = asteroid.x;
        const y = asteroid.y;
        
        asteroid.destroy();
        
        // Split into smaller asteroids
        if (size > 1) {
            for (let i = 0; i < 2; i++) {
                const newAsteroid = this.add.graphics();
                newAsteroid.x = x + Phaser.Math.Between(-30, 30);
                newAsteroid.y = y + Phaser.Math.Between(-30, 30);
                newAsteroid.velocityX = Phaser.Math.Between(-150, 150);
                newAsteroid.velocityY = Phaser.Math.Between(-150, 150);
                newAsteroid.size = size - 1;
                newAsteroid.rotation = 0;
                newAsteroid.rotationSpeed = Phaser.Math.Between(-3, 3);
                
                this.drawAsteroid(newAsteroid);
                this.asteroids.add(newAsteroid);
            }
        }

        // Check if all asteroids destroyed
        if (this.asteroids.children.entries.length === 0) {
            this.nextWave();
        }
    }

    playerHit() {
        this.player.lives--;
        this.livesText.setText('Lives: ' + this.player.lives);
        
        if (this.player.lives <= 0) {
            this.gameOver();
        } else {
            // Reset player
            this.player.x = 400;
            this.player.y = 300;
            this.player.velocityX = 0;
            this.player.velocityY = 0;
            this.player.angle = 0;
        }
    }

    nextWave() {
        // Create more asteroids
        for (let i = 0; i < 6; i++) {
            this.createAsteroid();
        }
        
        this.score += 100;
        this.scoreText.setText('Score: ' + this.score);
    }

    gameOver() {
        // Calculate game duration
        const gameEndTime = new Date();
        const gameDuration = Math.floor((gameEndTime - this.gameStartTime) / 1000); // in seconds
        
        // Save score
        this.saveScore(this.playerName, this.score, gameDuration);
        
        this.add.text(400, 250, 'GAME OVER', {
            fontSize: '48px',
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 320, `Final Score: ${this.score}`, {
            fontSize: '32px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 360, `Time: ${gameDuration}s`, {
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(400, 420, 'Press SPACE to play again', {
            fontSize: '24px',
            fill: '#aaa',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('PlayerNameScene');
        });
    }

    async saveScore(playerName, score, duration) {
        const scoreData = {
            name: playerName,
            score: score,
            time: duration
        };

        try {
            // Try to save to server first
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scoreData)
            });

            if (response.ok) {
                console.log('Score saved to server:', scoreData);
                return;
            }
        } catch (error) {
            console.log('Server not available, using localStorage:', error);
        }

        // Fallback to localStorage
        try {
            let scores = JSON.parse(localStorage.getItem('asteroidScores') || '[]');
            scores.push({
                ...scoreData,
                date: new Date().toISOString()
            });
            
            // Keep only top 10 scores
            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 10);
            
            localStorage.setItem('asteroidScores', JSON.stringify(scores));
            console.log('Score saved to localStorage:', scoreData);
        } catch (error) {
            console.log('Could not save score:', error);
        }
    }

    wrapObjects() {
        // Wrap player
        if (this.player.x < 0) this.player.x = 800;
        if (this.player.x > 800) this.player.x = 0;
        if (this.player.y < 0) this.player.y = 600;
        if (this.player.y > 600) this.player.y = 0;

        // Wrap asteroids
        this.asteroids.children.entries.forEach(asteroid => {
            if (asteroid.x < -50) asteroid.x = 850;
            if (asteroid.x > 850) asteroid.x = -50;
            if (asteroid.y < -50) asteroid.y = 650;
            if (asteroid.y > 650) asteroid.y = -50;
        });

        // Remove bullets that go off screen
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
                bullet.destroy();
            }
        });
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#000022',
    scene: [PlayerNameScene, HighScoresScene, PauseScene, AsteroidGame]
};

// Initialize the game
console.log('Initializing Phaser game...');
const game = new Phaser.Game(config);