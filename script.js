const apiKey = "18a7004f566caf56283e52c1835f0e81";
const app = document.getElementById('app');

// --- UI Generation Functions ---

function createUI() {
    // Container
    const container = document.createElement('div');
    container.className = 'container';
    
    // Search Section
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'userInput';
    searchInput.placeholder = 'Search City...';
    searchInput.autocomplete = 'off';
    
    const searchBtn = document.createElement('button');
    searchBtn.id = 'searchBtn';
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchBtn);
    
    // Error Message
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.className = 'error-message';
    
    // Weather Display (Initially hidden)
    const weatherDisplay = document.createElement('div');
    weatherDisplay.id = 'weather-display';
    weatherDisplay.className = 'weather-display hidden';
    
    // 1. Current Weather
    const currentWeather = document.createElement('div');
    currentWeather.className = 'current-weather';
    currentWeather.innerHTML = `
        <div class="weather-main">
            <h2 id="cityName">City Name</h2>
            <p id="date">Date</p>
            <div class="temp-icon">
                <img id="weatherIcon" src="" alt="Weather Icon">
                <h1 id="temperature">--°C</h1>
            </div>
            <p id="description">Description</p>
        </div>
    `;
    
    // 2. Details Grid
    const weatherDetails = document.createElement('div');
    weatherDetails.className = 'weather-details';
    
    const details = [
        { id: 'windSpeed', label: 'Wind Speed', icon: 'fa-wind', value: '-- km/h' },
        { id: 'humidity', label: 'Humidity', icon: 'fa-tint', value: '--%' },
        { id: 'pressure', label: 'Pressure', icon: 'fa-tachometer-alt', value: '-- hPa' },
        { id: 'visibility', label: 'Visibility', icon: 'fa-eye', value: '-- km' }
    ];
    
    details.forEach(detail => {
        const card = document.createElement('div');
        card.className = 'detail-card';
        card.innerHTML = `
            <i class="fas ${detail.icon}"></i>
            <div>
                <p>${detail.label}</p>
                <h4 id="${detail.id}">${detail.value}</h4>
            </div>
        `;
        weatherDetails.appendChild(card);
    });
    
    // 3. Forecast Section
    const forecastSection = document.createElement('div');
    forecastSection.className = 'forecast-section';
    forecastSection.innerHTML = `
        <h3>5-Day Forecast (3-Hour Intervals)</h3>
        <div id="forecast-container" class="forecast-container"></div>
    `;
    
    weatherDisplay.appendChild(currentWeather);
    weatherDisplay.appendChild(weatherDetails);
    weatherDisplay.appendChild(forecastSection);
    
    // Loader
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'loader hidden';
    
    // Assemble App
    container.appendChild(searchContainer);
    container.appendChild(errorMessage);
    container.appendChild(weatherDisplay);
    container.appendChild(loader);
    
    app.appendChild(container);
    
    // Attach Event Listeners
    setupEventListeners(searchInput, searchBtn);
}

function setupEventListeners(input, btn) {
    btn.addEventListener("click", () => {
        const city = input.value.trim();
        if (city) {
            getWeatherData(city);
        }
    });

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            const city = input.value.trim();
            if (city) {
                getWeatherData(city);
            }
        }
    });
}

// --- Data Fetching Logic ---

async function getWeatherData(city) {
    const loader = document.getElementById("loader");
    const errorMessage = document.getElementById("error-message");
    const weatherDisplay = document.getElementById("weather-display");
    
    loader.classList.remove("hidden");
    errorMessage.textContent = "";
    weatherDisplay.classList.add("hidden"); // Hide while loading
    
    try {
        // Fetch Current Weather
        const currentDateResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        
        if (!currentDateResponse.ok) {
            throw new Error("City not found");
        }
        
        const currentData = await currentDateResponse.json();
        
        // Fetch Forecast Data
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );
        
        const forecastData = await forecastResponse.json();
        
        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        
        weatherDisplay.classList.remove("hidden");
    } catch (error) {
        errorMessage.textContent = error.message;
        weatherDisplay.classList.add("hidden");
    } finally {
        loader.classList.add("hidden");
    }
}

function updateCurrentWeather(data) {
    document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById("date").textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById("temperature").textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById("description").textContent = data.weather[0].description;
    
    const iconCode = data.weather[0].icon;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    document.getElementById("windSpeed").textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById("humidity").textContent = `${data.main.humidity}%`;
    document.getElementById("pressure").textContent = `${data.main.pressure} hPa`;
    document.getElementById("visibility").textContent = `${(data.visibility / 1000).toFixed(1)} km`;
}

function updateForecast(data) {
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = ""; 
    
    data.list.slice(0, 10).forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });
        const date = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        
        const temp = Math.round(item.main.temp);
        const icon = item.weather[0].icon;
        
        const card = document.createElement("div");
        card.classList.add("forecast-card");
        
        card.innerHTML = `
            <p>${date} ${time}</p>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="icon">
            <h4>${temp}°C</h4>
            <p>${item.weather[0].main}</p>
        `;
        
        forecastContainer.appendChild(card);
    });
}

// Initialize App
createUI();
