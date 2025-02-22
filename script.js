document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeCitySearch();
});

/**
 * Initializes the theme toggle switch and restores the last selected theme.
 */
function initializeTheme() {
    let toggle = document.getElementById('themeToggle');
    let theme = localStorage.getItem('theme') || 'light-theme';  // default to light

    document.body.className = theme;
    toggle.checked = theme === 'dark-theme';

    toggle.addEventListener('change', () => {
        // theme switcer
        document.body.className = toggle.checked ? 'dark-theme' : 'light-theme';
        localStorage.setItem('theme', document.body.className);
    });
}

/**
 * sets up the city input field to fetch weather data when user presses Enter.
 */
function initializeCitySearch() {
    document.getElementById('cityInput').addEventListener('keypress', e => {
        if(e.key === 'Enter') fetchWeatherData();
    });
}

/**
 * fetches weather data for the entered city.
 */
async function fetchWeatherData() {
    let city = document.getElementById('cityInput').value.trim();
    if(!city) return;

    let result = document.getElementById('weatherResult');
    result.classList.remove('visible');

    const key = 'b61ba318b9af8364bfe43d521bfa5c8f'; 
    //const key = process.env.WEATHER_API_KEY;  // TODO: set this up properly

    try {
        console.log('fetching weather for:', city);  //leaving this for debugging
        let res = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${key}`
        );
        
        if(!res.ok) {
            result.innerHTML = `<p class="error">City not found! check your spelling maybe?</p>`;
            setTimeout(() => result.classList.add('visible'), 100);
            return;
        }

        let data = await res.json();
        
        // do all the things
        await updateCityImage(city);
        applyWeatherEffects(data.list[0].weather[0].main.toLowerCase());
        renderWeatherDetails(data.list[0], data);

        // fade it in
        setTimeout(() => result.classList.add('visible'), 100);
    } catch(err) {
        console.error('weather fetch died:', err);
        result.innerHTML = '<p class="error">Something broke! Try again?</p>';
        setTimeout(() => result.classList.add('visible'), 100);
    }
}

/**
 * Applies visual effects based on the weather condition.
 */
function applyWeatherEffects(condition) {
    weatherEffects.clearEffects();  // clear old stuff first
    
    // probably could use a switch here but whatever
    if(condition.includes('rain') || condition.includes('drizzle')) {
        weatherEffects.startRain();
        celestialSystem.updateForWeather('clouds');
    } else if(condition.includes('snow')) {
        weatherEffects.startSnow();
        celestialSystem.updateForWeather('clouds');
    } else if(condition.includes('clear')) {
        weatherEffects.clearEffects();
        celestialSystem.updateForWeather('clear');
    } else if(condition.includes('clouds')) {
        weatherEffects.startCloudy();
        celestialSystem.updateForWeather('clouds');
    } else {
        //dk what weather this is, just clear everything
        weatherEffects.clearEffects();
        celestialSystem.updateForWeather('clear');
    }
}

/**
 * Updates the weather display UI with fetched data.
 */
function renderWeatherDetails(current, data) {
    let temp_f = Math.round(current.main.temp);
    let temp_c = Math.round((temp_f - 32) * 5/9);
    
    // convert to miles, america
    let visibility = (current.visibility / 1609).toFixed(1);
    let pressure = (current.pressure * 0.02953).toFixed(2);

    //template literal incoming
    let result = document.getElementById('weatherResult');
    result.innerHTML = `
        <div class="weather-info-column">
            <h2>${data.city.name}, ${data.city.country}</h2>
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" 
                     alt="${current.weather[0].description}" 
                     class="weather-icon">
                <h3>${current.weather[0].description}</h3>
                <div class="temperature-display" onclick="toggleTemperatureUnit(this)" 
                     data-temp-f="${temp_f}" 
                     data-temp-c="${temp_c}" 
                     data-showing="F">
                    ${temp_f}°F
                </div>
            </div>
            <div class="weather-details">
                <div class="detail"><i class="fas fa-tint"></i> Humidity: ${current.main.humidity}%</div>
                <div class="detail"><i class="fas fa-wind"></i> Wind: ${Math.round(current.wind.speed)} mph</div>
                <div class="detail"><i class="fas fa-eye"></i> Visibility: ${visibility} mile${visibility === "1.0" ? "" : "s"}</div>
                <div class="detail"><i class="fas fa-compress-alt"></i> Pressure: ${pressure} inHg</div>
                <div class="detail"><i class="fas fa-thermometer-half"></i> Feels like: ${Math.round(current.main.feels_like)}°F</div>
            </div>
            <button onclick="showClothingTips('${current.weather[0].main.toLowerCase()}')" class="suggestion-btn">
                <i class="fas fa-tshirt"></i> Get Clothing Suggestions
            </button>
        </div>
        <div class="city-image-column">
            <img class="city-image" src="" alt="${data.city.name}" id="cityImage">
        </div>
    `;
}

/**
 * Toggles between F and C when the user clicks the temperature display.
 */
function toggleTemperatureUnit(el) {
    let f = el.dataset.tempF;
    let c = el.dataset.tempC;
    let current = el.dataset.showing;

    // flip between F and C
    if(current === 'F') {
        el.textContent = `${c}°C`;
        el.dataset.showing = 'C';
    } else {
        el.textContent = `${f}°F`;
        el.dataset.showing = 'F';
    }

    // fun little animation
    gsap.to(el, { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1 });
}

/**
 * Displays clothing suggestions based on the current weather condition.
 */
function showClothingTips(condition) {
    let temp = parseInt(document.querySelector('.temperature-display').dataset.tempF);
    
    // figure out how hot/cold it is
    let range = 
        temp >= 85 ? 'hot' :
        temp >= 65 ? 'warm' :
        temp >= 45 ? 'mild' :
        temp >= 32 ? 'cold' :
        'freezing';

    const tips = {
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

    // handle cloudy variations
    if(condition.includes('cloud') || condition === 'overcast') condition = 'clouds';

    let tip = tips[condition]?.[range] || 
        `For ${temp}°F, you need ${range === 'freezing' ? 'serious winter gear' : 'appropriate'} clothing for ${range} weather`;

    // show the popup
    let div = document.createElement('div');
    div.className = 'suggestion-popup';
    div.innerHTML = `
        <h3>Clothing Suggestions</h3>
        <p>${tip}</p>
        <button onclick="this.parentElement.remove()">Close</button>
    `;
    
    document.body.appendChild(div);
}

/**
 * Fetches and updates the city background image.
 */
async function updateCityImage(cityName) {
    try {
        // unsplash api stuff
        let res = await fetch(
            `https://api.unsplash.com/search/photos?query=${cityName} city&client_id=ni4PP6vH3b_G5gYssLTqZpzKyS7UFt5BQXMJ9pmrpZk`
        );
        let data = await res.json();

        if(data.results?.length > 0) {
            setTimeout(() => {
                let img = document.getElementById('cityImage');
                if(img) {  // make sure element exists
                    img.style.display = 'block';
                    img.src = data.results[0].urls.regular;
                }
            }, 100);  // small delay looks better
        }
    } catch(err) {
        console.warn("image fetch failed, oh well");
    }
}
