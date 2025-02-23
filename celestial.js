// handles the sun/moon thingy in the corner
let CelestialSystem = function() {
    // grab stuff from the page
    let theSun = document.getElementById('celestialBody');
    let container = document.getElementById('celestialContainer');
    
    // keep track of clicks
    let clickCount = 0;
    let maxSize = 2;
    
    // make it global for debugging
    window.celestialDebug = {
        sun: theSun,
        box: container,
        count: () => clickCount
    };

    // what happens when you click it
    function handleClick() {
        clickCount++;
        console.log('☀️ sun clicked:', clickCount, 'times');
        
        // make it bigger but not too big
        let i = 0;
        let currentScale = 1;
        while (i < clickCount && currentScale < maxSize) {
            currentScale += 0.1;
            i++;
        }
        
        // bounce animation
        gsap.to(theSun, {
            scale: currentScale * 1.2,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                if (clickCount > 10) {
                    console.log('wow you really like clicking this huh');
                }
            }
        });
    }

    // make it glow different amounts
    function changeGlow(howMuch) {
        // quick flash for high intensity
        let time = howMuch > 25 ? 0.2 : 0.3;
        
        Array.from({length: 3}).forEach((_, i) => {
            setTimeout(() => {
                gsap.to(theSun, {
                    boxShadow: '0 0 ' + (howMuch + i) + 'px #FFE87C',
                    duration: time
                });
            }, i * 50);
        });
    }

    // handle different weather types
    function weatherChange(type) {
        // default visibility
        let howVisible = 1;
        
        switch(type.toLowerCase()) {
            case 'clouds':
                howVisible = 0.3;
                console.log('☁️ clouds making sun dim');
                break;
            case 'clear':
                console.log('☀️ nice clear sky!');
                break;
            default:
                howVisible = 0.1;
                console.log('🌫️ something blocking the sun');
        }
        
        // fade it
        gsap.to(theSun, {
            opacity: howVisible,
            duration: 1
        });
    }

    // set up click handler
    theSun.addEventListener('click', handleClick);
    
    // stuff other code can use
    return {
        updateGlow: changeGlow,
        updateForWeather: weatherChange,
        // debug stuff
        _debug: {
            getClickCount: () => clickCount,
            resetClicks: () => { clickCount = 0; }
        }
    };
}

// start it up
let celestialSystem = new CelestialSystem();

// maybe add these later
/*
function addSpecialEffects() {
    // solar flares?
    // night sparkles?
    // rainbow mode???
}

function makeItDance() {
    // todo: figure out how to make the sun dance
    // probably need better music first
}
*/ 