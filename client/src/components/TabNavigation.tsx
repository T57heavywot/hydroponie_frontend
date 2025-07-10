import React from "react";

interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: string[];
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, setActiveTab, tabs }) => (
  <nav className="bg-white border-b border-gray-300">
    <div className="container mx-auto px-6 flex space-x-2">
      {tabs.map((tab) => (
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
);

export default TabNavigation;
