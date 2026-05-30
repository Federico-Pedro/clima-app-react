import { useState, useEffect } from 'react'
import './WheatherApp.css'
import Thermometer from "./components/Thermometer";
import DigitalClock from "./components/DigitalClock"
import AnalogicalClock from "./components/AnalogicalClock"
import Wind from "./components/Wind"
import Card from "./components/Card"
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css';

export const WheatherApp = () => {

    const symbolToEmoji = {
        1: '☀️',   // Clear
        2: '🌥️',   // High clouds
        3: '⛅',   // Scattered clouds
        4: '☁️',   // Cloudy
        5: '🌦️',   // Light rain
        6: '🌧️',   // Rain
        7: '⛈️',   // Thunderstorm
        8: '🌨️',   // Snow
    }

    const [city, setCity] = useState('')
    const [country, setCountry] = useState('')
    const [weatherData, setWeatherData] = useState(null)
    const [error, setError] = useState(null)
    const [nightMode, setNightMode] = useState(false)
    const [hour, setHour] = useState(new Date().getHours())

    const urlBase = import.meta.env.VITE_API_URL;

    const today = new Date();

    useEffect(() => {
        function revisarModoNoche() {
            const hora = new Date().getHours();

            setHour(hora)
            if (hora >= 19 || hora < 7) {
                document.body.classList.add('night-mode');
                setNightMode(true);
            } else {
                document.body.classList.remove('night-mode');
                setNightMode(false);
            }
        }

        revisarModoNoche();
        const intervalo = setInterval(revisarModoNoche, 60000);
        return () => clearInterval(intervalo);
    }, []);


    //Gets user location, fetches wheater data on that location and sets it to weatherData
    useEffect(() => {
        async function fetchInfo() {

            // 1. Revisar si hay cache válido (menos de 1 hora)
            const cached = localStorage.getItem('weatherData');
            console.log(cached ? "Hay info" : "No hay info")
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const unaHora = 60 * 60 * 1000;
                if (Date.now() - timestamp < unaHora) {
                    setWeatherData(data);
                    console.log(data)

                    return;
                }
            }

            // 2. Si no hay cache o expiró, hacés el fetch normal
            const response = await fetch('http://ip-api.com/json/');
            const location = await response.json();
            const zip = location.zip;
            const country = location.country
            setCountry(country);
            const locationsResponse = await fetch(`${urlBase}api/weather/${zip}`);
            const locationsData = await locationsResponse.json();

            const match = locationsData.data.locations.find(loc => loc.country_name === country);
            if (!match) {
                console.error('No se encontró la ubicación para:', countryName);
                return;
            }
            const hash = match.hash;

            const weatherResponse = await fetch(`${urlBase}api/weather/forecast/${hash}`);
            const weatherData = await weatherResponse.json();

            // 3. Guardar en cache con timestamp
            localStorage.setItem('weatherData', JSON.stringify({
                data: weatherData.data,
                timestamp: Date.now()
            }));

            setWeatherData(weatherData.data);
            console.log(weatherData.data)
        }

        fetchInfo();
    }, []);




    return (
        <div className="dashboard">

            <div className="header card-widest">
                Dashboard - {weatherData?.name}, {country}
            </div>


            <Card size="large">
                <p className="up">Local time</p>
                <AnalogicalClock nightMode={nightMode} />
            </Card>



            {weatherData && (
                <>

                    <Card size="large">
                        <p className="up">Temperature: {weatherData.hours[hour].temperature} ºC</p>
                        <Thermometer value={Math.floor(weatherData.hours[hour].temperature)} width={400} nightMode={nightMode} />

                    </Card>

                    <Card size="large">

                        <p className="up">Weather</p>

                        <div className="icon">
                            {symbolToEmoji[weatherData.hours[hour].symbol] || '🌡️'}
                        </div>
                    </Card>

                    <Card size="large">
                        <Calendar defaultValue={today} />
                    </Card>


                    <Card size="large">
                        <p className="up">Wind speed: {Math.round(weatherData.hours[hour].wind_speed)} - {Math.round(weatherData.hours[hour].wind_gust
                        )} Km/h</p>
                        <Wind value={weatherData.hours[hour].wind_direction} width={350} nightMode={nightMode} />
                    </Card>

                    {/* <Card size="large">
                        <iframe src={`https://maps.google.com/maps?q=${weatherData.coord.lat},${weatherData.coord.lon}&hl=es;z=14&amp&output=embed`}></iframe>
                    </Card> */}
                </>



            )}


        </div>

    )
}
