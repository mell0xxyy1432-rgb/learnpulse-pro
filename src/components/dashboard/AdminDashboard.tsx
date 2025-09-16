import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  todayAttendance: number;
}

interface RecentActivity {
  id: string;
  type: 'attendance' | 'class_created' | 'user_registered';
  description: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    todayAttendance: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user counts
      const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      const { data: teachers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'teacher');

      // Fetch total classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id');

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attendance } = await supabase
        .from('attendance')
        .select('id')
        .eq('is_present', true)
        .gte('marked_at', `${today}T00:00:00`)
        .lt('marked_at', `${today}T23:59:59`);

      setStats({
        totalStudents: students?.length || 0,
        totalTeachers: teachers?.length || 0,
        totalClasses: classes?.length || 0,
        todayAttendance: attendance?.length || 0,
      });

      // Fetch recent activity (mock data for now)
      setRecentActivity([
        {
          id: '1',
          type: 'attendance',
          description: 'High attendance rate recorded for Computer Science class',
          timestamp: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'class_created',
          description: 'New Mathematics class created by Dr. Smith',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '3',
          type: 'user_registered',
          description: '5 new students registered today',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
      ]);

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <GraduationCap className="h-6 w-6 text-primary" />,
      description: "Registered students",
    },
    {
      title: "Total Teachers",
      value: stats.totalTeachers,
      icon: <Users className="h-6 w-6 text-primary" />,
      description: "Active faculty members",
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      icon: <BookOpen className="h-6 w-6 text-primary" />,
      description: "Available courses",
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance,
      icon: <Calendar className="h-6 w-6 text-primary" />,
      description: "Students present today",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Calendar className="h-4 w-4" />;
      case 'class_created':
        return <BookOpen className="h-4 w-4" />;
      case 'user_registered':
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Badge variant="default">Attendance</Badge>;
      case 'class_created':
        return <Badge variant="secondary">Class</Badge>;
      case 'user_registered':
        return <Badge variant="outline">Registration</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Overview of your educational institution
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getActivityBadge(activity.type)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              Current status of your LearnPulse Pro system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-success/5">
                <span className="font-medium">Authentication</span>
                <Badge variant="default" className="bg-success text-success-foreground">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-success/5">
                <span className="font-medium">Database</span>
                <Badge variant="default" className="bg-success text-success-foreground">
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border bg-success/5">
                <span className="font-medium">Attendance System</span>
                <Badge variant="default" className="bg-success text-success-foreground">
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;