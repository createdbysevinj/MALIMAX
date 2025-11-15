import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

const DataEntryScreen = ({
  financialData = {},
  updateFinancialData = () => {},
  currentDate = new Date(),
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  setCurrentScreen,
}) => {
  const [formData, setFormData] = useState({
    gelir: "",
    expenses: {
      emekhaqi: "",
      icare: "",
      kommunal: "",
      marketing: "",
      diger: "",
    },
    taxes: {
      edv: "",
      gelirVergisi: "",
      sosialSigortasi: "",
    },
  });

  const months = [
    "Yanvar",
    "Fevral",
    "Mart",
    "Aprel",
    "May",
    "İyun",
    "İyul",
    "Avqust",
    "Sentyabr",
    "Oktyabr",
    "Noyabr",
    "Dekabr",
  ];

  const canEditMonth =
    selectedMonth <= currentDate.getMonth() ||
    selectedYear < currentDate.getFullYear();

  useEffect(() => {
    const monthData = financialData?.[selectedMonth] || {};
    setFormData({
      gelir: monthData.gelir || "",
      expenses: {
        emekhaqi: monthData.expenses?.emekhaqi || "",
        icare: monthData.expenses?.icare || "",
        kommunal: monthData.expenses?.kommunal || "",
        marketing: monthData.expenses?.marketing || "",
        diger: monthData.expenses?.diger || "",
      },
      taxes: {
        edv: monthData.taxes?.edv || "",
        gelirVergisi: monthData.taxes?.gelirVergisi || "",
        sosialSigortasi: monthData.taxes?.sosialSigortasi || "",
      },
    });
  }, [financialData, selectedMonth]);

  const handleSave = () => {
    // Gəlir
    if (formData.gelir) {
      updateFinancialData(selectedMonth, "gelir", formData.gelir);
    }

    // Xərclər
    Object.entries(formData.expenses).forEach(([key, value]) => {
      if (value) updateFinancialData(selectedMonth, "expenses", value, key);
    });

    // Vergilər
    Object.entries(formData.taxes).forEach(([key, value]) => {
      if (value) updateFinancialData(selectedMonth, "taxes", value, key);
    });

    alert("Məlumatlar uğurla yadda saxlanıldı!");
  };

  const totalExpenses =
    Object.values(formData.expenses).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    ) +
    Object.values(formData.taxes).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Maliyyə Məlumatları Girişi
          </h1>
          <button
            onClick={() => setCurrentScreen("dashboard")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Ay/İl seçimi */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dövrü seçin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ay
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İl
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          {!canEditMonth && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-medium">
                  Gələcək aylar üçün məlumat daxil edilə bilməz. Cari ay:{" "}
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
              </div>
            </div>
          )}
        </div>

        {canEditMonth && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gəlir */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" /> Gəlirlər
              </h3>
              <input
                type="number"
                value={formData.gelir}
                onChange={(e) =>
                  setFormData({ ...formData, gelir: e.target.value })
                }
                placeholder="0"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Xərclər */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingDown className="w-5 h-5 text-red-500 mr-2" /> Xərclər
              </h3>
              <div className="space-y-4">
                {Object.entries(formData.expenses).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expenses: {
                            ...formData.expenses,
                            [key]: e.target.value,
                          },
                        })
                      }
                      placeholder="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Vergilər */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />{" "}
                Vergilər
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(formData.taxes).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {key}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          taxes: { ...formData.taxes, [key]: e.target.value },
                        })
                      }
                      placeholder="0"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Xülasə */}
            <div className="lg:col-span-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Aylıq Xülasə</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <span className="block text-sm text-blue-100">
                    Ümumi Gəlir
                  </span>
                  <span className="text-2xl font-bold">
                    {(parseFloat(formData.gelir) || 0).toLocaleString()} ₼
                  </span>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <span className="block text-sm text-blue-100">
                    Ümumi Xərc
                  </span>
                  <span className="text-2xl font-bold">
                    {totalExpenses.toLocaleString()} ₼
                  </span>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <span className="block text-sm text-blue-100">Balans</span>
                  <span className="text-2xl font-bold">
                    {(
                      parseFloat(formData.gelir) || 0 - totalExpenses
                    ).toLocaleString()}{" "}
                    ₼
                  </span>
                </div>
              </div>
              <button
                onClick={handleSave}
                className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Yadda Saxla
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DataEntryScreen;
