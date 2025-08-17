import React from 'react';
import { Calendar } from 'lucide-react';
import ActivityList from '../components/ActivityList';

const DashboardActivity: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-base-100 rounded-box p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-semibold">Activité récente</h1>
        </div>
        
        <ActivityList />
      </div>
    </div>
  );
};

export default DashboardActivity;
