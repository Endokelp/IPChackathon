document.addEventListener('DOMContentLoaded', async () => {
    try {
        // gotta load these first or it breaks
        await weatherEffects.loadTextures();
        console.log('textures loaded, doing the rest...');
        
        doThemeStuff();
        makeSearchWork();
    } catch(err) {
        console.log('uh oh:', err);
    }
});

/**
 * Handles the dark/light mode toggle.
 */
function doThemeStuff() {
    let checkbox = document.getElementById('themeToggle');
    let savedStuff = localStorage.getItem('theme');
    
    // set initial theme
    document.body.className = savedStuff || 'light-theme';
    checkbox.checked = savedStuff === 'dark-theme';

    // toggle when clicked
    checkbox.addEventListener('change', function() {
        let theme = this.checked ? 'dark-theme' : 'light-theme';
        document.body.className = theme;
        localStorage.setItem('theme', theme);
    });
}

/**
 * Makes the search box work.
 */
function makeSearchWork() {
    let searchBox = document.getElementById('cityInput');
    
    // search when enter is pressed
    searchBox.onkeypress = (e) => {
        if(e.key === 'Enter') {
            fetchWeather();  // get the weather
        }
    };
}

/**
 * Gets weather data from the API.
 */
async function fetchWeather() {
    let box = document.getElementById('cityInput');
    let city = box.value.trim();
    
    // don't do anything if empty
    if(!city) {
        console.log('no city entered');
        return;
    }

    let resultBox = document.getElementById('weatherResult');
    resultBox.classList.remove('visible');

    // api key - should probably hide this somewhere else
    const API_KEY = 'b61ba318b9af8364bfe43d521bfa5c8f'; 

    try {
        console.log('looking up weather for ' + city + '...');
        
        // get data from api
        let data = await fetch(
            'https://api.openweathermap.org/data/2.5/forecast?q=' + 
            city + '&units=imperial&appid=' + API_KEY
        );
        
        // check if city exists
        if(!data.ok) {
            resultBox.innerHTML = "<p class='error'>Can't find that city! Try another one? 🤔</p>";
            setTimeout(() => resultBox.classList.add('visible'), 100);
            return;
        }

        let weather = await data.json();
        
        // do all the things
        try {
            await getCityImage(city);
        } catch(e) {
            console.log('image failed but whatever');
        }
        
        updateWeatherEffects(weather.list[0].weather[0].main.toLowerCase());
        showCurrentWeather(weather.list[0], weather);

        // show it with a nice fade
        setTimeout(() => resultBox.classList.add('visible'), 100);
        
    } catch(err) {
        console.log('something broke:', err);
        resultBox.innerHTML = "<p class='error'>Oops! Something went wrong 😅</p>";
        setTimeout(() => resultBox.classList.add('visible'), 100);
    }
}

/**
 * Sets up the visual effects based on weather.
 */
function updateWeatherEffects(weather) {
    // clear old stuff first
    weatherEffects.clearEffects();
    
    // check what weather it is
    if(weather.includes('rain') || weather.includes('drizzle')) {
        weatherEffects.startRain();
        celestialSystem.updateForWeather('clouds');
    } else if(weather.includes('snow')) {
        weatherEffects.startSnow();
        celestialSystem.updateForWeather('clouds');
    } else if(weather.includes('clear')) {
        weatherEffects.clearEffects();
        celestialSystem.updateForWeather('clear');
    } else if(weather.includes('clouds')) {
        weatherEffects.startCloudy();
        celestialSystem.updateForWeather('clouds');
    } else {
        // no idea what weather this is
        console.log('unknown weather:', weather);
        weatherEffects.clearEffects();
        celestialSystem.updateForWeather('clear');
    }
}

/**
 * Updates the UI with weather info.
 */
function showCurrentWeather(current, data) {
    // convert temperatures
    let f = Math.round(current.main.temp);
    let c = Math.round((f - 32) * 5/9);
    
    // convert to miles and inches
    let vis = (current.visibility / 1609).toFixed(1);
    let press = (current.pressure * 0.02953).toFixed(2);

    let box = document.getElementById('weatherResult');
    
    // build the html - messy but works
    let str = '<div class="weather-info-column">';
    str += '<h2>' + data.city.name + ', ' + data.city.country + '</h2>';
    str += '<div class="weather-main">';
    str += '<img src="https://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png"';
    str += ' alt="' + current.weather[0].description + '" class="weather-icon">';
    str += '<h3>' + current.weather[0].description + '</h3>';
    str += '<div class="temperature-display" onclick="toggleTemp(this)"';
    str += ' data-temp-f="' + f + '"';
    str += ' data-temp-c="' + c + '"';
    str += ' data-showing="F">';
    str += f + '°F</div></div>';
    
    // add details
    str += '<div class="weather-details">';
    str += '<div class="detail"><i class="fas fa-tint"></i> Humidity: ' + current.main.humidity + '%</div>';
    str += '<div class="detail"><i class="fas fa-wind"></i> Wind: ' + Math.round(current.wind.speed) + ' mph</div>';
    str += '<div class="detail"><i class="fas fa-eye"></i> Visibility: ' + vis + ' mile' + (vis === "1.0" ? "" : "s") + '</div>';
    str += '<div class="detail"><i class="fas fa-compress-alt"></i> Pressure: ' + press + ' inHg</div>';
    str += '<div class="detail"><i class="fas fa-thermometer-half"></i> Feels like: ' + Math.round(current.main.feels_like) + '°F</div>';
    str += '</div>';
    
    // add clothing button
    str += '<button onclick="showClothingTips(\'' + current.weather[0].main.toLowerCase() + '\')" class="suggestion-btn">';
    str += '<i class="fas fa-tshirt"></i> What to Wear?</button>';
    str += '</div>';
    
    // add image section
    str += '<div class="city-image-column">';
    str += '<img class="city-image" src="" alt="' + data.city.name + '" id="cityImage">';
    str += '</div>';

    box.innerHTML = str;
}

/**
 * Switches between F and C when clicked.
 */
function toggleTemp(el) {
    let f = el.dataset.tempF;
    let c = el.dataset.tempC;
    let current = el.dataset.showing;

    if(current === 'F') {
        el.textContent = c + '°C';
        el.dataset.showing = 'C';
    } else {
        el.textContent = f + '°F';
        el.dataset.showing = 'F';
    }

    // fun animation
    gsap.to(el, { 
        scale: 1.2, 
        duration: 0.15, 
        yoyo: true, 
        repeat: 1 
    });
}

/**
 * Shows what to wear based on weather.
 */
function showClothingTips(weather) {
    let temp = parseInt(document.querySelector('.temperature-display').dataset.tempF);
    
    // figure out how hot/cold it is
    let howHotIsIt = 
        temp >= 85 ? 'hot' :
        temp >= 65 ? 'warm' :
        temp >= 45 ? 'mild' :
        temp >= 32 ? 'cold' :
        'freezing';

    // what to wear in different conditions
    const clothingGuide = {
        rain: {
            hot: "Light raincoat and shorts",
            warm: "Waterproof jacket and comfortable clothes",
            mild: "Warm raincoat, waterproof boots",
            cold: "Heavy raincoat, insulated waterproof boots",
            freezing: "just stay inside, it's too cold for this"
        },
        snow: {
            hot: "This... shouldn't be possible?",
            warm: "This weather makes no sense",
            mild: "Heavy winter coat, gloves, and waterproof boots",
            cold: "Full winter gear ",
            freezing: "Extreme cold weather gear needed! or just stay inside"
        },
        clear: {
            hot: "Light, breathable clothes.",
            warm: "perfect for a t-shirt and shorts",
            mild: "Light jacket or sweater with long pants",
            cold: "Winter coat, gloves, and warm layers",
            freezing: "Heavy winter protection! or just stay inside"
        },
        clouds: {
            hot: "Light, comfortable clothes",
            warm: "Normal clothes, maybe a light jacket",
            mild: "Warm jacket",
            cold: "Winter coat",
            freezing: "Full winter gear or stay inside"
        }
    };

    // handle variations of cloudy
    if(weather.includes('cloud') || weather === 'overcast') {
        weather = 'clouds';
    }

    // get clothing suggestion or fallback to generic advice
    let suggestion = clothingGuide[weather]?.[howHotIsIt] || 
        'For ' + temp + '°F, you need ' + 
        (howHotIsIt === 'freezing' ? 'serious winter gear' : 'appropriate') + 
        ' clothing for ' + howHotIsIt + ' weather';

    // create and show the popup
    let popup = document.createElement('div');
    popup.className = 'suggestion-popup';
    popup.innerHTML = 
        '<h3>What to Wear</h3>' +
        '<p>' + suggestion + '</p>' +
        '<button onclick="this.parentElement.remove()">Got it!</button>';
    
    document.body.appendChild(popup);
}

/**
 * Gets a nice picture of the city.
 */
async function getCityImage(cityName) {
    try {
        // unsplash api - free but rate limited
        let response = await fetch(
            'https://api.unsplash.com/search/photos?query=' + cityName + 
            ' city&client_id=ni4PP6vH3b_G5gYssLTqZpzKyS7UFt5BQXMJ9pmrpZk'
        );
        let picData = await response.json();

        if(picData.results && picData.results.length > 0) {
            // small delay looks nicer
            setTimeout(() => {
                let img = document.getElementById('cityImage');
                if(img) {
                    img.style.display = 'block';
                    img.src = picData.results[0].urls.regular;
                }
            }, 100);
        }
    } catch(err) {
        console.warn("couldn't get city image, oh well");
    }
}