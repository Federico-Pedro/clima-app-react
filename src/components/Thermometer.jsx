import { useEffect, useRef } from "react";
import * as d3 from "d3";

// Zonas de color con su rango de temperatura
const ZONES = [
  { from: -20, to: 0,  color: "#001c38" }, // frío
  { from: 0,  to: 20,  color: "#002b57" }, // templado
  { from: 20, to: 40,  color: "#01468b" }, // cálido
  { from: 40, to: 60,  color: "#005db9" }, // caliente
];

const MIN = -20;
const MAX = 60;

// El semicírculo va de -π/2 (izquierda) a +π/2 (derecha)
// D3 usa ángulos donde 0 = arriba, por eso el offset de -π/2
const angleScale = d3.scaleLinear()
  .domain([MIN, MAX])
  .range([-Math.PI / 2, Math.PI / 2]);

export default function GaugeChart({ value = 20, width = 400, nightMode }) {
  const svgRef = useRef(null);
  const needleRef = useRef(null);
  const height = width * 0.6;
  const cx = width / 2;
  const cy = height * 0.88;
  const outerRadius = width * 0.38;
  const innerRadius = outerRadius * 0.85;
  const color = nightMode ? "#a3b1c6" : "#242424";
  // Dibuja los arcos y ticks — solo se ejecuta una vez al montar
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const arcGenerator = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Arcos de zonas
    ZONES.forEach((zone) => {
      svg.append("path")
        .attr("d", arcGenerator({
          startAngle: angleScale(zone.from),
          endAngle: angleScale(zone.to),
        }))
        .attr("fill", zone.color)
        .attr("opacity", 0.85)
        .attr("transform", `translate(${cx}, ${cy})`);
    });

    // Ticks de escala
    const tickValues = d3.range(MIN, MAX + 1, 5);
    tickValues.forEach((val) => {
      const angle = angleScale(val);
      const isMajor = val % 5 === 0;
      const rOuter = outerRadius + 8;
      const rInner = outerRadius + (isMajor ? 2 : 4);

      // Línea del tick
      svg.append("line")
        .attr("x1", cx + rOuter * Math.cos(angle - Math.PI / 2))
        .attr("y1", cy + rOuter * Math.sin(angle - Math.PI / 2))
        .attr("x2", cx + rInner * Math.cos(angle - Math.PI / 2))
        .attr("y2", cy + rInner * Math.sin(angle - Math.PI / 2))
        .attr("stroke", "#888")
        .attr("stroke-width", isMajor ? 1.5 : 0.8);

      // Etiqueta
      if (isMajor) {
        const rLabel = outerRadius + 22;
        svg.append("text")
          .attr("x", cx + rLabel * Math.cos(angle - Math.PI / 2))
          .attr("y", cy + rLabel * Math.sin(angle - Math.PI / 2) + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", "11px")
          .attr("fill", "#888")
          .text(`${val}°`);
      }
    });

    // Grupo de la aguja — lo guardamos en ref para animarlo después
    const needleGroup = svg.append("g")
      .attr("transform", `translate(${cx}, ${cy})`);

    needleGroup.append("line")
      .attr("class", "needle-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", -(innerRadius - 10))
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round");

    needleGroup.append("circle")
      .attr("r", 7)
      .attr("fill", color);

    needleGroup.append("circle")
      .attr("r", 3.5)
      .attr("fill", !color);

    needleRef.current = needleGroup;

    // Posición inicial
    const initialDeg = angleScale(value) * (180 / Math.PI);
    needleGroup.attr("transform", `translate(${cx}, ${cy}) rotate(${initialDeg})`);

  }, [width]); // se redibuja solo si cambia el tamaño

  // Anima la aguja cada vez que cambia el valor
  useEffect(() => {
    if (!needleRef.current) return;

    const targetDeg = angleScale(
      Math.max(MIN, Math.min(MAX, value)) // clamp por las dudas
    ) * (180 / Math.PI);

    needleRef.current
      .transition()
      .duration(500)
      .ease(d3.easeCubicOut)
      .attr("transform", `translate(${cx}, ${cy}) rotate(${targetDeg})`);

  }, [value]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    />
  );
}