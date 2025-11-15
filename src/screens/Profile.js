import React, { useState, useEffect } from "react";
import {
  User,
  Building,
  Mail,
  Phone,
  Edit,
  Save,
  X,
  Lock,
  Calendar,
  Shield,
} from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
  });
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || "",
        company: parsedUser.company || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
      });
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...formData,
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    setSuccess("Profil məlumatları uğurla yeniləndi!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      company: user?.company || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Yüklənir...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-8">
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-8 pb-8 border-b border-gray-200 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 md:space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.name || "İstifadəçi"}
                </h2>
                <p className="text-gray-600 mb-2">
                  {user.company || "Şirkət adı yoxdur"}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  <span>{user.email || "Email yoxdur"}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Redaktə et</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Saxla</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Ləğv et</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Ad və Soyad</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adınızı daxil edin"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {user.name || "Məlumat yoxdur"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>Şirkət adı</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şirkət adını daxil edin"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {user.company || "Məlumat yoxdur"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email ünvanınızı daxil edin"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {user.email || "Məlumat yoxdur"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Telefon</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+994 XX XXX XX XX"
                />
              ) : (
                <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                  {user.phone || "Məlumat yoxdur"}
                </p>
              )}
            </div>
          </div>

          {/* Account Info Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Hesab Məlumatları</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Hesab növü</p>
                <p className="font-medium text-gray-900">Freemium</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1 flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Qeydiyyat tarixi</span>
                </p>
                <p className="font-medium text-gray-900">
                  {new Date().toLocaleDateString("az-AZ", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Təhlükəsizlik</span>
            </h3>
            <div className="space-y-3">
              <button className="w-full md:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Şifrəni dəyiş
              </button>
              <p className="text-sm text-gray-500">
                Demo rejimdə şifrə dəyişikliyi funksiyası aktiv deyil
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
