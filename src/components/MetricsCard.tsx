import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string;
  percentage?: string;
  variant?: 'primary' | 'default';
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  percentage,
  variant = 'default',
}) => {
  const isPrimary = variant === 'primary';

  return (
    <div
      className={`rounded-lg p-6 ${
        isPrimary
          ? 'bg-gradient-to-br from-green-400 to-green-500 text-white shadow-lg'
          : 'bg-white border border-gray-200'
      }`}
    >
      <div
        className={`text-sm font-medium mb-3 ${
          isPrimary ? 'opacity-90' : 'text-gray-600'
        }`}
      >
        {title}
      </div>
      <div
        className={`text-4xl font-bold mb-1 ${
          isPrimary ? 'text-white' : 'text-gray-900'
        }`}
      >
        {value}
      </div>
      {percentage && (
        <div
          className={`text-sm font-medium ${
            isPrimary ? 'text-white' : 'text-gray-600'
          }`}
        >
          {percentage}
        </div>
      )}
    </div>
  );
};

export default MetricsCard;
