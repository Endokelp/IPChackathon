// handles all the fancy rain/snow stuff
// probably should split this into separate files but whatever
class PixiWeatherEffects {
    constructor() {
        this.app = this._setupPixiApp();
        this.drops = [];  // old name but keeping it
        this.active = false;
        this.textures = {};
        this.particles = [];
        
        // for when stuff breaks
        window.debugWeather = this;
    }

    // sets up the pixi canvas thing
    _setupPixiApp() {
        let app = new PIXI.Application({
            width: innerWidth,
            height: innerHeight,
            transparent: true,
            backgroundAlpha: 0,
            resizeTo: window
        });

        app.view.id = 'weatherCanvas';
        
        // make it look right - might need to adjust these later
        app.view.style.position = 'fixed';
        app.view.style.top = '0';
        app.view.style.left = '0';
        app.view.style.pointerEvents = 'none';
        app.view.style.zIndex = '1';

        document.body.appendChild(app.view);
        return app;
    }

    // loads all the particle images
    // TODO: maybe add more effects later?
    async loadTextures() {
        // Simple, web-friendly path
        const path = './assets/textures';
        
        // which image to use for what
        const files = {
            rain: 'trace_01.png',
            snow: 'star_09.png',
            cloud: 'smoke_08.png',
            lightning: 'spark_05.png'
        };

        try {
            let texturePromises = [];
            
            for(let [key, file] of Object.entries(files)) {
                console.log('Loading texture:', `${path}/${file}`); // Debug log
                texturePromises.push(
                    PIXI.Assets.load(`${path}/${file}`)
                        .then(tex => [key, tex])
                );
            }
            
            let loaded = await Promise.all(texturePromises);
            this.textures = Object.fromEntries(loaded);
            console.log('Successfully loaded textures:', Object.keys(this.textures));
        } catch (err) {
            console.error("Texture loading failed:", err); // More detailed error
            this.textures = {
                rain: PIXI.Texture.WHITE,
                snow: PIXI.Texture.WHITE,
                cloud: PIXI.Texture.WHITE,
                lightning: PIXI.Texture.WHITE
            };
        }
    }

    // make it rain!
    startRain() {
        console.log('☔ starting rain');
        let rainSettings = {
            alpha: 0.5,  // how visible
            scale: 0.2,  // how big
            speed: () => 15 + (Math.random() * 10)  // how fast
        };
        
        this.startEffect(100, 'rain', rainSettings);  // 100 drops seems good
    }

    // let it snow ❄️
    startSnow() {
        let snowCount = 50;  // looks nice with 50
        
        this.startEffect(snowCount, 'snow', {
            alpha: 0.8,
            scale: 0.15,
            speed: () => 2 + Math.random() * 2,
            drift: () => Math.random() - 0.5  // makes it float side to side
        });
    }

    // cloudy with a chance of meatballs
    startCloudy() {
        this.startEffect(5, 'cloud', {
            alpha: 0.6,
            scale: 1.5,
            speed: () => 0.5 + Math.random() * 10
        });
    }

    // does the actual work of creating particles
    startEffect(howMany, whatType, settings) {
        if (!this.textures[whatType]) {
            console.error('oops, missing texture for ' + whatType);
            return;
        }
        
        // clean up old stuff first
        this.clearEffects();
        this.active = true;

        // make all the particles
        for (let i = 0; i < howMany; i++) {
            let particle = new PIXI.Sprite(this.textures[whatType]);
            
            // basic setup
            particle.alpha = settings.alpha;
            particle.scale.set(settings.scale);
            
            // put it somewhere
            if (whatType === 'rain' || whatType === 'snow') {
                // start above screen
                particle.x = Math.random() * this.app.screen.width;
                particle.y = -20;
            } else if (whatType === 'cloud') {
                // start at left side
                particle.x = -particle.width;
                particle.y = Math.random() * (this.app.screen.height / 3);
            }

            this.app.stage.addChild(particle);
            
            // keep track of this particle
            let particleInfo = {
                sprite: particle,
                speed: settings.speed(),
                type: whatType
            };
            
            // snow needs extra drift
            if (settings.drift) {
                particleInfo.drift = settings.drift();
            }
            
            this.particles.push(particleInfo);
        }

        // start the animation loop
        requestAnimationFrame(() => this.animate());
    }

    // moves everything around
    // this could probably be optimized but eh
    animate() {
        if (!this.active) return;

        for (let p of this.particles) {
            // everything falls down
            p.sprite.y += p.speed;

            if (p.type === 'rain') {
                // reset rain when it hits bottom
                if (p.sprite.y > this.app.screen.height) {
                    p.sprite.x = Math.random() * this.app.screen.width;
                    p.sprite.y = -20;
                }
            } 
            else if (p.type === 'snow') {
                // snow drifts and spins
                p.sprite.x += p.drift;
                p.sprite.rotation += 0.01;
                if (p.sprite.y > this.app.screen.height) {
                    p.sprite.x = Math.random() * this.app.screen.width;
                    p.sprite.y = -20;
                }
            } 
            else if (p.type === 'cloud') {
                // clouds move right
                p.sprite.x += p.speed;
                if (p.sprite.x > this.app.screen.width) {
                    p.sprite.x = -p.sprite.width;
                    p.sprite.y = Math.random() * (this.app.screen.height / 3);
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    // clean everything up
    clearEffects() {
        this.active = false;
        
        // remove all particles
        for (let p of this.particles) {
            this.app.stage.removeChild(p.sprite);
        }
        this.particles = [];
    }
}

// make it available everywhere
let weatherEffects = new PixiWeatherEffects();
window.weatherEffects = weatherEffects;  // for debugging