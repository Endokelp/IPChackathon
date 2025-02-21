class CelestialSystem {
    constructor() {
        this.element = document.getElementById('celestialBody');
        this.container = document.getElementById('celestialContainer');
        this.baseScale = 1;
        this.setupClickAnimation();
    }

    updateGlow(intensity) {
        gsap.to(this.element, {
            boxShadow: `0 0 ${intensity}px #FFE87C`,
            duration: intensity === 30 ? 0.2 : 0.3
        });
    }

    setupClickAnimation() {
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
        const opacity = condition.includes('clear') ? 1 :
                       condition.includes('clouds') ? 0.3 :
                       0.1;
        
        gsap.to(this.element, {
            opacity,
            duration: 1
        });
    }
}

const celestialSystem = new CelestialSystem(); 