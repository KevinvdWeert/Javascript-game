class AsteroidGame extends Phaser.Scene {
    constructor() {
        super({ key: 'AsteroidGame' });
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
        this.player.lives = 3;
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

        // UI
        this.score = 0;
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff'
        });
        this.livesText = this.add.text(16, 56, 'Lives: 3', {
            fontSize: '32px',
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
        this.add.text(400, 300, 'GAME OVER\n\nPress SPACE to restart', {
            fontSize: '48px',
            fill: '#ff0000',
            align: 'center'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
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
    scene: AsteroidGame
};

// Initialize the game
console.log('Initializing Phaser game...');
const game = new Phaser.Game(config);