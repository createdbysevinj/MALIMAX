import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";

const ExpensePieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const percentage = ((entry.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.payload.color }}
            />
            <p className="text-sm font-semibold text-gray-900">{entry.name}</p>
          </div>
          <p className="text-lg font-bold text-gray-900 mb-1">
            {entry.value.toLocaleString()} ₼
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-blue-50 px-2 py-1 rounded">
              <p className="text-xs font-semibold text-blue-600">
                {percentage}%
              </p>
            </div>
            <p className="text-xs text-gray-500">ümumi xərcin</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderActiveShape = ({
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
  }) => (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={innerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Xərc Təhlili</h3>
        <p className="text-sm text-gray-500">
          Ümumi: {total.toLocaleString()} ₼
        </p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{
                    filter: activeIndex === index ? "brightness(1.1)" : "none",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-xs text-gray-500 mb-1">Ümumi Xərc</p>
          <p className="text-lg font-bold text-gray-900">
            {total.toLocaleString()} ₼
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div
              key={index}
              className={`flex justify-between items-center p-3 rounded-lg transition-all cursor-pointer ${
                activeIndex === index
                  ? "bg-gray-100 shadow-sm"
                  : "hover:bg-gray-50"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {percentage}%
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {item.value.toLocaleString()} ₼
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpensePieChart;
