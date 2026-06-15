import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, ScanLine, Keyboard, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// All common retail barcode formats
const FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.CODE_93,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.QR_CODE,
  Html5QrcodeSupportedFormats.DATA_MATRIX,
  Html5QrcodeSupportedFormats.PDF_417,
];

export interface BarcodeScannerProps {
  /** Called once with the decoded barcode string */
  onScan: (barcode: string) => void;
  /** Called when user dismisses scanner */
  onClose: () => void;
  title?: string;
}

type State = "initializing" | "scanning" | "success" | "error" | "permission_denied";

const REGION_ID = "inventra-barcode-region";

export function BarcodeScanner({ onScan, onClose, title = "Scan Barcode" }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const firedRef = useRef(false);
  const stoppingRef = useRef(false);

  const [state, setState] = useState<State>("initializing");
  const [errMsg, setErrMsg] = useState("");
  const [manual, setManual] = useState("");

  // ── safe stop ────────────────────────────────────────────────────────────
  const stopScanner = useCallback(async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    try {
      const s = scannerRef.current;
      if (s) {
        if (s.isScanning) await s.stop();
        s.clear();
        scannerRef.current = null;
      }
    } catch (_) {
      // camera already released — ignore
    } finally {
      stoppingRef.current = false;
    }
  }, []);

  // ── start camera ─────────────────────────────────────────────────────────
  const startScanner = useCallback(async () => {
    await stopScanner();
    firedRef.current = false;
    setState("initializing");
    setErrMsg("");

    // Wait for DOM element to render
    await new Promise((r) => setTimeout(r, 250));

    if (!document.getElementById(REGION_ID)) {
      setState("error");
      setErrMsg("Scanner container missing. Close and retry.");
      return;
    }

    try {
      const scanner = new Html5Qrcode(REGION_ID, { formatsToSupport: FORMATS, verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 280, height: 160 }, // wide box — retail barcodes are horizontal
          aspectRatio: 1.7778,
          disableFlip: false,                  // laptop webcam support
          videoConstraints: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        (decoded) => {
          if (firedRef.current) return;        // debounce
          firedRef.current = true;
          setState("success");
          stopScanner().then(() => onScan(decoded.trim()));
        },
        () => {}                               // per-frame errors — keep scanning
      );

      setState("scanning");
    } catch (err: any) {
      const msg = String(err?.message ?? err);
      if (/NotAllowed|Permission|permission/i.test(msg)) {
        setState("permission_denied");
        setErrMsg("Camera access denied. Allow camera in browser/OS settings, then retry.");
      } else if (/NotFound|not found|Requested device/i.test(msg)) {
        setState("error");
        setErrMsg("No camera found. Use manual entry below.");
      } else {
        setState("error");
        setErrMsg(`Camera error: ${msg}`);
      }
    }
  }, [onScan, stopScanner]);

  useEffect(() => {
    startScanner();
    return () => { stopScanner(); };
  }, []); // eslint-disable-line

  const handleClose = async () => { await stopScanner(); onClose(); };

  const handleManual = () => {
    const v = manual.trim();
    if (!v) return;
    firedRef.current = true;
    stopScanner().then(() => onScan(v));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black/95 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <ScanLine size={20} className="text-primary" />
          <span className="font-semibold text-white text-base">{title}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <X size={18} />
        </Button>
      </div>

      {/* Camera region */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 overflow-hidden">
        <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
          {/* html5-qrcode mounts <video> here */}
          <div
            id={REGION_ID}
            className={cn(
              "w-full",
              "[&_#html5-qrcode-anchor-scan-type-change]:hidden",
              "[&_img[alt='Info icon']]:hidden",
            )}
            style={{ minHeight: 230 }}
          />

          {/* Initializing overlay */}
          {state === "initializing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
              <Loader2 size={36} className="animate-spin text-primary" />
              <span className="text-white text-sm">Starting camera…</span>
            </div>
          )}

          {/* Scan-box overlay */}
          {state === "scanning" && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative border-2 border-primary/80 rounded-lg" style={{ width: 280, height: 160 }}>
                  {/* Animated scan line */}
                  <div
                    className="absolute left-3 right-3 h-px bg-primary/80 rounded"
                    style={{ animation: "barcode-scan 1.8s ease-in-out infinite", top: "50%" }}
                  />
                  {/* Corner brackets */}
                  {(["tl","tr","bl","br"] as const).map((c) => (
                    <span key={c} className={cn(
                      "absolute w-4 h-4 border-primary",
                      c === "tl" && "top-0 left-0 border-t-2 border-l-2 rounded-tl-sm",
                      c === "tr" && "top-0 right-0 border-t-2 border-r-2 rounded-tr-sm",
                      c === "bl" && "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-sm",
                      c === "br" && "bottom-0 right-0 border-b-2 border-r-2 rounded-br-sm",
                    )} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Success flash */}
          {state === "success" && (
            <div className="absolute inset-0 bg-green-500/25 flex items-center justify-center">
              <CheckCircle size={52} className="text-green-400" />
            </div>
          )}
        </div>

        {/* Scanning hint */}
        {state === "scanning" && (
          <p className="text-white/50 text-xs text-center max-w-xs">
            Hold barcode inside the frame. Auto-detects — no button needed.
          </p>
        )}

        {/* Error messages */}
        {(state === "error" || state === "permission_denied") && (
          <div className="w-full max-w-sm rounded-xl border border-red-500/30 bg-red-500/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={15} />
              <span className="text-sm font-medium">
                {state === "permission_denied" ? "Camera access denied" : "Camera unavailable"}
              </span>
            </div>
            <p className="text-xs text-white/50">{errMsg}</p>
            <button onClick={startScanner} className="text-xs text-primary hover:underline">
              Try again →
            </button>
          </div>
        )}

        {/* Manual entry — always shown */}
        <div className="w-full max-w-sm space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs text-white/40">
            <Keyboard size={13} />
            Can't scan? Enter barcode manually
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManual()}
              placeholder="e.g. 8901234567890"
              className="flex-1 bg-white/8 border-white/15 text-white placeholder-white/30 focus:border-primary/60"
            />
            <Button
              onClick={handleManual}
              disabled={!manual.trim()}
              className="shrink-0"
              size="sm"
            >
              Use
            </Button>
          </div>
        </div>
      </div>

      <p className="text-center text-white/20 text-[10px] py-3 shrink-0">
        EAN-13 · EAN-8 · UPC-A/E · CODE-128 · CODE-39 · QR · ITF · PDF417
      </p>

      {/* Inline keyframe — avoids needing global CSS changes */}
      <style>{`
        @keyframes barcode-scan {
          0%, 100% { transform: translateY(-28px); opacity: 0.4; }
          50%       { transform: translateY(28px);  opacity: 0.95; }
        }
      `}</style>
    </div>
  );
}
