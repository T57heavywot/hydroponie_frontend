import React, { useRef, useEffect, useState } from "react";

interface EventBadgeOverlayProps {
  events: { time: string; text: string }[];
  chartRef: React.RefObject<HTMLCanvasElement>;
  xScale: any; // Chart.js scale object
  topOffset?: number;
}

const EventBadgeOverlay: React.FC<EventBadgeOverlayProps> = ({
  events,
  chartRef,
  xScale,
  topOffset = 32,
}) => {
  const [positions, setPositions] = useState<{ x: number; text: string }[]>([]);

  useEffect(() => {
    if (!xScale || !chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const newPositions = events.map((ev) => {
      const x = xScale.getPixelForValue(new Date(ev.time));
      return { x, text: ev.text };
    });
    setPositions(newPositions);
  }, [events, xScale, chartRef]);

  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: "100%", pointerEvents: "none" }}>
      {positions.map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: pos.x - 10,
            top: topOffset,
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#f59e42",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: "bold",
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
            title={pos.text}
          >
            ℹ️
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventBadgeOverlay;
