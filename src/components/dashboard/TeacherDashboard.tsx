import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, QrCode, Play, Square } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AttendanceView from '@/components/attendance/AttendanceView';
import QRCodeDisplay from '@/components/attendance/QRCodeDisplay';

interface Session {
  id: string;
  class_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  qr_code: string | null;
  is_active: boolean;
  total_students: number;
  present_count: number;
  classes: {
    name: string;
    subject: string;
    room_number: string;
  };
}

const TeacherDashboard = () => {
  const { profile } = useAuth();
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showAttendance, setShowAttendance] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchTodaySessions();
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
        .eq('teacher_id', profile.user_id)
        .eq('session_date', today)
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
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = () => {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const startSession = async (sessionId: string) => {
    try {
      const qrCode = generateQRCode();
      const qrExpiresAt = new Date();
      qrExpiresAt.setMinutes(qrExpiresAt.getMinutes() + 30); // QR valid for 30 minutes

      const { error } = await supabase
        .from('sessions')
        .update({
          is_active: true,
          qr_code: qrCode,
          qr_expires_at: qrExpiresAt.toISOString(),
        })
        .eq('id', sessionId);

      if (error) throw error;

      await fetchTodaySessions();
      toast({
        title: "Session started!",
        description: "Students can now mark their attendance.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start session",
        variant: "destructive",
      });
    }
  };

  const stopSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          is_active: false,
          qr_code: null,
          qr_expires_at: null,
        })
        .eq('id', sessionId);

      if (error) throw error;

      await fetchTodaySessions();
      setShowQRCode(false);
      toast({
        title: "Session ended",
        description: "Attendance marking is now closed.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to stop session",
        variant: "destructive",
      });
    }
  };

  const viewAttendance = (session: Session) => {
    setSelectedSession(session);
    setShowAttendance(true);
  };

  const showSessionQR = (session: Session) => {
    setSelectedSession(session);
    setShowQRCode(true);
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
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your classes and track attendance
          </p>
        </div>

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Classes
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
                        <span className="text-sm">
                          {session.start_time} - {session.end_time}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Users className="h-4 w-4" />
                          {session.present_count}/{session.total_students}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.is_active ? (
                        <>
                          <Badge variant="default">Active</Badge>
                          <Button
                            onClick={() => showSessionQR(session)}
                            size="sm"
                            variant="outline"
                          >
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => stopSession(session.id)}
                            size="sm"
                            variant="destructive"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Badge variant="secondary">Scheduled</Badge>
                          <Button
                            onClick={() => startSession(session.id)}
                            size="sm"
                            variant="default"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => viewAttendance(session)}
                        size="sm"
                        variant="outline"
                      >
                        View Attendance
                      </Button>
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

        {/* Attendance Modal */}
        {showAttendance && selectedSession && (
          <AttendanceView
            session={selectedSession}
            onClose={() => {
              setShowAttendance(false);
              setSelectedSession(null);
              fetchTodaySessions();
            }}
          />
        )}

        {/* QR Code Modal */}
        {showQRCode && selectedSession && selectedSession.qr_code && (
          <QRCodeDisplay
            qrCode={selectedSession.qr_code}
            sessionName={`${selectedSession.classes.subject} - ${selectedSession.classes.name}`}
            onClose={() => {
              setShowQRCode(false);
              setSelectedSession(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;