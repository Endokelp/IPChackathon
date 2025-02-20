document.getElementById("cityInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather();
    }
});

async function getWeather() {
    const city = document.getElementById("cityInput").value;
    const apiKey = "de2741b1d4b343cb995185040251502";
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        document.getElementById("weatherResult").innerHTML = "City not found!";
    } else {
        const pressure = (data.current.pressure_mb * 0.02953).toFixed(2); // Round pressure to 2 decimal places
        const visibility = data.current.vis_miles;
        const visibilityText = visibility === 1 ? "mile" : "miles"; // Singular/plural correction

        document.getElementById("weatherResult").innerHTML = `
            <p>Weather in ${data.location.name}: ${data.current.condition.text}</p>
            <p>Temperature: ${data.current.temp_f}°F</p>
            <p>Humidity: ${data.current.humidity}%</p>
            <p>Wind Speed: ${data.current.wind_mph} mph</p>
            <p>Visibility: ${visibility} ${visibilityText}</p>
            <p>Pressure: ${pressure} inHg</p>
            <p>UV Index: ${data.current.uv}</p>
        `;
    }
}
