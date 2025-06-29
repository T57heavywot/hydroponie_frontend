import React, { useState, useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Ajout du TimeScale
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import "./App.css";
import WaterLevel from "./WaterLevel";
import GaugeBar from "./GaugeBar";
import EventBadgeOverlay from "./EventBadgeOverlay";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  TimeScale // Enregistrement du TimeScale pour l'axe temporel
);

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
  lightLevel: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  phReservoir: number;
  phBac: number;
  ecReservoir: number;
  ecBac: number;
  oxygenReservoir: number;
  oxygenBac: number;
  waterLevelReservoir: number;
  waterLevelBac: number;
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [waterLevel, setWaterLevel] = useState({ level: 0 });
  const [selectedHours, setSelectedHours] = useState<number>(6);
  const [activeTab, setActiveTab] = useState<string>("Accueil");
  const [selectCharts, setSelectCharts] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [events, setEvents] = useState<
    {
      id: string;
      text: string;
      time: string;
      categories: string[];
    }[]
  >([]);
  // Nouveaux états pour le formulaire d'ajout d'événement
  const [eventText, setEventText] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCategories, setEventCategories] = useState<string[]>([]);

  // Bornes par défaut (modifiable facilement)
  const BORNES = {
    phReservoir: { min: 5.5, max: 6.5 },
    phBac: { min: 5.5, max: 6.5 },
    ecReservoir: { min: 1.2, max: 2.0 },
    ecBac: { min: 1.2, max: 2.0 },
    oxygenReservoir: { min: 80, max: 100 },
    oxygenBac: { min: 80, max: 100 },
    temperature: { min: 18, max: 26 },
    humidity: { min: 40, max: 70 },
    waterLevelReservoir: { min: 20, max: 100 }, // bornes fictives
    waterLevelBac: { min: 10, max: 45 }, // bornes fictives
  };

  // Bornes éditables pour l'UI
  const [editableBornes, setEditableBornes] = useState({ ...BORNES });

  // Liste des graphiques disponibles
  const chartList = [
    {
      key: "oxygenReservoir",
      label: "Oxygène dissous (réservoir)",
      dataKey: "oxygenReservoir",
      color: "#3b82f6",
    },
    {
      key: "oxygenBac",
      label: "Oxygène dissous (bac)",
      dataKey: "oxygenBac",
      color: "#2563eb",
    },
    {
      key: "ecReservoir",
      label: "Conductivité (réservoir)",
      dataKey: "ecReservoir",
      color: "#a855f7",
    },
    {
      key: "ecBac",
      label: "Conductivité (bac)",
      dataKey: "ecBac",
      color: "#7c3aed",
    },
    {
      key: "phReservoir",
      label: "pH (réservoir)",
      dataKey: "phReservoir",
      color: "#f472b6",
    },
    { key: "phBac", label: "pH (bac)", dataKey: "phBac", color: "#f59e42" },
    {
      key: "temperature",
      label: "Température ambiante",
      dataKey: "temperature",
      color: "#3b82f6",
    },
    {
      key: "humidity",
      label: "Humidité ambiante",
      dataKey: "humidity",
      color: "#a855f7",
    },
    {
      key: "waterLevelReservoir",
      label: "Niveau d'eau du réservoir",
      dataKey: "waterLevelReservoir",
      color: "#06b6d4",
    },
    {
      key: "waterLevelBac",
      label: "Niveau d'eau du bac du système",
      dataKey: "waterLevelBac",
      color: "#f43f5e",
    },
  ];

  const chartRefs = useRef<Record<string, any>>({});
  const [chartInstances, setChartInstances] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simuler la récupération des données du backend
        const mockSensorData = generateMockData(selectedHours);
        setSensorData(mockSensorData);
        // Simuler la récupération du niveau d'eau
        const mockWaterLevel = { level: Math.floor(Math.random() * 100) };
        setWaterLevel(mockWaterLevel);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }
    };

    fetchData();
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [selectedHours]);

  const generateMockData = (hours: number): SensorData[] => {
    const now = new Date();
    const data: SensorData[] = [];
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: timestamp.toISOString(),
        temperature: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 20,
        lightLevel: 500 + Math.random() * 300,
        nutrients: {
          nitrogen: 200 + Math.random() * 100, // PPM
          phosphorus: 50 + Math.random() * 30,
          potassium: 150 + Math.random() * 50,
        },
        phReservoir: 5.5 + Math.random() * 2,
        phBac: 5.5 + Math.random() * 2,
        ecReservoir: 1.2 + Math.random() * 0.6,
        ecBac: 1.2 + Math.random() * 0.6,
        oxygenReservoir: 80 + Math.random() * 10, // % saturation
        oxygenBac: 80 + Math.random() * 10,
        waterLevelReservoir: 40 + Math.random() * 60, // 0-100
        waterLevelBac: Math.max(0, 40 + Math.random() * 60 - 55), // 0-100, décalé pour le bac
      });
    }
    return data;
  };

  const handleHoursChange = (hours: number) => {
    setSelectedHours(hours);
  };

  // Génère les annotations pour un graphique donné
  // Correction du typage dans getEventAnnotations
  function getEventAnnotations(category: string) {
    const filtered = events.filter((ev: any) =>
      ev.categories.includes(category)
    );
    const annotationsObj: Record<string, any> = {};
    filtered.forEach((ev: any, idx: number) => {
      annotationsObj[`event${idx}`] = {
        type: "line",
        xMin: new Date(ev.time),
        xMax: new Date(ev.time),
        borderColor: "#f59e42",
        borderWidth: 2,
        label: {
          display: false, // n'affiche pas en permanence
          content: ev.text, // texte complet
          enabled: true,
          position: "start",
          backgroundColor: "#f59e42",
          color: "#fff",
          font: { weight: "bold", size: 12 },
          callout: true, // info-bulle au survol (chartjs-plugin-annotation >= 3.0.0)
        },
      };
    });
    return annotationsObj;
  }

  // Préparer les données pour les graphiques
  // Adapter getChartData pour axe X temporel
  const getChartData = (
    dataKey: keyof SensorData,
    label: string,
    color: string
  ) => {
    if (!sensorData.length) return null;
    return {
      datasets: [
        {
          label,
          data: sensorData.map((data) => ({
            x: new Date(data.timestamp),
            y: typeof data[dataKey] === "object" ? null : data[dataKey],
          })),
          borderColor: color,
          backgroundColor: color + "20",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };
  // Options communes pour les graphiques
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Gestion de la sélection des graphiques
  const handleChartSelect = (key: string) => {
    setSelectedCharts((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Gestion de l’export CSV des graphiques sélectionnés
  const handleExportCSV = () => {
    if (!selectCharts || selectedCharts.length === 0) return;
    // Préparer les entêtes CSV
    let csv = "Heure";
    chartList.forEach((chart) => {
      if (selectedCharts.includes(chart.key)) {
        csv += `;${chart.label}`;
      }
    });
    csv += "\n";
    // Pour chaque point de temps, ajouter les valeurs sélectionnées
    sensorData.forEach((data) => {
      const date = new Date(data.timestamp);
      const hour =
        date.getHours() +
        ":" +
        (date.getMinutes() < 10 ? "0" : "") +
        date.getMinutes();
      let row = `${hour}`;
      chartList.forEach((chart) => {
        if (selectedCharts.includes(chart.key)) {
          // Récupérer la valeur (attention à dataKey)
          const value =
            typeof data[chart.dataKey as keyof SensorData] === "object"
              ? ""
              : data[chart.dataKey as keyof SensorData];
          row += `;${value}`;
        }
      });
      csv += row + "\n";
    });
    // Télécharger le CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export_graphiques.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Récupérer la dernière valeur pour chaque catégorie
  const latestData =
    sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  // Ajout d'une zone de bornes sur les graphiques si applicable
  const getChartOptionsWithBounds = (
    dataKey: keyof typeof BORNES,
    label: string,
    color: string,
    category?: string
  ) => {
    const bounds = editableBornes[dataKey];
    const eventAnnotations = getEventAnnotations(category || "");
    const annotations: Record<string, any> = { ...eventAnnotations };
    if (bounds) {
      annotations.zone = {
        type: "box",
        yMin: bounds.min,
        yMax: bounds.max,
        backgroundColor: "rgba(34,197,94,0.10)",
        borderWidth: 0,
      };
      annotations.minLine = {
        type: "line",
        yMin: bounds.min,
        yMax: bounds.min,
        borderColor: "#22c55e",
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
          display: true,
          content: "Min",
          position: "start",
          color: "#22c55e",
        },
      };
      annotations.maxLine = {
        type: "line",
        yMin: bounds.max,
        yMax: bounds.max,
        borderColor: "#22c55e",
        borderWidth: 2,
        borderDash: [6, 6],
        label: {
          display: true,
          content: "Max",
          position: "end",
          color: "#22c55e",
        },
      };
    }
    return {
      ...chartOptions,
      plugins: {
        ...chartOptions.plugins,
        annotation: {
          annotations,
        },
      },
      scales: {
        x: {
          type: "time" as const, // forcer le littéral
          time: {
            unit: "hour" as const, // forcer le littéral accepté par Chart.js
            displayFormats: {
              hour: "HH:mm",
              minute: "HH:mm",
            },
          },
          title: {
            display: true,
            text: "Heure",
          },
        },
        y: chartOptions.scales.y,
      },
    };
  };

  // Ajout d'un événement
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventText || !eventTime || eventCategories.length === 0) return;
    setEvents((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        text: eventText,
        time: eventTime,
        categories: eventCategories,
      },
    ]);
    setEventText("");
    setEventTime("");
    setEventCategories([]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-600 shadow-md">
        <div className="container mx-auto py-4 px-6">
          <h1 className="text-2xl font-bold text-white">
            Hydroponie - Tableau de Bord
          </h1>
        </div>
      </header>
      {/* Onglets wireframe sous le header */}
      <nav className="bg-white border-b border-gray-300">
        <div className="container mx-auto px-6 flex space-x-2">
          {["Accueil", "Graphiques", "Commandes"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 mt-1 border-b-2 font-medium transition-colors duration-150 focus:outline-none ${
                activeTab === tab
                  ? "border-green-600 text-green-700"
                  : "border-transparent text-gray-700 hover:text-green-600"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>
      <main className="container mx-auto py-8 px-6">
        {activeTab === "Accueil" ? (
          <div className="flex flex-col gap-8">
            {/* Groupe Ambiance */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">Ambiance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Température ambiante */}
                <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl shadow p-6 flex flex-col items-center border border-sky-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-sky-900 mb-1">
                    Température ambiante
                  </h3>
                  <span className="text-3xl font-extrabold text-sky-600 mb-1">
                    {latestData
                      ? latestData.temperature.toFixed(1) + " °C"
                      : "--"}
                  </span>
                  <span className="text-xs text-sky-400">Dernière mesure</span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={40}
                      value={latestData.temperature}
                      optimalMin={BORNES.temperature.min}
                      optimalMax={BORNES.temperature.max}
                      unit="°C"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.temperature.min} -{" "}
                    {BORNES.temperature.max} °C
                  </span>
                </div>
                {/* Humidité ambiante */}
                <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl shadow p-6 flex flex-col items-center border border-violet-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-violet-900 mb-1">
                    Humidité ambiante
                  </h3>
                  <span className="text-3xl font-extrabold text-violet-600 mb-1">
                    {latestData ? latestData.humidity.toFixed(1) + " %" : "--"}
                  </span>
                  <span className="text-xs text-violet-400">
                    Dernière mesure
                  </span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={100}
                      value={latestData.humidity}
                      optimalMin={BORNES.humidity.min}
                      optimalMax={BORNES.humidity.max}
                      unit="%"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.humidity.min} -{" "}
                    {BORNES.humidity.max} %
                  </span>
                </div>
              </div>
            </div>
            {/* Groupe Réservoir */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">
                Réservoir
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Conductivité réservoir */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center border border-purple-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-purple-900 mb-1">
                    Conductivité
                  </h3>
                  <span className="text-3xl font-extrabold text-purple-600 mb-1">
                    {latestData
                      ? latestData.ecReservoir.toFixed(2) + " mS/cm"
                      : "--"}
                  </span>
                  <span className="text-xs text-purple-400">
                    Dernière mesure
                  </span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={3}
                      value={latestData.ecReservoir}
                      optimalMin={BORNES.ecReservoir.min}
                      optimalMax={BORNES.ecReservoir.max}
                      unit="mS/cm"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.ecReservoir.min} -{" "}
                    {BORNES.ecReservoir.max} mS/cm
                  </span>
                </div>
                {/* pH réservoir */}
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl shadow p-6 flex flex-col items-center border border-fuchsia-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-fuchsia-900 mb-1">
                    pH
                  </h3>
                  <span className="text-3xl font-extrabold text-fuchsia-600 mb-1">
                    {latestData ? latestData.phReservoir.toFixed(2) : "--"}
                  </span>
                  <span className="text-xs text-fuchsia-400">
                    Dernière mesure
                  </span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={14}
                      value={latestData.phReservoir}
                      optimalMin={BORNES.phReservoir.min}
                      optimalMax={BORNES.phReservoir.max}
                      unit="pH"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.phReservoir.min} -{" "}
                    {BORNES.phReservoir.max}
                  </span>
                </div>
                {/* Oxygène réservoir */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center border border-blue-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-blue-900 mb-1">
                    Oxygène dissous
                  </h3>
                  <span className="text-3xl font-extrabold text-blue-600 mb-1">
                    {latestData
                      ? latestData.oxygenReservoir.toFixed(1) + " %"
                      : "--"}
                  </span>
                  <span className="text-xs text-blue-400">Dernière mesure</span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={100}
                      value={latestData.oxygenReservoir}
                      optimalMin={BORNES.oxygenReservoir.min}
                      optimalMax={BORNES.oxygenReservoir.max}
                      unit="%"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.oxygenReservoir.min} -{" "}
                    {BORNES.oxygenReservoir.max} %
                  </span>
                </div>
                {/* Niveau d'eau du réservoir */}
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl shadow p-6 flex flex-col items-center border border-cyan-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-cyan-900 mb-1">
                    Niveau d'eau
                  </h3>
                  <WaterLevel level={waterLevel.level} />
                </div>
              </div>
            </div>
            {/* Groupe Bac du système */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">
                Bac du système
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Conductivité bac */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow p-6 flex flex-col items-center border border-purple-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-purple-900 mb-1">
                    Conductivité
                  </h3>
                  <span className="text-3xl font-extrabold text-purple-600 mb-1">
                    {latestData ? latestData.ecBac.toFixed(2) + " mS/cm" : "--"}
                  </span>
                  <span className="text-xs text-purple-400">
                    Dernière mesure
                  </span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={3}
                      value={latestData.ecBac}
                      optimalMin={BORNES.ecBac.min}
                      optimalMax={BORNES.ecBac.max}
                      unit="mS/cm"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.ecBac.min} -{" "}
                    {BORNES.ecBac.max} mS/cm
                  </span>
                </div>
                {/* pH bac */}
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl shadow p-6 flex flex-col items-center border border-fuchsia-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-fuchsia-900 mb-1">
                    pH
                  </h3>
                  <span className="text-3xl font-extrabold text-fuchsia-600 mb-1">
                    {latestData ? latestData.phBac.toFixed(2) : "--"}
                  </span>
                  <span className="text-xs text-fuchsia-400">
                    Dernière mesure
                  </span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={14}
                      value={latestData.phBac}
                      optimalMin={BORNES.phBac.min}
                      optimalMax={BORNES.phBac.max}
                      unit="pH"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.phBac.min} -{" "}
                    {BORNES.phBac.max}
                  </span>
                </div>
                {/* Oxygène bac */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow p-6 flex flex-col items-center border border-blue-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-blue-900 mb-1">
                    Oxygène dissous
                  </h3>
                  <span className="text-3xl font-extrabold text-blue-600 mb-1">
                    {latestData ? latestData.oxygenBac.toFixed(1) + " %" : "--"}
                  </span>
                  <span className="text-xs text-blue-400">Dernière mesure</span>
                  {latestData && (
                    <GaugeBar
                      min={0}
                      max={100}
                      value={latestData.oxygenBac}
                      optimalMin={BORNES.oxygenBac.min}
                      optimalMax={BORNES.oxygenBac.max}
                      unit="%"
                    />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    Intervalle recommandé : {BORNES.oxygenBac.min} -{" "}
                    {BORNES.oxygenBac.max} %
                  </span>
                </div>
                {/* Niveau d'eau du bac du système */}
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl shadow p-6 flex flex-col items-center border border-rose-200 hover:shadow-lg transition">
                  <h3 className="text-base font-semibold text-rose-900 mb-1">
                    Niveau d'eau
                  </h3>
                  <WaterLevel level={Math.max(0, waterLevel.level - 55)} />
                  {waterLevel.level - 55 < 20 && (
                    <div className="mt-4 p-2 bg-red-100 text-red-800 rounded-lg text-sm">
                      Niveau critique! Remplissez le réservoir dès que possible.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "Graphiques" ? (
          <div className="flex flex-col gap-10">
            {/* Formulaire d'ajout d'événement */}
            <form
              onSubmit={handleAddEvent}
              className="mb-6 bg-white rounded-lg shadow p-4 border border-gray-300 flex flex-col md:flex-row md:items-end gap-4"
            >
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Texte de l'événement
                </label>
                <input
                  type="text"
                  className="border rounded px-2 py-1"
                  value={eventText}
                  onChange={(e) => setEventText(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Date/heure
                </label>
                <input
                  type="datetime-local"
                  className="border rounded px-2 py-1"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">
                  Catégories
                </label>
                <div className="flex flex-wrap gap-2">
                  {chartList.map((chart) => (
                    <label
                      key={chart.key}
                      className="flex items-center gap-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={eventCategories.includes(chart.key)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setEventCategories((prev) => [...prev, chart.key]);
                          else
                            setEventCategories((prev) =>
                              prev.filter((k) => k !== chart.key)
                            );
                        }}
                      />
                      {chart.label}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700"
              >
                Ajouter événement
              </button>
            </form>
            {/* Liste des événements existants avec suppression */}
            {events.length > 0 && (
              <div className="mb-6 bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
                <h3 className="text-base font-semibold text-gray-700 mb-2">
                  Événements ajoutés
                </h3>
                <ul className="space-y-2">
                  {events.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 bg-white rounded p-2 border border-gray-200"
                    >
                      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                        <span className="font-medium text-gray-800">
                          {ev.text}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(ev.time).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-600">
                          {ev.categories.map((cat) => {
                            const chart = chartList.find((c) => c.key === cat);
                            return chart ? (
                              <span
                                key={cat}
                                className="inline-block bg-green-100 text-green-800 rounded px-2 py-0.5 mr-1 text-xs"
                              >
                                {chart.label}
                              </span>
                            ) : null;
                          })}
                        </span>
                      </div>
                      <button
                        title="Supprimer l'événement"
                        className="text-red-600 hover:text-red-800 text-xl px-2"
                        onClick={() =>
                          setEvents((prev) =>
                            prev.filter((e) => e.id !== ev.id)
                          )
                        }
                        aria-label="Supprimer"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Section Ambiance */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3">Ambiance</h2>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between border border-gray-300">
                <div className="flex items-center gap-2 mb-2 md:mb-0">
                  {[3, 6, 12, 24].map((hours) => (
                    <button
                      key={hours}
                      className={`px-3 py-1 border border-gray-400 rounded bg-gray-100 font-semibold ${
                        selectedHours === hours ? "bg-green-500 text-white" : ""
                      }`}
                      onClick={() => handleHoursChange(hours)}
                    >
                      {hours} heures
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-2 text-gray-700">
                    Sélection des graphiques
                  </span>
                  <input
                    type="checkbox"
                    className="toggle toggle-sm"
                    checked={selectCharts}
                    onChange={() => setSelectCharts((v) => !v)}
                  />
                  <button
                    className="ml-4 px-4 py-1 bg-white border-2 border-black shadow text-black font-semibold hover:bg-gray-100 disabled:opacity-50"
                    disabled={!selectCharts || selectedCharts.length === 0}
                    onClick={handleExportCSV}
                  >
                    Exporter en CSV
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["temperature", "humidity"].map((key) => {
                  const chart = chartList.find((c) => c.key === key)!;
                  const chartData = getChartData(
                    chart.dataKey as any,
                    chart.label,
                    chart.color
                  );
                  return (
                    <div
                      key={chart.key}
                      className="bg-white rounded-lg shadow-md p-4 border border-gray-300 relative"
                    >
                      {selectCharts && (
                        <input
                          type="checkbox"
                          className="absolute top-2 right-2 w-5 h-5"
                          checked={selectedCharts.includes(chart.key)}
                          onChange={() => handleChartSelect(chart.key)}
                        />
                      )}
                      <h2 className="text-base font-semibold text-gray-800 mb-2">
                        Évolution de {chart.label}
                      </h2>
                      {chartData && (
                        <div style={{ position: "relative" }}>
                          <Line
                            ref={(el) => {
                              if (el) chartRefs.current[chart.key] = el;
                            }}
                            data={chartData}
                            options={getChartOptionsWithBounds(
                              chart.dataKey as any,
                              chart.label,
                              chart.color,
                              chart.key
                            )}
                            redraw={false}
                          />
                          {chartRefs.current[chart.key]?.scales?.x && (
                            <EventBadgeOverlay
                              events={events
                                .filter((ev) =>
                                  ev.categories.includes(chart.key)
                                )
                                .map((ev) => ({
                                  time: ev.time,
                                  text: ev.text,
                                }))}
                              chartRef={{
                                current: chartRefs.current[chart.key].canvas,
                              }}
                              xScale={chartRefs.current[chart.key].scales.x}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Section Réservoir */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">
                Réservoir
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "phReservoir",
                  "oxygenReservoir",
                  "ecReservoir",
                  "waterLevelReservoir",
                ].map((key) => {
                  const chart = chartList.find((c) => c.key === key)!;
                  const chartData = getChartData(
                    chart.dataKey as any,
                    chart.label,
                    chart.color
                  );
                  return (
                    <div
                      key={chart.key}
                      className="bg-white rounded-lg shadow-md p-4 border border-gray-300 relative"
                    >
                      {selectCharts && (
                        <input
                          type="checkbox"
                          className="absolute top-2 right-2 w-5 h-5"
                          checked={selectedCharts.includes(chart.key)}
                          onChange={() => handleChartSelect(chart.key)}
                        />
                      )}
                      <h2 className="text-base font-semibold text-gray-800 mb-2">
                        Évolution de {chart.label}
                      </h2>
                      {chartData && (
                        <div style={{ position: "relative" }}>
                          <Line
                            ref={(el) => {
                              if (el) chartRefs.current[chart.key] = el;
                            }}
                            data={chartData}
                            options={getChartOptionsWithBounds(
                              chart.dataKey as any,
                              chart.label,
                              chart.color,
                              chart.key
                            )}
                            redraw={false}
                          />
                          {chartRefs.current[chart.key]?.scales?.x && (
                            <EventBadgeOverlay
                              events={events
                                .filter((ev) =>
                                  ev.categories.includes(chart.key)
                                )
                                .map((ev) => ({
                                  time: ev.time,
                                  text: ev.text,
                                }))}
                              chartRef={{
                                current: chartRefs.current[chart.key].canvas,
                              }}
                              xScale={chartRefs.current[chart.key].scales.x}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Section Bac du système */}
            <div>
              <h2 className="text-lg font-bold text-gray-700 mb-3 mt-2">
                Bac du système
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["phBac", "oxygenBac", "ecBac", "waterLevelBac"].map((key) => {
                  const chart = chartList.find((c) => c.key === key)!;
                  const chartData = getChartData(
                    chart.dataKey as any,
                    chart.label,
                    chart.color
                  );
                  return (
                    chartData && (
                      <div
                        key={chart.key}
                        className="bg-white rounded-lg shadow-md p-4 border border-gray-300 relative"
                      >
                        {selectCharts && (
                          <input
                            type="checkbox"
                            className="absolute top-2 right-2 w-5 h-5"
                            checked={selectedCharts.includes(chart.key)}
                            onChange={() => handleChartSelect(chart.key)}
                          />
                        )}
                        <h2 className="text-base font-semibold text-gray-800 mb-2">
                          Évolution de {chart.label}
                        </h2>
                        <div style={{ position: "relative" }}>
                          <Line
                            ref={(el) => {
                              if (el) chartRefs.current[chart.key] = el;
                            }}
                            data={chartData}
                            options={getChartOptionsWithBounds(
                              chart.dataKey as any,
                              chart.label,
                              chart.color,
                              chart.key
                            )}
                            redraw={false}
                          />
                          {chartRefs.current[chart.key]?.scales?.x && (
                            <EventBadgeOverlay
                              events={events
                                .filter((ev) =>
                                  ev.categories.includes(chart.key)
                                )
                                .map((ev) => ({
                                  time: ev.time,
                                  text: ev.text,
                                }))}
                              chartRef={{
                                current: chartRefs.current[chart.key].canvas,
                              }}
                              xScale={chartRefs.current[chart.key].scales.x}
                            />
                          )}
                        </div>
                      </div>
                    )
                  );
                })}
              </div>
            </div>
          </div>
        ) : activeTab === "Commandes" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bloc Commandes */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col justify-center border border-gray-300 min-h-[340px]">
              <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    Ouverture des valves
                  </span>
                  <div className="flex gap-4">
                    <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                      Ouverture
                    </button>
                    <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                      Fermeture
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    Ajouter des nutriments
                  </span>
                  <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                    Ajouter
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">
                    Remplir le bac d'eau du système
                  </span>
                  <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                    Remplir
                  </button>
                </div>
              </div>
            </div>
            {/* Bloc graphique Conductivité (réservoir) */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col border border-gray-300 min-h-[340px]">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Évolution de la conductivité (réservoir)
              </h2>
              <div className="flex-1 min-h-[220px]">
                {getChartData(
                  "ecReservoir",
                  "Conductivité (réservoir)",
                  "#a855f7"
                ) ? (
                  <Line
                    data={
                      getChartData(
                        "ecReservoir",
                        "Conductivité (réservoir)",
                        "#a855f7"
                      )!
                    }
                    options={chartOptions}
                  />
                ) : (
                  <div className="text-gray-400 text-sm">
                    Aucune donnée à afficher
                  </div>
                )}
              </div>
            </div>
            {/* Bloc édition des bornes */}
            <div className="bg-white rounded-xl shadow p-8 flex flex-col border border-gray-300 min-h-[340px] mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Modifier les bornes des graphiques
              </h2>
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Les bornes sont déjà modifiées en temps réel dans editableBornes
                }}
              >
                {Object.entries(editableBornes).map(([key, val]) => {
                  const typedKey = key as keyof typeof editableBornes;
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <span className="w-40 font-medium text-gray-700">
                        {key}
                      </span>
                      <label className="text-sm">Min</label>
                      <input
                        type="number"
                        step="any"
                        className="border rounded px-2 py-1 w-20"
                        value={val.min}
                        onChange={(e) =>
                          setEditableBornes((b) => ({
                            ...b,
                            [typedKey]: {
                              ...b[typedKey],
                              min: parseFloat(e.target.value),
                            },
                          }))
                        }
                      />
                      <label className="text-sm">Max</label>
                      <input
                        type="number"
                        step="any"
                        className="border rounded px-2 py-1 w-20"
                        value={val.max}
                        onChange={(e) =>
                          setEditableBornes((b) => ({
                            ...b,
                            [typedKey]: {
                              ...b[typedKey],
                              max: parseFloat(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  );
                })}
              </form>
            </div>
          </div>
        ) : null}
        {/* Information Box */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400 mt-6">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Note pour l'implémentation
          </h3>
          <div className="text-sm text-yellow-700">
            <p>
              On utilise actuellement des données simulées. Pour connecter vos
              capteurs réels, on doit:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                Modifier le backend (server.js) pour recevoir les données des
                capteurs physiques
              </li>
              <li>
                Adapter le format des données selon nos capteurs spécifiques
              </li>
              <li>
                Ajuster les plages de valeurs et les unités si besoin, à voir
              </li>
            </ul>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 mt-8">
        <div className="container mx-auto px-6 text-center">
          <p>© {new Date().getFullYear()} Projet Hydroponie</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
