// sun/moon thing
class CelestialSystem {
    constructor() {
        this.sun = document.getElementById('celestialBody')
        this.box = document.getElementById('celestialContainer')
        this.scale = 1
        this._makeClickable()
        window.celestial = this  // global access 
    }

    // make it glow more/less
    updateGlow(i) {
        gsap.to(this.sun, {
            boxShadow: `0 0 ${i}px #FFE87C`,
            duration: i === 30 ? .2 : .3
        })
    }

    // click to make bigger, if it works it works
    _makeClickable() {
        this.sun.onclick = () => {
            this.scale = Math.min(this.scale + .1, 2)
            gsap.to(this.sun, {
                scale: this.scale * 1.2,
                duration: .15,
                yoyo: true,
                repeat: 1
            })
        }
    }

    // weather affects visibility
    updateForWeather(w) {
        gsap.to(this.sun, {
            opacity: w.includes('clear') ? 1 : 
                    w.includes('clouds') ? .3 : 
                    .1,
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