import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CashflowChart = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Nağd Axını Balansı
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "12px", fontWeight: 500 }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px", fontWeight: 500 }}
            tickFormatter={(value) => `${value.toLocaleString()} ₼`}
          />
          <Tooltip
            formatter={(value) => [`${value.toLocaleString()} ₼`]}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar
            dataKey="balance"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashflowChart;
