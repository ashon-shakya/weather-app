// Weather App - Fetches and displays current weather and daily forecast
// Functionality:
// 1. Search location by city name using Nominatim API
// 2. Get latitude and longitude coordinates from search results
// 3. Fetch weather data using Open-Meteo API with coordinates
// 4. Display current temperature, conditions, and weather icon
// 5. Show 7-day forecast with min/max temperatures and weather conditions

// search input element
const elementSelector = (element, type = "id") => {
  switch (type) {
    case "id":
      return document.getElementById(element);
    default:
      return document.querySelector(element);
  }
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
  return data?.error ? false : data;
};

const weatherDataShaper = (data) => {
  return data
    ? {
        current: {
          weather: wmoCodeTable[data.current.weather_code],
          temperature: `${data.current.temperature_2m} ${data.current_units.temperature_2m}`,

          rain: `${data.current.rain} ${data.current_units.rain}`,
          humidity: `${data.current.relative_humidity_2m} ${data.current_units.relative_humidity_2m}`,
          wind: `${data.current.wind_speed_10m} ${data.current_units.wind_speed_10m}`,
        },
        daily_forecast: data.daily.time.map((t, idx) => {
          return {
            day_name: new Date(t).toLocaleDateString("en-US", {
              weekday: "short",
            }),
            weather: wmoCodeTable[data.daily.weather_code[idx]],
            min_temp: data.daily.temperature_2m_min[idx],
            max_temp: data.daily.temperature_2m_max[idx],
          };
        }),
      }
    : {
        current: {
          weather: wmoCodeTable[0],
          temperature: `- -`,

          rain: `- -`,
          humidity: `- -`,
          wind: `- -`,
        },
        daily_forecast: [
          {
            day_name: " ",
            weather: "-",
            min_temp: "-",
            max_temp: "-",
          },
        ],
      };
};

class WeatherApp {
  searchElement;
  searchBtnElement;
  todayTempElement;
  todayTempForecastElement;
  todayTempIconElement;
  todayRainElement;
  todayHumidityElement;
  todayWindElement;
  foreCastElement;
  loaderElement;
  mobileTimeElement;
  constructor(value) {
    this.searchElement = elementSelector("search");
    this.searchBtnElement = elementSelector("search-btn");
    this.todayTempElement = elementSelector("today-temp");
    this.todayTempForecastElement = elementSelector("today-temp-forecast");
    this.todayTempIconElement = elementSelector("today-temp-icon");
    this.todayRainElement = elementSelector("today-rain");
    this.todayHumidityElement = elementSelector("today-humidity");
    this.todayWindElement = elementSelector("today-wind");
    this.foreCastElement = elementSelector("forecast");
    this.loaderElement = elementSelector("loader");
    this.mobileTimeElement = elementSelector("mobile-time");

    // initial search value
    this.searchElement.value = value;

    // Click event listner for search button
    this.searchBtnElement.addEventListener("click", async () => {
      this.fetchDailyForecast(this.searchElement.value);
    });

    const setTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      this.mobileTimeElement.innerText = `${hour} : ${minute}`;
    };

    setTime();
    setInterval(setTime, 60000);
  }

  renderDailyForecast(data) {
    // fill the current temperature
    this.todayTempElement.innerText = data.current.temperature;
    this.todayTempForecastElement.innerText = data.current.weather.name;
    this.todayTempIconElement.innerText = data.current.weather.emoji;
    this.todayRainElement.innerText = data.current.rain;
    this.todayHumidityElement.innerText = data.current.humidity;
    this.todayWindElement.innerText = data.current.winds;

    // fill the daily forecast
    let foreCastRows = "";

    for (let item of data.daily_forecast) {
      foreCastRows += `<tr>
                                <td class="align-middle">${item.day_name}</td>
                                <td class="align-middle"><span> ${item.weather.emoji} </span> ${item.weather.name}</td>
                                <td class="align-middle">${item.min_temp} &deg;</td>
                                <td class="align-middle">${item.max_temp} &deg;</td>
                            </tr>`;
    }

    this.foreCastElement.innerHTML = foreCastRows;
  }

  // Method to fetch daily forecast
  async fetchDailyForecast(search) {
    this.loaderElement.classList.remove("hidden");
    // get location gps coordinates
    let locationResult = await searchLocation(search);

    // get coordinate weather data
    let weatherData = weatherDataShaper(
      await searchWeather(locationResult.latitude, locationResult.longitude),
    );
    this.renderDailyForecast(weatherData);
    this.loaderElement.classList.add("hidden");
  }
}

const w = new WeatherApp("Sydney");
w.fetchDailyForecast(w.searchElement.value);
