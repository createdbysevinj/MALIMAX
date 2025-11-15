import React, { useState, useRef } from "react";
import { useFinancialData } from "../contexts/FinancialDataContext";
import {
  Plus,
  Trash2,
  Save,
  Calendar,
  DollarSign,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Upload,
  Download,
  Loader2,
} from "lucide-react";
import {
  parseExcelFile,
  parseCSVFile,
  parseTextFile,
  parsePDFFile,
  analyzeImportedDataWithAI,
  exportToExcel,
} from "../services/fileImportExportService";

const DataEntry = () => {
  const {
    financialData,
    addYearlyData,
    updateExpenseBreakdown,
    addUpcomingPayment,
    removeUpcomingPayment,
  } = useFinancialData();

  const [activeTab, setActiveTab] = useState("yearly");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef(null);

  // Yearly Data Form - with all 12 months
  const [yearlyForm, setYearlyForm] = useState({
    year: new Date().getFullYear(),
    months: [
      { month: "Yan", gelir: "", xerc: "" },
      { month: "Fev", gelir: "", xerc: "" },
      { month: "Mar", gelir: "", xerc: "" },
      { month: "Apr", gelir: "", xerc: "" },
      { month: "May", gelir: "", xerc: "" },
      { month: "İyn", gelir: "", xerc: "" },
      { month: "İyl", gelir: "", xerc: "" },
      { month: "Avq", gelir: "", xerc: "" },
      { month: "Sen", gelir: "", xerc: "" },
      { month: "Okt", gelir: "", xerc: "" },
      { month: "Noy", gelir: "", xerc: "" },
      { month: "Dek", gelir: "", xerc: "" },
    ],
  });

  const months = [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "İyn",
    "İyl",
    "Avq",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ];

  // Expense Breakdown Form
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    value: "",
    color: "#8884d8",
  });

  // Upcoming Payment Form
  const [paymentForm, setPaymentForm] = useState({
    title: "",
    amount: "",
    date: "",
    type: "expense",
    category: "",
  });

  const expenseCategories = [
    "Əməkhaqqı",
    "İcarə",
    "Kommunal",
    "Marketing",
    "Təchizat və Materiallar",
    "Texnologiya və Proqram",
    "Sığorta",
    "Nəqliyyat",
    "Peşəkar Xidmətlər",
    "Bank Komissiyaları",
    "Təmir və Saxlama",
    "Digər",
  ];

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleYearlySubmit = (e) => {
    e.preventDefault();
    try {
      // Validate that at least some months have data
      const hasData = yearlyForm.months.some(
        (m) => m.gelir !== "" || m.xerc !== ""
      );

      if (!hasData) {
        showError("Zəhmət olmasa ən azı bir ay üçün məlumat daxil edin");
        return;
      }

      // Add all months that have data
      yearlyForm.months.forEach((monthData) => {
        if (monthData.gelir !== "" && monthData.xerc !== "") {
          addYearlyData({
            year: yearlyForm.year,
            month: monthData.month,
            gelir: Number(monthData.gelir),
            xerc: Number(monthData.xerc),
          });
        }
      });

      // Reset form
      setYearlyForm({
        year: new Date().getFullYear(),
        months: months.map((m) => ({ month: m, gelir: "", xerc: "" })),
      });
      showSuccess("Aylıq məlumatlar uğurla əlavə edildi!");
    } catch (error) {
      showError(error.message || "Xəta baş verdi");
    }
  };

  const handleMonthChange = (index, field, value) => {
    const updatedMonths = [...yearlyForm.months];
    updatedMonths[index] = {
      ...updatedMonths[index],
      [field]: value,
    };
    setYearlyForm({
      ...yearlyForm,
      months: updatedMonths,
    });
  };

  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    try {
      if (!expenseForm.name || !expenseForm.value) {
        showError("Zəhmət olmasa bütün sahələri doldurun");
        return;
      }

      const newExpense = {
        name: expenseForm.name,
        value: Number(expenseForm.value),
        color: expenseForm.color,
      };

      const existingIndex = financialData.expenseBreakdown.findIndex(
        (e) => e.name === expenseForm.name
      );

      let updatedExpenses;
      if (existingIndex >= 0) {
        updatedExpenses = [...financialData.expenseBreakdown];
        updatedExpenses[existingIndex] = newExpense;
      } else {
        updatedExpenses = [...financialData.expenseBreakdown, newExpense];
      }

      updateExpenseBreakdown(updatedExpenses);
      setExpenseForm({ name: "", value: "", color: "#8884d8" });
      showSuccess("Xərc kateqoriyası uğurla əlavə edildi!");
    } catch (error) {
      showError(error.message || "Xəta baş verdi");
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    try {
      if (!paymentForm.title || !paymentForm.amount || !paymentForm.date) {
        showError("Zəhmət olmasa bütün sahələri doldurun");
        return;
      }

      addUpcomingPayment({
        title: paymentForm.title,
        amount: Number(paymentForm.amount),
        date: paymentForm.date,
        type: paymentForm.type,
        category: paymentForm.category || paymentForm.type,
      });

      setPaymentForm({
        title: "",
        amount: "",
        date: "",
        type: "expense",
        category: "",
      });
      showSuccess("Gələcək ödəniş uğurla əlavə edildi!");
    } catch (error) {
      showError(error.message || "Xəta baş verdi");
    }
  };

  const handleDeleteExpense = (index) => {
    const updated = financialData.expenseBreakdown.filter(
      (_, i) => i !== index
    );
    updateExpenseBreakdown(updated);
    showSuccess("Xərc kateqoriyası silindi!");
  };

  // File Import Handler
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      let parsedData;

      // Parse file based on extension
      switch (fileExtension) {
        case "xlsx":
        case "xls":
          parsedData = await parseExcelFile(file);
          break;
        case "csv":
          parsedData = await parseCSVFile(file);
          break;
        case "txt":
          parsedData = await parseTextFile(file);
          break;
        case "pdf":
          parsedData = await parsePDFFile(file);
          // PDF parsing returns structured data, use it directly
          if (parsedData.structured && parsedData.structured.length === 0) {
            // If no structured data found, use full text for AI analysis
            parsedData = parsedData.fullText || parsedData.raw;
          } else if (parsedData.structured) {
            // Use structured data
            parsedData = parsedData.structured;
          }
          break;
        default:
          throw new Error(
            "Dəstəklənməyən fayl formatı. Excel, CSV, TXT və ya PDF istifadə edin."
          );
      }

      // Analyze with AI
      const analyzedData = await analyzeImportedDataWithAI(
        parsedData,
        fileExtension.toUpperCase()
      );

      // Add monthly data
      if (analyzedData.monthlyData && analyzedData.monthlyData.length > 0) {
        analyzedData.monthlyData.forEach((monthData) => {
          if (monthData.gelir && monthData.xerc) {
            addYearlyData({
              year: monthData.year || new Date().getFullYear(),
              month: monthData.month,
              gelir: Number(monthData.gelir),
              xerc: Number(monthData.xerc),
            });
          }
        });
      }

      // Add expense breakdown
      if (
        analyzedData.expenseBreakdown &&
        analyzedData.expenseBreakdown.length > 0
      ) {
        const existingExpenses = [...financialData.expenseBreakdown];
        analyzedData.expenseBreakdown.forEach((expense) => {
          const existingIndex = existingExpenses.findIndex(
            (e) => e.name === expense.name
          );
          if (existingIndex >= 0) {
            existingExpenses[existingIndex] = {
              name: expense.name,
              value: Number(expense.value),
              color: expense.color || "#8884d8",
            };
          } else {
            existingExpenses.push({
              name: expense.name,
              value: Number(expense.value),
              color: expense.color || "#8884d8",
            });
          }
        });
        updateExpenseBreakdown(existingExpenses);
      }

      // Add upcoming payments
      if (
        analyzedData.upcomingPayments &&
        analyzedData.upcomingPayments.length > 0
      ) {
        analyzedData.upcomingPayments.forEach((payment) => {
          addUpcomingPayment({
            title: payment.title,
            amount: Number(payment.amount),
            date: payment.date,
            type: payment.type || "expense",
            category: payment.category || payment.type || "Digər",
          });
        });
      }

      showSuccess(
        `Fayl uğurla import edildi! ${analyzedData.summary || ""} (Etibar: ${
          analyzedData.confidence || "orta"
        })`
      );
    } catch (error) {
      console.error("Import error:", error);
      showError(error.message || "Fayl import edilərkən xəta baş verdi");
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Export handlers
  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportToExcel(financialData);
      showSuccess("Excel faylı uğurla yaradıldı!");
    } catch (error) {
      showError(error.message || "Excel faylını yaratmaq mümkün olmadı");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Məlumat İdxal/İxrac
              </h1>
              <p className="text-gray-600">
                Maliyyə məlumatlarınızı əlavə edin, import/export edin və
                yeniləyin
              </p>
            </div>
            <div className="flex gap-3">
              {/* Import Button */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt,.pdf"
                  onChange={handleFileImport}
                  className="hidden"
                  id="file-import"
                />
                <label
                  htmlFor="file-import"
                  className={`flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer ${
                    importing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {importing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{importing ? "Yüklənir..." : "Import"}</span>
                </label>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className={`flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                  exporting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Excel Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {errorMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("yearly")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "yearly"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                İllik Məlumat
              </div>
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "expenses"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Xərc Təhlili
              </div>
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === "payments"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Gələcək Ödənişlər
              </div>
            </button>
          </div>

          <div className="p-6">
            {/* Yearly Data Tab */}
            {activeTab === "yearly" && (
              <form onSubmit={handleYearlySubmit} className="space-y-6">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İl
                  </label>
                  <input
                    type="number"
                    value={yearlyForm.year}
                    onChange={(e) =>
                      setYearlyForm({
                        ...yearlyForm,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="2020"
                    max="2030"
                    required
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Ay
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Gəlir (₼)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Xərc (₼)
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Mənfəət (₼)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyForm.months.map((monthData, index) => {
                        const gelir = monthData.gelir
                          ? Number(monthData.gelir)
                          : 0;
                        const xerc = monthData.xerc
                          ? Number(monthData.xerc)
                          : 0;
                        const profit = gelir - xerc;
                        return (
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium text-gray-900">
                                {monthData.month}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={monthData.gelir}
                                onChange={(e) =>
                                  handleMonthChange(
                                    index,
                                    "gelir",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                min="0"
                                step="0.01"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                value={monthData.xerc}
                                onChange={(e) =>
                                  handleMonthChange(
                                    index,
                                    "xerc",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                min="0"
                                step="0.01"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-sm font-medium ${
                                  profit >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {profit.toLocaleString()} ₼
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-300">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          Ümumi
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {yearlyForm.months
                            .reduce(
                              (sum, m) => sum + (m.gelir ? Number(m.gelir) : 0),
                              0
                            )
                            .toLocaleString()}{" "}
                          ₼
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {yearlyForm.months
                            .reduce(
                              (sum, m) => sum + (m.xerc ? Number(m.xerc) : 0),
                              0
                            )
                            .toLocaleString()}{" "}
                          ₼
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <span
                            className={
                              yearlyForm.months.reduce(
                                (sum, m) =>
                                  sum +
                                  (m.gelir ? Number(m.gelir) : 0) -
                                  (m.xerc ? Number(m.xerc) : 0),
                                0
                              ) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {yearlyForm.months
                              .reduce(
                                (sum, m) =>
                                  sum +
                                  (m.gelir ? Number(m.gelir) : 0) -
                                  (m.xerc ? Number(m.xerc) : 0),
                                0
                              )
                              .toLocaleString()}{" "}
                            ₼
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Bütün Ayları Əlavə Et
                </button>
              </form>
            )}

            {/* Expense Breakdown Tab */}
            {activeTab === "expenses" && (
              <div className="space-y-6">
                <form onSubmit={handleExpenseSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Xərc Kateqoriyası
                      </label>
                      <input
                        type="text"
                        value={expenseForm.name}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        list="expense-categories"
                        required
                      />
                      <datalist id="expense-categories">
                        {expenseCategories.map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Məbləğ (₼)
                      </label>
                      <input
                        type="number"
                        value={expenseForm.value}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            value: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rəng
                      </label>
                      <input
                        type="color"
                        value={expenseForm.color}
                        onChange={(e) =>
                          setExpenseForm({
                            ...expenseForm,
                            color: e.target.value,
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Əlavə Et
                  </button>
                </form>

                {/* Expense List */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Mövcud Xərc Kateqoriyaları
                  </h3>
                  <div className="space-y-2">
                    {financialData.expenseBreakdown.map((expense, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: expense.color }}
                          />
                          <span className="font-medium text-gray-900">
                            {expense.name}
                          </span>
                          <span className="text-gray-600">
                            {expense.value.toLocaleString()} ₼
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Payments Tab */}
            {activeTab === "payments" && (
              <div className="space-y-6">
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlıq
                      </label>
                      <input
                        type="text"
                        value={paymentForm.title}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Məbləğ (₼)
                      </label>
                      <input
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            amount: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarix
                      </label>
                      <input
                        type="date"
                        value={paymentForm.date}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            date: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kateqoriya
                      </label>
                      <input
                        type="text"
                        value={paymentForm.category}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Məs: Əmək haqqı"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Əlavə Et
                  </button>
                </form>

                {/* Payments List */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Gələcək Ödənişlər
                  </h3>
                  <div className="space-y-2">
                    {financialData.upcomingPayments.map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.title}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.date).toLocaleDateString("az-AZ")}{" "}
                            • {payment.amount.toLocaleString()} ₼
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            removeUpcomingPayment(index);
                            showSuccess("Ödəniş silindi!");
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataEntry;
