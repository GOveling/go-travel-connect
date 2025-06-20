
import React from 'react';
import { IOSCard } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';

interface IOSTripTemplatesProps {
  onBeachVacation: () => void;
  onMountainTrip: () => void;
  onCityBreak: () => void;
  onBackpacking: () => void;
}

const IOSTripTemplates = ({
  onBeachVacation,
  onMountainTrip,
  onCityBreak,
  onBackpacking
}: IOSTripTemplatesProps) => {
  const templates = [
    {
      icon: '🏖️',
      title: 'Beach Vacation',
      description: 'Relax by the ocean',
      color: 'from-blue-400 to-cyan-400',
      onClick: onBeachVacation
    },
    {
      icon: '⛰️',
      title: 'Mountain Adventure',
      description: 'Explore the peaks',
      color: 'from-green-400 to-emerald-400',
      onClick: onMountainTrip
    },
    {
      icon: '🏙️',
      title: 'City Break',
      description: 'Urban exploration',
      color: 'from-purple-400 to-pink-400',
      onClick: onCityBreak
    },
    {
      icon: '🎒',
      title: 'Backpacking',
      description: 'Adventure awaits',
      color: 'from-orange-400 to-red-400',
      onClick: onBackpacking
    }
  ];

  return (
    <IOSCard className="p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start Templates</h3>
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <IOSButton
            key={index}
            variant="secondary"
            className="p-4 h-auto flex flex-col items-center space-y-2"
            onClick={template.onClick}
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${template.color} rounded-2xl flex items-center justify-center text-2xl mb-2`}>
              {template.icon}
            </div>
            <div className="text-sm font-semibold text-gray-900">{template.title}</div>
            <div className="text-xs text-gray-600">{template.description}</div>
          </IOSButton>
        ))}
      </div>
    </IOSCard>
  );
};

export default IOSTripTemplates;
