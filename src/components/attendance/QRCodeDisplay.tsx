import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  qrCode: string;
  sessionName: string;
  onClose: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  qrCode,
  sessionName,
  onClose,
}) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrCode);
    toast({
      title: "Copied!",
      description: "QR code copied to clipboard.",
    });
  };

  const downloadQR = () => {
    // Create a simple QR code representation using text
    const qrText = `QR Code for: ${sessionName}\nCode: ${qrCode}\nGenerated: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([qrText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${sessionName.replace(/\s+/g, '-')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Create a visual QR code representation using CSS
  const generateVisualQR = (text: string) => {
    const size = 12;
    const cells = [];
    
    // Simple pattern based on text hash
    for (let i = 0; i < size * size; i++) {
      const char = text.charCodeAt(i % text.length);
      const isBlack = (char + i) % 2 === 0;
      cells.push(isBlack);
    }
    
    return cells;
  };

  const qrPattern = generateVisualQR(qrCode);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for Attendance</DialogTitle>
          <DialogDescription>{sessionName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Visual QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border-2 border-border">
              <div className="grid grid-cols-12 gap-px bg-black p-2 rounded">
                {qrPattern.map((isBlack, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 ${isBlack ? 'bg-black' : 'bg-white'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-center mt-2 text-muted-foreground">
                Scan with student app
              </p>
            </div>
          </div>

          {/* QR Code Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">QR Code:</span>
              <Badge variant="outline">Active</Badge>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                {qrCode}
              </code>
              <Button onClick={copyToClipboard} size="sm" variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Students can scan this QR code to mark their attendance</p>
            <p>• QR code is valid for 30 minutes</p>
            <p>• Keep this window open during class</p>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button onClick={downloadQR} variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDisplay;