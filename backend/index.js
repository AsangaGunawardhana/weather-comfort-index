const express = require ('express');
const cors = require ('cors');
require ('dotenv').config();
const citiesData = require('./cities.json');

const app = express();

app.use(cors());

const weatherCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; 

async function getWeather(cityId) {
  const cached = weatherCache.get(cityId);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Cache HIT for city ${cityId}`);
    return cached.data;
  }

  console.log(`Cache MISS for city ${cityId}`);
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`,
  );
  const data = await response.json();

  weatherCache.set(cityId, { data: data, timestamp: Date.now() });

  return data;
}


async function getAllCitiesWeather() {
  const cityList = citiesData.List;

  const weatherPromises = cityList.map((city) => getWeather(city.CityCode));

  const weatherResults = await Promise.all(weatherPromises);

  return weatherResults;
}

function scoreTemperature(feelsLike) {
  const idealMin = 23;
  const idealMax = 27;

  if (feelsLike >= idealMin && feelsLike <= idealMax) {
    return 100;
  }

  let distance;
  if (feelsLike < idealMin) {
    distance = idealMin - feelsLike;
  } else {
    distance = feelsLike - idealMax;
  }

  const score = 100 - distance * 5;
  return Math.max(0, score);
}

function scoreHumidity(percentage) {
  const idealMin = 30;
  const idealMax = 50;

  if (percentage >= idealMin && percentage <= idealMax) {
    return 100;
  }

  let distance;
  if (percentage < idealMin) {
    distance = idealMin - percentage;
  } else {
    distance = percentage - idealMax;
  }

  const score = 100 - distance * 5;
  return Math.max(0, score);
}

function scoreWind(speed) {
  const idealMax = 3.3;

  if (speed <= idealMax) {
    return 100;
  }

  const distance = speed - idealMax;
  const score = 100 - distance * 5;
  return Math.max(0, score);
}

function calculateComfortIndex(weatherData) {
  const tempScore = scoreTemperature(weatherData.main.feels_like);
  const humidityScore = scoreHumidity(weatherData.main.humidity);
  const windScore = scoreWind(weatherData.wind.speed);

  const comfortIndex =
    tempScore * 0.35 + humidityScore * 0.45 + windScore * 0.2;

  return Math.round(comfortIndex);
}

async function getRankedCities() {
  const allWeatherData = await getAllCitiesWeather(); // array of all 10 cities' raw data

  const cityScores = allWeatherData.map((data) => {
    return {
      cityName: data.name,
      description: data.weather[0].description,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      comfortScore: calculateComfortIndex(data),
    };
  });

  // sort by comfortScore, highest first
  cityScores.sort((a, b) => b.comfortScore - a.comfortScore);

  // add rank number to each
  const rankedCities = cityScores.map((city, index) => {
    return {
      rank: index + 1,
      ...city,
    };
  });

  return rankedCities;
}

//Debugging endpoints
app.get("/test-all", async (req, res) => {
  const allWeatherData = await getAllCitiesWeather();
  res.json(allWeatherData);
});

app.get('/test', async (req, res) => {
    const getWeatherData = await getWeather('1248991'); // colombo city ID
    res.json(getWeatherData);
});

app.get('/test-score', (req, res) => {
  const score = scoreTemperature(33.53); // Colombo's feels_like from earlier
  res.json({ feelsLike: 33.53, score: score });
});

app.get('/test-humidity', (req, res) => {
  const score = scoreHumidity(70);  
  res.json({ humidity: 70, score: score });
});

app.get('/test-wind', (req, res) => {
  const score = scoreWind(7.2);  
  res.json({ wind: 7.2, score: score });
});

app.get('/test-comfort-index', async (req, res) => {  
  const weatherData = await getWeather('1248991');      
  const comfortIndex = calculateComfortIndex(weatherData);
  res.json({ comfortIndex: comfortIndex });
});

app.get('/ranked-cities', async (req, res) => {
  const rankedCities = await getRankedCities();
  res.json(rankedCities);
});

app.get('/cache-status', (req, res) => {
  const cityList = citiesData.List;

  const status = cityList.map((city) => {
    const cached = weatherCache.get(city.CityCode);
    const isFresh = cached && Date.now() - cached.timestamp < CACHE_DURATION;

    return {
      cityName: city.CityName,
      cityCode: city.CityCode,
      cacheStatus: isFresh ? 'HIT' : 'MISS',
    };
  });

  res.json(status);
});

app.get('/',(req,res) => {
    res.json({message:'openweathermap is running'});
})

const PORT = process.env.PORT || 5000;
app.listen (PORT, () =>{
console.log(`Server running on port ${PORT}`);
})