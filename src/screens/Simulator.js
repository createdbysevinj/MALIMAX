import React, {
  useState,
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
} from "react";
import {
  Calculator,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Info,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { generateAIScenarioSuggestions } from "../services/aiService";
import { useFinancialData } from "../contexts/FinancialDataContext";

// Financial Context
const ACTIONS = {
  SET_MONTHLY_DATA: "SET_MONTHLY_DATA",
  ADD_MONTH_DATA: "ADD_MONTH_DATA",
  UPDATE_MONTH_DATA: "UPDATE_MONTH_DATA",
  SET_EXPENSE_CATEGORIES: "SET_EXPENSE_CATEGORIES",
  RESET_DATA: "RESET_DATA",
};

// Initial state will be set dynamically from context
const getInitialState = (financialData) => ({
  monthlyData: financialData.monthlyData,
  expenseCategories: financialData.expenseBreakdown.map((exp) => ({
    name: exp.name,
    percentage: (exp.value / financialData.kpi.totalExpenses) * 100,
    color: exp.color,
  })),
});

const financialReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_MONTHLY_DATA:
      return { ...state, monthlyData: action.payload };
    case ACTIONS.ADD_MONTH_DATA:
      return { ...state, monthlyData: [...state.monthlyData, action.payload] };
    case ACTIONS.UPDATE_MONTH_DATA:
      return {
        ...state,
        monthlyData: state.monthlyData.map((m) =>
          m.date === action.payload.date ? { ...m, ...action.payload } : m
        ),
      };
    case ACTIONS.SET_EXPENSE_CATEGORIES:
      return { ...state, expenseCategories: action.payload };
    case ACTIONS.RESET_DATA:
      return action.payload;
    default:
      return state;
  }
};

const FinancialContext = createContext();

const FinancialProvider = ({ children, initialData }) => {
  const initialState = getInitialState(initialData);
  const [state, dispatch] = useReducer(financialReducer, initialState);

  const calculations = useMemo(() => {
    const { monthlyData, expenseCategories } = state;
    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];

    const monthlyProfit = currentMonth?.profit || 0;
    const cashflow = currentMonth?.balance || 0;
    const totalExpenses = currentMonth?.xerc || 0;

    const growthRate =
      previousMonth && currentMonth
        ? ((currentMonth.gelir - previousMonth.gelir) / previousMonth.gelir) *
          100
        : 0;

    const expenseBreakdown = expenseCategories.map((c) => ({
      ...c,
      value: Math.round((totalExpenses * c.percentage) / 100),
    }));

    const lastThree = monthlyData.slice(-3);
    const avgRevenue =
      lastThree.reduce((s, m) => s + m.gelir, 0) / lastThree.length;
    const avgExpenses =
      lastThree.reduce((s, m) => s + m.xerc, 0) / lastThree.length;
    const avgProfit = avgRevenue - avgExpenses;

    return {
      monthlyDataWithBalance: monthlyData,
      kpi: { monthlyProfit, cashflow, totalExpenses, growthRate },
      expenseBreakdown,
      trends: { avgRevenue, avgExpenses, avgProfit },
    };
  }, [state]);

  return (
    <FinancialContext.Provider
      value={{ state, dispatch, calculations, actions: ACTIONS }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context)
    throw new Error("useFinancial must be used within a FinancialProvider");
  return context;
};

// Input Components
const SliderInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "%",
  info,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {info && (
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute right-0 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            {info}
          </div>
        </div>
      )}
    </div>
    <div className="flex items-center space-x-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <span className="text-sm text-gray-600 w-8">{unit}</span>
    </div>
  </div>
);

const NumberInput = ({
  label,
  value,
  onChange,
  placeholder,
  unit = "₼",
  info,
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {info && (
        <div className="group relative">
          <Info className="w-4 h-4 text-gray-400 cursor-help" />
          <div className="absolute right-0 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
            {info}
          </div>
        </div>
      )}
    </div>
    <div className="relative">
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        placeholder={placeholder}
        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <span className="absolute right-3 top-2 text-gray-500 text-sm">
        {unit}
      </span>
    </div>
  </div>
);

// Scenario Builder
const CustomScenarioBuilder = ({ onScenarioChange }) => {
  const { calculations } = useFinancial();
  const { trends } = calculations;

  const [scenario, setScenario] = useState({
    revenueChange: 0,
    expenseChange: 0,
    oneTimeIncome: 0,
    oneTimeExpense: 0,
    loanAmount: 0,
    loanTerm: 12,
    interestRate: 5,
  });

  const handleChange = (field, value) => {
    const newScenario = { ...scenario, [field]: value };
    setScenario(newScenario);
    if (onScenarioChange) onScenarioChange(newScenario);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-4">
        <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
          <Calculator className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
          Ssenari Konfiqurasiyası
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Monthly Changes */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-500" />
            Aylıq Dəyişikliklər
          </h4>
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-4">
            <SliderInput
              label="Gəlir dəyişikliyi"
              value={scenario.revenueChange}
              onChange={(v) => handleChange("revenueChange", v)}
              min={-50}
              max={50}
              info={`Cari orta gəlir: ${Math.round(
                trends.avgRevenue
              ).toLocaleString()} ₼/ay`}
            />
            <SliderInput
              label="Xərc dəyişikliyi"
              value={scenario.expenseChange}
              onChange={(v) => handleChange("expenseChange", v)}
              min={-30}
              max={30}
              info={`Cari orta xərc: ${Math.round(
                trends.avgExpenses
              ).toLocaleString()} ₼/ay`}
            />
          </div>
        </div>

        {/* One-time Events */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
            Birdəfəlik Hadisələr
          </h4>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg space-y-4">
            <NumberInput
              label="Birdəfəlik gəlir"
              value={scenario.oneTimeIncome}
              onChange={(v) => handleChange("oneTimeIncome", v)}
              placeholder="Məsələn: 50000"
              info="Böyük müqavilə, aktiv satışı və s."
            />
            <NumberInput
              label="Birdəfəlik xərc"
              value={scenario.oneTimeExpense}
              onChange={(v) => handleChange("oneTimeExpense", v)}
              placeholder="Məsələn: 25000"
              info="Avadanlıq alışı, təmir xərcləri və s."
            />
          </div>
        </div>

        {/* Loan Parameters */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center text-sm sm:text-base">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-500" />
            Kredit Parametrləri
          </h4>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg space-y-4">
            <NumberInput
              label="Kredit məbləği"
              value={scenario.loanAmount}
              onChange={(v) => handleChange("loanAmount", v)}
              placeholder="Məsələn: 100000"
              info="Bank kreditinin ümumi məbləği"
            />
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                label="Müddət"
                value={scenario.loanTerm}
                onChange={(v) => handleChange("loanTerm", v)}
                placeholder="12"
                unit="ay"
                info="Kreditin geri ödəmə müddəti"
              />
              <NumberInput
                label="Faiz dərəcəsi"
                value={scenario.interestRate}
                onChange={(v) => handleChange("interestRate", v)}
                placeholder="5"
                unit="%"
                info="İllik faiz dərəcəsi"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Scenario Results
const ScenarioResults = ({ scenario }) => {
  const { calculations } = useFinancial();

  const results = useMemo(() => {
    if (!scenario) return null;

    const { trends, kpi } = calculations;
    const currentBalance = kpi.cashflow;

    const newMonthlyRevenue =
      trends.avgRevenue * (1 + scenario.revenueChange / 100);
    const newMonthlyExpenses =
      trends.avgExpenses * (1 + scenario.expenseChange / 100);

    let monthlyLoanPayment = 0;
    if (scenario.loanAmount > 0 && scenario.loanTerm > 0) {
      const monthlyRate = scenario.interestRate / 100 / 12;
      if (monthlyRate > 0) {
        monthlyLoanPayment =
          (scenario.loanAmount *
            monthlyRate *
            Math.pow(1 + monthlyRate, scenario.loanTerm)) /
          (Math.pow(1 + monthlyRate, scenario.loanTerm) - 1);
      } else {
        monthlyLoanPayment = scenario.loanAmount / scenario.loanTerm;
      }
    }

    const newMonthlyProfit =
      newMonthlyRevenue - newMonthlyExpenses - monthlyLoanPayment;
    const projectedBalance =
      currentBalance +
      scenario.oneTimeIncome -
      scenario.oneTimeExpense +
      scenario.loanAmount +
      newMonthlyProfit * 6;

    let monthsUntilCritical = null;
    if (newMonthlyProfit < 0) {
      const adjustedBalance =
        currentBalance +
        scenario.oneTimeIncome -
        scenario.oneTimeExpense +
        scenario.loanAmount;
      monthsUntilCritical = Math.floor(
        adjustedBalance / Math.abs(newMonthlyProfit)
      );
    }

    const projections = [];
    let runningBalance =
      currentBalance +
      scenario.oneTimeIncome -
      scenario.oneTimeExpense +
      scenario.loanAmount;

    for (let i = 0; i < 12; i++) {
      runningBalance += newMonthlyProfit;
      projections.push({
        month: `Ay ${i + 1}`,
        originalProjection: kpi.cashflow + trends.avgProfit * (i + 1),
        scenarioProjection: runningBalance,
        monthlyProfit: newMonthlyProfit,
      });
    }

    // Fixed yearly impact logic
    const revenueImpact = Math.round(
      (newMonthlyRevenue - trends.avgRevenue) * 12
    );
    const expenseImpact = Math.round(
      (newMonthlyExpenses - trends.avgExpenses) * 12
    );
    const loanImpact = Math.round(monthlyLoanPayment * 12);

    return {
      currentBalance,
      projectedBalance: Math.round(projectedBalance),
      newMonthlyRevenue: Math.round(newMonthlyRevenue),
      newMonthlyExpenses: Math.round(newMonthlyExpenses),
      newMonthlyProfit: Math.round(newMonthlyProfit),
      monthlyLoanPayment: Math.round(monthlyLoanPayment),
      monthsUntilCritical,
      projections,
      impactAnalysis: {
        revenueImpact,
        expenseImpact,
        loanImpact,
        profitImpact: Math.round((newMonthlyProfit - trends.avgProfit) * 12),
      },
    };
  }, [scenario, calculations]);

  if (!results) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 text-center shadow-inner border border-gray-200">
        <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Ssenari Analiz Gözləyir
        </h3>
        <p className="text-gray-500">
          Solda parametrləri dəyişdirərək nəticələri görün
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Projection Chart */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">
            12 Aylıq Proyeksiya Qrafiki
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results.projections}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis
                stroke="#6b7280"
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value, name) => [
                  `${value.toLocaleString()} ₼`,
                  name === "originalProjection"
                    ? "Cari proqnoz"
                    : "Ssenari proqnoz",
                ]}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="originalProjection"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Cari proqnoz"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="scenarioProjection"
                stroke="#6366f1"
                strokeWidth={3}
                name="Ssenari proqnozu"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 sm:px-6 py-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Əsas Göstəricilər
          </h3>
        </div>

        <div className="p-6">
          {/* Risk Warning */}
          {results.monthsUntilCritical !== null &&
            results.monthsUntilCritical >= 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-800 mb-1">
                      ⚠️ Risk Xəbərdarlığı
                    </h4>
                    <p className="text-red-700">
                      Bu ssenaridə təxminən{" "}
                      <strong>{results.monthsUntilCritical} ay</strong> sonra
                      balans mənfi olacaq!
                    </p>
                  </div>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
              <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
              <p className="text-sm text-blue-700 font-medium mb-1">
                Hazırki Balans
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {results.currentBalance.toLocaleString()} ₼
              </p>
            </div>

            <div
              className={`bg-gradient-to-br ${
                results.projectedBalance >= results.currentBalance
                  ? "from-green-50 to-green-100"
                  : "from-red-50 to-red-100"
              } rounded-xl p-5 border ${
                results.projectedBalance >= results.currentBalance
                  ? "border-green-200"
                  : "border-red-200"
              }`}
            >
              {results.projectedBalance >= results.currentBalance ? (
                <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-600 mb-2" />
              )}
              <p
                className={`text-sm font-medium mb-1 ${
                  results.projectedBalance >= results.currentBalance
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                6 Ay Sonra
              </p>
              <p
                className={`text-2xl font-bold ${
                  results.projectedBalance >= results.currentBalance
                    ? "text-green-900"
                    : "text-red-900"
                }`}
              >
                {results.projectedBalance.toLocaleString()} ₼
              </p>
            </div>

            <div
              className={`bg-gradient-to-br ${
                results.newMonthlyProfit >= 0
                  ? "from-purple-50 to-purple-100"
                  : "from-orange-50 to-orange-100"
              } rounded-xl p-5 border ${
                results.newMonthlyProfit >= 0
                  ? "border-purple-200"
                  : "border-orange-200"
              }`}
            >
              <Calculator
                className={`w-8 h-8 mb-2 ${
                  results.newMonthlyProfit >= 0
                    ? "text-purple-600"
                    : "text-orange-600"
                }`}
              />
              <p
                className={`text-sm font-medium mb-1 ${
                  results.newMonthlyProfit >= 0
                    ? "text-purple-700"
                    : "text-orange-700"
                }`}
              >
                Yeni Aylıq Mənfəət
              </p>
              <p
                className={`text-2xl font-bold ${
                  results.newMonthlyProfit >= 0
                    ? "text-purple-900"
                    : "text-orange-900"
                }`}
              >
                {results.newMonthlyProfit.toLocaleString()} ₼
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Aylıq Təfərrüatlar
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Yeni gəlir:</span>
                  <span className="font-semibold text-green-600">
                    {results.newMonthlyRevenue.toLocaleString()} ₼
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Yeni xərclər:</span>
                  <span className="font-semibold text-red-600">
                    {results.newMonthlyExpenses.toLocaleString()} ₼
                  </span>
                </div>
                {results.monthlyLoanPayment > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Kredit ödənişi:</span>
                    <span className="font-semibold text-orange-600">
                      {results.monthlyLoanPayment.toLocaleString()} ₼
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 pt-3 border-t-2 border-gray-300">
                  <span className="font-medium text-gray-800">
                    Xalis mənfəət:
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      results.newMonthlyProfit >= 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {results.newMonthlyProfit.toLocaleString()} ₼
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 italic">
                  * Aylıq mənfəət = Gəlir - Xərclər - Kredit
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                İllik Təsir Analizi
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Gəlir dəyişikliyi:</span>
                  <span
                    className={`font-semibold ${
                      results.impactAnalysis.revenueImpact >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {results.impactAnalysis.revenueImpact >= 0 ? "+" : ""}
                    {results.impactAnalysis.revenueImpact.toLocaleString()} ₼
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Xərc dəyişikliyi:</span>
                  <span
                    className={`font-semibold ${
                      results.impactAnalysis.expenseImpact <= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {results.impactAnalysis.expenseImpact >= 0 ? "+" : ""}
                    {results.impactAnalysis.expenseImpact.toLocaleString()} ₼
                  </span>
                </div>
                <div className="flex justify-between py-2 pt-3 border-t-2 border-gray-300">
                  <span className="font-medium text-gray-800">
                    Xalis təsir:
                  </span>
                  <span
                    className={`font-bold text-lg ${
                      results.impactAnalysis.profitImpact >= 0
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {results.impactAnalysis.profitImpact >= 0 ? "+" : ""}
                    {results.impactAnalysis.profitImpact.toLocaleString()} ₼
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500 italic">
                  * İllik təsir = (Gəlir - Xərc - Kredit) × 12 ay
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Scenario Suggestions Component
const AIScenarioSuggestions = ({ financialData, onSelectScenario }) => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!financialData) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await generateAIScenarioSuggestions(financialData);
        setSuggestions(result);
      } catch (error) {
        console.error("AI Scenario Suggestions Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [financialData]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          <span className="text-gray-600">
            AI ssenari təklifləri hazırlanır...
          </span>
        </div>
      </div>
    );
  }

  if (
    !suggestions ||
    !suggestions.scenarios ||
    suggestions.scenarios.length === 0
  ) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-6 shadow-lg border border-purple-300 mb-6 text-white">
      <div className="flex items-center space-x-3 mb-4">
        <Sparkles className="w-6 h-6" />
        <h3 className="text-xl font-bold">AI Tövsiyə Olunan Ssenarilər</h3>
      </div>
      <p className="text-blue-100 text-sm mb-4">
        AI maliyyə məlumatlarınızı təhlil edərək ən vacib ssenariləri təklif
        edir
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suggestions.scenarios.map((scenario) => (
          <div
            key={scenario.id}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
            onClick={() => onSelectScenario(scenario)}
          >
            <h4 className="font-semibold mb-2">{scenario.title}</h4>
            <p className="text-sm text-blue-100 mb-3">{scenario.description}</p>
            {scenario.reason && (
              <p className="text-xs text-blue-200 italic mb-3">
                💡 {scenario.reason}
              </p>
            )}
            <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 rounded-lg text-sm font-medium transition-all">
              Bu ssenarini tətbiq et
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Simulator
const Simulator = ({ onNavigate }) => {
  const { financialData } = useFinancialData();
  const [currentScenario, setCurrentScenario] = useState(null);

  const handleAIScenarioSelect = (aiScenario) => {
    // Convert AI scenario to our scenario format
    const scenario = {
      revenueChange: aiScenario.revenueChange || 0,
      expenseChange: aiScenario.expenseChange || 0,
      oneTimeIncome: aiScenario.oneTimeIncome || 0,
      oneTimeExpense: aiScenario.oneTimeExpense || 0,
      loanAmount: aiScenario.loanAmount || 0,
      loanTerm: aiScenario.loanTerm || 0,
      interestRate: aiScenario.interestRate || 0,
    };
    setCurrentScenario(scenario);
  };

  return (
    <FinancialProvider initialData={financialData}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <main className="max-w-7xl mx-auto px-6 pb-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Maliyyə Ssenari Simulyatoru
            </h1>
            <p className="text-gray-600 mt-1">
              Müxtəlif Ssenariərə görə maliyyə vəziyyətinizi analiz edin
            </p>
          </div>
          {/* AI Scenario Suggestions */}
          {financialData && (
            <AIScenarioSuggestions
              financialData={financialData}
              onSelectScenario={handleAIScenarioSelect}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <CustomScenarioBuilder onScenarioChange={setCurrentScenario} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <ScenarioResults scenario={currentScenario} />
            </div>
          </div>
        </main>
      </div>
    </FinancialProvider>
  );
};

export default Simulator;
