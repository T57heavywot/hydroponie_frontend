import React from "react";
import { Line } from "react-chartjs-2";

interface SystemHistoryChartProps {
  sensorData: Array<{
    timestamp: string;
    temperature: number;
    humidity: number;
    lightLevel: number;
    ph: number;
    ec: number;
    nutrients: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
  }>;
}

const SystemHistoryChart: React.FC<SystemHistoryChartProps> = ({ sensorData }) => {
  if (!sensorData.length) return <div>Aucune donnée à afficher.</div>;

  const labels = sensorData.map(data => {
    const date = new Date(data.timestamp);
    return date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Température (°C)",
        data: sensorData.map(d => d.temperature),
        borderColor: "#ef4444",
        backgroundColor: "#ef444420",
        yAxisID: 'y',
        tension: 0.4,
        fill: false,
      },
      {
        label: "Humidité (%)",
        data: sensorData.map(d => d.humidity),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f620",
        yAxisID: 'y1',
        tension: 0.4,
        fill: false,
      },
      {
        label: "pH",
        data: sensorData.map(d => d.ph),
        borderColor: "#a855f7",
        backgroundColor: "#a855f720",
        yAxisID: 'y2',
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: 'Température (°C)' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Humidité (%)' },
      },
      y2: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'pH' },
        offset: true,
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default SystemHistoryChart;