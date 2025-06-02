import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import humidity_icon from "../assets/humidity.png";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { FaDownload } from "react-icons/fa";


const Weather = () => {
  const navigate = useNavigate();
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [backgroundClass, setBackgroundClass] = useState("clear");
  const [fadeIn, setFadeIn] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  // **Added currentTime state**
  const [currentTime, setCurrentTime] = useState(new Date());

  const allIcons = {
    "01d": clear_icon,
    "01n": clear_icon,
    "02d": cloud_icon,
    "02n": cloud_icon,
    "03d": cloud_icon,
    "03n": cloud_icon,
    "04d": drizzle_icon,
    "04n": drizzle_icon,
    "09d": rain_icon,
    "09n": rain_icon,
    "10d": rain_icon,
    "10n": rain_icon,
    "13d": snow_icon,
    "13n": snow_icon,
  };

  useEffect(() => {
  if (showAlert) {
    const timer = setTimeout(() => {
      Swal.fire({
        title: "Download Our App!",
        text: "Get instant weather updates with our mobile app.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Download Now",
        cancelButtonText: "Maybe Later",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/download");
        }
        setShowAlert(false); // prevent repeat until you reset this
      });
    }, 5000);
    return () => clearTimeout(timer);
  }
}, [showAlert, navigate]);

  const getBackgroundClass = (iconCode) => {
    if (iconCode.includes("13")) return "snow";
    if (iconCode.includes("09") || iconCode.includes("10")) return "rain";
    if (iconCode.includes("04")) return "drizzle";
    if (iconCode.includes("02") || iconCode.includes("03")) return "cloud";
    return "clear";
  };

  const handleInputChange = async (e) => {
    const query = e.target.value;
    if (!query) return setSuggestions([]);

    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${
        import.meta.env.VITE_APP_ID
      }`
    );
    const data = await res.json();
    setSuggestions(data);
  };

  const formatTime = (unix) => {
    const date = new Date(unix * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  const formatCurrentDate = (date) => {
    const weekday = date.toLocaleDateString(undefined, { weekday: "long" }); // Saturday
    const day = date.getDate(); // 31
    const month = date.toLocaleDateString(undefined, { month: "short" }); // May
    const year = date.getFullYear(); // 2025

    return `${weekday} | ${day} ${month}, ${year}`;
  };

  const extractDailyForecast = (list) => {
    const daily = [];
    const seenDates = new Set();

    list.forEach((item) => {
      const [date, time] = item.dt_txt.split(" ");
      if (!seenDates.has(date) && time === "12:00:00") {
        daily.push(item);
        seenDates.add(date);
      }
    });

    return daily;
  };

  const updateWeatherData = (data, forecast) => {
    const icon = allIcons[data.weather[0].icon] || clear_icon;
    const background = getBackgroundClass(data.weather[0].icon);

    setWeatherData({
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      temperature: Math.floor(data.main.temp),
      feelsLike: Math.floor(data.main.feels_like),
      location: data.name,
      icon,
      description: data.weather[0].description,
      date: new Date().toLocaleString(),
      sunrise: formatTime(data.sys.sunrise),
      sunset: formatTime(data.sys.sunset),
    });

    setBackgroundClass(background);
    setFadeIn(true);

    if (forecast) {
      const daily = extractDailyForecast(forecast.list);
      setForecastData(daily);
    }
  };

  const search = async (city) => {
    if (!city) {
      alert("Enter city name");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setFadeIn(false);

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${
          import.meta.env.VITE_APP_ID
        }`
      );
      const weatherJson = await weatherRes.json();

      if (!weatherRes.ok) {
        setErrorMessage(weatherJson.message);
        setWeatherData(null);
        setForecastData([]);
        setLoading(false);
        return;
      }

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${
          import.meta.env.VITE_APP_ID
        }`
      );
      const forecastJson = await forecastRes.json();

      if (!forecastRes.ok) {
        setErrorMessage(forecastJson.message);
        setForecastData([]);
        setLoading(false);
        return;
      }

      updateWeatherData(weatherJson, forecastJson);
    } catch (error) {
      setErrorMessage("Unable to fetch weather data.");
      setWeatherData(null);
      setForecastData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrentTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minStr = minutes < 10 ? "0" + minutes : minutes;
    const secStr = seconds < 10 ? "0" + seconds : seconds;
    return `${hours}:${minStr}:${secStr} ${ampm}`;
  };

  const fetchLocationWeather = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);
        setErrorMessage("");
        setFadeIn(false);
        try {
          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${
              import.meta.env.VITE_APP_ID
            }`
          );
          const weatherJson = await weatherRes.json();

          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${
              import.meta.env.VITE_APP_ID
            }`
          );
          const forecastJson = await forecastRes.json();

          updateWeatherData(weatherJson, forecastJson);
        } catch (error) {
          setErrorMessage("Failed to fetch weather for your location.");
          setWeatherData(null);
          setForecastData([]);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setErrorMessage("Location access denied.");
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    fetchLocationWeather();
  }, []);

  return (
    <div className={`weather ${backgroundClass}`} >
      <div className="weather-container">
        <div className="search-bar">
          <input ref={inputRef} type="text" placeholder="Search city..." />
          <ul className="autocomplete-suggestions">
            {suggestions.map((city, idx) => (
              <li
                key={idx}
                onClick={() => {
                  inputRef.current.value = city.name;
                  setSuggestions([]);
                  search(city.name);
                }}
              >
                {city.name}, {city.country}
              </li>
            ))}
          </ul>
          &nbsp;
          <button
            onClick={() => search(inputRef.current.value)}
            style={{
              cursor: "pointer",
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            Search
          </button>
        </div>

        {loading && (
          <div className="loader">
            <div className="spinner"></div>
          </div>
        )}

        {errorMessage && <div className="error-msg">{errorMessage}</div>}

        {!loading && weatherData && (
          <>
            <div className={`weather-content ${fadeIn ? "fade-in" : ""}`}>
              <div className="weather-left">
                <img
                  src={weatherData.icon}
                  alt="Weather Icon"
                  className="weather-icon"
                />
                <p className="temperature">{weatherData.temperature} &deg; C</p>
                <p className="description">{weatherData.description}</p>
                <p className="location">{weatherData.location}</p>
                <p className="date-time">
                  {" "}
                  {formatCurrentDate(currentTime)} |{" "}
                  {formatCurrentTime(currentTime)}
                </p>
                <p className="feels-like">
                  Feels like: {weatherData.feelsLike} &deg;C
                </p>
                <p className="sunrise-sunset">
                  Sunrise: {weatherData.sunrise} | Sunset: {weatherData.sunset}
                </p>
              </div>

              <div className="weather-right">
                <div className="col">
                  <img src={humidity_icon} alt="Humidity" />
                  <p>{weatherData.humidity} %</p>
                  <span>Humidity</span>
                </div>
                <div className="col">
                  <img src={wind_icon} alt="Wind Speed" />
                  <p>{weatherData.windSpeed} Km/h</p>
                  <span>Wind Speed</span>
                </div>
              </div>
            </div>

            <div className="forecast-container">
              <h3>5-Day Forecast</h3>
              <div className="forecast-list">
                {forecastData.map((day) => {
                  const icon = allIcons[day.weather[0].icon] || clear_icon;
                  const date = new Date(day.dt * 1000).toLocaleDateString(
                    undefined,
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  );
                  const temp = Math.round(day.main.temp);
                  return (
                    <div key={day.dt} className="forecast-item">
                      <p>{date}</p>
                      <img src={icon} alt="icon" />
                      <p>{temp} &deg;C</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => navigate('/download')}
          style={{
            cursor: 'pointer',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#3085d6',
            color: 'white',
            fontWeight: 'bold',
          }}
        >
        <FaDownload />  Download the App
        </button>
      </div>
    </div>
  );
};

export default Weather;
