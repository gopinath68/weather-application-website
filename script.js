const apiKey = "18a7004f566caf56283e52c1835f0e81";
const app = document.getElementById('app');

// --- State ---
let currentUnit = 'metric'; // 'metric' or 'imperial'
let cachedWeatherData = null;
let cachedForecastData = null;

// --- Weather condition → theme mapping ---
const weatherThemes = {
    Clear: 'theme-clear',
    Clouds: 'theme-clouds',
    Rain: 'theme-rain',
    Drizzle: 'theme-drizzle',
    Thunderstorm: 'theme-thunderstorm',
    Snow: 'theme-snow',
    Mist: 'theme-mist',
    Haze: 'theme-mist',
    Fog: 'theme-mist',
    Smoke: 'theme-mist',
    Dust: 'theme-mist',
};

// --- UI Generation ---

function createUI() {
    const container = document.createElement('div');
    container.className = 'container';

    // Search Section
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'userInput';
    searchInput.placeholder = 'Search city...';
    searchInput.autocomplete = 'off';
    searchInput.setAttribute('aria-label', 'Search for a city');

    const searchBtn = document.createElement('button');
    searchBtn.id = 'searchBtn';
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    searchBtn.setAttribute('aria-label', 'Search');

    const locationBtn = document.createElement('button');
    locationBtn.id = 'locationBtn';
    locationBtn.className = 'location-btn';
    locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
    locationBtn.setAttribute('aria-label', 'Use my location');

    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchBtn);
    searchContainer.appendChild(locationBtn);

    // Error Message
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.className = 'error-message';
    errorMessage.setAttribute('role', 'alert');

    // Controls Row (unit toggle)
    const controlsRow = document.createElement('div');
    controlsRow.className = 'controls-row hidden';
    controlsRow.id = 'controls-row';

    const unitToggle = document.createElement('div');
    unitToggle.className = 'unit-toggle';

    const celsiusBtn = document.createElement('button');
    celsiusBtn.id = 'celsiusBtn';
    celsiusBtn.textContent = '°C';
    celsiusBtn.className = 'active';

    const fahrenheitBtn = document.createElement('button');
    fahrenheitBtn.id = 'fahrenheitBtn';
    fahrenheitBtn.textContent = '°F';

    unitToggle.appendChild(celsiusBtn);
    unitToggle.appendChild(fahrenheitBtn);
    controlsRow.appendChild(unitToggle);

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
            <p class="feels-like" id="feelsLike"></p>
        </div>
    `;

    // 2. Details Grid
    const weatherDetails = document.createElement('div');
    weatherDetails.className = 'weather-details';

    const details = [
        { id: 'windSpeed', label: 'Wind', icon: 'fa-wind', value: '--' },
        { id: 'humidity', label: 'Humidity', icon: 'fa-droplet', value: '--' },
        { id: 'pressure', label: 'Pressure', icon: 'fa-gauge-high', value: '--' },
        { id: 'visibility', label: 'Visibility', icon: 'fa-eye', value: '--' },
        { id: 'sunrise', label: 'Sunrise', icon: 'fa-sun', value: '--' },
        { id: 'sunset', label: 'Sunset', icon: 'fa-moon', value: '--' },
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
        <h3>5-Day Forecast</h3>
        <div id="forecast-container" class="forecast-container"></div>
    `;

    weatherDisplay.appendChild(currentWeather);
    weatherDisplay.appendChild(weatherDetails);
    weatherDisplay.appendChild(forecastSection);

    // Welcome State
    const welcomeState = document.createElement('div');
    welcomeState.id = 'welcome-state';
    welcomeState.className = 'welcome-state';
    welcomeState.innerHTML = `
        <i class="fas fa-cloud-sun"></i>
        <h3>Welcome to WeatherScope</h3>
        <p>Search for a city or use your location<br>to get started.</p>
    `;

    // Loader
    const loader = document.createElement('div');
    loader.id = 'loader';
    loader.className = 'loader hidden';

    // Assemble App
    container.appendChild(searchContainer);
    container.appendChild(errorMessage);
    container.appendChild(controlsRow);
    container.appendChild(welcomeState);
    container.appendChild(weatherDisplay);
    container.appendChild(loader);

    app.appendChild(container);

    // Attach Event Listeners
    setupEventListeners(searchInput, searchBtn, locationBtn, celsiusBtn, fahrenheitBtn);
}

function setupEventListeners(input, searchBtn, locationBtn, celsiusBtn, fahrenheitBtn) {
    searchBtn.addEventListener('click', () => {
        const city = input.value.trim();
        if (city) getWeatherData(city);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = input.value.trim();
            if (city) getWeatherData(city);
        }
    });

    locationBtn.addEventListener('click', () => {
        getLocationWeather();
    });

    celsiusBtn.addEventListener('click', () => {
        if (currentUnit !== 'metric') {
            currentUnit = 'metric';
            celsiusBtn.classList.add('active');
            fahrenheitBtn.classList.remove('active');
            if (cachedWeatherData) {
                updateCurrentWeather(cachedWeatherData);
                updateForecast(cachedForecastData);
            }
        }
    });

    fahrenheitBtn.addEventListener('click', () => {
        if (currentUnit !== 'imperial') {
            currentUnit = 'imperial';
            fahrenheitBtn.classList.add('active');
            celsiusBtn.classList.remove('active');
            if (cachedWeatherData) {
                updateCurrentWeather(cachedWeatherData);
                updateForecast(cachedForecastData);
            }
        }
    });
}

// --- Geolocation ---

function getLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    const locationBtn = document.getElementById('locationBtn');
    locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
            await getWeatherByCoords(latitude, longitude);
        },
        (error) => {
            locationBtn.innerHTML = '<i class="fas fa-location-crosshairs"></i>';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    showError('Location access denied. Please search manually.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    showError('Location unavailable. Please try again.');
                    break;
                default:
                    showError('Could not get your location.');
            }
        },
        { enableHighAccuracy: false, timeout: 10000 }
    );
}

// --- Data Fetching ---

async function getWeatherData(city) {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const weatherDisplay = document.getElementById('weather-display');
    const welcomeState = document.getElementById('welcome-state');
    const controlsRow = document.getElementById('controls-row');

    loader.classList.remove('hidden');
    errorMessage.textContent = '';
    weatherDisplay.classList.add('hidden');
    welcomeState.classList.add('hidden');
    controlsRow.classList.add('hidden');

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
        ]);

        if (!currentRes.ok) {
            const errData = await currentRes.json();
            throw new Error(errData.message || 'City not found');
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        cachedWeatherData = currentData;
        cachedForecastData = forecastData;

        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        applyWeatherTheme(currentData);

        weatherDisplay.classList.remove('hidden');
        controlsRow.classList.remove('hidden');
    } catch (error) {
        showError(capitalize(error.message));
        weatherDisplay.classList.add('hidden');
        controlsRow.classList.add('hidden');
        welcomeState.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

async function getWeatherByCoords(lat, lon) {
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');
    const weatherDisplay = document.getElementById('weather-display');
    const welcomeState = document.getElementById('welcome-state');
    const controlsRow = document.getElementById('controls-row');

    loader.classList.remove('hidden');
    errorMessage.textContent = '';
    weatherDisplay.classList.add('hidden');
    welcomeState.classList.add('hidden');
    controlsRow.classList.add('hidden');

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
        ]);

        if (!currentRes.ok) throw new Error('Could not fetch weather for your location.');

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        cachedWeatherData = currentData;
        cachedForecastData = forecastData;

        document.getElementById('userInput').value = currentData.name;

        updateCurrentWeather(currentData);
        updateForecast(forecastData);
        applyWeatherTheme(currentData);

        weatherDisplay.classList.remove('hidden');
        controlsRow.classList.remove('hidden');
    } catch (error) {
        showError(error.message);
        welcomeState.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

// --- UI Update Functions ---

function convertTemp(tempC) {
    if (currentUnit === 'imperial') {
        return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
}

function tempSymbol() {
    return currentUnit === 'imperial' ? '°F' : '°C';
}

function windUnit(speedMs) {
    // API returns m/s in metric; convert to km/h or mph
    if (currentUnit === 'imperial') {
        return `${Math.round(speedMs * 2.237)} mph`;
    }
    return `${Math.round(speedMs * 3.6)} km/h`;
}

function updateCurrentWeather(data) {
    document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('temperature').textContent = `${convertTemp(data.main.temp)}${tempSymbol()}`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feelsLike').textContent = `Feels like ${convertTemp(data.main.feels_like)}${tempSymbol()}`;

    const iconCode = data.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    document.getElementById('windSpeed').textContent = windUnit(data.wind.speed);
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Sunrise & Sunset
    const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('sunrise').textContent = sunriseTime;
    document.getElementById('sunset').textContent = sunsetTime;
}

function updateForecast(data) {
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = '';

    data.list.slice(0, 10).forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true
        });
        const day = new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });

        const temp = convertTemp(item.main.temp);
        const icon = item.weather[0].icon;

        const card = document.createElement('div');
        card.classList.add('forecast-card');

        card.innerHTML = `
            <span class="fc-day">${day}</span>
            <span class="fc-time">${time}</span>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${item.weather[0].description}">
            <span class="fc-temp">${temp}${tempSymbol()}</span>
            <span class="fc-desc">${item.weather[0].main}</span>
        `;

        forecastContainer.appendChild(card);
    });
}

// --- Theme ---

function applyWeatherTheme(data) {
    // Remove old themes
    document.body.className = '';

    const mainCondition = data.weather[0].main;
    const iconCode = data.weather[0].icon;
    const isNight = iconCode.endsWith('n');

    if (isNight) {
        document.body.classList.add('theme-night');
    } else if (weatherThemes[mainCondition]) {
        document.body.classList.add(weatherThemes[mainCondition]);
    }
}

// --- Helpers ---

function showError(message) {
    const el = document.getElementById('error-message');
    el.textContent = message;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- Initialize ---
createUI();
