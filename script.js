const API_KEY = "YOUR_API_KEY"; // put your API key here

let cities = ["Delhi", "Mumbai", "London", "New York", "Tokyo"];
let weatherData = [];

// Fetch Weather Data
async function fetchWeather() {
  document.getElementById("loading").style.display = "block";

  try {
    const promises = cities.map(city =>
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
        .then(res => res.json())
    );

    weatherData = await Promise.all(promises);

    displayData(weatherData);

  } catch (error) {
    console.log("Error:", error);
  }

  document.getElementById("loading").style.display = "none";
}

// Display using MAP
function displayData(data) {
  const container = document.getElementById("weatherContainer");

  container.innerHTML = data.map(item => `
    <div class="card">
      <h3>${item.name}</h3>
      <p>🌡 Temp: ${item.main.temp}°C</p>
      <p>☁️ ${item.weather[0].main}</p>
    </div>
  `).join("");
}

// SEARCH using FILTER
document.getElementById("searchInput").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();

  const filtered = weatherData.filter(city =>
    city.name.toLowerCase().includes(value)
  );

  displayData(filtered);
});

// SORT using SORT
function sortTemp() {
  const sorted = [...weatherData].sort((a, b) => a.main.temp - b.main.temp);
  displayData(sorted);
}

// FILTER (Hot cities > 25°C)
function filterHot() {
  const hotCities = weatherData.filter(city => city.main.temp > 25);
  displayData(hotCities);
}

// Dark Mode
function toggleMode() {
  document.body.classList.toggle("dark");
}

// Call API
fetchWeather();
