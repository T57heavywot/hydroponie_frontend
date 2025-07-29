import React, { useState } from "react";
import EventForm from "./EventForm";
import EventList from "./EventList";
import ChartSection from "./ChartSection";
import ChartTimeSelector from "./ChartTimeSelector";
import AjoutEvenementForm from "./AjoutEvenementForm";

interface GraphiquesTabProps {
  selectedHours: number;
  setSelectedHours: React.Dispatch<React.SetStateAction<number>>;
  chartList: any[];
  selectedCharts: string[];
  handleChartSelect: (key: string) => void;
  chartRefs: React.MutableRefObject<Record<string, any>>;
  getChartData: (dataKey: string, label: string, color: string) => any;
  getChartOptionsWithBounds: (dataKey: string, label: string, color: string, category?: string) => any;
  EventBadgeOverlay: any;
  sensorData: any[];
}

const GraphiquesTab: React.FC<GraphiquesTabProps> = (props) => {
  const {
    selectedHours,
    setSelectedHours,
    chartList,
    selectedCharts,
    handleChartSelect,
    chartRefs,
    getChartData,
    getChartOptionsWithBounds,
    EventBadgeOverlay,
    sensorData
  } = props;

  // State for chart selection and export
  const [showChartSelection, setShowChartSelection] = useState(false);
  const [chartsToExport, setChartsToExport] = useState<string[]>([]);

  // Export handler
  const handleExportCSV = () => {
    const selected: string[] = showChartSelection && chartsToExport.length > 0
      ? chartsToExport
      : selectedCharts.length > 0
        ? selectedCharts
        : chartList.map(c => c.key);
    const header = ["timestamp", ...selected];
    const rows = [header.join(";")];
    sensorData.forEach((data: any) => {
      const row = [
        data.timestamp,
        ...selected.map((key: string) => {
          const val = (data as any)[key];
          return typeof val === "number" ? val : "";
        })
      ];
      rows.push(row.join(";"));
    });
    const csv = rows.join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donnees_graphiques.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Sélecteur de période */}
      <ChartTimeSelector
        selectedHours={selectedHours}
        setSelectedHours={setSelectedHours}
      />
      {/* (Formulaire d'ajout d'événement et liste supprimés, gérés dans App.tsx) */}
      {/* Chart selection and export UI at the same level as the charts */}
      <div className="mb-4 flex flex-col gap-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded w-fit"
          onClick={() => setShowChartSelection((v) => !v)}
        >
          {showChartSelection ? "Annuler la sélection" : "Sélectionner les graphiques à exporter"}
        </button>
        {showChartSelection && (
          <div className="flex flex-wrap gap-4">
            {chartList.map((chart) => (
              <label key={chart.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={chartsToExport.includes(chart.key)}
                  onChange={e => {
                    setChartsToExport((prev) =>
                      e.target.checked
                        ? [...prev, chart.key]
                        : prev.filter((k) => k !== chart.key)
                    );
                  }}
                />
                {chart.label}
              </label>
            ))}
          </div>
        )}
        <button
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 w-fit"
          onClick={handleExportCSV}
        >
          Exporter les données graphiques en CSV
        </button>
      </div>
      {/* Chart sections */}
      <ChartSection
        title="Ambiance"
        chartKeys={["temperature", "humidity"]}
        chartList={chartList}
        getChartData={getChartData}
        getChartOptionsWithBounds={getChartOptionsWithBounds}
        showChartSelection={showChartSelection}
        chartsToExport={chartsToExport}
        setChartsToExport={setChartsToExport}
        selectedCharts={selectedCharts}
        handleChartSelect={handleChartSelect}
        chartRefs={chartRefs}
        /* events n'est plus passé, la gestion des événements est dans App.tsx */
        EventBadgeOverlay={EventBadgeOverlay}
      />
      <ChartSection
        title="Réservoir"
        chartKeys={["phReservoir", "oxygenReservoir", "ecReservoir", "waterLevelReservoir"]}
        chartList={chartList}
        getChartData={getChartData}
        getChartOptionsWithBounds={getChartOptionsWithBounds}
        showChartSelection={showChartSelection}
        chartsToExport={chartsToExport}
        setChartsToExport={setChartsToExport}
        selectedCharts={selectedCharts}
        handleChartSelect={handleChartSelect}
        chartRefs={chartRefs}
        /* events n'est plus passé, la gestion des événements est dans App.tsx */
        EventBadgeOverlay={EventBadgeOverlay}
      />
      <ChartSection
        title="Bac du système"
        chartKeys={["phBac", "oxygenBac", "ecBac", "waterLevelBac"]}
        chartList={chartList}
        getChartData={getChartData}
        getChartOptionsWithBounds={getChartOptionsWithBounds}
        showChartSelection={showChartSelection}
        chartsToExport={chartsToExport}
        setChartsToExport={setChartsToExport}
        selectedCharts={selectedCharts}
        handleChartSelect={handleChartSelect}
        chartRefs={chartRefs}
        /* events n'est plus passé, la gestion des événements est dans App.tsx */
        EventBadgeOverlay={EventBadgeOverlay}
      />
    </div>
  );
};

export default GraphiquesTab;
