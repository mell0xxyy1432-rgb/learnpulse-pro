import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, BookOpen, Target, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QRScanner from '@/components/attendance/QRScanner';

interface Session {
  id: string;
  class_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  qr_code: string | null;
  is_active: boolean;
  classes: {
    name: string;
    subject: string;
    room_number: string;
  };
}

interface ActivitySuggestion {
  id: string;
  activity_id: string;
  suggested_for_date: string;
  free_period_start: string;
  free_period_end: string;
  completed: boolean;
  activities: {
    title: string;
    description: string;
    activity_type: string;
    estimated_minutes: number;
  };
}

const StudentDashboard = () => {
  const { profile, signOut } = useAuth();
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchTodaySessions();
      fetchActivitySuggestions();
    }
  }, [profile]);

  const fetchTodaySessions = async () => {
    if (!profile) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          classes:class_id (
            name,
            subject,
            room_number
          )
        `)
        .eq('session_date', today)
        .in('class_id', await supabase
            .from('class_enrollments')
            .select('class_id')
            .eq('student_id', profile.user_id)
            .then(({ data }) => data?.map(item => item.class_id) || [])
        )
        .order('start_time');

      if (error) throw error;
      setTodaySessions(data || []);
    } catch (error: any) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch today's schedule",
        variant: "destructive",
      });
    }
  };

  const fetchActivitySuggestions = async () => {
    if (!profile) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('activity_suggestions')
        .select(`
          *,
          activities:activity_id (
            title,
            description,
            activity_type,
            estimated_minutes
          )
        `)
        .eq('student_id', profile.user_id)
        .eq('suggested_for_date', today)
        .eq('completed', false)
        .order('free_period_start');

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const markActivityCompleted = async (suggestionId: string) => {
    try {
      const { error } = await supabase
        .from('activity_suggestions')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', suggestionId);

      if (error) throw error;

      setSuggestions(suggestions.filter(s => s.id !== suggestionId));
      toast({
        title: "Activity completed!",
        description: "Great job on completing your activity.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark activity as completed",
        variant: "destructive",
      });
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      // Find session with matching QR code
      const session = todaySessions.find(s => s.qr_code === qrCode && s.is_active);
      
      if (!session) {
        toast({
          title: "Invalid QR Code",
          description: "This QR code is not valid for any active session",
          variant: "destructive",
        });
        return;
      }

      // Mark attendance
      const { error } = await supabase
        .from('attendance')
        .upsert({
          session_id: session.id,
          student_id: profile!.user_id,
          is_present: true,
          method: 'qr',
          marked_at: new Date().toISOString(),
        });

      if (error) throw error;

      setShowQRScanner(false);
      toast({
        title: "Attendance marked!",
        description: `Successfully marked present for ${session.classes.subject}`,
      });
      
      // Refresh sessions to update attendance status
      fetchTodaySessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your schedule and personalized activities for today
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setShowQRScanner(true)} className="gap-2">
            <QrCode className="h-4 w-4" />
            Scan QR for Attendance
          </Button>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaySessions.length > 0 ? (
              <div className="space-y-4">
                {todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{session.classes.subject}</h3>
                      <p className="text-sm text-muted-foreground">
                        {session.classes.name} • Room {session.classes.room_number}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4" />
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Scheduled</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No classes scheduled for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Activity Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Suggested Activities
            </CardTitle>
            <CardDescription>
              Personalized activities for your free periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{suggestion.activities.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.activities.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">
                          {suggestion.activities.activity_type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {suggestion.activities.estimated_minutes} min
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {suggestion.free_period_start} - {suggestion.free_period_end}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => markActivityCompleted(suggestion.id)}
                      size="sm"
                      variant="outline"
                    >
                      Mark Complete
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No activities suggested for today. Enjoy your free time!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScanner
            onScan={handleQRScan}
            onClose={() => setShowQRScanner(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;