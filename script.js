document.addEventListener('DOMContentLoaded', async () => {
    // gotta load the textures first or everything breaks
    await weatherEffects.loadTextures();
    
    // now we can do the rest
    setupThemeStuff();
    setupCitySearch();
});

/**
 * Handles the dark/light mode toggle.
 */
function setupThemeStuff() {
    let toggle = document.getElementById('themeToggle');
    
    // get saved theme or default to light
    let savedTheme = localStorage.getItem('theme');
    let theme = savedTheme || 'light-theme';

    document.body.className = theme;
    toggle.checked = theme === 'dark-theme';

    // switch themes when clicked
    toggle.addEventListener('change', () => {
        let newTheme = toggle.checked ? 'dark-theme' : 'light-theme';
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
    });
}

/**
 * Makes the search box work.
 */
function setupCitySearch() {
    let input = document.getElementById('cityInput');
    input.addEventListener('keypress', e => {
        if(e.key === 'Enter') {
            getWeatherStuff();  // could've named this better lol
        }
    });
}

/**
 * Gets weather data from the API.
 */
async function getWeatherStuff() {
    let cityInput = document.getElementById('cityInput');
    let city = cityInput.value.trim();
    if(!city) return;  // don't bother if empty

    let result = document.getElementById('weatherResult');
    result.classList.remove('visible');

    // TODO: move this to env file someday
    const apiKey = 'b61ba318b9af8364bfe43d521bfa5c8f'; 

    try {
        console.log('🔍 looking up weather for:', city);
        
        // get the weather data
        let response = await fetch(
            'https://api.openweathermap.org/data/2.5/forecast?q=' + 
            city + '&units=imperial&appid=' + apiKey
        );
        
        if(!response.ok) {
            result.innerHTML = "<p class='error'>Oops! Can't find that city... typo maybe? 🤔</p>";
            setTimeout(() => result.classList.add('visible'), 100);
            return;
        }

        let weatherData = await response.json();
        
        // do all the things we need to do
        await getAndSetCityPic(city);
        makeWeatherEffects(weatherData.list[0].weather[0].main.toLowerCase());
        showWeatherInfo(weatherData.list[0], weatherData);

        // fade it in nicely
        setTimeout(() => result.classList.add('visible'), 100);
    } catch(err) {
        console.error('ugh, something broke:', err);
        result.innerHTML = "<p class='error'>Something went wrong! Maybe try again? 😅</p>";
        setTimeout(() => result.classList.add('visible'), 100);
    }
}

/**
 * Sets up the visual effects based on weather.
 */
function makeWeatherEffects(weather) {
    weatherEffects.clearEffects();  // clear old effects first
    
    // could use switch but if/else is fine
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
        // no idea what this weather is, just clear everything
        weatherEffects.clearEffects();
        celestialSystem.updateForWeather('clear');
    }
}

/**
 * Updates the UI with weather info.
 */
function showWeatherInfo(current, data) {
    // convert temps
    let fahrenheit = Math.round(current.main.temp);
    let celsius = Math.round((fahrenheit - 32) * 5/9);
    
    // convert to freedom units
    let visibility = (current.visibility / 1609).toFixed(1);
    let pressure = (current.pressure * 0.02953).toFixed(2);

    let result = document.getElementById('weatherResult');
    
    // build the HTML - this is messy but works
    let html = '<div class="weather-info-column">';
    html += '<h2>' + data.city.name + ', ' + data.city.country + '</h2>';
    html += '<div class="weather-main">';
    html += '<img src="https://openweathermap.org/img/wn/' + current.weather[0].icon + '@2x.png"';
    html += ' alt="' + current.weather[0].description + '" class="weather-icon">';
    html += '<h3>' + current.weather[0].description + '</h3>';
    html += '<div class="temperature-display" onclick="toggleTemperatureUnit(this)"';
    html += ' data-temp-f="' + fahrenheit + '"';
    html += ' data-temp-c="' + celsius + '"';
    html += ' data-showing="F">';
    html += fahrenheit + '°F</div></div>';
    
    // add all the details
    html += '<div class="weather-details">';
    html += '<div class="detail"><i class="fas fa-tint"></i> Humidity: ' + current.main.humidity + '%</div>';
    html += '<div class="detail"><i class="fas fa-wind"></i> Wind: ' + Math.round(current.wind.speed) + ' mph</div>';
    html += '<div class="detail"><i class="fas fa-eye"></i> Visibility: ' + visibility + ' mile' + (visibility === "1.0" ? "" : "s") + '</div>';
    html += '<div class="detail"><i class="fas fa-compress-alt"></i> Pressure: ' + pressure + ' inHg</div>';
    html += '<div class="detail"><i class="fas fa-thermometer-half"></i> Feels like: ' + Math.round(current.main.feels_like) + '°F</div>';
    html += '</div>';
    
    // add the clothing button
    html += '<button onclick="showClothingTips(\'' + current.weather[0].main.toLowerCase() + '\')" class="suggestion-btn">';
    html += '<i class="fas fa-tshirt"></i> Clothing Recommendations</button>';
    html += '</div>';
    
    // add the city image section
    html += '<div class="city-image-column">';
    html += '<img class="city-image" src="" alt="' + data.city.name + '" id="cityImage">';
    html += '</div>';

    result.innerHTML = html;
}

/**
 * Switches between F and C when clicked.
 */
function toggleTemperatureUnit(element) {
    let tempF = element.dataset.tempF;
    let tempC = element.dataset.tempC;
    let currentUnit = element.dataset.showing;

    if(currentUnit === 'F') {
        element.textContent = tempC + '°C';
        element.dataset.showing = 'C';
    } else {
        element.textContent = tempF + '°F';
        element.dataset.showing = 'F';
    }

    // fun little pop animation
    gsap.to(element, { 
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
async function getAndSetCityPic(cityName) {
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