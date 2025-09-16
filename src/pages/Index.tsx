import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Calendar, Target, QrCode, BarChart } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <QrCode className="h-6 w-6" />,
      title: "Smart Attendance",
      description: "QR code, Bluetooth, and face recognition attendance tracking"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Live attendance display on classroom screens"
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Personalized Activities",
      description: "AI-suggested tasks for free periods based on interests"
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Comprehensive reports and insights for administrators"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">LearnPulse Pro</h1>
          </div>
          <Button onClick={() => navigate('/auth')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto py-20 px-4 text-center">
        <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Smart Curriculum Activity & Attendance System
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Revolutionizing education with automated attendance tracking, personalized learning activities, 
          and comprehensive analytics for modern institutions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/auth')} 
            size="lg" 
            className="gap-2"
          >
            <Users className="h-5 w-5" />
            Start Free Trial
          </Button>
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline" 
            size="lg"
          >
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto py-20 px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
          <p className="text-muted-foreground text-lg">
            Everything you need to modernize your educational institution
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-20 px-4">
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-0">
          <CardContent className="py-16 text-center">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Institution?</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of educational institutions already using LearnPulse Pro 
              to streamline attendance and enhance student engagement.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              size="lg"
              className="gap-2"
            >
              <GraduationCap className="h-5 w-5" />
              Get Started Today
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto py-8 px-4 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; 2024 LearnPulse Pro. Built for the Government of Punjab - Smart Education Initiative.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
