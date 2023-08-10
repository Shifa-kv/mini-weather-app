import { useEffect, useState } from "react";
import arrow from './icons/arrow.svg'
import location from './icons/location.svg'
import humidity from './icons/humidity.svg'
import temperature from './icons/temperature.svg'

function App() {
  const [State, setState] = useState({ status: false, error: null, loading: false });
  const [coord, setCoord] = useState();
  const [data, setData] = useState();
  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY
  const API_BASE_URL = process.env.REACT_APP_WEATHER_API_BASE_URL

  // Handle tracking geolocation and set coordinates
  const handleLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const current_lat = position.coords.latitude;
        const current_lon = position.coords.longitude;
        setCoord({ lat: current_lat, lon: current_lon });
      },
        (error) => {
          console.error("Geolocation error:", error);
          setState({ ...State, error: "Unable to locate you. Please ensure your browser allows access to your location and try again." });
        });
    } else {
      setState({ ...State, error: 'Geolocation is not supported by this browser.' })
    }
  }

  // Fetch data from API
  const fetchData = async (apiUrl, errorMessage) => {
    setState({ ...State, loading: true });
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const jsonData = await response.json();
        setData(jsonData);
        setState({ status: true, loading: false });
      } else {
        setState({ ...State, error: errorMessage })
      }
    } catch (error) {
      setState({ ...State, error: 'An error occurred. Try again later.' })
    }
  };

  // Handle input from user
  const handleInput = (e) => {
    const { value } = e.currentTarget;
    const apiUrl = `${API_BASE_URL}?q=${value}&units=metric&appid=${API_KEY}`;
    const errorMessage = 'City not found. Please enter a valid city name or try again later.'

    if (e.key === 'Enter') {
      if (value.length <= 2) {
        setState({ ...State, error: 'Please enter a valid city name.' });
        return;
      }
      fetchData(apiUrl, errorMessage)
    }
  }

  // Fetch data from API when coordinates changes
  useEffect(() => {
    const apiUrl = `${API_BASE_URL}?lat=${coord?.lat}&lon=${coord?.lon}&units=metric&appid=${API_KEY}`;
    const errorMessage = 'Weather information is not available at the moment. Try again later.'

    if (coord) {
      fetchData(apiUrl, errorMessage);
    }
  }, [coord])

  return (
    <div className="App">
      {!State.status ? (
        // Render first page with form
        <div className='start'>
          <div className="card-top">
            <h1>Weather App</h1>
          </div>
          <div className='p-3 form-block'>
            {State?.error &&
              <div className="error fade-in">
                {State?.error}
              </div>
            }
            <input
              type='text'
              id='city'
              placeholder='Enter city name'
              onKeyDownCapture={handleInput}
            />
            <p><span>or</span></p>
            <button onClick={handleLocate}>Get Device Location</button>
          </div>
          {State.loading &&
            <div className="loading">
            </div>
          }
        </div>
      ) : (
        // Render the weather information
        <div className='start '>
          <div className="card-top">
            <button
              className="goBack-btn"
              onClick={() => {
                setState({ ...State, status: false });
                setData()
                setCoord()
              }}
            >
              <img src={arrow} alt="Back" width={20} />
            </button>
            <h1>Weather App</h1>
          </div>
          <div className='p-3 card-body fade-in'>
            {data?.weather[0] &&
              <img
                src={`http://openweathermap.org/img/wn/${data?.weather[0]?.icon}@2x.png`}
                alt="weathericon"
                className="weathericon"
              />
            }
            <h2>{Math.round(data?.main?.temp)}° C</h2>
            <p>{data?.weather[0]?.description}</p>
            <p><img src={location} alt="location" width={15} /> {data?.name}, {data?.sys?.country}</p>
          </div>
          <div className="card-footer">
            <div className="card-footer-item fade-in">
              <img src={temperature} alt="Feels like" width={30} />
              <p>
                {Math.round(data?.main?.feels_like)}° C <br />
                <span>
                  Feels like
                </span>
              </p>
            </div>
            <div className="card-footer-item fade-in">
              <img src={humidity} alt="Humidity" width={30} />
              <p>
                {data?.main?.humidity}% <br />
                <span>
                  Humidity
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
