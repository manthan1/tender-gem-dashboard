
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, CheckSquare, Building2, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchTerm = formData.get('search') as string;
    
    if (searchTerm.trim()) {
      // Navigate to dashboard with search term
      navigate(`/dashboard?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  const stats = [
    {
      icon: CheckSquare,
      number: "2,00,000+",
      label: "All Tenders",
      color: "text-green-500"
    },
    {
      icon: Building2,
      number: "1300+",
      label: "Departments",
      color: "text-purple-500"
    },
    {
      icon: Home,
      number: "65+",
      label: "Ministries",
      color: "text-blue-500"
    },
    {
      icon: Users,
      number: "2000+",
      label: "Organisations",
      color: "text-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-brand-navy text-white px-3 py-2 rounded-lg font-bold text-lg">
                TENDER<span className="bg-brand-orange px-1 ml-1 rounded">AI</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/dashboard" className="text-gray-600 hover:text-brand-navy transition-colors">
                Tenders
              </Link>
              <span className="text-gray-600">About Us</span>
              <span className="text-gray-600">GeM Registration</span>
              <span className="text-gray-600">Company Insights</span>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="bg-brand-navy hover:bg-navy-700 text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-red-500 hover:bg-red-600 text-white">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link to="/dashboard">
                <Button size="sm" className="bg-brand-navy hover:bg-navy-700 text-white">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            WIN MORE GOVERNMENT
            <br />
            <span className="text-brand-orange">TENDERS</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Our AI helps you understand tenders better and make better bids
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-16">
            <div className="relative flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="pl-6 pr-4">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                placeholder="Search for tenders..."
                className="flex-1 py-4 px-2 text-lg focus:outline-none focus:ring-0 border-0"
              />
              <Button 
                type="submit"
                className="m-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold"
              >
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className={`p-4 rounded-2xl bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link to="/dashboard">
            <Button 
              size="lg"
              className="bg-brand-orange hover:bg-orange-600 text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Start Exploring Tenders
            </Button>
          </Link>
        </div>
      </main>

      {/* Free Alerts Button (Fixed Position) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-3 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1">
          <span className="mr-2">🔔</span>
          Free Alerts
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
