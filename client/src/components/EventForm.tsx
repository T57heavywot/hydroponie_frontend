import React from "react";

interface EventFormProps {
  eventText: string;
  setEventText: (v: string) => void;
  eventTime: string;
  setEventTime: (v: string) => void;
  eventCategoryGroup: string;
  setEventCategoryGroup: (v: string) => void;
  setEventCategories: (v: string[]) => void;
  chartList: { key: string; label: string }[];
  onSubmit: (e: React.FormEvent) => void;
}

const EventForm: React.FC<EventFormProps> = ({
  eventText,
  setEventText,
  eventTime,
  setEventTime,
  eventCategoryGroup,
  setEventCategoryGroup,
  setEventCategories,
  chartList,
  onSubmit,
}) => (
  <form
    onSubmit={onSubmit}
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
      <select
        className="border rounded px-2 py-1"
        value={eventCategoryGroup}
        onChange={(e) => {
          const val = e.target.value;
          setEventCategoryGroup(val);
          if (val === "all") {
            setEventCategories(chartList.map((c) => c.key));
          } else if (val === "ambiance") {
            setEventCategories(["temperature", "humidity"]);
          } else if (val === "reservoir") {
            setEventCategories([
              "phReservoir",
              "oxygenReservoir",
              "ecReservoir",
              "waterLevelReservoir",
            ]);
          } else if (val === "bac") {
            setEventCategories([
              "phBac",
              "oxygenBac",
              "ecBac",
              "waterLevelBac",
            ]);
          } else {
            setEventCategories([]);
          }
        }}
        required
      >
        <option value="">Sélectionner…</option>
        <option value="all">Tout</option>
        <option value="ambiance">Ambiance</option>
        <option value="reservoir">Réservoir</option>
        <option value="bac">Bac</option>
      </select>
    </div>
    <button
      type="submit"
      className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700"
    >
      Ajouter événement
    </button>
  </form>
);

export default EventForm;
