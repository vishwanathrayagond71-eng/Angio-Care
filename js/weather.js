/* ==========================================================================
   ANGIOCARE - WEATHER INTEGRATION MODULE
   ========================================================================== */

const weatherModule = (() => {
    let weatherChartInstance = null;

    // Generate weather dataset based on user location
    function getWeatherData(location) {
        const province = location.toLowerCase();
        
        // Custom variables based on location simulation
        let tempBase = 30;
        let humBase = 65;
        let condition = "Clear Sunny";
        let windSpeed = 12;

        if (province.includes('punjab') || province.includes('haryana')) {
            tempBase = 34;
            humBase = 50;
            condition = "Dry & Sunny";
        } else if (province.includes('gujarat') || province.includes('anand')) {
            tempBase = 32;
            humBase = 60;
            condition = "Partly Cloudy";
        } else if (province.includes('assam') || province.includes('kerala')) {
            tempBase = 28;
            humBase = 85;
            condition = "Humid & Showers";
            windSpeed = 18;
        }

        // Daily temperatures & humidity lists
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDayIndex = new Date().getDay();
        const forecastDays = [];
        
        const chartLabels = [];
        const chartTempData = [];
        const chartHumidData = [];

        for (let i = 0; i < 7; i++) {
            const index = (currentDayIndex + i) % 7;
            const dayName = days[index];
            
            // Random variation
            const tempVal = Math.round(tempBase + (Math.sin(i) * 3) + (Math.random() * 2 - 1));
            const humVal = Math.round(humBase - (Math.sin(i) * 5) + (Math.random() * 4 - 2));
            
            forecastDays.push({
                day: dayName,
                temp: `${tempVal}°C`,
                humidity: humVal,
                condition: humVal > 78 ? 'Cloudy Rain' : (humVal > 62 ? 'Partly Cloudy' : 'Sunny'),
                icon: humVal > 78 ? 'cloud-drizzle' : (humVal > 62 ? 'cloud-sun' : 'sun')
            });

            chartLabels.push(dayName);
            chartTempData.push(tempVal);
            chartHumidData.push(humVal);
        }

        return {
            location: location || "Anand, Gujarat",
            currentTemp: `${forecastDays[0].temp}`,
            currentHumidity: `${forecastDays[0].humidity}%`,
            currentCondition: forecastDays[0].condition,
            currentWind: `${windSpeed} km/h`,
            forecast: forecastDays,
            chartData: {
                labels: chartLabels,
                temperatures: chartTempData,
                humidities: chartHumidData
            }
        };
    }

    // Weather condition and icon mapping helper
    function mapWeatherCode(code) {
        if (code === 0) return { condition: "Clear Sky", icon: "sun" };
        if (code >= 1 && code <= 3) return { condition: "Partly Cloudy", icon: "cloud-sun" };
        if (code === 45 || code === 48) return { condition: "Foggy", icon: "cloud" };
        if (code >= 51 && code <= 55) return { condition: "Light Drizzle", icon: "cloud-drizzle" };
        if (code >= 61 && code <= 65) return { condition: "Rainy", icon: "cloud-rain" };
        if (code >= 80 && code <= 82) return { condition: "Rain Showers", icon: "cloud-drizzle" };
        if (code >= 95 && code <= 99) return { condition: "Thunderstorm", icon: "cloud-lightning" };
        return { condition: "Partly Cloudy", icon: "cloud-sun" };
    }

    // Geocoded lookup coordinates list
    const fallbackCoords = {
        "anand": { lat: 22.56, lon: 72.96, name: "Anand, Gujarat" },
        "gujarat": { lat: 22.2587, lon: 71.1924, name: "Anand, Gujarat" },
        "punjab": { lat: 31.1471, lon: 75.3412, name: "Ludhiana, Punjab" },
        "haryana": { lat: 29.0588, lon: 76.0856, name: "Karnal, Haryana" },
        "assam": { lat: 26.2006, lon: 92.9376, name: "Guwahati, Assam" },
        "kerala": { lat: 10.8505, lon: 76.2711, name: "Palakkad, Kerala" }
    };

    function getCoordsForLocation(locStr) {
        if (!locStr) return fallbackCoords["anand"];
        const s = locStr.toLowerCase();
        for (const k in fallbackCoords) {
            if (s.includes(k)) {
                return fallbackCoords[k];
            }
        }
        return fallbackCoords["anand"];
    }

    // Main weather bootstrapper using navigator.geolocation
    function loadWeatherData() {
        // Show loading states
        document.getElementById('weather-temp').textContent = '--°C';
        document.getElementById('weather-condition').textContent = 'Fetching...';
        document.getElementById('weather-location').textContent = 'Accessing GPS coordinates...';
        document.getElementById('weather-humidity').textContent = '--%';
        document.getElementById('weather-wind').textContent = '-- km/h';

        const session = authModule.getSession();
        const defaultLoc = session ? session.location : "Anand, Gujarat";

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    await fetchRealWeather(lat, lon, `Coordinates: ${lat.toFixed(2)}, ${lon.toFixed(2)}`);
                },
                async (error) => {
                    console.warn("Geolocation denied or failed. Fallback to default location.", error);
                    const coordsObj = getCoordsForLocation(defaultLoc);
                    await fetchRealWeather(coordsObj.lat, coordsObj.lon, coordsObj.name);
                },
                { timeout: 8000 }
            );
        } else {
            console.warn("Geolocation not supported by browser. Fallback to default location.");
            const coordsObj = getCoordsForLocation(defaultLoc);
            fetchRealWeather(coordsObj.lat, coordsObj.lon, coordsObj.name);
        }
    }

    // Async Fetch from external endpoints
    async function fetchRealWeather(lat, lon, fallbackName) {
        let locationName = fallbackName;
        
        // 1. Try reverse geocoding via Nominatim
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
            if (geoRes.ok) {
                const geoData = await geoRes.json();
                const address = geoData.address;
                const city = address.city || address.town || address.village || address.district || address.state_district || address.state;
                const state = address.state;
                if (city) {
                    locationName = state ? `${city}, ${state}` : city;
                }
            }
        } catch (err) {
            console.warn("Nominatim Geocoding API failed: ", err);
        }

        // 2. Try fetching Open-Meteo
        try {
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
            if (!weatherRes.ok) throw new Error("Open-Meteo API response not OK");

            const weatherData = await weatherRes.json();
            
            // Format current weather metrics
            const currentTemp = Math.round(weatherData.current_weather.temperature);
            const windSpeed = Math.round(weatherData.current_weather.windspeed);
            const wmoCode = weatherData.current_weather.weathercode;
            const mappedCurrent = mapWeatherCode(wmoCode);
            
            // Get current humidity (from first hourly element or current hour)
            const hourlyHumid = weatherData.hourly.relativehumidity_2m || [];
            const currentHumidityVal = hourlyHumid.length > 0 ? hourlyHumid[0] : 65;

            // Build forecast details
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const forecastDays = [];
            const chartLabels = [];
            const chartTempData = [];
            const chartHumidData = [];

            const dailyTime = weatherData.daily.time;
            const tempMaxs = weatherData.daily.temperature_2m_max;
            const tempMins = weatherData.daily.temperature_2m_min;
            const dailyCodes = weatherData.daily.weathercode;

            for (let i = 0; i < 7; i++) {
                if (!dailyTime[i]) break;
                // Parse date format safely
                const dateParts = dailyTime[i].split('-');
                const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
                const dayName = days[date.getDay()];

                const tempMax = tempMaxs[i];
                const tempMin = tempMins[i];
                const avgTemp = Math.round((tempMax + tempMin) / 2);

                // Slice hourly values for this day (24 values)
                const dayHourlyHumid = hourlyHumid.slice(i * 24, (i + 1) * 24);
                const avgHumid = dayHourlyHumid.length > 0 
                    ? Math.round(dayHourlyHumid.reduce((a, b) => a + b, 0) / dayHourlyHumid.length) 
                    : 60;

                const mappedDaily = mapWeatherCode(dailyCodes[i]);

                forecastDays.push({
                    day: dayName,
                    temp: `${avgTemp}°C`,
                    humidity: avgHumid,
                    condition: mappedDaily.condition,
                    icon: mappedDaily.icon
                });

                chartLabels.push(dayName);
                chartTempData.push(avgTemp);
                chartHumidData.push(avgHumid);
            }

            const parsedData = {
                location: locationName,
                currentTemp: `${currentTemp}°C`,
                currentHumidity: `${currentHumidityVal}%`,
                currentCondition: mappedCurrent.condition,
                currentWind: `${windSpeed} km/h`,
                forecast: forecastDays,
                chartData: {
                    labels: chartLabels,
                    temperatures: chartTempData,
                    humidities: chartHumidData
                }
            };

            renderWeatherDataToDom(parsedData);
        } catch (err) {
            console.error("Open-Meteo API failed, falling back to simulated data: ", err);
            const simData = getWeatherData(locationName);
            renderWeatherDataToDom(simData);
        }
    }

    // Render parsed data to HTML
    function renderWeatherDataToDom(data) {
        document.getElementById('weather-temp').textContent = data.currentTemp;
        document.getElementById('weather-condition').textContent = data.currentCondition;
        document.getElementById('weather-location').textContent = `District: ${data.location}`;
        document.getElementById('weather-humidity').textContent = data.currentHumidity;
        document.getElementById('weather-wind').textContent = data.currentWind;

        // Render weekly cards
        const forecastContainer = document.getElementById('weather-forecast-container');
        forecastContainer.innerHTML = '';

        data.forecast.forEach(item => {
            const card = document.createElement('div');
            card.className = 'forecast-card glass-panel';
            card.innerHTML = `
                <div class="forecast-day">${item.day}</div>
                <div class="forecast-icon"><i data-lucide="${item.icon}"></i></div>
                <div class="forecast-temp">${item.temp}</div>
                <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">RH: ${item.humidity}%</div>
            `;
            forecastContainer.appendChild(card);
        });

        // Initialize disease risk advisory rules
        const alertBox = document.getElementById('weather-alert-box');
        const alertText = document.getElementById('weather-alert-text');
        
        const maxHumidity = Math.max(...data.chartData.humidities);
        const avgTemp = data.chartData.temperatures.reduce((a, b) => a + b, 0) / data.chartData.temperatures.length;

        if (maxHumidity > 80 && avgTemp < 28) {
            alertBox.style.display = 'block';
            alertBox.style.borderLeftColor = 'var(--danger)';
            alertBox.querySelector('h4').style.color = 'var(--danger)';
            alertBox.querySelector('h4 span').textContent = 'Late Blight Outbreak Risk';
            alertText.textContent = `CRITICAL ALERT: Atmospheric humidity is forecast to peak at ${maxHumidity}% this week with temperatures averaging ${avgTemp.toFixed(1)}°C. High risk of late blight outbreaks for potato and tomato crops. Preventive copper sprays recommended.`;
        } else if (maxHumidity > 70) {
            alertBox.style.display = 'block';
            alertBox.style.borderLeftColor = 'var(--accent)';
            alertBox.querySelector('h4').style.color = 'var(--accent)';
            alertBox.querySelector('h4 span').textContent = 'Fungal Spore Warn';
            alertText.textContent = `WARN: Humidity levels are elevated (${maxHumidity}%). High fungal spore dispersal probability. Inspect rice fields for blast lesions or cotton leaves for Alternaria spots.`;
        } else {
            alertBox.style.display = 'block';
            alertBox.style.borderLeftColor = 'var(--success)';
            alertBox.querySelector('h4').style.color = 'var(--success)';
            alertBox.querySelector('h4 span').textContent = 'Stable Agro-Weather';
            alertText.textContent = `Low humidity levels and high solar rates forecasted for the week. Outbreak indices for fungal blights are minimal. Keep up standard drip irrigation rotations.`;
        }

        // Draw Line Chart
        renderWeatherChart(data.chartData);

        // Re-run Lucide mapping for new dynamic icons
        lucide.createIcons();
    }

    // Render Double-Axis Chart
    function renderWeatherChart(chartData) {
        const ctx = document.getElementById('weatherChart').getContext('2d');

        if (weatherChartInstance) {
            weatherChartInstance.destroy();
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
        const labelColor = isDark ? '#9ca3af' : '#4b5563';

        weatherChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: chartData.temperatures,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        yAxisID: 'y-temp',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: 'Relative Humidity (%)',
                        data: chartData.humidities,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        yAxisID: 'y-humid',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: labelColor,
                            font: { family: 'Inter', weight: '600' }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: gridColor },
                        ticks: { color: labelColor }
                    },
                    'y-temp': {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Temperature (°C)', color: labelColor },
                        grid: { color: gridColor },
                        ticks: { color: labelColor }
                    },
                    'y-humid': {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Humidity (%)', color: labelColor },
                        grid: { drawOnChartArea: false }, // Avoid duplicate lines
                        ticks: { color: labelColor },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    return {
        loadWeatherData
    };
})();
