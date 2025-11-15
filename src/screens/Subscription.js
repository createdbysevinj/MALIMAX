import React, { useState } from "react";
import {
  CreditCard,
  Building,
  Check,
  Sparkles,
  Zap,
  Shield,
  Star,
} from "lucide-react";

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState("freemium");

  const plans = [
    {
      id: "freemium",
      name: "Freemium",
      price: "Pulsuz",
      period: "",
      description: "Kiçik bizneslər üçün əsas funksiyalar",
      features: [
        { text: "Əsas dashboard və qrafiklər", included: true },
        { text: "Ödəniş xatırlatmaları", included: true },
        { text: "Əsas maliyyə hesabatları", included: true },
        { text: "3 aylıq məlumat saxlama", included: true },
        { text: "AI tövsiyələr", included: false },
        { text: "Pul axını simulyatoru", included: false },
        { text: "Detallı proqnozlar", included: false },
        { text: "Prioritet dəstək", included: false },
      ],
      popular: false,
      icon: <Zap className="w-6 h-6" />,
      color: "from-gray-500 to-gray-600",
    },
    {
      id: "premium",
      name: "Premium",
      price: "29",
      period: "₼/ay",
      description: "Böyüməkdə olan bizneslər üçün",
      features: [
        { text: "Bütün Freemium funksiyalar", included: true },
        { text: "AI maliyyə tövsiyəçisi", included: true },
        { text: "Pul axını simulyatoru", included: true },
        { text: "Detallı proqnozlar və analitika", included: true },
        { text: "İllik məlumat saxlama", included: true },
        { text: "Prioritet dəstək", included: true },
        { text: "Eksport funksiyaları (PDF/Excel)", included: true },
        { text: "Çox istifadəçi dəstəyi", included: true },
      ],
      popular: true,
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-blue-500 to-purple-600",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Müştəri",
      period: "",
      description: "Böyük təşkilatlar üçün xüsusi həllər",
      features: [
        { text: "Bütün Premium funksiyalar", included: true },
        { text: "Limitsiz məlumat saxlama", included: true },
        { text: "API inteqrasiyası", included: true },
        { text: "Xüsusi AI modelləri", included: true },
        { text: "24/7 prioritet dəstək", included: true },
        { text: "Xüsusi təlim və onboarding", included: true },
        { text: "SLA zəmanəti", included: true },
        { text: "Xüsusi hesabatlar", included: true },
      ],
      popular: false,
      icon: <Shield className="w-6 h-6" />,
      color: "from-purple-600 to-pink-600",
    },
  ];

  const paymentMethods = [
    {
      name: "Bank kartı",
      description: "Visa, MasterCard, Amex",
      icon: <CreditCard className="w-8 h-8 text-blue-500" />,
    },
    {
      name: "Bank köçürməsi",
      description: "SWIFT, lokal köçürmə",
      icon: <Building className="w-8 h-8 text-green-500" />,
    },
    {
      name: "Kripto valyuta",
      description: "Bitcoin, USDT",
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Biznesiniz üçün uyğun planı seçin
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Güclü maliyyə idarəetmə alətləri ilə KOB-unuzu böyüdün
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 ${
                plan.popular
                  ? "border-blue-500 scale-105"
                  : "border-gray-200 hover:border-gray-300"
              } ${
                selectedPlan === plan.id
                  ? "ring-4 ring-blue-500 ring-opacity-50"
                  : ""
              } bg-white`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Populyar
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4`}
                >
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-600">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    {feature.included ? (
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg"
                    : plan.id === "freemium"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.id === "freemium"
                  ? "Hazırda aktiv"
                  : plan.id === "premium"
                  ? "Premium-a keç"
                  : "Əlaqə saxla"}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Funksiyaların müqayisəsi
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-gray-700 font-semibold">
                    Funksiya
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.id}
                      className="text-center py-4 px-4 text-gray-900 font-bold"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  "Dashboard və qrafiklər",
                  "AI tövsiyələr",
                  "Simulyator",
                  "Məlumat saxlama",
                  "Eksport",
                  "Dəstək",
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-4 px-4 text-gray-700">{feature}</td>
                    {plans.map((plan) => (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {plan.features[index]?.included ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-300">✕</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Ödəniş üsulları
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-4 mb-4">
                  {method.icon}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {method.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {method.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Tez-tez verilən suallar
          </h3>
          <div className="space-y-4">
            {[
              {
                q: "Planı dəyişdirmək mümkündürmü?",
                a: "Bəli, istənilən vaxt planınızı yüksəldə və ya aşağı sala bilərsiniz.",
              },
              {
                q: "Ödəniş necə edilir?",
                a: "Bank kartı, bank köçürməsi və ya kripto valyuta ilə ödəniş edə bilərsiniz.",
              },
              {
                q: "Pulsuz plan nə qədər müddətə keçərlidir?",
                a: "Freemium plan həmişəlik pulsuzdur və əsas funksiyaları təmin edir.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
