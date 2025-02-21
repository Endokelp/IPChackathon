class CelestialSystem {
    constructor() {
        this.element = document.getElementById('celestialBody');
        this.container = document.getElementById('celestialContainer');
        this.baseScale = 1;
        this._setupClickStuff();
        window.celestial = this;
    }

    updateGlow(intensity) {
        gsap.to(this.element, {
            boxShadow: `0 0 ${intensity}px #FFE87C`,
            duration: intensity === 30 ? 0.2 : 0.3
        });
    }

    _setupClickStuff() {
        this.element.addEventListener('click', () => {
            this.baseScale = Math.min(this.baseScale + 0.1, 2);
            gsap.to(this.element, {
                scale: this.baseScale * 1.2,
                duration: 0.15,
                yoyo: true,
                repeat: 1
            });
        });
    }

    updateForWeather(condition) {
        let opacity;
        
        if (condition.includes('clear')) {
            opacity = 1;
        } else if (condition.includes('clouds')) {
            opacity = 0.3;
        } else {
            opacity = 0.1;
        }
        
        gsap.to(this.element, {
            opacity: opacity,
            duration: 1
        });
    }
}

let celestialSystem = new CelestialSystem(); 

/*function addSpecialEffects() {
    // solar flares
    // night sparkles
    // etc
}*/ 