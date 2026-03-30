"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrCodeDisplay({ code, size = 180 }: { code: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, code, {
        width: size,
        margin: 1,
        color: { dark: "#1a1a2e", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });
    }
  }, [code, size]);

  return <canvas ref={canvasRef} className="mx-auto rounded-lg" />;
}
