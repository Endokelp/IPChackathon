class PixiWeatherEffects {
    constructor() {
        this.app = this.createPixiApp();
        this.textures = {};
        this.particles = [];
        this.isActive = false;
        this.loadTextures();
    }

    // Initializes the PIXI application and appends it to the DOM
    createPixiApp() {
        const app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: true,
            backgroundAlpha: 0,
            resizeTo: window
        });

        app.view.id = 'weatherCanvas';
        Object.assign(app.view.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            pointerEvents: 'none',
            zIndex: '1'
        });

        document.body.appendChild(app.view);
        return app;
    }

    // Loads textures asynchronously and falls back to white textures if an error occurs
    async loadTextures() {
        const basePath = './texture%20packs/kenney_particle-pack/PNG%20(Transparent)';
        const textureFiles = {
            rain: 'trace_01.png',
            snow: 'star_09.png',
            cloud: 'smoke_08.png',
            lightning: 'spark_05.png'
        };

        try {
            this.textures = await this.loadAllTextures(basePath, textureFiles);
        } catch (error) {
            console.warn("Texture loading failed, using default white textures.");
            this.textures = {
                rain: PIXI.Texture.WHITE,
                snow: PIXI.Texture.WHITE,
                cloud: PIXI.Texture.WHITE,
                lightning: PIXI.Texture.WHITE
            };
        }
    }

    // Helper function to load multiple textures at once
    async loadAllTextures(basePath, files) {
        const textureEntries = await Promise.all(
            Object.entries(files).map(async ([key, file]) => {
                return [key, await PIXI.Assets.load(`${basePath}/${file}`)];
            })
        );

        return Object.fromEntries(textureEntries);
    }

    // Starts the rain effect
    startRain() {
        this.startEffect(100, 'rain', {
            alpha: 0.5,
            scale: 0.2,
            speed: () => 15 + Math.random() * 10
        });
    }

    // Starts the snow effect
    startSnow() {
        this.startEffect(50, 'snow', {
            alpha: 0.8,
            scale: 0.15,
            speed: () => 2 + Math.random() * 2,
            drift: () => Math.random() - 0.5
        });
    }

    // Starts the cloudy effect
    startCloudy() {
        this.startEffect(5, 'cloud', {
            alpha: 0.6,
            scale: 1.5,
            speed: () => 0.5 + Math.random() * 0.5
        });
    }

    // Generic function to start a weather effect
    startEffect(count, type, properties) {
        this.clearEffects();
        this.isActive = true;

        for (let i = 0; i < count; i++) {
            const sprite = new PIXI.Sprite(this.textures[type]);
            sprite.alpha = properties.alpha;
            sprite.scale.set(properties.scale);

            this.resetSpritePosition(sprite, type);

            this.app.stage.addChild(sprite);
            this.particles.push({
                sprite,
                speed: properties.speed(),
                drift: properties.drift ? properties.drift() : 0,
                type
            });
        }

        this.animate();
    }

    // Resets the position of a sprite based on its type
    resetSpritePosition(sprite, type) {
        switch (type) {
            case 'rain':
                sprite.x = Math.random() * this.app.screen.width;
                sprite.y = -20;
                break;
            case 'snow':
                sprite.x = Math.random() * this.app.screen.width;
                sprite.y = -20;
                break;
            case 'cloud':
                sprite.x = -sprite.width;
                sprite.y = Math.random() * (this.app.screen.height / 3);
                break;
        }
    }

    // Clears all particles from the stage
    clearEffects() {
        this.isActive = false;
        this.particles.forEach(p => this.app.stage.removeChild(p.sprite));
        this.particles = [];
    }

    // Animates all active weather particles
    animate() {
        if (!this.isActive) return;

        this.particles.forEach(p => {
            p.sprite.y += p.speed;

            if (p.type === 'rain' && p.sprite.y > this.app.screen.height) {
                this.resetSpritePosition(p.sprite, 'rain');
            } else if (p.type === 'snow') {
                p.sprite.x += p.drift;
                p.sprite.rotation += 0.01;
                if (p.sprite.y > this.app.screen.height) {
                    this.resetSpritePosition(p.sprite, 'snow');
                }
            } else if (p.type === 'cloud') {
                p.sprite.x += p.speed;
                if (p.sprite.x > this.app.screen.width) {
                    this.resetSpritePosition(p.sprite, 'cloud');
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// Instantiate the weather effects system
const weatherEffects = new PixiWeatherEffects();
