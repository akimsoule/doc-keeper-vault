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
      color: 'blue',
      bgColor: 'from-blue-50 to-indigo-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: HardDrive,
      label: 'Espace utilisé',
      value: formatFileSize(totalSize),
      color: 'green',
      bgColor: 'from-green-50 to-emerald-50',
      iconColor: 'text-green-600',
    },
    {
      icon: Star,
      label: 'Favoris',
      value: favoriteCount.toString(),
      color: 'yellow',
      bgColor: 'from-yellow-50 to-amber-50',
      iconColor: 'text-yellow-600',
    },
    {
      icon: Share2,
      label: 'Partagés',
      value: sharedCount.toString(),
      color: 'purple',
      bgColor: 'from-purple-50 to-violet-50',
      iconColor: 'text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-200 hover:bg-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.bgColor}`}>
                <IconComponent className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};