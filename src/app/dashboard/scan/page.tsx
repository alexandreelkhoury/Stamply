"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, Check, AlertCircle, Gift, X } from "lucide-react";
import { api } from "@/lib/api";

interface StampResult {
  customerName: string;
  currentStamps: number;
  stampsRequired: number;
  rewardEarned: boolean;
  rewardText: string;
  programName: string;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

function playSuccessSound() {
  playTone(880, 0.15);
  setTimeout(() => playTone(1108, 0.2), 120);
}

function playErrorSound() {
  playTone(300, 0.25, "square");
  setTimeout(() => playTone(220, 0.3, "square"), 200);
}

export default function ScanPage() {
  const scannerContainerId = "qr-scanner-container";
  const html5QrRef = useRef<unknown>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<StampResult | null>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const processingRef = useRef(false);

  const stopCamera = useCallback(async () => {
    if (html5QrRef.current) {
      try {
        const scanner = html5QrRef.current as { isScanning: boolean; stop: () => Promise<void>; clear: () => void };
        if (scanner.isScanning) {
          await scanner.stop();
        }
        scanner.clear();
      } catch {
        // Ignore cleanup errors
      }
      html5QrRef.current = null;
    }
    setScanning(false);
  }, []);

  const processQrCode = useCallback(async (qrCode: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setProcessing(true);
    await stopCamera();

    try {
      const { data, ok } = await api.post<{ stamp: StampResult; error?: string }>("/api/stamps", { qrCode });

      if (!ok) {
        playErrorSound();
        setError((data as { error?: string }).error || "Failed to stamp");
        return;
      }

      playSuccessSound();
      setResult(data.stamp);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setResult(null);
        setError("");
      }, 4000);
    } catch {
      playErrorSound();
      setError("Something went wrong");
    } finally {
      processingRef.current = false;
      setProcessing(false);
    }
  }, [stopCamera]);

  async function startCamera() {
    setError("");
    setResult(null);

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(scannerContainerId);
      html5QrRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          processQrCode(decodedText);
        },
        () => {
          // QR not found in this frame
        }
      );

      setScanning(true);
    } catch {
      setError("Could not access camera. Please allow camera access.");
    }
  }

  useEffect(() => {
    return () => {
      if (html5QrRef.current) {
        const scanner = html5QrRef.current as { isScanning: boolean; stop: () => Promise<void>; clear: () => void };
        try {
          if (scanner.isScanning) {
            scanner.stop().then(() => scanner.clear()).catch(() => {});
          } else {
            scanner.clear();
          }
        } catch {
          // Ignore
        }
      }
    };
  }, []);

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
                    {i < result.currentStamps ? "\u2713" : ""}
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
        <div id={scannerContainerId} className="w-full h-full" />
        {!scanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <Camera className="h-12 w-12 text-white/50" />
            <button
              onClick={startCamera}
              disabled={processing}
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
