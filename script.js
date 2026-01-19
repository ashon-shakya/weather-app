// Weather App - Fetches and displays current weather and daily forecast
// Functionality:
// 1. Search location by city name using Nominatim API
// 2. Get latitude and longitude coordinates from search results
// 3. Fetch weather data using Open-Meteo API with coordinates
// 4. Display current temperature, conditions, and weather icon
// 5. Show 7-day forecast with min/max temperatures and weather conditions

// search input element
const searchElement = document.getElementById("search");
const searchBtnElement = document.getElementById("search-btn");
const todayTempElement = document.getElementById("today-temp");
const todayTempForecastElement = document.getElementById("today-temp-forecast");
const todayTempIconElement = document.getElementById("today-temp-icon");
const todayRainElement = document.getElementById("today-rain");
const todayHumidityElement = document.getElementById("today-humidity");
const todayWindElement = document.getElementById("today-wind");

const foreCastElement = document.getElementById("forecast");
const loaderElement = document.getElementById("loader");

// function to get gps coordinate via key word
const searchLocation = async (location) => {
  let response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`,
  );

  let data = await response.json();

  if (data[0]) {
    return {
      latitude: data[0].lat,
      longitude: data[0].lon,
    };
  } else {
    return {
      latitude: "27",
      logitude: "85",
    };
  }
};

// function to get weather data
// data retrieves:
// 1. Current temperature, rain, wind, humidity
// 2. 7 Days Forecast with Max/Min Temp

const searchWeather = async (latitude, longitude) => {
  let response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_min,temperature_2m_max&current=temperature_2m,weather_code,rain,wind_speed_10m,relative_humidity_2m,precipitation,is_day`,
  );

  let data = await response.json();

  console.log(data);
  return data?.error ? false : data;
};

// Weather Code Table
const wmoCodeTable = {
  0: { emoji: "☀️", name: "Clear" },
  1: { emoji: "🌤️", name: "Mainly Clear" },
  2: { emoji: "⛅", name: "Partly Cloudy" },
  3: { emoji: "☁️", name: "Overcast" },
  45: { emoji: "🌫️", name: "Foggy" },
  48: { emoji: "🌫️", name: "Depositing Rime Fog" },
  51: { emoji: "🌧️", name: "Light Drizzle" },
  53: { emoji: "🌧️", name: "Moderate Drizzle" },
  55: { emoji: "🌧️", name: "Dense Drizzle" },
  61: { emoji: "🌧️", name: "Slight Rain" },
  63: { emoji: "🌧️", name: "Moderate Rain" },
  65: { emoji: "⛈️", name: "Heavy Rain" },
  71: { emoji: "❄️", name: "Slight Snow" },
  73: { emoji: "❄️", name: "Moderate Snow" },
  75: { emoji: "❄️", name: "Heavy Snow" },
  77: { emoji: "❄️", name: "Snow Grains" },
  80: { emoji: "🌧️", name: "Slight Showers" },
  81: { emoji: "🌧️", name: "Moderate Showers" },
  82: { emoji: "⛈️", name: "Violent Showers" },
  85: { emoji: "❄️", name: "Slight Snow Showers" },
  86: { emoji: "❄️", name: "Heavy Snow Showers" },
  95: { emoji: "⛈️", name: "Thunderstorm" },
  96: { emoji: "⛈️", name: "Thunderstorm with Hail" },
  99: { emoji: "⛈️", name: "Thunderstorm with Large Hail" },
};

// fetch daily forecast
const fetchDailyForecast = async (search) => {
  loaderElement.classList.remove("hidden");
  // get location gps coordinates
  let locationResult = await searchLocation(search);

  // get coordinate weather data
  let data = await searchWeather(
    locationResult.latitude,
    locationResult.longitude,
  );

  if (data) {
    // fill the current temperature
    todayTempElement.innerText =
      data.current.temperature_2m + " " + data.current_units.temperature_2m;
    todayTempForecastElement.innerText =
      wmoCodeTable[data.current.weather_code].name;
    todayTempIconElement.innerText =
      wmoCodeTable[data.current.weather_code].emoji;
    todayRainElement.innerText =
      data.current.rain + " " + data.current_units.rain;
    todayHumidityElement.innerText =
      data.current.relative_humidity_2m +
      " " +
      data.current_units.relative_humidity_2m;
    todayWindElement.innerText =
      data.current.wind_speed_10m + " " + data.current_units.wind_speed_10m;

    // fill the daily forecast
    let foreCastRows = "";

    for (let i = 0; i < data.daily.time.length; i++) {
      const options = { weekday: "short" };
      const dayName = new Date(data.daily.time[i]).toLocaleDateString(
        "en-US",
        options,
      );

      const weather = wmoCodeTable[data.daily.weather_code[i]];
      //  {name, emoji}

      const tempMin = data.daily.temperature_2m_min[i];
      const tempMax = data.daily.temperature_2m_max[i];

      foreCastRows += `<div
                          class="forecast-row d-flex justify-content-between rounded-2 align-items-center px-4 fw-lighter">
                          <div class="forecast-date">
                              ${dayName}
                          </div>
                          <div class="forecast-details d-flex justify-content-start align-items-center">
                              <span class="icon fs-1">${weather.emoji}</span>
                              <span>${weather.name}</span>
                          </div>
  
                          <div class="temp">
                              <div>${tempMax}&deg;</div>
                              <div>${tempMin}&deg;</div>
                          </div>
                      </div>
  `;
    }

    foreCastElement.innerHTML = foreCastRows;
  } else {
    // reset data
    // fill the current temperature
    todayTempElement.innerText = "-";
    todayTempForecastElement.innerText = "-";
    todayTempIconElement.innerText = "-";
    todayRainElement.innerText = "-";
    todayHumidityElement.innerText = "-";
    todayWindElement.innerText = "-";
    foreCastElement.innerHTML = ` <div
                            class="forecast-row d-flex justify-content-between rounded-2 align-items-center px-4 fw-lighter">
                            <div class="forecast-date">
                                -
                            </div>
                            <div class="forecast-details d-flex justify-content-start align-items-center">
                                <span class="icon fs-1">🌤️</span>
                                <span>-</span>
                            </div>

                            <div class="temp">
                                <div>-&deg;</div>
                                <div>-&deg;</div>
                            </div>
                        </div>`;
  }

  loaderElement.classList.add("hidden");
};

// Click event listner for search button
searchBtnElement.addEventListener("click", async () => {
  fetchDailyForecast(searchElement.value);
});

searchElement.value = "Sydney";
fetchDailyForecast(searchElement.value);
