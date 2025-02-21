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
            
            // Note: Using URL-encoded spaces in the path
            const basePath = './texture%20packs/kenney_particle-pack/PNG%20(Transparent)';
            console.log("Base path:", basePath);
            
            // Log each texture path before loading
            const texturePaths = {
                rain: `${basePath}/trace_01.png`,      // Updated to trace_01.png
                snow: `${basePath}/star_09.png`,       // Updated to star_09.png
                cloud: `${basePath}/smoke_08.png`,
                lightning: `${basePath}/spark_05.png`   // Added lightning texture
            };
            
            console.log("Attempting to load textures from:", texturePaths);
            
            this.textures = {
                rain: await PIXI.Assets.load(texturePaths.rain)
                    .catch(err => {
                        console.error(`Failed to load rain texture from ${texturePaths.rain}:`, err);
                        return PIXI.Texture.WHITE;
                    }),
                snow: await PIXI.Assets.load(texturePaths.snow)
                    .catch(err => {
                        console.error(`Failed to load snow texture from ${texturePaths.snow}:`, err);
                        return PIXI.Texture.WHITE;
                    }),
                cloud: await PIXI.Assets.load(texturePaths.cloud)
                    .catch(err => {
                        console.error(`Failed to load cloud texture from ${texturePaths.cloud}:`, err);
                        return PIXI.Texture.WHITE;
                    }),
                lightning: await PIXI.Assets.load(texturePaths.lightning)
                    .catch(err => {
                        console.error(`Failed to load lightning texture from ${texturePaths.lightning}:`, err);
                        return PIXI.Texture.WHITE;
                    })
            };
            
            // Log the loaded texture details
            console.log("Loaded textures:", {
                rain: {
                    valid: this.textures.rain.valid,
                    width: this.textures.rain.width,
                    height: this.textures.rain.height
                },
                snow: {
                    valid: this.textures.snow.valid,
                    width: this.textures.snow.width,
                    height: this.textures.snow.height
                },
                cloud: {
                    valid: this.textures.cloud.valid,
                    width: this.textures.cloud.width,
                    height: this.textures.cloud.height
                },
                lightning: {
                    valid: this.textures.lightning.valid,
                    width: this.textures.lightning.width,
                    height: this.textures.lightning.height
                }
            });
            
        } catch (error) {
            console.error("Error loading textures:", error);
            this.textures = {
                rain: PIXI.Texture.WHITE,
                snow: PIXI.Texture.WHITE,
                cloud: PIXI.Texture.WHITE,
                lightning: PIXI.Texture.WHITE
            };
        }
    }

    startRain() {
        this.clearEffects();
        this.active = true;
        for (let i = 0; i < 100; i++) {
            const rain = new PIXI.Sprite(this.textures.rain);
            rain.alpha = 0.5;
            rain.scale.set(0.2);
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
            snow.alpha = 0.8;
            snow.scale.set(0.15);
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
            cloud.alpha = 0.6;
            cloud.scale.set(1.5);
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