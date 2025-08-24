import React from 'react';
import { LucideIcon } from 'lucide-react';
import { theme } from '../../theme/theme';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  unit: string;
  trend?: number;
  color?: 'blue' | 'green' | 'orange' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  unit, 
  trend, 
  color = 'blue' 
}) => {
  const getColorScheme = (color: string) => {
    const schemes = {
      blue: {
        bg: theme.colors.primary[50],
        border: theme.colors.primary[100],
        text: theme.colors.primary[600],
        iconBg: theme.colors.primary[100],
      },
      green: {
        bg: theme.colors.success[50],
        border: `${theme.colors.success[500]}30`,
        text: theme.colors.success[500],
        iconBg: `${theme.colors.success[500]}20`,
      },
      orange: {
        bg: theme.colors.warning[50],
        border: `${theme.colors.warning[500]}30`,
        text: theme.colors.warning[500],
        iconBg: `${theme.colors.warning[500]}20`,
      },
      red: {
        bg: theme.colors.danger[50],
        border: `${theme.colors.danger[500]}30`,
        text: theme.colors.danger[500],
        iconBg: `${theme.colors.danger[500]}20`,
      },
    };
    return schemes[color as keyof typeof schemes];
  };

  const colorScheme = getColorScheme(color);

  return (
    <div
      className="relative overflow-hidden transition-all duration-300 hover:transform hover:scale-102"
      style={{
        background: colorScheme.bg,
        borderRadius: theme.radii.lg,
        boxShadow: theme.shadows.md,
        border: `1px solid ${colorScheme.border}`,
      }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div
            className="p-3 rounded-lg"
            style={{ background: colorScheme.iconBg }}
          >
            <Icon size={24} color={colorScheme.text} />
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${
              trend > 0 ? 'text-red-500' : 'text-green-500'
            }`}>
              <span className="mr-1">{trend > 0 ? '↑' : '↓'}</span>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold" style={{ color: colorScheme.text }}>
            {value}
          </span>
          <span className="ml-1 text-gray-600">{unit}</span>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: colorScheme.text }}
      />
    </div>
  );
};