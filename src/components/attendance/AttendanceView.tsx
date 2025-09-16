import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Search, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Session {
  id: string;
  classes: {
    name: string;
    subject: string;
    room_number: string;
  };
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  is_present: boolean;
  method: string | null;
  marked_at: string | null;
  profiles: {
    name: string;
    roll_number: string;
  };
}

interface AttendanceViewProps {
  session: Session;
  onClose: () => void;
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ session, onClose }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, [session.id]);

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles:student_id (
            name,
            roll_number
          )
        `)
        .eq('session_id', session.id);

      if (error) throw error;
      setAttendanceRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = async (recordId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({
          is_present: !currentStatus,
          method: 'manual',
          marked_at: new Date().toISOString(),
        })
        .eq('id', recordId);

      if (error) throw error;

      await fetchAttendance();
      toast({
        title: "Attendance updated",
        description: "Student attendance has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    }
  };

  const exportAttendance = () => {
    const csvContent = [
      ['Name', 'Roll Number', 'Status', 'Method', 'Marked At'].join(','),
      ...filteredRecords.map(record => [
        record.profiles.name,
        record.profiles.roll_number || '',
        record.is_present ? 'Present' : 'Absent',
        record.method || '',
        record.marked_at ? new Date(record.marked_at).toLocaleString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${session.classes.subject}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRecords = attendanceRecords.filter(record =>
    record.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.profiles.roll_number && record.profiles.roll_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const presentCount = filteredRecords.filter(record => record.is_present).length;
  const totalCount = filteredRecords.length;

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">Loading attendance...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Attendance - {session.classes.subject}
          </DialogTitle>
          <DialogDescription>
            {session.classes.name} • Room {session.classes.room_number}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="default">
                Present: {presentCount}/{totalCount}
              </Badge>
              <Badge variant="outline">
                Attendance Rate: {totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%
              </Badge>
            </div>
            <Button onClick={exportAttendance} size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Attendance List */}
          <div className="flex-1 overflow-auto border rounded-lg">
            {filteredRecords.length > 0 ? (
              <div className="divide-y">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{record.profiles.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {record.profiles.roll_number && `Roll: ${record.profiles.roll_number}`}
                        {record.marked_at && (
                          <span className="ml-2">
                            • Marked: {new Date(record.marked_at).toLocaleTimeString()}
                          </span>
                        )}
                        {record.method && (
                          <span className="ml-2">
                            • Method: {record.method.toUpperCase()}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {record.is_present ? (
                        <Badge variant="default" className="bg-success text-success-foreground gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Present
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Absent
                        </Badge>
                      )}
                      <Button
                        onClick={() => toggleAttendance(record.id, record.is_present)}
                        size="sm"
                        variant="outline"
                      >
                        {record.is_present ? 'Mark Absent' : 'Mark Present'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students found
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceView;