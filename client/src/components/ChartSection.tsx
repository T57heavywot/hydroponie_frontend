import React from "react";
import { Line } from "react-chartjs-2";

interface ChartSectionProps {
  title: string;
  chartKeys: string[];
  chartList: { key: string; label: string; dataKey: string; color: string }[];
  getChartData: (dataKey: string, label: string, color: string) => any;
  getChartOptionsWithBounds: (
    dataKey: string,
    label: string,
    color: string,
    category?: string
  ) => any;
  selectCharts: boolean;
  selectedCharts: string[];
  handleChartSelect: (key: string) => void;
  chartRefs: React.MutableRefObject<Record<string, any>>;
  events: any[];
  EventBadgeOverlay: React.ComponentType<any>;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  title,
  chartKeys,
  chartList,
  getChartData,
  getChartOptionsWithBounds,
  selectCharts,
  selectedCharts,
  handleChartSelect,
  chartRefs,
  events,
  EventBadgeOverlay,
}) => (
  <div>
    <h2 className="text-lg font-bold text-gray-700 mb-3">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {chartKeys.map((key) => {
        const chart = chartList.find((c) => c.key === key)!;
        const chartData = getChartData(chart.dataKey, chart.label, chart.color);
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
                    chart.dataKey,
                    chart.label,
                    chart.color,
                    chart.key
                  )}
                  redraw={false}
                />
                {chartRefs.current[chart.key]?.scales?.x && (
                  <EventBadgeOverlay
                    events={events
                      .filter((ev) => ev.categories.includes(chart.key))
                      .map((ev) => ({
                        time: ev.time,
                        text: ev.text,
                      }))}
                    chartRef={{ current: chartRefs.current[chart.key].canvas }}
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
);

export default ChartSection;
