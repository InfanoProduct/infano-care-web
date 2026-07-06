'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStats } from '../hooks/use-dashboard-data';

export function DashboardCharts() {
  const { data, isLoading } = useDashboardStats();
  const [activeTab, setActiveTab] = useState<'users' | 'revenue'>('users');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (isLoading || !data) {
    return (
      <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] h-[360px] animate-pulse" />
    );
  }

  const trends = data.trends || [];
  const maxValue = activeTab === 'users' 
    ? Math.max(...trends.map(t => t.users)) * 1.15
    : Math.max(...trends.map(t => t.revenue)) * 1.15;

  // Chart coordinate dimensions
  const width = 600;
  const height = 280;
  const paddingLeft = 40;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const getCoordinates = () => {
    return trends.map((t, i) => {
      const x = paddingLeft + (i * (width - paddingLeft - paddingRight)) / (trends.length - 1);
      const val = activeTab === 'users' ? t.users : t.revenue;
      const y = height - paddingBottom - (val / maxValue) * (height - paddingTop - paddingBottom);
      return { x, y, label: t.month, val };
    });
  };

  const coords = getCoordinates();

  // Draw area and line path strings
  const linePath = coords.reduce((acc, c, i) => {
    return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
  }, '');

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - paddingBottom} L ${coords[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="bg-white border border-[#E2E8F0] p-8 rounded-[2rem] h-full flex flex-col justify-between">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h3 className="text-[#0F172A] text-lg font-black tracking-tight flex items-center gap-1">
            <span>Growth Analytics</span>
            <span className="text-xs text-muted-foreground font-boldNormal"> (Last 6 Months)</span>
          </h3>
        </div>

        {/* Custom Toggle Switch */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-slate-100">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-white text-[#7C3AED] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            User Growth
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
              activeTab === 'revenue'
                ? 'bg-white text-[#7C3AED] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Revenue Trends
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative mt-8">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="purpleLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>

          {/* Gridlines & Y-Axis Labels (0, 25, 50, 75, 100) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
            // Label is computed relative to the max value or standard 0-100 percentage
            const percentLabel = Math.round((1 - ratio) * 100);
            return (
              <g key={ratio}>
                {/* Y-axis label */}
                <text
                  x={paddingLeft - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-bold fill-[#94A3B8]"
                >
                  {percentLabel}
                </text>
                {/* Dotted gridline */}
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* X-Axis bottom line */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="#CBD5E1"
            strokeWidth={1.5}
          />

          {/* Line & Area Fills */}
          <g>
            <motion.path
              key={`${activeTab}-area-mock`}
              d={areaPath}
              fill="url(#purpleAreaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            
            <motion.path
              key={`${activeTab}-line-mock`}
              d={linePath}
              fill="none"
              stroke="url(#purpleLineGrad)"
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </g>

          {/* Data Points and labels */}
          {coords.map((c, i) => (
            <g key={i}>
              {/* Target touch zone */}
              <circle
                cx={c.x}
                cy={c.y}
                r={20}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />

              {/* White circular dot with purple border */}
              <circle
                cx={c.x}
                cy={c.y}
                r={hoveredIndex === i ? 6 : 4}
                fill="#FFFFFF"
                stroke="#7C3AED"
                strokeWidth={hoveredIndex === i ? 4 : 3}
                className="transition-all duration-200 pointer-events-none"
              />

              {/* Month label centered below point */}
              <text
                x={c.x}
                y={height - 15}
                textAnchor="middle"
                className="text-[10px] font-bold fill-[#94A3B8]"
              >
                {c.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredIndex !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                left: `${(coords[hoveredIndex].x / width) * 100}%`,
                top: `${(coords[hoveredIndex].y / height) * 100 - 15}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-full bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-xl flex flex-col items-center pointer-events-none border border-white/10 z-10 w-24 text-center"
            >
              <span className="text-[8px] uppercase tracking-wider text-slate-400 mb-0.5">{coords[hoveredIndex].label}</span>
              <span className="text-xs font-black text-white">
                {activeTab === 'users' 
                  ? `${coords[hoveredIndex].val} Members`
                  : `₹${coords[hoveredIndex].val.toLocaleString('en-IN')}`
                }
              </span>
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-white/10" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
