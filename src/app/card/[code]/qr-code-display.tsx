"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrCodeDisplay({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, code, {
        width: 180,
        margin: 1,
        color: { dark: "#1a1a2e", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
    }
  }, [code]);

  return <canvas ref={canvasRef} className="mx-auto rounded-lg" />;
}
