import { useState, useEffect } from 'react'
import './WheatherApp.css'
import Thermometer from "./Thermometer";
import DigitalClock from "./DigitalClock"
import AnalogicalClock from "./AnalogicalClock"

export const WheatherApp = () => {


    const [city, setCity] = useState('')
    const [weatherData, setWeatherData] = useState(null)
    const [error, setError] = useState(null)


    const urlBase = 'https://api.openweathermap.org/data/2.5/weather'
    const API_KEY = import.meta.env.VITE_API_KEY

    const difKelvin = 273.15


    function revisarModoNoche() {
        const hora = new Date().getHours();
        if (hora >= 19 || hora < 7) { document.body.classList.add('night-mode'); }
        else { document.body.classList.remove('night-mode'); }
    }
    // revisarModoNoche();
    setInterval(revisarModoNoche, 60000);



    const fetchWeatherData = async () => {
        setError(null)
        setWeatherData(null)
        try {
            const response = await fetch(`${urlBase}?q=${city}&appid=${API_KEY}&lang=es`)

            if (response.status === 404) {
                setError('Ciudad no encontrada')
                return
            }
            if (response.status === 400) {
                setError('Ingresá el nombre de una ciudad')
                return
            }

            const data = await response.json()
            setWeatherData(data)
            console.log(data)
        } catch (error) {
            setError('Error de conexión')
        }
    }



    const handleCityChange = (event) => {
        setCity(event.target.value)

    }


    const handleSubmit = (event) => {
        event.preventDefault();
        fetchWeatherData()
        setCity('')      //Vacía el input

    }



    return (
        <>
            <div className="container">
                <h1>Weather App</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Ingresa ciudad"
                        value={city}
                        onChange={handleCityChange}
                    />
                    <button type="submit">Buscar</button>
                </form>

                {error && <h1>{error}</h1>}
                <div className="deep">

                    <p className="title">La hora actual es: </p>
                    <AnalogicalClock />
                </div>

            </div>


            {weatherData && (
                <div className="container">

                    {weatherData && <h2>{weatherData.name}, {weatherData.sys.country}</h2>}
                    <div className="deep">

                        <p>La temperatura actual es: {Math.floor(weatherData.main.temp - difKelvin)} ºC</p>
                        <Thermometer value={Math.floor(weatherData.main.temp - difKelvin)} width={400} />

                    </div>
                    <div className="deep">

                        <p>La condición meteorológica actual es: {weatherData.weather[0].description} </p>
                        <div className="icon">

                            <img
                                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                                alt={weatherData.weather[0].description} />
                        </div>
                    </div>

                    <div className="deep">

                        <p>La hora actual es: </p>
                        <DigitalClock />
                    </div>



                    <iframe src={`https://maps.google.com/maps?q=${weatherData.coord.lat},${weatherData.coord.lon}&hl=es;z=14&amp&output=embed`}></iframe>

                </div>
            )}


        </>

    )
}
