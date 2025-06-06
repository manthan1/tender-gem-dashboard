
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, CheckSquare, Building2, Home, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchTerm = formData.get('search') as string;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (searchTerm.trim()) {
      // Navigate to dashboard with search term
      navigate(`/dashboard?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleCardClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/dashboard');
  };

  const handleExploreClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/dashboard');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-[#1E3A8A] text-white px-4 py-2 rounded-xl font-bold text-lg font-inter">
                TENDER<span className="bg-[#3B82F6] px-1 ml-1 rounded">AI</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button 
                onClick={handleCardClick}
                className="text-gray-600 hover:text-[#1E3A8A] transition-colors font-medium font-inter"
              >
                Tenders
              </button>
              <span className="text-gray-600 font-medium font-inter">About Us</span>
              <span className="text-gray-600 font-medium font-inter">GeM Registration</span>
              <span className="text-gray-600 font-medium font-inter">Company Insights</span>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-xl px-6 py-2 font-medium font-inter">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-xl px-6 py-2 font-medium font-inter">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button onClick={handleCardClick}>
                <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-xl font-inter">
                  Dashboard
                </Button>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight font-inter">
              WIN MORE GOVERNMENT
              <br />
              <span className="text-[#3B82F6]">TENDERS</span>
            </h1>
            <p className="text-lg text-[#6B7280] mb-10 max-w-lg leading-relaxed font-inter">
              Our AI helps you understand tenders better and make better bids with intelligent insights and automated analysis.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative flex items-center bg-white rounded-2xl shadow-inner border border-gray-100 overflow-hidden focus-within:ring-2 focus-within:ring-[#3B82F6] focus-within:ring-opacity-20 transition-all">
                <div className="pl-6 pr-4">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  placeholder="e.g. CCTV Tenders in Gujarat"
                  className="flex-1 py-4 px-2 text-base focus:outline-none border-0 font-inter placeholder-gray-400"
                />
                <Button 
                  type="submit"
                  className="m-2 px-6 py-3 bg-[#1E3A8A] hover:bg-[#1E40AF] text-white rounded-xl font-medium font-inter transition-colors"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
          
          {/* Image Carousel */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="w-96 h-96 rounded-3xl overflow-hidden shadow-2xl">
              <Carousel 
                className="w-full h-full"
                opts={{
                  align: "start",
                  loop: true,
                }}
                plugins={[
                  Autoplay({
                    delay: 3000,
                  }),
                ]}
              >
                <CarouselContent className="h-full">
                  <CarouselItem className="h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=800&fit=crop&crop=center"
                      alt="Professional workspace"
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                  <CarouselItem className="h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=800&fit=crop&crop=center"
                      alt="Modern laptop setup"
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                  <CarouselItem className="h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=800&fit=crop&crop=center"
                      alt="Business professional working"
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                  <CarouselItem className="h-full">
                    <img 
                      src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=800&fit=crop&crop=center"
                      alt="MacBook Pro in use"
                      className="w-full h-full object-cover"
                    />
                  </CarouselItem>
                </CarouselContent>
              </Carousel>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="bg-white border-0 cursor-pointer transition-all duration-200 hover:-translate-y-1"
              style={{ boxShadow: '0 4px 8px rgba(0,0,0,0.04)' }}
              onClick={handleCardClick}
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <stat.icon className="h-6 w-6 text-[#1E3A8A]" />
                  </div>
                </div>
                <div className="text-xl font-bold text-gray-900 mb-1 font-inter">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 font-medium font-inter">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Button 
            size="lg"
            onClick={handleExploreClick}
            className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white px-12 py-4 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-inter"
          >
            Start Exploring Tenders
          </Button>
        </div>
      </main>

      {/* Free Alerts Button (Fixed Position) */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button className="bg-[#3B82F6] hover:bg-[#1E3A8A] text-white rounded-full px-6 py-3 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-1 font-inter">
          <span className="mr-2">🔔</span>
          Free Alerts
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
