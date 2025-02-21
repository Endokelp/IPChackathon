document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    
    // Check for saved theme preference, default to light theme if none saved
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
    themeToggle.checked = savedTheme === 'dark-theme';

    // Theme switch handler
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.className = 'dark-theme';
            localStorage.setItem('theme', 'dark-theme');
        } else {
            document.body.className = 'light-theme';
            localStorage.setItem('theme', 'light-theme');
        }
    });
});

document.getElementById("cityInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {
    const weatherResult = document.getElementById("weatherResult");
    weatherResult.classList.remove('visible');
    
    const city = document.getElementById("cityInput").value;
    const apiKey = "b61ba318b9af8364bfe43d521bfa5c8f";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod !== "200") {
            weatherResult.innerHTML = `<p class='error'>${data.message}</p>`;
        } else {
            // Update background first
            await updateCityBackground(city);
            
            const current = data.list[0];
            const condition = current.weather[0].main.toLowerCase();

            // Update weather effects and celestial body
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

            // Update weather display - pass both current and data
            updateWeatherDisplay(current, data);
        }
        
        setTimeout(() => {
            weatherResult.classList.add('visible');
        }, 100);
        
    } catch (error) {
        weatherResult.innerHTML = "<p class='error'>Error fetching weather data. Please try again.</p>";
        console.error("API Error:", error);
    }
}

function updateWeatherDisplay(current, data) {
    const tempF = Math.round(current.main.temp);
    const tempC = Math.round((tempF - 32) * 5/9);
    const visibility = (current.visibility / 1609).toFixed(1);
    const visibilityText = visibility === "1.0" ? "mile" : "miles";
    const pressure = (current.pressure * 0.02953).toFixed(2);
    
    let temperatureHTML = `
        <div class="temperature-display" onclick="toggleTemperature(this)" 
             data-temp-f="${tempF}" 
             data-temp-c="${tempC}"
             data-showing="F">
            ${tempF}°F
        </div>
    `;

    const weatherResult = document.getElementById("weatherResult");
    weatherResult.innerHTML = `
        <div class="weather-info-column">
            <h2>${data.city.name}, ${data.city.country}</h2>
            <div class="weather-main">
                <img src="https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png" 
                     alt="${current.weather[0].description}"
                     class="weather-icon">
                <h3>${current.weather[0].description}</h3>
                ${temperatureHTML}
            </div>
            <div class="weather-details">
                <div class="detail">
                    <i class="fas fa-tint"></i>
                    <span>Humidity: ${current.main.humidity}%</span>
                </div>
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <span>Wind: ${Math.round(current.wind.speed)} mph</span>
                </div>
                <div class="detail">
                    <i class="fas fa-eye"></i>
                    <span>Visibility: ${visibility} ${visibilityText}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-compress-alt"></i>
                    <span>Pressure: ${pressure} inHg</span>
                </div>
                <div class="detail">
                    <i class="fas fa-thermometer-half"></i>
                    <span>Feels like: ${Math.round(current.main.feels_like)}°F</span>
                </div>
            </div>
            <div class="additional-info">
                <button onclick="showClothingSuggestions('${current.weather[0].main.toLowerCase()}')" class="suggestion-btn">
                    <i class="fas fa-tshirt"></i> Get Clothing Suggestions
                </button>
            </div>
        </div>
        <div class="city-image-column">
            <img class="city-image" src="" alt="${data.city.name}" id="cityImage" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
    `;
}

function toggleTemperature(element) {
    const tempF = element.dataset.tempF;
    const tempC = element.dataset.tempC;
    const currentUnit = element.dataset.showing;
    
    if (currentUnit === 'F') {
        element.textContent = `${tempC}°C`;
        element.dataset.showing = 'C';
    } else {
        element.textContent = `${tempF}°F`;
        element.dataset.showing = 'F';
    }
    
    // Add a small animation
    element.style.transform = 'scale(1.2)';
    setTimeout(() => {
        element.style.transform = 'scale(1)';
    }, 200);
}

function showClothingSuggestions(condition) {
    const suggestions = getClothingSuggestions(condition);
    const suggestionDiv = document.createElement('div');
    suggestionDiv.className = 'suggestion-popup';
    suggestionDiv.innerHTML = `
        <h3>Clothing Suggestions</h3>
        <p>${suggestions}</p>
        <button onclick="this.parentElement.remove()">Close</button>
    `;
    document.body.appendChild(suggestionDiv);
}

function getClothingSuggestions(condition) {
    if (condition.includes('rain')) {
        return "Don't forget your raincoat and umbrella! Waterproof shoes recommended.";
    } else if (condition.includes('snow')) {
        return "Bundle up! Wear a warm coat, gloves, scarf, and winter boots.";
    } else if (condition.includes('clear')) {
        return "Perfect weather! Dress comfortably for the temperature.";
    } else if (condition.includes('clouds')) {
        return "Bring a light jacket, it might get chilly.";
    }
    return "Dress according to the temperature and bring a light jacket just in case.";
}

async function updateCityBackground(cityName) {
    try {
        console.log("Fetching image for:", cityName);
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${cityName} city&client_id=ni4PP6vH3b_G5gYssLTqZpzKyS7UFt5BQXMJ9pmrpZk`,
            {
                headers: {
                    'Authorization': `Client-ID ni4PP6vH3b_G5gYssLTqZpzKyS7UFt5BQXMJ9pmrpZk`
                }
            }
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;
            // Wait a brief moment for DOM to update
            setTimeout(() => {
                const cityImage = document.getElementById('cityImage');
                if (cityImage) {
                    cityImage.style.display = 'block';
                    cityImage.src = imageUrl;
                    console.log("Setting image URL to:", imageUrl);
                } else {
                    console.error("City image element not found");
                }
            }, 100);
        } else {
            console.log("No images found for:", cityName);
        }
    } catch (error) {
        console.error("Error fetching city image:", error);
    }
}