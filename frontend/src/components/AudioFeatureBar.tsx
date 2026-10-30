import React from 'react';

interface AudioFeatureBarProps {
  label: string;
  value: number; // 0.0 to 1.0 or normalized
  color?: string;
  showPercentage?: boolean;
}

export const AudioFeatureBar: React.FC<AudioFeatureBarProps> = ({
  label,
  value,
  color = 'from-emerald-500 to-green-400',
  showPercentage = true,
}) => {
  const percentage = Math.round(Math.min(100, Math.max(0, value * 100)));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="text-gray-400 capitalize">{label}</span>
        {showPercentage && <span className="font-semibold text-gray-200">{percentage}%</span>}
      </div>
      <div className="w-full bg-gray-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
