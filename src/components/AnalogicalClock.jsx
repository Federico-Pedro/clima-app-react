import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";


const MIN = 1;
const MAX = 12;


const angleSeconds = d3.scaleLinear()
    .domain([0, 60])
    .range([0, (2 * Math.PI)]);

const angleHours = d3.scaleLinear()
    .domain([1, 13])
    .range([0, (2 * Math.PI)]);

export default function GaugeChart({ value = 0, width = 400, nightMode }) {


    const [date, setDate] = useState(new Date())


    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours();
    const svgRef = useRef(null);

    const secondNeedleRef = useRef(null);
    const minuteNeedleRef = useRef(null);
    const hourNeedleRef = useRef(null);

    const color = nightMode ? "#a3b1c6" : "#242424";

    
    const height = width * 0.6;
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = width * 0.25;
    const innerRadius = outerRadius * 1.03;

    useEffect(() => {
        const intervalo = setInterval(() => {
            setDate(new Date());

        }, 1000);

        return () => clearInterval(intervalo);
    }, []);

    // Dibuja los arcos y ticks — solo se ejecuta una vez al montar
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const arcGenerator = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);


        svg.append("path")
            .attr("d", arcGenerator({
                startAngle: angleHours(0),
                endAngle: angleHours(360),
            }))
            .attr("fill", color)
            .attr("opacity", 0.85)
            .attr("transform", `translate(${cx}, ${cy})`);


        // Ticks de escala
        const tickValues = d3.range(1, 13, 1);
        tickValues.forEach((val) => {
            const angle = angleHours(val);
            const rOuter = outerRadius + 10;
            const rInner = outerRadius + 2;

            // Línea del tick
            svg.append("line")
                .attr("x1", cx + rOuter * Math.cos(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("y1", cy + rOuter * Math.sin(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("x2", cx + rInner * Math.cos(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("y2", cy + rInner * Math.sin(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("stroke", color)
                .attr("stroke-width", 1.5);

            // Etiqueta

            const rLabel = outerRadius + 22;
            svg.append("text")
                .attr("x", cx + rLabel * Math.cos(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("y", cy + rLabel * Math.sin(angle - Math.PI / 2 + (2 * Math.PI / 12)) + 4)
                .attr("text-anchor", "middle")
                .attr("font-size", "11px")
                .attr("fill", color)
                .text(`${val}`);

        });


        //Ticks para los segundos
        const tickSeconds = d3.range(0, 60, 1);
        tickSeconds.forEach((val) => {
            const angle = angleSeconds(val);
            const rOuter = outerRadius + 6;
            const rInner = outerRadius + 2;

            // Línea del tick
            svg.append("line")
                .attr("x1", cx + rOuter * Math.cos(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("y1", cy + rOuter * Math.sin(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("x2", cx + rInner * Math.cos(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("y2", cy + rInner * Math.sin(angle - Math.PI / 2 + (2 * Math.PI / 12)))
                .attr("stroke", color)
                .attr("stroke-width", 1);

        });



        //Aguja de las horas
        const needleHours = svg.append("g")
            .attr("transform", `translate(${cx}, ${cy})`);

        needleHours.append("line")
            .attr("class", "needle-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -(innerRadius - 40))
            .attr("stroke", color)
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");

        needleHours.append("circle")
            .attr("r", 7)
            .attr("fill", color);

        needleHours.append("circle")
            .attr("r", 3.5)
            .attr("fill", "white");

        hourNeedleRef.current = needleHours;

        const initialHour = angleHours(hours % 12) * (180 / Math.PI) + 30;
        needleHours.attr("transform", `translate(${cx}, ${cy}) rotate(${initialHour})`);
        

        //Aguja de los minutos
        const needleMinutes = svg.append("g")
            .attr("transform", `translate(${cx}, ${cy})`);

        needleMinutes.append("line")
            .attr("class", "needle-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -(innerRadius - 25))
            .attr("stroke", color)
            .attr("stroke-width", 2.5)
            .attr("stroke-linecap", "round");

        needleMinutes.append("circle")
            .attr("r", 7)
            .attr("fill", color);

        needleMinutes.append("circle")
            .attr("r", 3.5)
            .attr("fill", "white");

        minuteNeedleRef.current = needleMinutes;

        const initialMinute = angleSeconds(minutes) * (180 / Math.PI);
        needleMinutes.attr("transform", `translate(${cx}, ${cy}) rotate(${initialMinute})`);


        //Aguja de los segundos
        const needleSeconds = svg.append("g")
            .attr("transform", `translate(${cx}, ${cy})`);

        needleSeconds.append("line")
            .attr("class", "needle-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -(innerRadius - 20))
            .attr("stroke", "#990000")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round");

        needleSeconds.append("circle")
            .attr("r", 7)
            .attr("fill", "#990000");

        needleSeconds.append("circle")
            .attr("r", 3.5)
            .attr("fill", "white");

        secondNeedleRef.current = needleSeconds;

        // Posición inicial
        const initialSec = angleSeconds(seconds) * (180 / Math.PI);
        needleSeconds.attr("transform", `translate(${cx}, ${cy}) rotate(${initialSec})`);

    }, [width, color]); // se redibuja solo si cambia el tamaño




    // Anima la aguja cada vez que cambian las horas
    useEffect(() => {
        if (!hourNeedleRef.current) return;

        const targetDeg = angleHours(
            Math.max(0, Math.min(60, hours)) // clamp por las dudas
        ) * (180 / Math.PI) + 30;

        hourNeedleRef.current
            .transition()
            .duration(500)
            .ease(d3.easeCubicOut)
            .attr("transform", `translate(${cx}, ${cy}) rotate(${targetDeg})`);

    }, [hours]); //cambia cada vez que los segundos se actualizan






    // Anima la aguja cada vez que cambian los minutos
    useEffect(() => {
        if (!minuteNeedleRef.current) return;

        const targetDeg = angleSeconds(
            Math.max(0, Math.min(60, minutes)) // clamp por las dudas
        ) * (180 / Math.PI);

        minuteNeedleRef.current
            .transition()
            .duration(500)
            .ease(d3.easeCubicOut)
            .attr("transform", `translate(${cx}, ${cy}) rotate(${targetDeg})`);

    }, [minutes]);



    // Anima la aguja cada vez que cambian los segundos
    useEffect(() => {
        if (!secondNeedleRef.current) return;

        const targetDeg = angleSeconds(
            Math.max(0, Math.min(60, seconds)) // clamp por las dudas
        ) * (180 / Math.PI);

        secondNeedleRef.current
            .transition()
            .duration(500)
            .ease(d3.easeCubicOut)
            .attr("transform", `translate(${cx}, ${cy}) rotate(${targetDeg})`);

    }, [seconds]); //cambia cada vez que los segundos se actualizan







    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ overflow: "visible" }}
        />
    );
}