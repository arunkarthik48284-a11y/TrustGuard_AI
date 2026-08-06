import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0F172A] border border-gray-700 p-3 rounded-xl shadow-xl text-xs">
        <p className="font-bold text-gray-200 mb-1">Time Window: {label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ThreatChart = ({ data = [], type = 'area' }) => {
  if (type === 'bar') {
    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
            <XAxis dataKey="category" stroke="#6B7280" fontSize={11} />
            <YAxis stroke="#6B7280" fontSize={11} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#06B6D4" radius={[6, 6, 0, 0]} name="Incidents Flagged" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis dataKey="timestamp" stroke="#6B7280" fontSize={11} />
          <YAxis stroke="#6B7280" fontSize={11} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="scans" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#scansGradient)" name="Total Scans" />
          <Area type="monotone" dataKey="threats" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#threatsGradient)" name="Threats Intercepted" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThreatChart;
