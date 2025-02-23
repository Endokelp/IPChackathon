// handles all the fancy weather effects and stuff
// probably should clean this up someday but it works ¯\_(ツ)_/¯
let PixiWeatherEffects = function() {
    // basic stuff we need
    let app = null;
    let particles = [];  // holds all the weather thingies
    let isActive = false;
    let textureStuff = {};
    
    // for when things break
    window.debugWeather = {
        getApp: () => app,
        countParticles: () => particles.length,
        textures: () => textureStuff
    };

    // makes the canvas where stuff happens
    function setupCanvas() {
        // make pixi do its thing
        let pixiApp = new PIXI.Application({
            width: window.innerWidth,  // just grab the whole window
            height: window.innerHeight,
            transparent: true,
            backgroundAlpha: 0,
            resizeTo: window  // makes it resize automatically
        });

        // make it look right
        let canvas = pixiApp.view;
        canvas.id = 'weatherCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0px';  // gotta have the px or it looks weird
        canvas.style.left = '0px';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';  // might need to change this later idk

        // stick it on the page
        document.body.appendChild(canvas);
        return pixiApp;
    }

    // loads all the particle pictures
    async function loadAllTextures() {
        console.log('🎨 loading textures...');
        
        let basePath = './assets/textures';
        let textureFiles = {
            rain: 'trace_01.png',    // this one looks like rain kinda
            snow: 'star_09.png',     // stars make good snowflakes
            cloud: 'smoke_08.png',   // smokey looking clouds
            lightning: 'spark_05.png' // maybe use this later?
        };

        try {
            // try loading everything at once
            let loadPromises = [];
            
            // loop through files
            let i = 0;
            for(let type in textureFiles) {
                let file = textureFiles[type];
                console.log(`trying texture ${++i}: ${file}`);
                
                loadPromises.push(
                    PIXI.Assets.load(basePath + '/' + file)
                        .then(texture => [type, texture])
                );
            }
            
            // wait for all the loading
            let results = await Promise.all(loadPromises);
            textureStuff = Object.fromEntries(results);
            
            console.log('✨ loaded textures:', Object.keys(textureStuff).join(', '));
            
        } catch (oops) {
            // uh oh, something broke
            console.error("😱 texture loading failed:", oops);
            
            // just use white boxes instead
            let types = ['rain', 'snow', 'cloud', 'lightning'];
            types.forEach(type => {
                textureStuff[type] = PIXI.Texture.WHITE;
            });
        }
    }

    // make it rain!
    function doRain() {
        console.log('☔ making it rain');
        
        // rain settings - might need to tweak these
        let settings = {
            alpha: 0.5,
            scale: 0.2,
            speed: () => 15 + (Math.random() * 10),
            count: 100
        };
        
        makeParticles('rain', settings);
    }

    // let it snow!
    function doSnow() {
        console.log('❄️ snow time');
        
        makeParticles('snow', {
            alpha: 0.8,
            scale: 0.15,
            speed: () => 2 + Math.random() * 2,
            drift: () => Math.random() - 0.5,  // makes it float side to side
            count: 50
        });
    }

    // make some clouds
    function doClouds() {
        console.log('☁️ cloudy weather');
        
        makeParticles('cloud', {
            alpha: 0.6,
            scale: 1.5,
            speed: () => 0.5 + Math.random() * 10,
            count: 5
        });
    }

    // does the actual particle creation
    function makeParticles(type, settings) {
        // make sure we have the texture
        if (!textureStuff[type]) {
            console.error('missing texture for ' + type + ' 😢');
            return;
        }
        
        // cleanup old stuff
        cleanup();
        isActive = true;

        // make all the particles
        let count = settings.count;
        while(count--) {  // counting down is faster (probably)
            let particle = new PIXI.Sprite(textureStuff[type]);
            
            // basic setup
            particle.alpha = settings.alpha;
            particle.scale.set(settings.scale);
            
            // position it based on type
            if (type === 'rain' || type === 'snow') {
                particle.x = Math.random() * app.screen.width;
                particle.y = -20;  // start above screen
            } else if (type === 'cloud') {
                particle.x = -particle.width;  // start off screen
                particle.y = Math.random() * (app.screen.height / 3);
            }

            app.stage.addChild(particle);
            
            // save extra info we need
            let info = {
                sprite: particle,
                speed: settings.speed(),
                type: type
            };
            
            // snow needs drift
            if (settings.drift) {
                info.drift = settings.drift();
            }
            
            particles.push(info);
        }

        // start moving everything
        requestAnimationFrame(updateParticles);
    }

    // moves all the particles
    function updateParticles() {
        if (!isActive) return;

        // update each particle
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.sprite.y += p.speed;  // everything falls down

            switch(p.type) {
                case 'rain':
                    // reset rain at bottom
                    if (p.sprite.y > app.screen.height) {
                        p.sprite.x = Math.random() * app.screen.width;
                        p.sprite.y = -20;
                    }
                    break;
                    
                case 'snow':
                    // make snow float and spin
                    p.sprite.x += p.drift;
                    p.sprite.rotation += 0.01;
                    
                    // reset at bottom
                    if (p.sprite.y > app.screen.height) {
                        p.sprite.x = Math.random() * app.screen.width;
                        p.sprite.y = -20;
                    }
                    break;
                    
                case 'cloud':
                    // clouds go right
                    p.sprite.x += p.speed;
                    
                    // reset at right edge
                    if (p.sprite.x > app.screen.width) {
                        p.sprite.x = -p.sprite.width;
                        p.sprite.y = Math.random() * (app.screen.height / 3);
                    }
                    break;
            }
        }

        requestAnimationFrame(updateParticles);
    }

    // cleanup
    function cleanup() {
        isActive = false;
        
        // remove everything
        let i = particles.length;
        while(i--) {
            app.stage.removeChild(particles[i].sprite);
        }
        particles = [];
    }

    // initialize everything
    app = setupCanvas();

    // what other code can use
    return {
        loadTextures: loadAllTextures,
        startRain: doRain,
        startSnow: doSnow,
        startCloudy: doClouds,
        clearEffects: cleanup
    };
};

// make it global
let weatherEffects = new PixiWeatherEffects();
window.weatherEffects = weatherEffects;  // for debugging

// maybe add these later?
/*
TODO: 
- Add thunder effects ⚡
- Make rain splash when it hits ground 💦
- Add wind that affects particles 🌪️
- Rainbow effect when it's sunny after rain? 🌈
*/