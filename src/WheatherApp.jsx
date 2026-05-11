import { useState } from 'react'
import './WheatherApp.css'

export const WheatherApp = () => {


    const [city, setCity] = useState('')
    const [weatherData, setWeatherData] = useState(null)

    const urlBase = 'https://api.openweathermap.org/data/2.5/weather'
    const API_KEY = import.meta.env.VITE_API_KEY
    const difKelvin = 273.15




    const fecthWeatherData = async () => {
        try {
            const response = await fetch(`${urlBase}?q=${city}&appid=${API_KEY}&lang=es`)
            const data = await response.json()
            console.log(data)
            setWeatherData(data)
        } catch (error) {
            console.error('Ha habido un error', error)
        }
    }



    const handleCityChange = (event) => {
        setCity(event.target.value)

    }


    const handleSubmit = (event) => {
        event.preventDefault();
        fecthWeatherData()
        setCity('')      //Vacía el input

    }



    return (

        <div className="container">
            <h1>App de clima</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Ingresa ciudad"
                    value={city}
                    onChange={handleCityChange}
                />
                <button type="submit">Buscar</button>
            </form>

            {weatherData && (
                <div>
                    <h2>{weatherData.name}, {weatherData.sys.country}</h2>
                    <p>La temperatura actual es: {Math.floor(weatherData.main.temp - difKelvin)} ºC</p>
                    <p>La condición meteorológica actual es: {weatherData.weather[0].description} </p>
                    <img
                        src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                        alt={weatherData.weather[0].description} />

                    <iframe src={`https://maps.google.com/maps?q=${weatherData.coord.lat},${weatherData.coord.lon}&hl=es;z=14&amp&output=embed`}></iframe>

                </div>
            )}


        </div>


    )
}
