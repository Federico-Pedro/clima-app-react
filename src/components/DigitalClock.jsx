import { useState, useEffect } from 'react'

export default function DigitalClock() {

    const [date, setDate] = useState(new Date())

    useEffect(() => {
        const intervalo = setInterval(() => {
            setDate(new Date());

        }, 1000);

        return () => clearInterval(intervalo);
    }, []);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return (
        <div>

            {hours}:{minutes}:{seconds}
        </div>
    )
}