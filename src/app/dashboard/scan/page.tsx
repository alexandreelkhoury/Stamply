"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Check, AlertCircle, Gift, X } from "lucide-react";

interface StampResult {
  customerName: string;
  currentStamps: number;
  stampsRequired: number;
  rewardEarned: boolean;
  rewardText: string;
  programName: string;
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<StampResult | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scannerRef.current) {
      clearInterval(scannerRef.current);
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const processQrCode = useCallback(async (qrCode: string) => {
    if (processing) return;
    setProcessing(true);
    stopCamera();

    try {
      const res = await fetch("/api/stamps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to stamp");
        return;
      }

      setResult(data.stamp);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setResult(null);
        setError("");
      }, 4000);
    } catch {
      setError("Something went wrong");
    } finally {
      setProcessing(false);
    }
  }, [processing, stopCamera]);

  async function startCamera() {
    setError("");
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);

      // Use BarcodeDetector if available, otherwise fall back
      if ("BarcodeDetector" in window) {
        const detector = new (window as unknown as { BarcodeDetector: new (opts: { formats: string[] }) => { detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector({
          formats: ["qr_code"],
        });

        scannerRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                processQrCode(barcodes[0].rawValue);
              }
            } catch {
              // Ignore detection errors
            }
          }
        }, 300);
      }
    } catch {
      setError("Could not access camera. Please allow camera access.");
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Manual QR code input as fallback
  const [manualCode, setManualCode] = useState("");

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Scan Customer QR</h1>

      {/* Result overlay */}
      {result && (
        <div className={`mb-6 rounded-2xl p-6 text-white ${result.rewardEarned ? "bg-warning" : "bg-success"}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.rewardEarned ? (
              <Gift className="h-8 w-8" />
            ) : (
              <Check className="h-8 w-8" />
            )}
            <div>
              <div className="font-bold text-lg">{result.customerName}</div>
              <div className="text-white/80 text-sm">{result.programName}</div>
            </div>
          </div>
          {result.rewardEarned ? (
            <div className="text-lg font-semibold">
              Reward earned: {result.rewardText}!
            </div>
          ) : (
            <div>
              <div className="flex gap-1.5 my-3">
                {Array.from({ length: result.stampsRequired }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < result.currentStamps
                        ? "bg-white/30"
                        : "border-2 border-white/30"
                    }`}
                  >
                    {i < result.currentStamps ? "✓" : ""}
                  </div>
                ))}
              </div>
              <div className="text-white/80 text-sm">
                {result.currentStamps}/{result.stampsRequired} stamps
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-2 text-danger bg-danger/10 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Camera view */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-square mb-6">
        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Camera className="h-12 w-12 text-white/50" />
            <button
              onClick={startCamera}
              className="bg-primary text-white px-6 py-3 rounded-xl font-medium text-lg hover:bg-primary-dark transition"
            >
              Start Scanner
            </button>
          </div>
        )}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-16 border-2 border-white/50 rounded-2xl" />
          </div>
        )}
      </div>

      {/* Manual input fallback */}
      <div className="border-t border-foreground/10 pt-6">
        <p className="text-sm text-foreground/40 mb-3">Or enter code manually</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manualCode.trim()) processQrCode(manualCode.trim());
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-foreground/15 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Enter QR code"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition"
          >
            Stamp
          </button>
        </form>
      </div>
    </div>
  );
}
