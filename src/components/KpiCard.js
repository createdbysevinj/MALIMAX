import React from "react";

const KpiCard = ({ title, value, icon, change, positive, delay }) => {
  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border border-gray-200`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        <span
          className={`text-sm font-medium px-2 py-1 rounded-full ${
            positive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
          }`}
        >
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default KpiCard;
