import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './App.css';

function App() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const [cities, setCities] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  useEffect(() => {
    if (isAuthenticated) {
      fetch('http://localhost:5000/ranked-cities')
        .then((response) => response.json())
        .then((data) => setCities(data));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-body' : '';
  }, [darkMode]);

  if (isLoading) return 'Loading...';

 if (!isAuthenticated) {
   return (
     <div
       className='container'
       style={{ textAlign: 'center', marginTop: '100px' }}
     >
       <h1>Weather Comfort Index</h1>
       {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
       <button className='login-button' onClick={login}>
         Login
       </button>
     </div>
   );
 }

  return (
    <div className='container'>
      <h1>Weather Comfort Index</h1>
      <p style={{ textAlign: 'center' }}>Logged in as {user.email}</p>

      <div className='button-row'>
        <button
          className='logout-button'
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
        <button className='logout-button' onClick={logout}>
          Logout
        </button>
      </div>

      <div className='city-grid'>
        {cities.map((city) => (
          <div className='city-card' key={city.rank}>
            <h3>
              {city.rank}. {city.cityName}
            </h3>
            <p>{city.description}</p>
            <p>Temperature: {city.temperature}°C</p>
            <p>Humidity: {city.humidity}%</p>
            <p>Windspeed: {city.windSpeed}m/s</p>
            <p
              style={{
                color:
                  city.comfortScore >= 70
                    ? 'green'
                    : city.comfortScore >= 40
                      ? 'orange'
                      : 'red',
              }}
            >
              Comfort Score: {city.comfortScore}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
