import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";
import "./App.css";
import WaterLevel from "./WaterLevel";
import GaugeBar from "./GaugeBar";
import EventBadgeOverlay from "./EventBadgeOverlay";
import AddPlantModal from "./AddPlantModal";
import EventForm from "./EventForm";
import EventList from "./EventList";
import ChartSection from "./ChartSection";
import PlantBoundsCSVButtons from "./PlantBoundsCSVButtons";
import InfoBox from "./InfoBox";
import ChartTimeSelector from "./ChartTimeSelector";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  TimeScale
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

// Génère des données simulées pour la période choisie
function generateMockData(hours: number): SensorData[] {
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
        nitrogen: 200 + Math.random() * 100,
        phosphorus: 50 + Math.random() * 30,
        potassium: 150 + Math.random() * 50,
      },
      phReservoir: 5.5 + Math.random() * 2,
      phBac: 5.5 + Math.random() * 2,
      ecReservoir: 1.2 + Math.random() * 0.6,
      ecBac: 1.2 + Math.random() * 0.6,
      oxygenReservoir: 80 + Math.random() * 10,
      oxygenBac: 80 + Math.random() * 10,
      waterLevelReservoir: 40 + Math.random() * 60,
      waterLevelBac: Math.max(0, 40 + Math.random() * 60 - 55),
    });
  }
  return data;
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [waterLevel, setWaterLevel] = useState({ level: 0 });
  const [activeTab, setActiveTab] = useState<string>("Accueil");
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const [events, setEvents] = useState<
    {
      id: string;
      text: string;
      time: string;
      categories: string[];
    }[]
  >([]);
  const [eventText, setEventText] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCategories, setEventCategories] = useState<string[]>([]);
  // Ajout d'un état pour le groupe de catégories sélectionné
  const [eventCategoryGroup, setEventCategoryGroup] = useState("");

  const BORNES = {
    phReservoir: { min: 5.5, max: 6.5 },
    phBac: { min: 5.5, max: 6.5 },
    ecReservoir: { min: 1.2, max: 2.0 },
    ecBac: { min: 1.2, max: 2.0 },
    oxygenReservoir: { min: 80, max: 100 },
    oxygenBac: { min: 80, max: 100 },
    temperature: { min: 18, max: 26 },
    humidity: { min: 40, max: 70 },
    waterLevelReservoir: { min: 20, max: 100 },
    waterLevelBac: { min: 10, max: 45 },
  };

  const [editableBornes, setEditableBornes] = useState({ ...BORNES });

  // Bornes par défaut pour chaque plante
  const DEFAULT_PLANT_BORNES = {
    basilic: {
      phReservoir: { min: 5.5, max: 6.5 },
      phBac: { min: 5.5, max: 6.5 },
      ecReservoir: { min: 1.2, max: 1.6 },
      ecBac: { min: 1.2, max: 1.6 },
      oxygenReservoir: { min: 80, max: 100 },
      oxygenBac: { min: 80, max: 100 },
      temperature: { min: 20, max: 28 },
      humidity: { min: 50, max: 70 },
      waterLevelReservoir: { min: 20, max: 100 },
      waterLevelBac: { min: 10, max: 45 },
    },
    tomate: {
      phReservoir: { min: 5.5, max: 6.5 },
      phBac: { min: 5.5, max: 6.5 },
      ecReservoir: { min: 2.0, max: 5.0 },
      ecBac: { min: 2.0, max: 5.0 },
      oxygenReservoir: { min: 80, max: 100 },
      oxygenBac: { min: 80, max: 100 },
      temperature: { min: 18, max: 26 },
      humidity: { min: 40, max: 70 },
      waterLevelReservoir: { min: 20, max: 100 },
      waterLevelBac: { min: 10, max: 45 },
    },
  } as const;

  type PlantKey = keyof typeof DEFAULT_PLANT_BORNES | "";
  const [selectedPlant, setSelectedPlant] = useState<PlantKey>("");
  const [plantBornes, setPlantBornes] = useState<any>({
    ...DEFAULT_PLANT_BORNES,
  });

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

  // Remettre l'état pour la période d'affichage des graphiques
  const [selectedHours, setSelectedHours] = useState<number>(6);

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
          display: false,
          content: ev.text,
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

  // Correction des signatures pour accepter string en dataKey
  const getChartData = (
    dataKey: string, // au lieu de keyof SensorData
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
            y:
              typeof (data as any)[dataKey] === "object"
                ? null
                : (data as any)[dataKey],
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

  // Récupérer la dernière valeur pour chaque catégorie
  const latestData =
    sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  // Ajout d'une zone de bornes sur les graphiques si applicable
  const getChartOptionsWithBounds = (
    dataKey: string, // au lieu de keyof typeof BORNES
    label: string,
    color: string,
    category?: string
  ) => {
    const bounds = (editableBornes as any)[dataKey];
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
    setEventCategoryGroup("");
  };

  // Met à jour les bornes selon la plante sélectionnée
  useEffect(() => {
    if (selectedPlant && plantBornes[selectedPlant]) {
      setEditableBornes({ ...plantBornes[selectedPlant] });
    }
  }, [selectedPlant, plantBornes]);

  // Fonction pour envoyer la commande flush au serveur
  const handleFlushReservoir = async () => {
    try {
      const response = await fetch("/api/flush-reservoir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        alert("Commande de vidange envoyée au serveur !");
      } else {
        alert("Erreur lors de l'envoi de la commande de vidange.");
      }
    } catch (err) {
      alert("Erreur de connexion au serveur.");
    }
  };

  // Dictionnaire de traduction des paramètres pour l'affichage
  const PARAM_LABELS: Record<string, string> = {
    phReservoir: "pH réservoir",
    phBac: "pH bac",
    ecReservoir: "Conductivité réservoir",
    ecBac: "Conductivité bac",
    oxygenReservoir: "Oxygène réservoir",
    oxygenBac: "Oxygène bac",
    temperature: "Température ambiante",
    humidity: "Humidité ambiante",
  };

  const [showAddPlantModal, setShowAddPlantModal] = useState(false);
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantBornes, setNewPlantBornes] = useState<any>({
    phReservoir: { min: 5.5, max: 6.5 },
    phBac: { min: 5.5, max: 6.5 },
    ecReservoir: { min: 1.2, max: 2.0 },
    ecBac: { min: 1.2, max: 2.0 },
    oxygenReservoir: { min: 80, max: 100 },
    oxygenBac: { min: 80, max: 100 },
    temperature: { min: 18, max: 26 },
    humidity: { min: 40, max: 70 },
    waterLevelReservoir: { min: 20, max: 100 },
    waterLevelBac: { min: 10, max: 45 },
  });

  // Handlers pour l'import/export CSV des bornes
  const handleExportPlantBoundsCSV = () => {
    const rows = ["Plant;Parameter;Min;Max"];
    Object.entries(plantBornes).forEach(([plant, params]) => {
      Object.entries(
        params as { [key: string]: { min: number; max: number } }
      ).forEach(([param, val]) => {
        rows.push(`${plant};${param};${val.min};${val.max}`);
      });
    });
    const csv = rows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plant_bounds.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleImportPlantBoundsCSV = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1);
      const newPlantBornes: any = { ...plantBornes };
      lines.forEach((line) => {
        const [plant, param, min, max] = line.split(";");
        if (plant && param && min !== undefined && max !== undefined) {
          const key = plant as keyof typeof newPlantBornes;
          if (!newPlantBornes[key]) {
            newPlantBornes[key] = {};
          }
          newPlantBornes[key][param] = {
            min: parseFloat(min),
            max: parseFloat(max),
          };
        }
      });
      setPlantBornes(newPlantBornes);
      alert("Bornes importées avec succès !");
    };
    reader.readAsText(file, "UTF-8");
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
                    {BORNES.oxygenBac.max}
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
            <ChartTimeSelector
              selectedHours={selectedHours}
              setSelectedHours={setSelectedHours}
            />
            {/* Formulaire d'ajout d'événement */}
            <EventForm
              eventText={eventText}
              setEventText={setEventText}
              eventTime={eventTime}
              setEventTime={setEventTime}
              eventCategoryGroup={eventCategoryGroup}
              setEventCategoryGroup={setEventCategoryGroup}
              setEventCategories={setEventCategories}
              chartList={chartList}
              onSubmit={handleAddEvent}
            />
            {/* Liste des événements existants avec suppression */}
            <EventList
              events={events}
              chartList={chartList}
              onDelete={(id) =>
                setEvents((prev) => prev.filter((e) => e.id !== id))
              }
            />
            <ChartSection
              title="Ambiance"
              chartKeys={["temperature", "humidity"]}
              chartList={chartList}
              getChartData={getChartData}
              getChartOptionsWithBounds={getChartOptionsWithBounds}
              selectCharts={false}
              selectedCharts={selectedCharts}
              handleChartSelect={handleChartSelect}
              chartRefs={chartRefs}
              events={events}
              EventBadgeOverlay={EventBadgeOverlay}
            />
            <ChartSection
              title="Réservoir"
              chartKeys={[
                "phReservoir",
                "oxygenReservoir",
                "ecReservoir",
                "waterLevelReservoir",
              ]}
              chartList={chartList}
              getChartData={getChartData}
              getChartOptionsWithBounds={getChartOptionsWithBounds}
              selectCharts={false}
              selectedCharts={selectedCharts}
              handleChartSelect={handleChartSelect}
              chartRefs={chartRefs}
              events={events}
              EventBadgeOverlay={EventBadgeOverlay}
            />
            <ChartSection
              title="Bac du système"
              chartKeys={["phBac", "oxygenBac", "ecBac", "waterLevelBac"]}
              chartList={chartList}
              getChartData={getChartData}
              getChartOptionsWithBounds={getChartOptionsWithBounds}
              selectCharts={false}
              selectedCharts={selectedCharts}
              handleChartSelect={handleChartSelect}
              chartRefs={chartRefs}
              events={events}
              EventBadgeOverlay={EventBadgeOverlay}
            />
          </div>
        ) : activeTab === "Commandes" ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Bloc Actions rapides avec sélecteur de plante */}
              <div className="flex justify-center">
                <div className="bg-white rounded-xl shadow p-10 flex flex-col gap-8 border border-gray-300 min-w-[350px] max-w-lg w-full">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">
                    Actions rapides
                  </h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plante par défaut
                    </label>
                    <div className="flex gap-2 items-center">
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={selectedPlant}
                        onChange={(e) =>
                          setSelectedPlant(e.target.value as PlantKey)
                        }
                      >
                        <option value="">-- Choisir une plante --</option>
                        {Object.keys(plantBornes).map((plant) => (
                          <option key={plant} value={plant}>
                            {plant.charAt(0).toUpperCase() + plant.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="ml-2 px-2 py-1 bg-green-100 text-green-800 border border-green-600 rounded font-semibold hover:bg-green-200"
                        onClick={() => {
                          setNewPlantName("");
                          setNewPlantBornes({
                            phReservoir: { min: 5.5, max: 6.5 },
                            phBac: { min: 5.5, max: 6.5 },
                            ecReservoir: { min: 1.2, max: 2.0 },
                            ecBac: { min: 1.2, max: 2.0 },
                            oxygenReservoir: { min: 80, max: 100 },
                            oxygenBac: { min: 80, max: 100 },
                            temperature: { min: 18, max: 26 },
                            humidity: { min: 40, max: 70 },
                            waterLevelReservoir: { min: 20, max: 100 },
                            waterLevelBac: { min: 10, max: 45 },
                          });
                          setShowAddPlantModal(true);
                        }}
                        title="Ajouter une nouvelle plante"
                      >
                        + Ajouter une plante
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Ouverture des valves
                      </span>
                      <div className="flex gap-2">
                        <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                          Ouverture
                        </button>
                        <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                          Fermeture
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Ajouter des nutriments
                      </span>
                      <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                        Ajouter
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Remplir le bac d'eau du système
                      </span>
                      <button className="px-4 py-1 border-2 border-black rounded bg-white font-semibold hover:bg-gray-100">
                        Remplir
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-700">
                        Vidanger le réservoir
                      </span>
                      <button
                        className="px-4 py-1 border-2 border-red-600 text-red-600 rounded font-semibold bg-white hover:bg-red-50"
                        onClick={handleFlushReservoir}
                      >
                        Vidanger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bloc édition des bornes */}
              <div className="bg-white rounded-xl shadow p-8 border border-gray-300 flex flex-col justify-between">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Modifier les bornes des graphiques
                </h2>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  {Object.entries(editableBornes)
                    .filter(
                      ([key]) =>
                        key !== "waterLevelReservoir" && key !== "waterLevelBac"
                    )
                    .map(([key, val]) => {
                      const typedKey = key as keyof typeof editableBornes;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="w-48 font-medium text-gray-700">
                            {PARAM_LABELS[key] || key}
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
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 self-end"
                    onClick={() => {
                      if (selectedPlant) {
                        setPlantBornes((prev: any) => ({
                          ...prev,
                          [selectedPlant]: { ...editableBornes },
                        }));
                        alert(
                          "Bornes enregistrées pour la plante sélectionnée !"
                        );
                      }
                    }}
                  >
                    Enregistrer
                  </button>
                </form>
                <PlantBoundsCSVButtons
                  plantBornes={plantBornes}
                  setPlantBornes={setPlantBornes}
                  selectedPlant={selectedPlant}
                  setEditableBornes={setEditableBornes}
                />
              </div>
            </div>
            {/* Modal d'ajout de plante */}
            <AddPlantModal
              show={showAddPlantModal}
              onClose={() => setShowAddPlantModal(false)}
              plantName={newPlantName}
              setPlantName={setNewPlantName}
              plantBornes={newPlantBornes}
              setPlantBornes={setNewPlantBornes}
              paramLabels={PARAM_LABELS}
              onSubmit={() => {
                const name = newPlantName.trim().toLowerCase();
                if (!name) {
                  alert("Veuillez saisir un nom de plante.");
                  return;
                }
                if (plantBornes[name]) {
                  alert("Cette plante existe déjà.");
                  return;
                }
                setPlantBornes((prev: any) => ({
                  ...prev,
                  [name]: { ...newPlantBornes },
                }));
                setNewPlantName("");
                setShowAddPlantModal(false);
              }}
            />
            {/* InfoBox d'implémentation */}
            <InfoBox />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
