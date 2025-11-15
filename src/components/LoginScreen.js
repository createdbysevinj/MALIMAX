import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Wallet,
} from "lucide-react";
import {
  connectWallet,
  isMetaMaskInstalled,
  formatAddress,
} from "../services/walletService";

// Demo user credentials
const DEMO_USER = {
  email: "demo@malimax.az",
  password: "demo123",
  name: "Demo KOB",
  company: "Tech Solutions MMC",
};

const LoginScreen = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    company: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate demo user
    if (
      formData.email.toLowerCase() !== DEMO_USER.email.toLowerCase() ||
      formData.password !== DEMO_USER.password
    ) {
      setError(
        "Yanlış email və ya şifrə. Demo istifadəçi: demo@malimax.az / demo123"
      );
      return;
    }

    // Success - save user and navigate
    const user = {
      name: DEMO_USER.name,
      company: DEMO_USER.company,
      email: DEMO_USER.email,
    };
    localStorage.setItem("user", JSON.stringify(user));
    setSuccess("Uğurla daxil oldunuz!");
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate form
    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.company
    ) {
      setError("Zəhmət olmasa bütün məlumatları doldurun");
      return;
    }

    if (formData.password.length < 6) {
      setError("Şifrə ən azı 6 simvol olmalıdır");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Şifrələr uyğun gəlmir");
      return;
    }

    // Check if trying to use demo email
    if (formData.email.toLowerCase() === DEMO_USER.email.toLowerCase()) {
      setError(
        "Bu email artıq istifadə olunur. Zəhmət olmasa başqa email istifadə edin."
      );
      return;
    }

    // In demo mode, signup is not fully functional
    setError(
      "Qeydiyyat funksiyası demo rejimdə aktiv deyil. Demo istifadəçi ilə daxil olun."
    );
  };

  const handleGoogleLogin = () => {
    setError("");
    setSuccess("");
    // In demo mode, Google login just logs in as demo user
    const user = {
      name: DEMO_USER.name,
      company: DEMO_USER.company,
      email: DEMO_USER.email,
      provider: "google",
    };
    localStorage.setItem("user", JSON.stringify(user));
    setSuccess("Google ilə uğurla daxil oldunuz!");
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  const handleWalletLogin = async () => {
    setError("");
    setSuccess("");

    try {
      if (!isMetaMaskInstalled()) {
        setError(
          "MetaMask yüklənmiş deyil. Zəhmət olmasa MetaMask genişləndirməsini quraşdırın."
        );
        return;
      }

      const walletData = await connectWallet();
      const { address } = walletData;

      // Create user with wallet address
      const user = {
        name: `Wallet User ${formatAddress(address)}`,
        company: "Crypto Business",
        email: `${formatAddress(address)}@wallet.malimax.az`,
        walletAddress: address,
        provider: "wallet",
        chainId: walletData.chainId,
      };

      localStorage.setItem("user", JSON.stringify(user));
      setSuccess("Kripto cüzdan ilə uğurla daxil oldunuz!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      setError(
        error.message ||
          "Cüzdan bağlantısında xəta baş verdi. Zəhmət olmasa yenidən cəhd edin."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Building className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MALİMAX</h1>
          <p className="text-blue-200">Maliyyə idarəetmə platforması</p>
        </div>

        {/* Toggle between Login and Signup */}
        <div className="flex bg-white/10 rounded-lg p-1 mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
              setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                name: "",
                company: "",
                phone: "",
              });
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              isLogin
                ? "bg-white text-blue-900 shadow-md"
                : "text-white hover:text-blue-200"
            }`}
          >
            Daxil ol
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
              setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                name: "",
                company: "",
                phone: "",
              });
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              !isLogin
                ? "bg-white text-blue-900 shadow-md"
                : "text-white hover:text-blue-200"
            }`}
          >
            Qeydiyyat
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-2 text-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-2 text-green-200">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Google ilə daxil ol</span>
          </button>

          <button
            onClick={handleWalletLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
          >
            <Wallet className="w-5 h-5" />
            <span>MetaMask ilə daxil ol</span>
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-blue-200">və ya</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-sm text-blue-200 mb-2 flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Ad və Soyad</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                  placeholder="Adınızı daxil edin"
                  required={!isLogin}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-blue-200 mb-2 flex items-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>Şirkət adı</span>
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                  placeholder="Şirkət adını daxil edin"
                  required={!isLogin}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm text-blue-200 mb-2 flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Telefon (İstəyə bağlı)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
                  placeholder="+994 XX XXX XX XX"
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm text-blue-200 mb-2 flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all"
              placeholder="sizin@email.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-blue-200 mb-2 flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Şifrə</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm text-blue-200 mb-2 flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>Şifrəni təsdiq et</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all pr-10"
                  placeholder="Şifrəni təkrar daxil edin"
                  required={!isLogin}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          {isLogin && (
            <div className="mb-6 flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm text-blue-200 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400"
                />
                <span>Məni xatırla</span>
              </label>
              <button
                type="button"
                className="text-sm text-blue-200 hover:text-white transition-colors"
              >
                Şifrəni unutmusunuz?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {isLogin ? "Daxil ol" : "Qeydiyyatdan keç"}
          </button>
        </form>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
          <p className="text-blue-200 text-sm text-center mb-2">
            <strong>Demo rejim:</strong>
          </p>
          <p className="text-blue-200 text-xs text-center">
            Email: <strong className="text-white">demo@malimax.az</strong>
          </p>
          <p className="text-blue-200 text-xs text-center">
            Şifrə: <strong className="text-white">demo123</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
