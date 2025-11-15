import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { mockFinancialData } from "../data/mockFinancialData";

const FinancialDataContext = createContext();

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error(
      "useFinancialData must be used within FinancialDataProvider"
    );
  }
  return context;
};

export const FinancialDataProvider = ({ children }) => {
  const [financialData, setFinancialData] = useState(() => {
    // Load from localStorage or use mock data
    const savedData = localStorage.getItem("financialData");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        return mockFinancialData;
      }
    }
    return mockFinancialData;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("financialData", JSON.stringify(financialData));
  }, [financialData]);

  // Calculate KPIs dynamically
  const calculatedKPI = useMemo(() => {
    const { monthlyData } = financialData;
    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    if (!currentMonth) {
      return {
        monthlyProfit: 0,
        cashflow: 0,
        totalExpenses: 0,
        growthRate: 0,
      };
    }

    const monthlyProfit = currentMonth.profit || 0;
    const cashflow = currentMonth.balance || 0;
    const totalExpenses = currentMonth.xerc || 0;

    let growthRate = 0;
    if (previousMonth && currentMonth && previousMonth.gelir > 0) {
      growthRate = Number(
        (
          ((currentMonth.gelir - previousMonth.gelir) / previousMonth.gelir) *
          100
        ).toFixed(2)
      );
    }

    return {
      monthlyProfit,
      cashflow,
      totalExpenses,
      growthRate,
    };
  }, [financialData]);

  // Add monthly data entry (can be called multiple times for all 12 months)
  const addYearlyData = (monthData) => {
    const { year, month, gelir, xerc } = monthData;
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
    const monthIndex = months.indexOf(month);

    if (monthIndex === -1) {
      throw new Error("Invalid month");
    }

    const date = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
    const profit = gelir - xerc;

    // Get last balance from previous entry
    let previousBalance = 0;

    // Find the last entry before this month/year
    const sortedData = [...financialData.monthlyData].sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Find the entry just before this one chronologically
    for (let i = sortedData.length - 1; i >= 0; i--) {
      const entry = sortedData[i];
      if (
        entry.year < year ||
        (entry.year === year && months.indexOf(entry.month) < monthIndex)
      ) {
        previousBalance = entry.balance;
        break;
      }
    }

    const balance = previousBalance + profit;

    const newEntry = {
      month,
      year,
      date,
      gelir,
      xerc,
      profit,
      balance: Math.round(balance),
    };

    // Check if entry for this month/year already exists
    const existingIndex = financialData.monthlyData.findIndex(
      (entry) => entry.month === month && entry.year === year
    );

    let updatedMonthlyData;
    if (existingIndex >= 0) {
      // Update existing entry
      updatedMonthlyData = [...financialData.monthlyData];
      updatedMonthlyData[existingIndex] = newEntry;
    } else {
      // Add new entry
      updatedMonthlyData = [...financialData.monthlyData, newEntry];
    }

    // Sort by year and month
    updatedMonthlyData.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Recalculate all balances to ensure consistency
    for (let i = 1; i < updatedMonthlyData.length; i++) {
      const prev = updatedMonthlyData[i - 1];
      updatedMonthlyData[i] = {
        ...updatedMonthlyData[i],
        balance: prev.balance + updatedMonthlyData[i].profit,
      };
    }

    setFinancialData({
      ...financialData,
      monthlyData: updatedMonthlyData,
    });
  };

  // Update expense breakdown
  const updateExpenseBreakdown = (expenseBreakdown) => {
    setFinancialData({
      ...financialData,
      expenseBreakdown,
    });
  };

  // Add upcoming payment
  const addUpcomingPayment = (payment) => {
    setFinancialData({
      ...financialData,
      upcomingPayments: [...financialData.upcomingPayments, payment],
    });
  };

  // Remove upcoming payment
  const removeUpcomingPayment = (index) => {
    const updated = financialData.upcomingPayments.filter(
      (_, i) => i !== index
    );
    setFinancialData({
      ...financialData,
      upcomingPayments: updated,
    });
  };

  // Reset to mock data
  const resetToMockData = () => {
    setFinancialData(mockFinancialData);
    localStorage.removeItem("financialData");
  };

  const value = {
    financialData: {
      ...financialData,
      kpi: calculatedKPI,
    },
    addYearlyData,
    updateExpenseBreakdown,
    addUpcomingPayment,
    removeUpcomingPayment,
    resetToMockData,
  };

  return (
    <FinancialDataContext.Provider value={value}>
      {children}
    </FinancialDataContext.Provider>
  );
};
