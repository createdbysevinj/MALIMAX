import React from "react";
import { AlertCircle, CreditCard } from "lucide-react";

const UpcomingPayments = ({ payments }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Gələcək Ödənişlər
      </h3>
      <div className="space-y-4">
        {payments.map((payment, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  payment.type === "tax" ? "bg-orange-100" : "bg-blue-100"
                }`}
              >
                {payment.type === "tax" ? (
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                ) : (
                  <CreditCard className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{payment.title}</h4>
                <p className="text-sm text-gray-500">{payment.date}</p>
              </div>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {payment.amount.toLocaleString()} ₼
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingPayments;
