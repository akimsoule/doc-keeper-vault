import React from 'react';
import { FileText, HardDrive, Star, Share2 } from 'lucide-react';

interface StatsProps {
  totalDocuments: number;
  totalSize: number;
  favoriteCount: number;
  sharedCount: number;
}

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const Stats: React.FC<StatsProps> = ({
  totalDocuments,
  totalSize,
  favoriteCount,
  sharedCount,
}) => {
  const stats = [
    {
      icon: FileText,
      label: 'Total documents',
      value: totalDocuments.toString(),
      bgColor: 'bg-info/10',
      iconColor: 'text-info',
    },
    {
      icon: HardDrive,
      label: 'Espace utilisé',
      value: formatFileSize(totalSize),
      bgColor: 'bg-success/10',
      iconColor: 'text-success',
    },
    {
      icon: Star,
      label: 'Favoris',
      value: favoriteCount.toString(),
      bgColor: 'bg-warning/10',
      iconColor: 'text-warning',
    },
    {
      icon: Share2,
      label: 'Partagés',
      value: sharedCount.toString(),
      bgColor: 'bg-secondary/10',
      iconColor: 'text-secondary',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className="stats shadow"
          >
            <div className="stat">
              <div className="stat-figure">
                <div className="flex">
                  <div className={`${stat.bgColor} rounded-lg w-12 h-12 flex items-center justify-center`}>
                    <IconComponent className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
              <div className="stat-title text-xs sm:text-sm">{stat.label}</div>
              <div className="stat-value text-lg sm:text-2xl">{stat.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};