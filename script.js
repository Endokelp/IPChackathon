document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeCitySearch();
});

/**
 * Initializes the theme toggle switch and restores the last selected theme.
 */
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light-theme';

    document.body.className = savedTheme;
    themeToggle.checked = savedTheme === 'dark-theme';

    themeToggle.addEventListener('change', () => {
        const selectedTheme = themeToggle.checked ? 'dark-theme' : 'light-theme';
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
    const city = document.getElementById('cityInput').value.trim();
    if (!city) return;

    const weatherResult = document.getElementById('weatherResult');
    weatherResult.classList.remove('visible');

    const apiKey = 'b61ba318b9af8364bfe43d521bfa5c8f';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== '200') {
            weatherResult.innerHTML = `<p class="error">${data.message}</p>`;
            return;
        }

        await updateCityImage(city);
        applyWeatherEffects(data.list[0].weather[0].main.toLowerCase());
        renderWeatherDetails(data.list[0], data);

        setTimeout(() => weatherResult.classList.add('visible'), 100);
    } catch (error) {
        weatherResult.innerHTML = '<p class="error">Error fetching weather data. Please try again.</p>';
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
    const tempF = Math.round(current.main.temp);
    const tempC = Math.round((tempF - 32) * 5 / 9);
    const visibilityMiles = (current.visibility / 1609).toFixed(1);
    const pressureInHg = (current.pressure * 0.02953).toFixed(2);

    const weatherResult = document.getElementById('weatherResult');
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
    const { tempF, tempC, showing } = element.dataset;
    const newUnit = showing === 'F' ? 'C' : 'F';
    const newTemp = showing === 'F' ? tempC : tempF;

    element.textContent = `${newTemp}°${newUnit}`;
    element.dataset.showing = newUnit;

    gsap.to(element, { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1 });
}

/**
 * Displays clothing suggestions based on the current weather condition.
 */
function showClothingTips(condition) {
    const suggestions = {
        rain: "Don't forget your raincoat or umbrella, waterproof shoes recommended so you don't slip and lose your aura.",
        snow: "wear a warm coat, gloves, scarf, and winter boots. or walk around naked to improve your aura.",
        clear: "Perfect weather! Dress comfortably and rizz up the huzz.",
        clouds: "Bring a light jacket to mog ppl around you"
    };

    const suggestionText = suggestions[condition] || "Wear something comfortable based on how you feel.";

    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'suggestion-popup';
    suggestionDiv.innerHTML = `
        <h3>Clothing Suggestions</h3>
        <p>${suggestionText}</p>
        <button onclick="this.parentElement.remove()">Close</button>
    `;
    
    document.body.appendChild(suggestionDiv);
}

/**
 * Fetches and updates the city background image.
 */
async function updateCityImage(cityName) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${cityName} city&client_id=ni4PP6vH3b_G5gYssLTqZpzKyS7UFt5BQXMJ9pmrpZk`
        );
        const data = await response.json();

        if (data.results?.length > 0) {
            setTimeout(() => {
                const cityImage = document.getElementById('cityImage');
                if (cityImage) {
                    cityImage.style.display = 'block';
                    cityImage.src = data.results[0].urls.regular;
                }
            }, 100);
        }
    } catch (error) {
        console.warn("Could not load city image.");
    }
}
