async function getWeather() {
  const city = document.getElementById("cityInput").value;

  // 🔑 Replace with your API key
  const apiKey = "YOUR_API_KEY";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("city").innerText = data.name;
    document.getElementById("temp").innerText = Math.round(data.main.temp) + "°C";
    document.getElementById("desc").innerText = data.weather[0].description;
    document.getElementById("humidity").innerText = data.main.humidity;
    document.getElementById("wind").innerText = data.wind.speed;

  } catch (error) {
    alert("City not found!");
  }
}
