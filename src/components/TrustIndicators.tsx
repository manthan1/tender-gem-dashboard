import React from 'react';
import { Shield, Lock, Award, Users, CheckCircle, Globe } from 'lucide-react';
import { Card } from './ui/card';

const TrustIndicators: React.FC = () => {
  const trustBadges = [
    {
      icon: Shield,
      title: "Government Approved",
      description: "Certified platform for government procurement",
      color: "text-green-600"
    },
    {
      icon: Lock,
      title: "Bank-Level Security",
      description: "256-bit SSL encryption for all data",
      color: "text-blue-600"
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Best Digital Platform 2024",
      color: "text-yellow-600"
    },
    {
      icon: Users,
      title: "10,000+ Users",
      description: "Trusted by businesses nationwide",
      color: "text-purple-600"
    }
  ];

  const certifications = [
    {
      name: "ISO 27001",
      description: "Information Security Management",
      logo: "🛡️"
    },
    {
      name: "SOC 2 Type II",
      description: "Security & Availability",
      logo: "🔒"
    },
    {
      name: "GeM Registered",
      description: "Government e-Marketplace",
      logo: "🏛️"
    },
    {
      name: "GDPR Compliant",
      description: "Data Protection Standards",
      logo: "🌍"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
    { value: "100%", label: "Data Safety" },
    { value: "Zero", label: "Breaches" }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 font-inter">
            Trusted & Secure Platform
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-inter">
            Your data is protected with enterprise-grade security and compliance standards
          </p>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trustBadges.map((badge, index) => (
            <Card key={index} className="p-6 text-center border-0 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gray-50">
                  <badge.icon className={`h-6 w-6 ${badge.color}`} />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 font-inter">{badge.title}</h3>
              <p className="text-sm text-muted-foreground font-inter">{badge.description}</p>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center font-inter">
            Certifications & Compliance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{cert.logo}</div>
                <h4 className="font-medium text-gray-900 mb-1 font-inter">{cert.name}</h4>
                <p className="text-xs text-muted-foreground font-inter">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-primary mb-1 font-inter">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-inter">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Security Features */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 font-inter">
                Enterprise Security Features
              </h3>
              <div className="space-y-3">
                {[
                  "End-to-end encryption for all communications",
                  "Multi-factor authentication (MFA)",
                  "Regular security audits and penetration testing",
                  "Secure cloud infrastructure with AWS",
                  "Automated backup and disaster recovery"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-inter">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="h-16 w-16 text-green-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;