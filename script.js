Script · JS
Copy

/* ====================================================
   SkyKiss - script.js
   
   FEATURES IMPLEMENTED:
   1. API Integration (fetch from OpenWeatherMap)
   2. Search functionality
   3. Recent Searches (saved in localStorage)
   4. Dark / Light Mode toggle
   5. Save weather results
   6. Filter by city name using .filter() HOF
   7. Sort results using .sort() HOF
   8. Loading state & Error handling
   9. Debouncing on filter input
   ==================================================== */
 
 
// ---- API KEY & BASE URL ----
// Sign up for free at https://openweathermap.org/api to get your own API key
const API_KEY = "YOUR_API_KEY_HERE"; // 🔑 Replace this with your key
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
 
 
// ---- GRAB HTML ELEMENTS ----
// We store references to all the elements we'll interact with
const cityInput     = document.getElementById("cityInput");
const searchBtn     = document.getElementById("searchBtn");
const loader        = document.getElementById("loader");
const errorMsg      = document.getElementById("errorMsg");
const weatherCard   = document.getElementById("weatherCard");
const recentSection = document.getElementById("recentSection");
const savedSection  = document.getElementById("savedSection");
const recentList    = document.getElementById("recentList");
const savedList     = document.getElementById("savedList");
const themeToggle   = document.getElementById("themeToggle");
const filterInput   = document.getElementById("filterInput");
const sortSelect    = document.getElementById("sortSelect");
const clearHistory  = document.getElementById("clearHistory");
 
// Quick city buttons
const quickBtns = document.querySelectorAll(".quick-btn");
 
 
// ---- APP STATE ----
// These variables hold the app's current data
let recentSearches = JSON.parse(localStorage.getItem("skyKissRecent")) || [];
let savedWeather   = JSON.parse(localStorage.getItem("skyKissSaved"))  || [];
let isDarkMode     = localStorage.getItem("skyKissDark") === "true";
 
 
// ---- INITIALIZE APP ----
// Run these functions when the page loads
function init() {
  applyTheme();
  renderRecentSearches();
  renderSavedWeather(savedWeather);
}
 
init(); // call on page load
 
 
// ===================================================
// SECTION 1: THEME TOGGLE (Dark / Light Mode)
// ===================================================
 
function applyTheme() {
  if (isDarkMode) {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙 Dark Mode";
  }
}
 
// When user clicks the toggle button
themeToggle.addEventListener("click", function () {
  isDarkMode = !isDarkMode; // flip true/false
  localStorage.setItem("skyKissDark", isDarkMode); // save preference
  applyTheme();
});
 
 
// ===================================================
// SECTION 2: SEARCH FUNCTIONALITY
// ===================================================
 
// Search when user clicks Search button
searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim(); // remove extra spaces
  if (city !== "") {
    fetchWeather(city);
  }
});
 
// Search when user presses Enter key
cityInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    const city = cityInput.value.trim();
    if (city !== "") {
      fetchWeather(city);
    }
  }
});
 
// Quick city buttons
quickBtns.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const city = btn.getAttribute("data-city"); // read city from data attribute
    fetchWeather(city);
  });
});
 
 
// ===================================================
// SECTION 3: FETCH WEATHER FROM API
// ===================================================
 
async function fetchWeather(city) {
  // 1. Show loader, hide previous results and errors
  showLoader();
 
  try {
    // 2. Build the URL with city name and API key
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;
 
    // 3. Call the API using fetch (this is async, so we await)
    const response = await fetch(url);
 
    // 4. If city not found, API returns 404
    if (!response.ok) {
      throw new Error("City not found");
    }
 
    // 5. Convert response to JavaScript object (JSON)
    const data = await response.json();
 
    // 6. Display the weather data
    displayWeather(data);
 
    // 7. Save to recent searches and saved weather
    saveToRecent(data.name);
    saveToSaved(data);
 
  } catch (error) {
    // If anything goes wrong, show error message
    showError();
  }
}
 
 
// ===================================================
// SECTION 4: DISPLAY WEATHER DATA
// ===================================================
 
function displayWeather(data) {
  // Extract needed values from API response
  const city        = data.name;
  const country     = data.sys.country;
  const temp        = Math.round(data.main.temp);
  const feelsLike   = Math.round(data.main.feels_like);
  const description = data.weather[0].description;
  const humidity    = data.main.humidity;
  const windKmh     = Math.round(data.wind.speed * 3.6); // convert m/s to km/h
  const visibilityKm = (data.visibility / 1000).toFixed(1);
  const minTemp     = Math.round(data.main.temp_min);
  const maxTemp     = Math.round(data.main.temp_max);
  const weatherMain = data.weather[0].main; // e.g. "Rain", "Clear"
 
  // Put values into the HTML elements
  document.getElementById("cityName").textContent    = city;
  document.getElementById("countryName").textContent = country;
  document.getElementById("temperature").textContent = `${temp}°C`;
  document.getElementById("feelsLike").textContent   = `Feels like ${feelsLike}°C`;
  document.getElementById("description").textContent = description;
  document.getElementById("humidity").textContent    = `${humidity}%`;
  document.getElementById("windSpeed").textContent   = `${windKmh} km/h`;
  document.getElementById("visibility").textContent  = `${visibilityKm} km`;
  document.getElementById("minMax").textContent      = `${minTemp} / ${maxTemp}°C`;
  document.getElementById("weatherIcon").textContent = getWeatherEmoji(weatherMain);
 
  // Show the card
  hideLoader();
  weatherCard.classList.remove("hidden");
  errorMsg.classList.add("hidden");
}
 
 
// ===================================================
// SECTION 5: WEATHER EMOJI HELPER
// ===================================================
 
// Returns an emoji based on the type of weather
function getWeatherEmoji(weatherMain) {
  const emojiMap = {
    "Clear"       : "☀️",
    "Clouds"      : "☁️",
    "Rain"        : "🌧️",
    "Drizzle"     : "🌦️",
    "Thunderstorm": "⛈️",
    "Snow"        : "❄️",
    "Mist"        : "🌫️",
    "Fog"         : "🌫️",
    "Haze"        : "🌁",
    "Dust"        : "🌪️",
    "Sand"        : "🌪️",
    "Wind"        : "💨",
  };
  // Return matching emoji, or default sun if not found
  return emojiMap[weatherMain] || "🌤️";
}
 
 
// ===================================================
// SECTION 6: RECENT SEARCHES
// ===================================================
 
function saveToRecent(cityName) {
  // Remove if already exists (avoid duplicates) — uses .filter() HOF
  recentSearches = recentSearches.filter(function (name) {
    return name.toLowerCase() !== cityName.toLowerCase();
  });
 
  // Add city to the front of the list
  recentSearches.unshift(cityName);
 
  // Keep only the last 8 searches
  recentSearches = recentSearches.slice(0, 8);
 
  // Save to localStorage
  localStorage.setItem("skyKissRecent", JSON.stringify(recentSearches));
 
  // Update the display
  renderRecentSearches();
}
 
function renderRecentSearches() {
  if (recentSearches.length === 0) {
    recentSection.classList.add("hidden");
    return;
  }
 
  recentSection.classList.remove("hidden");
  recentList.innerHTML = ""; // clear existing tags
 
  // Create a tag for each recent city — uses .forEach() HOF
  recentSearches.forEach(function (city) {
    const tag = document.createElement("button");
    tag.textContent = city;
    tag.className = "recent-tag";
    tag.addEventListener("click", function () {
      fetchWeather(city); // click to search again
    });
    recentList.appendChild(tag);
  });
}
 
// Clear all recent searches
clearHistory.addEventListener("click", function () {
  recentSearches = [];
  localStorage.removeItem("skyKissRecent");
  recentSection.classList.add("hidden");
});
 
 
// ===================================================
// SECTION 7: SAVED WEATHER RESULTS
// ===================================================
 
function saveToSaved(data) {
  const cityName = data.name;
 
  // Remove if city already saved — uses .filter() HOF
  savedWeather = savedWeather.filter(function (item) {
    return item.city.toLowerCase() !== cityName.toLowerCase();
  });
 
  // Add new entry at the front
  savedWeather.unshift({
    city       : data.name,
    country    : data.sys.country,
    temp       : Math.round(data.main.temp),
    description: data.weather[0].description,
    humidity   : data.main.humidity,
    icon       : getWeatherEmoji(data.weather[0].main),
    wind       : Math.round(data.wind.speed * 3.6),
  });
 
  // Keep only 12 saved cities
  savedWeather = savedWeather.slice(0, 12);
 
  // Save to localStorage
  localStorage.setItem("skyKissSaved", JSON.stringify(savedWeather));
 
  // Refresh display
  renderSavedWeather(savedWeather);
}
 
 
// ===================================================
// SECTION 8: FILTER & SORT (using Array HOFs)
// ===================================================
 
// Filter saved weather cards by city name
function filterSaved(searchText) {
  // .filter() keeps only items where city name includes the search text
  const filtered = savedWeather.filter(function (item) {
    return item.city.toLowerCase().includes(searchText.toLowerCase());
  });
  sortAndRender(filtered);
}
 
// Sort the filtered results
function sortAndRender(list) {
  const sortBy = sortSelect.value;
  let sorted;
 
  if (sortBy === "temp-asc") {
    // .sort() with comparison function — low temp first
    sorted = list.sort(function (a, b) { return a.temp - b.temp; });
 
  } else if (sortBy === "temp-desc") {
    // High temp first
    sorted = list.sort(function (a, b) { return b.temp - a.temp; });
 
  } else if (sortBy === "name-asc") {
    // Alphabetical A to Z — localeCompare handles strings
    sorted = list.sort(function (a, b) { return a.city.localeCompare(b.city); });
 
  } else if (sortBy === "humidity-desc") {
    // Highest humidity first
    sorted = list.sort(function (a, b) { return b.humidity - a.humidity; });
 
  } else {
    // Default: no sorting
    sorted = list;
  }
 
  renderSavedWeather(sorted);
}
 
// Render the saved weather cards on screen
function renderSavedWeather(list) {
  if (list.length === 0) {
    savedSection.classList.add("hidden");
    return;
  }
 
  savedSection.classList.remove("hidden");
  savedList.innerHTML = ""; // clear existing cards
 
  // Use .forEach() to loop and create a card for each city
  list.forEach(function (item) {
    const card = document.createElement("div");
    card.className = "saved-card";
    card.innerHTML = `
      <div class="saved-card-icon">${item.icon}</div>
      <div class="saved-card-city">${item.city}, ${item.country}</div>
      <div class="saved-card-temp">${item.temp}°C</div>
      <div class="saved-card-desc">${item.description}</div>
    `;
    // Click on saved card to search that city again
    card.addEventListener("click", function () {
      fetchWeather(item.city);
    });
    savedList.appendChild(card);
  });
}
 
// Listen for typing in filter box
// Uses DEBOUNCING to avoid calling filter on every keystroke
let debounceTimer;
filterInput.addEventListener("input", function () {
  clearTimeout(debounceTimer); // cancel the previous timer
  debounceTimer = setTimeout(function () {
    filterSaved(filterInput.value); // only run after 300ms of no typing
  }, 300);
});
 
// Listen for sort dropdown change
sortSelect.addEventListener("change", function () {
  filterSaved(filterInput.value); // re-filter + re-sort
});
 
 
// ===================================================
// SECTION 9: LOADING STATE HELPERS
// ===================================================
 
function showLoader() {
  loader.classList.remove("hidden");
  weatherCard.classList.add("hidden");
  errorMsg.classList.add("hidden");
}
 
function hideLoader() {
  loader.classList.add("hidden");
}
 
function showError() {
  loader.classList.add("hidden");
  errorMsg.classList.remove("hidden");
  weatherCard.classList.add("hidden");
}
 