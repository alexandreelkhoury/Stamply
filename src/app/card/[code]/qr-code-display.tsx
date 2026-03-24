"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export default function QrCodeDisplay({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, code, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }
  }, [code]);

  return <canvas ref={canvasRef} className="mx-auto" />;
}
