import React from "react";

interface EventListProps {
  events: {
    id: string;
    text: string;
    time: string;
    categories: string[];
  }[];
  chartList: { key: string; label: string }[];
  onDelete: (id: string) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  chartList,
  onDelete,
}) => {
  if (!events.length) return null;
  return (
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
              <span className="font-medium text-gray-800">{ev.text}</span>
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
              onClick={() => onDelete(ev.id)}
              aria-label="Supprimer"
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EventList;
