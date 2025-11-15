import { GoogleGenAI } from "@google/genai";

// Initialize Gemini AI
const getAIClient = () => {
  const apiKey = "AIzaSyAH4IUjPV46iVgn4m69eUPsBAaz9oSLcxU";
  if (!apiKey) {
    console.warn("Gemini API key not found. Using fallback mode.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Format financial data for AI analysis
const formatFinancialDataForAI = (financialData) => {
  const { monthlyData, expenseBreakdown, kpi, upcomingPayments } =
    financialData;

  const last12Months = monthlyData.slice(-12);
  const summary = {
    currentBalance: kpi.cashflow,
    monthlyProfit: kpi.monthlyProfit,
    totalExpenses: kpi.totalExpenses,
    growthRate: kpi.growthRate,
    recentMonths: last12Months.map((m) => ({
      month: m.month,
      revenue: m.gelir,
      expenses: m.xerc,
      profit: m.gelir - m.xerc,
      balance: m.balance,
    })),
    expenseCategories: expenseBreakdown.map((e) => ({
      name: e.name,
      amount: e.value,
      percentage: ((e.value / kpi.totalExpenses) * 100).toFixed(1),
    })),
    upcomingPayments: upcomingPayments.slice(0, 5),
  };

  return JSON.stringify(summary, null, 2);
};

// Generate AI recommendations using Gemini
export const generateAIRecommendations = async (financialData) => {
  const ai = getAIClient();
  if (!ai) {
    return getFallbackRecommendations(financialData);
  }

  try {
    const dataSummary = formatFinancialDataForAI(financialData);

    const prompt = `Sən maliyyə məsləhətçisi AI-sısan. Aşağıdakı maliyyə məlumatlarını təhlil et və konkret, hərəkətə keçirilə bilən tövsiyələr ver. 

Maliyyə Məlumatları:
${dataSummary}

Tövsiyələri aşağıdakı formatda ver (JSON):
{
  "recommendations": [
    {
      "id": "unique-id",
      "title": "Tövsiyə başlığı",
      "description": "Ətraflı təsvir",
      "priority": "Yüksək" | "Orta" | "Aşağı",
      "category": "xərc-optimizasiyası" | "gəlir-artırma" | "risk-idarəetməsi" | "investisiya" | "digər",
      "savings": ədəd (aylıq qənaət AZN-də, varsa),
      "potential": ədəd (potensial gəlir artımı AZN-də, varsa),
      "steps": ["addım 1", "addım 2", "addım 3"],
      "impact": "qısa təsir təsviri"
    }
  ],
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "title": "İnsight başlığı",
      "description": "Təsvir",
      "recommendation": "Tövsiyə"
    }
  ],
  "forecast": {
    "next3Months": {
      "predictedRevenue": ədəd,
      "predictedExpenses": ədəd,
      "predictedProfit": ədəd,
      "riskLevel": "aşağı" | "orta" | "yüksək"
    },
    "anomalies": ["anomaliya 1", "anomaliya 2"]
  }
}

Cavabı YALNIZ JSON formatında ver, heç bir əlavə mətn olmadan. Azərbaycan dilində yaz.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Handle different response formats
    let responseText = "";
    if (typeof response.text === "function") {
      responseText = await response.text();
    } else if (typeof response.text === "string") {
      responseText = response.text;
    } else if (response.response?.text) {
      responseText =
        typeof response.response.text === "function"
          ? await response.response.text()
          : response.response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    }

    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("AI API Error:", error);
    return getFallbackRecommendations(financialData);
  }
};

// Generate AI scenario suggestions for Simulator
export const generateAIScenarioSuggestions = async (financialData) => {
  const ai = getAIClient();
  if (!ai) {
    return getFallbackScenarios(financialData);
  }

  try {
    const dataSummary = formatFinancialDataForAI(financialData);

    const prompt = `Maliyyə məlumatlarına əsasən, 3 ən vacib "nə olarsa" ssenarisi təklif et:

Maliyyə Məlumatları:
${dataSummary}

Cavabı JSON formatında ver:
{
  "scenarios": [
    {
      "id": "unique-id",
      "title": "Ssenari başlığı",
      "description": "Təsvir",
      "revenueChange": ədəd (faiz dəyişikliyi, məs: -20),
      "expenseChange": ədəd (faiz dəyişikliyi, məs: 15),
      "loanAmount": ədəd (kredit məbləği, varsa),
      "loanTerm": ədəd (ay sayı),
      "interestRate": ədəd (faiz dərəcəsi),
      "oneTimeIncome": ədəd,
      "oneTimeExpense": ədəd,
      "reason": "Niyə bu ssenari vacibdir"
    }
  ]
}

YALNIZ JSON, heç bir əlavə mətn yox. Azərbaycan dilində.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Handle different response formats
    let responseText = "";
    if (typeof response.text === "function") {
      responseText = await response.text();
    } else if (typeof response.text === "string") {
      responseText = response.text;
    } else if (response.response?.text) {
      responseText =
        typeof response.response.text === "function"
          ? await response.response.text()
          : response.response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    }

    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("AI Scenario Error:", error);
    return getFallbackScenarios(financialData);
  }
};

// Generate AI insights for Dashboard
export const generateAIDashboardInsights = async (financialData) => {
  const ai = getAIClient();
  if (!ai) {
    return getFallbackInsights(financialData);
  }

  try {
    const dataSummary = formatFinancialDataForAI(financialData);

    const prompt = `Maliyyə məlumatlarını təhlil et və 3-4 qısa, vacib insight ver:

Maliyyə Məlumatları:
${dataSummary}

JSON formatında:
{
  "insights": [
    {
      "type": "positive" | "warning" | "info",
      "title": "Başlıq",
      "message": "Qısa mesaj",
      "icon": "trending-up" | "alert-circle" | "info"
    }
  ],
  "quickTip": "Bir sətirlik məsləhət"
}

YALNIZ JSON. Azərbaycan dilində.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Handle different response formats
    let responseText = "";
    if (typeof response.text === "function") {
      responseText = await response.text();
    } else if (typeof response.text === "string") {
      responseText = response.text;
    } else if (response.response?.text) {
      responseText =
        typeof response.response.text === "function"
          ? await response.response.text()
          : response.response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    }

    let jsonText = responseText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
    }

    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return getFallbackInsights(financialData);
  }
};

// Fallback recommendations (when API is not available)
const getFallbackRecommendations = (financialData) => {
  const { kpi, expenseBreakdown } = financialData;

  const recommendations = [];
  const insights = [];

  // Marketing optimization
  const marketingExpense = expenseBreakdown.find((e) => e.name === "Marketing");
  if (marketingExpense && marketingExpense.value > 5000) {
    recommendations.push({
      id: "marketing-opt",
      title: "Marketing Xərclərini Optimallaşdırın",
      description: `Marketing xərcləriniz ${marketingExpense.value.toLocaleString()} ₼ təşkil edir. ROI yüksək olan kanallara fokuslanmaqla qənaət edə bilərsiniz.`,
      priority: "Yüksək",
      category: "xərc-optimizasiyası",
      savings: Math.round(marketingExpense.value * 0.15),
      steps: [
        "Ən çox gəlir gətirən marketing kanallarını müəyyənləşdirin",
        "ROI aşağı olan kampanyaları dayandırın",
        "Rəqəmsal marketing alətlərindən daha çox istifadə edin",
      ],
      impact: "Aylıq 15% qənaət potensialı",
    });
  }

  // Cash flow risk
  if (kpi.cashflow < 50000) {
    insights.push({
      type: "warning",
      title: "Nəqd Axını Riski",
      description:
        "Hazırki balansınız aşağıdır. Ehtiyat fondu yaratmaq vacibdir.",
      recommendation: "Ən az 3 aylıq xərc ehtiyatı yaradın",
    });
  }

  return {
    recommendations,
    insights,
    forecast: {
      next3Months: {
        predictedRevenue: kpi.monthlyProfit * 1.1,
        predictedExpenses: kpi.totalExpenses * 1.05,
        predictedProfit: kpi.monthlyProfit * 1.1 - kpi.totalExpenses * 1.05,
        riskLevel: kpi.cashflow < 50000 ? "yüksək" : "orta",
      },
      anomalies: [],
    },
  };
};

const getFallbackScenarios = (financialData) => {
  return {
    scenarios: [
      {
        id: "revenue-drop",
        title: "Gəlirin 20% azalması",
        description: "Müştəri itkisi və ya bazar durgunluğu",
        revenueChange: -20,
        expenseChange: 0,
        loanAmount: 0,
        loanTerm: 0,
        interestRate: 0,
        oneTimeIncome: 0,
        oneTimeExpense: 0,
        reason: "Bazar şəraitinin dəyişməsi riskini qiymətləndirmək üçün",
      },
    ],
  };
};

const getFallbackInsights = (financialData) => {
  return {
    insights: [
      {
        type: "info",
        title: "Maliyyə Vəziyyəti",
        message: "Maliyyə göstəriciləriniz stabil görünür",
        icon: "info",
      },
    ],
    quickTip: "Daimi monitoring maliyyə sağlamlığını təmin edir",
  };
};
