class CelestialSystem {
    constructor() {
        this.element = document.getElementById('celestialBody');
        this.container = document.getElementById('celestialContainer');
        this.setupDraggable();
        this.setupClickAnimation();
        this.baseScale = 1;
    }

    setupDraggable() {
        Draggable.create(this.element, {
            type: "rotation",
            inertia: true,
            onDrag: function() {
                gsap.to(this.target, {
                    boxShadow: "0 0 30px #FFE87C",
                    duration: 0.2
                });
            },
            onDragEnd: function() {
                gsap.to(this.target, {
                    boxShadow: "0 0 20px #FFE87C",
                    duration: 0.3
                });
            }
        });
    }

    setupClickAnimation() {
        this.element.addEventListener('click', () => {
            this.baseScale = Math.min(this.baseScale + 0.1, 2);
            gsap.to(this.element, {
                scale: this.baseScale * 1.2,
                duration: 0.15,
                onComplete: () => {
                    gsap.to(this.element, {
                        scale: this.baseScale,
                        duration: 0.15
                    });
                }
            });
        });
    }

    updateForWeather(condition) {
        const isDay = new Date().getHours() > 6 && new Date().getHours() < 18;
        const isDarkTheme = document.body.classList.contains('dark-theme');
        
        if (condition.includes('clouds')) {
            gsap.to(this.element, {
                opacity: 0.3,
                duration: 1
            });
        } else if (condition.includes('clear')) {
            gsap.to(this.element, {
                opacity: 1,
                duration: 1
            });
        } else if (condition.includes('rain') || condition.includes('snow')) {
            gsap.to(this.element, {
                opacity: 0.1,
                duration: 1
            });
        }
    }
}

const celestialSystem = new CelestialSystem(); 