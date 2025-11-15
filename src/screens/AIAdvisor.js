import React, { useState, useEffect } from "react";
import {
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Sparkles,
  Loader2,
} from "lucide-react";
import { generateAIRecommendations } from "../services/aiService";
import { useFinancialData } from "../contexts/FinancialDataContext";

// AI Recommendation Card Component
export const AIRecommendationCard = ({
  recommendation,
  onImplement,
  onDismiss,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [status, setStatus] = useState("pending");

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Yüksək":
        return "bg-red-100 text-red-700 border-red-200";
      case "Orta":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Aşağı":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "xərc-optimizasiyası":
        return <Target className="w-5 h-5 text-blue-500" />;
      case "gəlir-artırma":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "risk-idarəetməsi":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "investisiya":
        return <DollarSign className="w-5 h-5 text-purple-500" />;
      default:
        return <Lightbulb className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "implemented":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "dismissed":
        return <Clock className="w-5 h-5 text-gray-400" />;
      default:
        return getCategoryIcon(recommendation.category || "digər");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-sm border transition-all duration-300 ${
        status === "implemented"
          ? "border-green-200 bg-green-50"
          : status === "dismissed"
          ? "border-gray-200 bg-gray-50"
          : "border-gray-200 hover:border-blue-300 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              status === "implemented"
                ? "bg-green-100"
                : status === "dismissed"
                ? "bg-gray-100"
                : "bg-gray-50"
            }`}
          >
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {recommendation.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                  recommendation.priority
                )}`}
              >
                {recommendation.priority} prioritet
              </span>
              {recommendation.category && (
                <span className="text-xs text-gray-500 capitalize">
                  {recommendation.category}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{recommendation.description}</p>

      {/* Impact */}
      {recommendation.impact && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium">
            {recommendation.impact}
          </p>
        </div>
      )}

      {/* Potential Impact */}
      {(recommendation.savings || recommendation.potential) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          {recommendation.savings && (
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-blue-800 font-medium">
                Potensial qənaət:
              </span>
              <span className="font-bold text-blue-900 text-lg">
                {recommendation.savings.toLocaleString()} ₼/ay
              </span>
            </div>
          )}
          {recommendation.potential && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-800 font-medium">
                Potensial gəlir artımı:
              </span>
              <span className="font-bold text-purple-900 text-lg">
                +{recommendation.potential.toLocaleString()} ₼/ay
              </span>
            </div>
          )}
        </div>
      )}

      {/* Detailed Steps - Expandable */}
      {recommendation.steps && recommendation.steps.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>
              {isExpanded ? "Addımları gizlə" : "Tətbiq addımlarını gör"}
            </span>
            <div
              className={`transform transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </div>
          </button>

          {isExpanded && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">
                Tətbiq addımları:
              </h4>
              <ol className="space-y-2">
                {recommendation.steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700 flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {status === "pending" && (
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setStatus("implemented");
              if (onImplement) onImplement(recommendation);
            }}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
          >
            Tətbiq et
          </button>
          <button
            onClick={() => {
              setStatus("dismissed");
              if (onDismiss) onDismiss(recommendation);
            }}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Təxirə sal
          </button>
        </div>
      )}

      {status === "implemented" && (
        <div className="flex items-center space-x-2 text-green-700 bg-green-100 py-2.5 px-4 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Tətbiq edildi</span>
        </div>
      )}
    </div>
  );
};

// AI Insights Dashboard Component
export const AIInsightsDashboard = ({ insights, forecast }) => {
  const getInsightIcon = (type) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case "info":
        return <BarChart3 className="w-6 h-6 text-blue-500" />;
      default:
        return <PieChart className="w-6 h-6 text-purple-500" />;
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "yüksək":
        return "text-red-600 bg-red-100";
      case "orta":
        return "text-orange-600 bg-orange-100";
      case "aşağı":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-8 h-8" />
            <h3 className="text-2xl font-bold">AI Maliyyə Təhlili</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="bg-white/20 rounded-lg p-4 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {getInsightIcon(insight.type)}
                  </div>
                  <h4 className="font-semibold text-lg text-white">
                    {insight.title}
                  </h4>
                </div>
                <p className="text-white text-sm mb-3 leading-relaxed">
                  {insight.description}
                </p>
                {insight.recommendation && (
                  <p className="text-xs text-white bg-white/20 rounded p-2 leading-relaxed">
                    <strong>💡 Tövsiyə:</strong> {insight.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast */}
      {forecast && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-gray-900">
              AI Proqnoz (Növbəti 3 ay)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 mb-1">
                Proqnozlaşdırılan Gəlir
              </p>
              <p className="text-2xl font-bold text-blue-800">
                {forecast.next3Months?.predictedRevenue?.toLocaleString() ||
                  "N/A"}{" "}
                ₼
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 mb-1">
                Proqnozlaşdırılan Xərc
              </p>
              <p className="text-2xl font-bold text-orange-800">
                {forecast.next3Months?.predictedExpenses?.toLocaleString() ||
                  "N/A"}{" "}
                ₼
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 mb-1">
                Proqnozlaşdırılan Mənfəət
              </p>
              <p className="text-2xl font-bold text-green-800">
                {forecast.next3Months?.predictedProfit?.toLocaleString() ||
                  "N/A"}{" "}
                ₼
              </p>
            </div>
          </div>

          {forecast.next3Months?.riskLevel && (
            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getRiskColor(
                forecast.next3Months.riskLevel
              )}`}
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">
                Risk Səviyyəsi: {forecast.next3Months.riskLevel.toUpperCase()}
              </span>
            </div>
          )}

          {forecast.anomalies && forecast.anomalies.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Aşkar edilmiş anomaliyalar:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                {forecast.anomalies.map((anomaly, index) => (
                  <li key={index}>{anomaly}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// AI Recommendations List Component
export const AIRecommendationsList = ({
  recommendations,
  onImplement,
  onDismiss,
}) => {
  const [implementedCount, setImplementedCount] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  const handleImplement = (recommendation) => {
    setImplementedCount((prev) => prev + 1);
    if (recommendation.savings) {
      setTotalSavings((prev) => prev + recommendation.savings);
    }
    if (onImplement) onImplement(recommendation);
  };

  const handleDismiss = (recommendation) => {
    if (onDismiss) onDismiss(recommendation);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {recommendations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Aktiv tövsiyə</div>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {implementedCount}
            </div>
            <div className="text-sm text-gray-600">Tətbiq edilmiş</div>
          </div>
          <div className="text-center">
            <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {totalSavings.toLocaleString()} ₼
            </div>
            <div className="text-sm text-gray-600">Potensial qənaət</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations &&
          recommendations.map((recommendation) => (
            <AIRecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              onImplement={handleImplement}
              onDismiss={handleDismiss}
            />
          ))}
      </div>

      {(!recommendations || recommendations.length === 0) && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hazırda tövsiyə yoxdur
          </h3>
          <p className="text-gray-600">
            AI sisteminiz məlumatları təhlil edir və tezliklə yeni tövsiyələr
            təqdim edəcək.
          </p>
        </div>
      )}
    </div>
  );
};

// Complete AI Advisor Component
const AIAdvisor = ({ onNavigate }) => {
  const { financialData } = useFinancialData();
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      if (!financialData) {
        setError("Maliyyə məlumatları yoxdur");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await generateAIRecommendations(financialData);
        setAiData(result);
      } catch (err) {
        console.error("AI Error:", err);
        setError(
          "AI təhlili zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAIRecommendations();
  }, [financialData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 pb-6 space-y-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-500" />
            AI Maliyyə Tövsiyəçisi
          </h1>
          <p className="text-gray-600 mt-1">
            Ağıllı tövsiyələr və avtomatik maliyyə optimizasiyası
          </p>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">
              AI maliyyə məlumatlarınızı təhlil edir...
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Bu bir neçə saniyə çəkə bilər
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-semibold text-red-800">Xəta</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && aiData && (
          <>
            {/* AI Insights Dashboard */}
            <AIInsightsDashboard
              insights={aiData.insights}
              forecast={aiData.forecast}
            />

            {/* AI Recommendations */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-500" />
                AI Tövsiyələri
              </h2>
              <AIRecommendationsList
                recommendations={aiData.recommendations}
                onImplement={(rec) => {
                  console.log("Recommendation implemented:", rec);
                  // Here you could update financial data if needed
                }}
                onDismiss={(rec) => {
                  console.log("Recommendation dismissed:", rec);
                }}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AIAdvisor;
