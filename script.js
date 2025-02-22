document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeCitySearch();
});

/**
 * Initializes the theme toggle switch and restores the last selected theme.
 */
function initializeTheme() {
    let themeToggle = document.getElementById('themeToggle');
    let savedTheme = localStorage.getItem('theme') || 'light-theme';

    document.body.className = savedTheme;
    themeToggle.checked = savedTheme === 'dark-theme';

    themeToggle.addEventListener('change', () => {
        let selectedTheme = themeToggle.checked ? 'dark-theme' : 'light-theme';
        document.body.className = selectedTheme;
        localStorage.setItem('theme', selectedTheme);
    });
}

/**
 * Sets up the city input field to fetch weather data when the user presses Enter.
 */
function initializeCitySearch() {
    document.getElementById('cityInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') fetchWeatherData();
    });
}

/**
 * Fetches weather data for the entered city.
 */
async function fetchWeatherData() {
    let city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    let weatherResult = document.getElementById('weatherResult');
    weatherResult.classList.remove('visible');

    // TODO: move to env file
    const apiKey = 'b61ba318b9af8364bfe43d521bfa5c8f';
    let url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

    try {
        let response = await fetch(url);
        
        // Check if response is ok before trying to parse JSON
        if (!response.ok) {
            // console.log('City not found, status:', response.status);
            weatherResult.innerHTML = `<p class="error">City not found! Try another one?</p>`;
            setTimeout(() => weatherResult.classList.add('visible'), 100);
            return;
        }

        let data = await response.json();

        // update everything
        await updateCityImage(city);
        applyWeatherEffects(data.list[0].weather[0].main.toLowerCase());
        renderWeatherDetails(data.list[0], data);

        setTimeout(() => weatherResult.classList.add('visible'), 100);
    } catch (error) {
        console.error('weather fetch failed:', error);
        weatherResult.innerHTML = '<p class="error">Error fetching weather data. Please try again.</p>';
        setTimeout(() => weatherResult.classList.add('visible'), 100);
    }
}

/**
 * Applies visual effects based on the weather condition.
 */
function applyWeatherEffects(condition) {
    if (condition.includes('rain') || condition.includes('drizzle')) {
        weatherEffects.startRain();
        celestialSystem.updateForWeather('clouds');
    } else if (condition.includes('snow')) {
        weatherEffects.startSnow();
        celestialSystem.updateForWeather('clouds');
    } else if (condition.includes('clear')) {
        weatherEffects.clearEffects();
        celestialSystem.updateForWeather('clear');
    } else if (condition.includes('clouds')) {
        weatherEffects.startCloudy();
        celestialSystem.updateForWeather('clouds');
    } else {
        weatherEffects.clearEffects();
        celestialSystem.updateForWeather('clear');
    }
}

/**
 * Updates the weather display UI with fetched data.
 */
function renderWeatherDetails(current, data) {
    let tempF = Math.round(current.main.temp);
    let tempC = Math.round((tempF - 32) * 5 / 9);
    let visibilityMiles = (current.visibility / 1609).toFixed(1);
    let pressureInHg = (current.pressure * 0.02953).toFixed(2);

    let weatherResult = document.getElementById('weatherResult');
    weatherResult.innerHTML = `
        <div class="weather-info-column">
            <h2>${data.city.name}, ${data.city.country}</h2>
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" 
                     alt="${current.weather[0].description}" 
                     class="weather-icon">
                <h3>${current.weather[0].description}</h3>
                <div class="temperature-display" onclick="toggleTemperatureUnit(this)" 
                     data-temp-f="${tempF}" 
                     data-temp-c="${tempC}" 
                     data-showing="F">
                    ${tempF}°F
                </div>
            </div>
            <div class="weather-details">
                <div class="detail"><i class="fas fa-tint"></i> Humidity: ${current.main.humidity}%</div>
                <div class="detail"><i class="fas fa-wind"></i> Wind: ${Math.round(current.wind.speed)} mph</div>
                <div class="detail"><i class="fas fa-eye"></i> Visibility: ${visibilityMiles} mile${visibilityMiles === "1.0" ? "" : "s"}</div>
                <div class="detail"><i class="fas fa-compress-alt"></i> Pressure: ${pressureInHg} inHg</div>
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
 * Toggles between Fahrenheit and Celsius when the user clicks the temperature display.
 */
function toggleTemperatureUnit(element) {
    let tempF = element.dataset.tempF;
    let tempC = element.dataset.tempC;
    let showing = element.dataset.showing;

    let newUnit = showing === 'F' ? 'C' : 'F';
    let newTemp = showing === 'F' ? tempC : tempF;

    element.textContent = `${newTemp}°${newUnit}`;
    element.dataset.showing = newUnit;

    gsap.to(element, { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1 });
}

/**
 * Displays clothing suggestions based on the current weather condition.
 */
function showClothingTips(condition) {
    // grab current temp from the display
    let tempElement = document.querySelector('.temperature-display');
    let tempF = parseInt(tempElement.dataset.tempF);
    
    //temperature ranges in F
    let tempRange = 
        tempF >= 85 ? 'hot' :
        tempF >= 65 ? 'warm' :
        tempF >= 45 ? 'mild' :
        tempF >= 32 ? 'cold' :
        'freezing';

    //suggestions based on both weather and temp
    const suggestions = {
        rain: {
            hot: "Light raincoat and shorts, it's warm but wet!", //my fav kind of weather (pause.)
            warm: "Waterproof jacket and comfortable clothes",
            mild: "Warm raincoat, waterproof boots, and warm layers",
            cold: "Heavy raincoat, insulated waterproof boots, and multiple warm layers",
            freezing: "Just dont go out bruh, put the fries in the bag (in home)"
        },
        snow: {
            hot: "That isn't possible. Check your thermometer!", // global warming is weird
            warm: "This weather makes no sense - but dress warmly just in case", 
            mild: "Heavy winter coat, gloves, and waterproof boots",
            cold: "Full winter gear - look cold and be cold 🥶🥶",
            freezing: "Just dont go out bruh, put the fries in the bag (in home)"
        },
        clear: {
            hot: "breathable clothes. Don't forget sunscreen!",
            warm: "Light clothes - perfect for a t-shirt and shorts",
            mild: "Light jacket or sweater with long pants",
            cold: "Winter coat, gloves, and warm layers",
            freezing: "Just dont go out bruh, put the fries in the bag (in home)"
        },
        clouds: {
            hot: "Light, comfortable clothes - it's still hot!",
            warm: "Normal clothes, maybe a light jacket",
            mild: "Warm jacket and layers recommended",
            cold: "Winter coat and multiple warm layers",
            freezing: "Just dont go out bruh, put the fries in the bag (in home)"
        }
    };

    // handle 'overcast' as 'clouds'
    if (condition.includes('cloud') || condition === 'overcast') {
        condition = 'clouds';
    }

    // fallback for unknown conditions
    let suggestionText = suggestions[condition]?.[tempRange] || 
        `For ${tempF}°F, you need ${tempRange === 'freezing' ? 'serious winter gear' : 'appropriate'} clothing for ${tempRange} weather`;

    let suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'suggestion-popup';
    suggestionDiv.innerHTML = `
        <h3>Clothing Suggestions</h3>
        <p>${suggestionText}</p>
        <button onclick="this.parentElement.remove()">Close</button>
    `;
    
    document.body.appendChild(suggestionDiv);
}

/**
 * Fetches and updates the city background image. I don't know what's harder, setting up unsplash or writing the code itself.
 */
async function updateCityImage(cityName) {
    try {
        let response = await fetch(
            `https://api.unsplash.com/search/photos?query=${cityName} city&client_id=ni4PP6vH3b_G5gYssLTqZpzKyS7UFt5BQXMJ9pmrpZk`
        );
        let data = await response.json();

        if (data.results?.length > 0) {
            setTimeout(() => {
                let cityImage = document.getElementById('cityImage');
                if (cityImage) {
                    cityImage.style.display = 'block';
                    cityImage.src = data.results[0].urls.regular;
                }
            }, 100);
        }
    } catch (error) {
        console.warn("Couldn't load city image.");
    }
}
