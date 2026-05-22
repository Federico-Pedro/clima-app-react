import { useState, useEffect } from 'react'
import './WheatherApp.css'
import Thermometer from "./Thermometer";
import DigitalClock from "./DigitalClock"
import AnalogicalClock from "./AnalogicalClock"
import Card from "./components/Card"

export const WheatherApp = () => {


    const [city, setCity] = useState('')
    const [weatherData, setWeatherData] = useState(null)
    const [error, setError] = useState(null)
    const [nightMode, setNightMode] = useState(false)


    const urlBase = 'https://api.openweathermap.org/data/2.5/weather'
    const API_KEY = import.meta.env.VITE_API_KEY

    const difKelvin = 273.15


    useEffect(() => {
        function revisarModoNoche() {
            const hora = new Date().getHours();
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


    //Gets user location, fetches wheater data on that location and sets it tu weatherData
    useEffect(() => {
        async function fetchInfo() {
            const response = await fetch('http://ip-api.com/json/');
            const location = await response.json();
            console.log(location)
            const weatherResponse = await fetch(`${urlBase}?q=${location.city}&appid=${API_KEY}&lang=es`);
            const weatherData = await weatherResponse.json();
            console.log(weatherData)
            setWeatherData(weatherData);
            setError(null)
        }
        fetchInfo();

    }, []);



    return (
        <div className="dashboard">

            <div className="header card-widest">
                Dashboard - {weatherData?.name}, {weatherData?.sys?.country}
            </div>


            <Card size="large">
                <p>Local time</p>
                <AnalogicalClock nightMode={nightMode} />
            </Card>



            {weatherData && (
                <>
                    
                    <Card size="large">
                        <p>Temperature {Math.floor(weatherData.main.temp - difKelvin)} ºC</p>
                        <Thermometer value={Math.floor(weatherData.main.temp - difKelvin)} width={400} />

                    </Card>


                    <Card size="large">

                        <p>Weather</p>
                        
                        <div className="icon">

                            <img
                                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                alt={weatherData.weather[0].description} />
                        </div>
                    </Card>
                    
                    <Card size="large">
                        <iframe src={`https://maps.google.com/maps?q=${weatherData.coord.lat},${weatherData.coord.lon}&hl=es;z=14&amp&output=embed`}></iframe>
                    </Card>
                </>



            )}


        </div>

    )
}
