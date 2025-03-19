document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the main page or the weather-only page
    const isMainPage = document.querySelector('.hero-container') !== null;
    
    // Initialize selectors based on page context
    const weatherContainer = isMainPage ? 
        document.querySelector('.hero-container .weather-info') : 
        document.querySelector('.weather-info');
        
    // Rest of your code...
});

const API_KEY = "b2a766efa8eaf0814a8c5d9e8548565a"; // Replace with your OpenWeatherMap API key
const weatherInfo = document.querySelector(".weather-info");
const searchCity = document.querySelector(".search-city");
const notFound = document.querySelector(".not-found");

console.log("Weather script loaded");
console.log("Weather container found:", document.querySelector(".weather-info") !== null);

const getWeatherDetails = async (latitude, longitude) => {
    try {
        console.log("Fetching weather data for:", latitude, longitude);
        
        // OpenWeatherMap Current Weather API
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        const currentData = await currentResponse.json();
        
        // OpenWeatherMap 5-day Forecast API
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        console.log("Current data:", currentData);
        console.log("Forecast data:", forecastData);

        if (currentData.cod !== 200) {
            console.error("API returned error:", currentData.message);
            weatherInfo.style.display = "none";
            searchCity.style.display = "none";
            notFound.style.display = "block";
            return;
        }

        // Update UI with current weather data
        document.querySelector(".city-name").textContent = currentData.name;
        document.querySelector(".country-code").textContent = currentData.sys.country;
        document.querySelector(".current-date").textContent = new Date().toLocaleDateString();
        document.querySelector(".temperature").textContent = `${Math.round(currentData.main.temp)}°C`;
        document.querySelector(".description").textContent = currentData.weather[0].description;
        document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
        document.querySelector(".humidity").textContent = `${currentData.main.humidity}%`;
        document.querySelector(".wind-speed").textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`; // Convert m/s to km/h

        // Process 5-day forecast data
        const forecastList = document.querySelector(".forecast-list");
        forecastList.innerHTML = "";
        
        // OpenWeatherMap returns forecast in 3-hour intervals, we need daily
        // Get one forecast per day (noon) for the next 5 days
        const dailyForecasts = forecastData.list.filter((forecast, index) => 
            index % 8 === 4 // This roughly gets the noon forecast for each day
        ).slice(0, 5); // Limit to 5 days
        
        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000); // Convert timestamp to date
            forecastList.innerHTML += `
                <div class="forecast-item">
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon">
                    <h5>${date.toLocaleDateString('en-US', { weekday: 'short' })}</h5>
                    <h5>${Math.round(day.main.temp)}°C</h5>
                </div>
            `;
        });

        weatherInfo.style.display = "block";
        searchCity.style.display = "none";
        notFound.style.display = "none";
    } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherInfo.style.display = "none";
        searchCity.style.display = "none";
        notFound.style.display = "block";
    }
};

const getUserLocation = () => {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log(`User Location: ${lat}, ${lon}`);
                getWeatherDetails(lat, lon);
            },
            (error) => {
                console.error("Geolocation error:", error.message);
                alert("Failed to access location. Please allow location services and refresh.");
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
};

window.addEventListener("load", getUserLocation);

// Event listener for search button
document.querySelector(".search-btn").addEventListener("click", () => {
    const city = document.querySelector(".city-input").value.trim();
    if (city) {
        searchWeatherByCity(city);
    }
});

// Event listener for Enter key in the input field
document.querySelector(".city-input").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        const city = document.querySelector(".city-input").value.trim();
        if (city) {
            searchWeatherByCity(city);
        }
    }
});

// Function to search weather by city name
const searchWeatherByCity = async (city) => {
    try {
        console.log("Searching for city:", city);
        
        // OpenWeatherMap Current Weather API
        const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const currentData = await currentResponse.json();
        
        if (currentData.cod !== 200) {
            console.error("City not found:", city);
            weatherInfo.style.display = "none";
            searchCity.style.display = "none";
            notFound.style.display = "block";
            return;
        }
        
        // OpenWeatherMap 5-day Forecast API
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastResponse.json();

        // Update UI with current weather data
        document.querySelector(".city-name").textContent = currentData.name;
        document.querySelector(".country-code").textContent = currentData.sys.country;
        document.querySelector(".current-date").textContent = new Date().toLocaleDateString();
        document.querySelector(".temperature").textContent = `${Math.round(currentData.main.temp)}°C`;
        document.querySelector(".description").textContent = currentData.weather[0].description;
        document.querySelector(".weather-icon").src = `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png`;
        document.querySelector(".humidity").textContent = `${currentData.main.humidity}%`;
        document.querySelector(".wind-speed").textContent = `${Math.round(currentData.wind.speed * 3.6)} km/h`; // Convert m/s to km/h

        // Process 5-day forecast data
        const forecastList = document.querySelector(".forecast-list");
        forecastList.innerHTML = "";
        
        // OpenWeatherMap returns forecast in 3-hour intervals, we need daily
        // Get one forecast per day (noon) for the next 5 days
        const dailyForecasts = forecastData.list.filter((forecast, index) => 
            index % 8 === 4 // This roughly gets the noon forecast for each day
        ).slice(0, 5); // Limit to 5 days
        
        dailyForecasts.forEach(day => {
            const date = new Date(day.dt * 1000); // Convert timestamp to date
            forecastList.innerHTML += `
                <div class="forecast-item">
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="weather icon">
                    <h5>${date.toLocaleDateString('en-US', { weekday: 'short' })}</h5>
                    <h5>${Math.round(day.main.temp)}°C</h5>
                </div>
            `;
        });

        weatherInfo.style.display = "block";
        searchCity.style.display = "none";
        notFound.style.display = "none";
    } catch (error) {
        console.error("Error searching for city:", error);
        weatherInfo.style.display = "none";
        searchCity.style.display = "none";
        notFound.style.display = "block";
    }
};