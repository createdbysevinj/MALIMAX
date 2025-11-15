import React from "react";
import KpiCard from "../components/KpiCard";
import RevenueExpensesChart from "../components/RevenueExpensesChart";
import CashflowChart from "../components/CashflowChart";
import ExpensePieChart from "../components/ExpensePieChart";
import UpcomingPayments from "../components/UpcomingPayments";
import AIInsightsWidget from "../components/AIInsightsWidget";
import { useFinancialData } from "../contexts/FinancialDataContext";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

const Dashboard = ({ animateCards, onNavigate }) => {
  const { financialData } = useFinancialData();
  const kpis = [
    {
      title: "Aylıq Mənfəət",
      value: `${financialData.kpi.monthlyProfit.toLocaleString()} ₼`,
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      change: "+12.5%",
      positive: true,
    },
    {
      title: "Nəqd Axını",
      value: `${financialData.kpi.cashflow.toLocaleString()} ₼`,
      icon: <DollarSign className="w-6 h-6 text-blue-500" />,
      change: "+8.2%",
      positive: true,
    },
    {
      title: "Aylıq Xərclər",
      value: `${financialData.kpi.totalExpenses.toLocaleString()} ₼`,
      icon: <TrendingDown className="w-6 h-6 text-orange-500" />,
      change: "+5.1%",
      positive: false,
    },
    {
      title: "Böyümə Dərəcəsi",
      value: `${financialData.kpi.growthRate}%`,
      icon: <Target className="w-6 h-6 text-purple-500" />,
      change: "+2.3%",
      positive: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <KpiCard
              key={index}
              {...kpi}
              delay={animateCards ? index * 100 : 0}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RevenueExpensesChart data={financialData.monthlyData} />
          <CashflowChart data={financialData.monthlyData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <ExpensePieChart data={financialData.expenseBreakdown} />
          <div className="lg:col-span-2">
            <UpcomingPayments payments={financialData.upcomingPayments} />
          </div>
        </div>

        {/* AI Insights Widget */}
        <AIInsightsWidget
          financialData={financialData}
          onNavigate={onNavigate}
        />
      </main>
    </div>
  );
};

export default Dashboard;
