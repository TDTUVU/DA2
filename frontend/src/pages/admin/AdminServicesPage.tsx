import React, { useState } from 'react';
import ToursTable from './services/ToursTable';
import HotelsTable from './services/HotelsTable';
import FlightsTable from './services/FlightsTable';

type ServiceType = 'tours' | 'hotels' | 'flights';

const TABS: { key: ServiceType; label: string }[] = [
  { key: 'tours', label: 'Quản lý Tours' },
  { key: 'hotels', label: 'Quản lý Khách sạn' },
  { key: 'flights', label: 'Quản lý Chuyến bay' },
];

const AdminServicesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ServiceType>('tours');

  const renderContent = () => {
    switch (activeTab) {
      case 'tours':
        return <ToursTable />;
      case 'hotels':
        return <HotelsTable />;
      case 'flights':
        return <FlightsTable />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">Quản lý Dịch vụ</h1>

      {/* Mobile Tabs */}
      <div className="lg:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as ServiceType)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm mb-4"
          aria-label="Chọn loại dịch vụ"
        >
          {TABS.map((tab) => (
            <option key={tab.key} value={tab.key}>
              {tab.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:block border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminServicesPage; 