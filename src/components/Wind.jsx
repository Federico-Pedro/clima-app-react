import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";



const MIN = 0;
const MAX = 360;


const angleSeconds = d3.scaleLinear()
    .domain([MIN, MAX])
    .range([0, (2 * Math.PI)]);



    const windDegrees = {
        N: 0, NNE: 22.5, NE: 45, ENE: 67.5,
        E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
        S: 180, SSW: 202.5, SW: 225, WSW: 247.5,
        W: 270, WNW: 292.5, NW: 315, NNW: 337.5
    };

export default function GaugeChart({ value = 'N', width = 350, nightMode }) {


    const degrees = windDegrees[value] ?? 0;


    const svgRef = useRef(null);

    const secondNeedleRef = useRef(null);

    const color = nightMode ? "#a3b1c6" : "#242424";
    const color2 = nightMode ? "#6e7785" : "#555454";

    const [direction, setDirection] = useState(degrees)

    const height = width * 0.6;
    const cx = width / 2;
    const cy = height / 2;
    const outerRadius = width * 0.25;
    const innerRadius = outerRadius * 0.85;

    useEffect(() => {
        const intervalo = setInterval(() => {
            setDirection(windDegrees[value] ?? 0) // ← grados, no string
        }, 100000);
        return () => clearInterval(intervalo);
    }, [value]);

    // Dibuja los arcos y ticks — solo se ejecuta una vez al montar
    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const arcGenerator = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const totalSegmentos = 36;
        const angleScale = d3.scaleLinear()
            .domain([0, totalSegmentos])
            .range([0, 2 * Math.PI]);

        d3.range(totalSegmentos).forEach((i) => {
            svg.append("path")
                .attr("d", arcGenerator({
                    startAngle: angleScale(i),
                    endAngle: angleScale(i + 1),
                }))
                .attr("fill", i % 2 === 0 ? color : color2)
                .attr("opacity", 0.85)
                .attr("transform", `translate(${cx}, ${cy})`);
        });


        // Ticks de escala
        const tickValues = d3.range(MIN, MAX, 10);
        tickValues.forEach((val) => {
            const angle = angleSeconds(val);
            const rOuter = outerRadius + 10;
            const rInner = outerRadius + 2;

            // Línea del tick
            svg.append("line")
                .attr("x1", cx + rOuter * Math.cos(angle - Math.PI / 2))
                .attr("y1", cy + rOuter * Math.sin(angle - Math.PI / 2))
                .attr("x2", cx + rInner * Math.cos(angle - Math.PI / 2))
                .attr("y2", cy + rInner * Math.sin(angle - Math.PI / 2))
                .attr("stroke", color)
                .attr("stroke-width", 1);

            // Etiqueta

            const cardinales = { 0: 'N', 1: 'NE', 2: 'E', 3: 'SE', 4: 'S', 5: 'SW', 6: 'W', 7: 'NW' };
            const tickValues = [0, 1, 2, 3, 4, 5, 6, 7];

            tickValues.forEach((val) => {
                const angle = (val * Math.PI / 4);

                const rLabel = outerRadius + 22;
                svg.append("text")
                    .attr("x", cx + rLabel * Math.cos(angle - Math.PI / 2))
                    .attr("y", cy + rLabel * Math.sin(angle - Math.PI / 2) + 4)
                    .attr("text-anchor", "middle")
                    .attr("font-size", "12px")
                    .attr("font-weight", "100")
                    .attr("fill", color)
                    .text(cardinales[val]);
            });

        });



        //Aguja de los segundos
        const needleSeconds = svg.append("g")
            .attr("transform", `translate(${cx}, ${cy})`);

        needleSeconds.append("line")
            .attr("class", "needle-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", -(innerRadius - 10))
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
        const initialSec = angleSeconds(direction) * (180 / Math.PI);
        needleSeconds.attr("transform", `translate(${cx}, ${cy}) rotate(${initialSec})`);

    }, [width, color]); // se redibuja solo si cambia el tamaño




    // Anima la aguja cada vez que cambian los segundos
    useEffect(() => {
        if (!secondNeedleRef.current) return;

        const targetDeg = angleSeconds(
            Math.max(0, Math.min(360, direction)) 
        ) * (180 / Math.PI);

        secondNeedleRef.current
            .transition()
            .duration(500)
            .ease(d3.easeCubicOut)
            .attr("transform", `translate(${cx}, ${cy}) rotate(${targetDeg})`);

    }, [direction]); //cambia cada vez que los segundos se actualizan







    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ overflow: "visible" }}
        />
    );
}