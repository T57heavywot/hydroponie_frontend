import React from "react";
import EventForm from "./EventForm";
import EventList from "./EventList";
import ChartSection from "./ChartSection";
import ChartTimeSelector from "./ChartTimeSelector";
import AjoutEvenementForm from "./AjoutEvenementForm";

interface GraphiquesTabProps {
  selectedHours: number;
  setSelectedHours: React.Dispatch<React.SetStateAction<number>>;
  eventText: string;
  setEventText: React.Dispatch<React.SetStateAction<string>>;
  eventTime: string;
  setEventTime: React.Dispatch<React.SetStateAction<string>>;
  eventCategoryGroup: string;
  setEventCategoryGroup: React.Dispatch<React.SetStateAction<string>>;
  eventCategories: string[];
  setEventCategories: React.Dispatch<React.SetStateAction<string[]>>;
  chartList: any[];
  handleAddEvent: (e: React.FormEvent) => void;
  events: any[];
  setEvents: React.Dispatch<React.SetStateAction<any[]>>;
  selectedCharts: string[];
  handleChartSelect: (key: string) => void;
  chartRefs: React.MutableRefObject<Record<string, any>>;
  getChartData: (dataKey: string, label: string, color: string) => any;
  getChartOptionsWithBounds: (dataKey: string, label: string, color: string, category?: string) => any;
  EventBadgeOverlay: any;
}

const GraphiquesTab: React.FC<GraphiquesTabProps> = ({
  selectedHours,
  setSelectedHours,
  eventText,
  setEventText,
  eventTime,
  setEventTime,
  eventCategoryGroup,
  setEventCategoryGroup,
  eventCategories,
  setEventCategories,
  chartList,
  handleAddEvent,
  events,
  setEvents,
  selectedCharts,
  handleChartSelect,
  chartRefs,
  getChartData,
  getChartOptionsWithBounds,
  EventBadgeOverlay
}) => {
  return (
    <div className="flex flex-col gap-10">
      {/* Sélecteur de période */}
      <ChartTimeSelector
        selectedHours={selectedHours}
        setSelectedHours={setSelectedHours}
      />
      {/* Formulaire d'ajout d'événement */}
      <AjoutEvenementForm
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
        onDelete={(id) => setEvents((prev) => prev.filter((e) => e.id !== id))}
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
        chartKeys={["phReservoir", "oxygenReservoir", "ecReservoir", "waterLevelReservoir"]}
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
  );
};

export default GraphiquesTab;
