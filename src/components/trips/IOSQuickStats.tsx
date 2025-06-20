
import React from 'react';
import { IOSCard } from '@/components/ui/ios-card';

interface IOSQuickStatsProps {
  trips: any[];
}

const IOSQuickStats = ({ trips }: IOSQuickStatsProps) => {
  const stats = [
    {
      label: 'Total Trips',
      value: trips.length,
      color: 'text-blue-600'
    },
    {
      label: 'Upcoming',
      value: trips.filter(t => t.status === 'upcoming').length,
      color: 'text-green-600'
    },
    {
      label: 'Group Trips',
      value: trips.filter(t => t.isGroupTrip).length,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <IOSCard key={index} className="p-4 text-center">
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {stat.label}
          </div>
        </IOSCard>
      ))}
    </div>
  );
};

export default IOSQuickStats;
