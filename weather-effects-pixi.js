class PixiWeatherEffects {
    constructor() {
        this.app = this._initPixiApp();
        this.textures = {};
        this.particles = [];
        this.isActive = false;
        this.loadTextures();
        
        // for debugging
        window.debugWeather = this;
    }

    _initPixiApp() {
        let app = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            transparent: true,
            backgroundAlpha: 0,
            resizeTo: window
        });

        app.view.id = 'weatherCanvas';
        
        // could make this cleaner but works for now
        app.view.style.position = 'fixed';
        app.view.style.top = '0';
        app.view.style.left = '0';
        app.view.style.pointerEvents = 'none';
        app.view.style.zIndex = '1';

        document.body.appendChild(app.view);
        return app;
    }

    async loadTextures() {
        const path = './texture%20packs/kenney_particle-pack/PNG%20(Transparent)';
        
        // leaving this here in case we need more textures
        /*const extraTextures = {
            thunder: 'spark_06.png',
            mist: 'smoke_04.png'
        };*/
        
        const files = {
            rain: 'trace_01.png',
            snow: 'star_09.png', // star works better than circle
            cloud: 'smoke_08.png',
            lightning: 'spark_05.png'
        };

        try {
            let texturePromises = [];
            // mixing different loop styles because why not
            Object.entries(files).forEach(([key, file]) => {
                texturePromises.push(
                    PIXI.Assets.load(`${path}/${file}`)
                        .then(tex => [key, tex])
                );
            });
            
            const loadedTextures = await Promise.all(texturePromises);
            this.textures = Object.fromEntries(loadedTextures);
            console.log('textures loaded:', Object.keys(this.textures));
        } catch (err) {
            console.warn("texture loading failed lol, using white boxes");
            // fallback to basic shapes
            this.textures = {
                rain: PIXI.Texture.WHITE,
                snow: PIXI.Texture.WHITE,
                cloud: PIXI.Texture.WHITE,
                lightning: PIXI.Texture.WHITE
            };
        }
    }

    startRain() {
        // console.log('making it rain');
        const rainConfig = {
            alpha: 0.5,
            scale: 0.2,
            speed: () => 15 + Math.random() * 10
        };
        
        this.startEffect(100, 'rain', rainConfig);
    }

    startSnow() {
        let particles = 50;  // magic number but works well
        
        this.startEffect(particles, 'snow', {
            alpha: 0.8,
            scale: 0.15,
            speed: () => 2 + Math.random() * 2,
            drift: () => Math.random() - 0.5
        });
    }

    startCloudy() {
        this.startEffect(5, 'cloud', {
            alpha: 0.6,
            scale: 1.5,
            speed: () => 0.5 + Math.random() * 0.5
        });
    }

    startEffect(count, type, props) {
        // cleanup first
        this.clearEffects();
        this.isActive = true;

        // create all the particles
        for (let i = 0; i < count; i++) {
            let particle = new PIXI.Sprite(this.textures[type]);
            
            // basic setup
            particle.alpha = props.alpha;
            particle.scale.set(props.scale);
            
            // reset position (could be a function but meh)
            if (type === 'rain' || type === 'snow') {
                particle.x = Math.random() * this.app.screen.width;
                particle.y = -20;
            } else if (type === 'cloud') {
                particle.x = -particle.width;
                particle.y = Math.random() * (this.app.screen.height / 3);
            }

            this.app.stage.addChild(particle);
            
            // store particle data
            let particleData = {
                sprite: particle,
                speed: props.speed(),
                type: type
            };
            
            // add drift for snow
            if (props.drift) {
                particleData.drift = props.drift();
            }
            
            this.particles.push(particleData);
        }

        requestAnimationFrame(() => this.animate());
    }

    // probably could optimize this
    animate() {
        if (!this.isActive) return;

        for (let p of this.particles) {
            p.sprite.y += p.speed;

            if (p.type === 'rain') {
                if (p.sprite.y > this.app.screen.height) {
                    p.sprite.x = Math.random() * this.app.screen.width;
                    p.sprite.y = -20;
                }
            } else if (p.type === 'snow') {
                p.sprite.x += p.drift;
                p.sprite.rotation += 0.01;
                if (p.sprite.y > this.app.screen.height) {
                    p.sprite.x = Math.random() * this.app.screen.width;
                    p.sprite.y = -20;
                }
            } else if (p.type === 'cloud') {
                p.sprite.x += p.speed;
                if (p.sprite.x > this.app.screen.width) {
                    p.sprite.x = -p.sprite.width;
                    p.sprite.y = Math.random() * (this.app.screen.height / 3);
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    clearEffects() {
        this.isActive = false;
        // could use forEach here but loop is fine
        for (let i = 0; i < this.particles.length; i++) {
            this.app.stage.removeChild(this.particles[i].sprite);
        }
        this.particles = [];
    }
}

// expose for debugging
let weatherEffects = new PixiWeatherEffects();
