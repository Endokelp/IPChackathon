class PixiWeatherEffects {
    constructor() {
        this.app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: true,
            backgroundAlpha: 0,
            resizeTo: window
        });
        document.body.appendChild(this.app.view);
        this.app.view.id = 'weatherCanvas';
        this.app.view.style.position = 'fixed';
        this.app.view.style.top = '0';
        this.app.view.style.left = '0';
        this.app.view.style.pointerEvents = 'none';
        this.app.view.style.zIndex = '1';
        
        this.loadTextures();
        this.particles = [];
        this.active = false;
    }

    async loadTextures() {
        try {
            console.log("Attempting to load textures...");
            
            const basePath = './texture-packs/kenney_particle-pack/PNG-Transparent';
            
            this.textures = {
                rain: await PIXI.Assets.load(`${basePath}/circle_05.png`)
                    .catch(err => {
                        console.error("Failed to load rain texture:", err);
                        return PIXI.Texture.WHITE;
                    }),
                snow: await PIXI.Assets.load(`${basePath}/star_07.png`)
                    .catch(err => {
                        console.error("Failed to load snow texture:", err);
                        return PIXI.Texture.WHITE;
                    }),
                cloud: await PIXI.Assets.load(`${basePath}/smoke_08.png`)
                    .catch(err => {
                        console.error("Failed to load cloud texture:", err);
                        return PIXI.Texture.WHITE;
                    })
            };
            
            console.log("Textures loaded successfully:", this.textures);
        } catch (error) {
            console.error("Error loading textures:", error);
            this.textures = {
                rain: PIXI.Texture.WHITE,
                snow: PIXI.Texture.WHITE,
                cloud: PIXI.Texture.WHITE
            };
        }
    }

    startRain() {
        this.clearEffects();
        this.active = true;
        for (let i = 0; i < 100; i++) {
            const rain = new PIXI.Sprite(this.textures.rain);
            rain.alpha = 0.3;
            rain.scale.set(0.3, 1);
            this.resetRainDrop(rain);
            this.app.stage.addChild(rain);
            this.particles.push({
                sprite: rain,
                speed: 15 + Math.random() * 10,
                type: 'rain'
            });
        }
        this.animate();
    }

    startSnow() {
        this.clearEffects();
        this.active = true;
        for (let i = 0; i < 50; i++) {
            const snow = new PIXI.Sprite(this.textures.snow);
            snow.alpha = 0.7;
            snow.scale.set(0.2);
            this.resetSnowflake(snow);
            this.app.stage.addChild(snow);
            this.particles.push({
                sprite: snow,
                speed: 2 + Math.random() * 2,
                drift: Math.random() - 0.5,
                type: 'snow'
            });
        }
        this.animate();
    }

    startCloudy() {
        this.clearEffects();
        this.active = true;
        for (let i = 0; i < 5; i++) {
            const cloud = new PIXI.Sprite(this.textures.cloud);
            cloud.alpha = 0.3;
            cloud.scale.set(2);
            this.resetCloud(cloud);
            this.app.stage.addChild(cloud);
            this.particles.push({
                sprite: cloud,
                speed: 0.5 + Math.random() * 0.5,
                type: 'cloud'
            });
        }
        this.animate();
    }

    resetRainDrop(sprite) {
        sprite.x = Math.random() * this.app.screen.width;
        sprite.y = -20;
    }

    resetSnowflake(sprite) {
        sprite.x = Math.random() * this.app.screen.width;
        sprite.y = -20;
    }

    resetCloud(sprite) {
        sprite.x = -sprite.width;
        sprite.y = Math.random() * (this.app.screen.height / 3);
    }

    clearEffects() {
        this.active = false;
        this.particles.forEach(p => this.app.stage.removeChild(p.sprite));
        this.particles = [];
    }

    animate() {
        if (!this.active) return;

        this.particles.forEach(p => {
            if (p.type === 'rain') {
                p.sprite.y += p.speed;
                if (p.sprite.y > this.app.screen.height) {
                    this.resetRainDrop(p.sprite);
                }
            } else if (p.type === 'snow') {
                p.sprite.y += p.speed;
                p.sprite.x += p.drift;
                p.sprite.rotation += 0.01;
                if (p.sprite.y > this.app.screen.height) {
                    this.resetSnowflake(p.sprite);
                }
            } else if (p.type === 'cloud') {
                p.sprite.x += p.speed;
                if (p.sprite.x > this.app.screen.width) {
                    this.resetCloud(p.sprite);
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

const weatherEffects = new PixiWeatherEffects(); 