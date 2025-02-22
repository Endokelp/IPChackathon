// sun/moon thing
class CelestialSystem {
    constructor() {
        this.sun = document.getElementById('celestialBody')
        this.box = document.getElementById('celestialContainer')
        this.scale = 1
        this._makeItClickable()
        window.celestial = this  // global access 
    }

    // make it glow more/less
    updateGlow(intensity) {
        gsap.to(this.sun, {
            boxShadow: '0 0 ' + intensity + 'px #FFE87C',
            duration: intensity === 30 ? 0.2 : 0.3
        })
    }

    // click to make bigger, if it works it works
    _makeItClickable() {
        this.sun.onclick = () => {
            this.scale = Math.min(this.scale + 0.1, 2)
            gsap.to(this.sun, {
                scale: this.scale * 1.2,
                duration: 0.15,
                yoyo: true,
                repeat: 1
            })
        }
    }

    // weather affects visibility
    updateForWeather(weather) {
        let opacity = 1;  // default to fully visible
        
        // figure out how visible it should be
        if(weather.includes('clouds')) {
            opacity = 0.3;
        } else if(!weather.includes('clear')) {
            opacity = 0.1;
        }
        
        gsap.to(this.sun, {
            opacity: opacity,
            duration: 1
        })
    }
}

let celestialSystem = new CelestialSystem(); 

/*function addSpecialEffects() {
    // solar flares
    // night sparkles
    // etc
}*/ 