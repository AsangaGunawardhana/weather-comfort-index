# Weather Comfort Index App

A weather app that pulls live weather data for 10 cities, works out a "Comfort Index" score for each one using a formula I designed myself, and shows them ranked from most to least comfortable. Login is handled through Auth0, with MFA enabled.

**Tech stack:** Node.js/Express (backend),
                 React + Vite (frontend),
                 Auth0 (authentication),
                 OpenWeatherMap API (data source)

## How to Run This

### Backend
1. Go into the `backend` folder
2. Run `npm install`
3. Create a `.env` file and add:
    OPENWEATHER_API_KEY=your_key_here
    PORT=5000
4. Run `npm run dev` (uses nodemon for auto-restart on file changes), or `node index.js` to run it directly
5. It'll start on `http://localhost:5000`

### Frontend
1. Go into the `frontend` folder
2. Run `npm install`
3. Run `npm run dev`
4. It'll open on `http://localhost:5173`

Note: the Auth0 `domain` and `clientId` are hardcoded in `main.jsx` rather than in an environment variable, since they aren't sensitive secrets — a Single Page Application's Client ID is meant to be public. The `OPENWEATHER_API_KEY` is the only value that actually needs to stay private, which is why it's the one kept in `.env`.

### Test login
- Email: `careers@fidenz.com`
- Password: `Pass#fidenz`

## How the Comfort Index Works

I combined three weather factors into one score out of 100:

- **Temperature (35% weight)** – I used "feels like" temperature instead of the actual temperature, because how hot something feels depends a lot on humidity too, not just the number on a thermometer. Ideal range: 23–27°C, based on an ASHRAE thermal comfort standard from 1992.
- **Humidity (45% weight)** – Ideal range: 30–50%, based on EPA/ASHRAE guidelines. I gave this the highest weight because, from my own experience, humidity affects how uncomfortable a day feels more than temperature does.
- **Wind speed (20% weight)** – Ideal range: 0–3.3 m/s, based on pedestrian wind comfort research. Wind matters least of the three — it only starts feeling bad once it gets noticeably strong.

If a value falls inside its ideal range, it scores 100. Outside that range, it loses 5 points for every unit it's away from the range, down to a minimum of 0.

Final formula:
`comfortIndex = (tempScore × 0.35) + (humidityScore × 0.45) + (windScore × 0.20)`

## Why I Weighted Things This Way

I decided the weights by comparing what actually bothers me more: a hot day with low humidity, or the same temperature with high humidity. Humidity made a bigger difference to how uncomfortable it felt, so I gave it the highest weight. Temperature came second, and wind speed last, since wind only becomes a real problem once it's quite strong.

## Trade-offs I Made

- **One fixed comfort range for every city** – In reality, people in hot climates get used to higher temperatures feeling "normal," while people in cold climates have a different comfort zone. I used one fixed range for every city for simplicity, which means tropical cities can score lower than they'd actually feel to someone living there.
- **In-memory cache instead of Redis** – I used a simple JavaScript Map to cache data in memory rather than something like Redis. This is fine for a single server like this project, but wouldn't work if this were running across multiple servers — Redis would be the better choice there.
- **Same penalty rate for all three factors** – Every factor loses 5 points per unit outside its ideal range. In a more refined version, each factor could have its own rate, since temperature, humidity, and wind probably don't affect comfort at the same "speed."

## How Caching Works

I cache the raw weather data from OpenWeatherMap in memory, using a Map, along with a timestamp for when it was fetched. Before making a new API call, the app checks if there's already cached data for that city that's less than 5 minutes old — if so, it reuses it (a "HIT") instead of calling the API again (a "MISS"). There's a `/cache-status` endpoint that shows the HIT/MISS status for all 10 cities.

## Known Limitations

- Auth0 doesn't allow Email to be the only MFA method — it has to be paired with another method, so I also enabled One-Time Password. During testing, Auth0 defaulted to asking for the OTP code first rather than email.
- I only cache the raw weather data, not the final processed/ranked results separately — this was listed as optional in the assignment, and I prioritized the required parts given the time I had.
- Comfort ranges are the same for every city rather than adjusted by climate.
- I didn't get to the bonus features (unit tests, sorting, graphs) due to time constraints, and focused on getting the core requirements solid instead.
- Dark mode works correctly, but the choice doesn't persist across page reloads — it always resets to light mode by default (the initial state), regardless of what was previously selected.
