import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, X, Type } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScan: (qrCode: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setUseCamera(true);
        setIsScanning(true);
        
        // Simple QR code detection simulation
        // In a real implementation, you'd use a library like @zxing/library
        toast({
          title: "Camera ready",
          description: "Point your camera at a QR code or enter the code manually below.",
        });
      }
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please enter the QR code manually below.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setUseCamera(false);
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
          <DialogDescription>
            Use your camera to scan the QR code or enter it manually
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Section */}
          <div className="space-y-4">
            {!useCamera ? (
              <Button 
                onClick={startCamera} 
                className="w-full gap-2"
                variant="outline"
              >
                <Camera className="h-4 w-4" />
                Use Camera
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ display: 'none' }}
                  />
                  <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-primary"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-primary"></div>
                  </div>
                </div>
                <Button 
                  onClick={stopCamera} 
                  variant="outline" 
                  className="w-full"
                >
                  Stop Camera
                </Button>
              </div>
            )}
          </div>

          {/* Manual Entry Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              <Label htmlFor="manual-code">Or enter code manually:</Label>
            </div>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <Input
                id="manual-code"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Enter QR code"
                className="flex-1"
              />
              <Button type="submit" disabled={!manualCode.trim()}>
                Submit
              </Button>
            </form>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;