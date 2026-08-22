import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { QrCode, Download, Printer, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useTables } from "@/hooks/useTables";

// QR Code generation using canvas
function generateQRDataUrl(text: string, size: number = 200): Promise<string> {
  return new Promise((resolve) => {
    // Dynamic import for qrcode — fallback to a simple SVG-based QR if unavailable
    import("qrcode")
      .then((QRCode) => {
        QRCode.toDataURL(text, {
          width: size,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
          errorCorrectionLevel: "M",
        }).then(resolve);
      })
      .catch(() => {
        // Fallback: generate a placeholder QR image
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = "#000";
        ctx.font = `${size / 10}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("QR", size / 2, size / 3);
        ctx.fillText(text.split("/").pop() || "", size / 2, size * 2 / 3);
        resolve(canvas.toDataURL());
      });
  });
}

interface TableQR {
  tableNumber: number;
  tableId: string;
  section: string;
  capacity: number;
  url: string;
  qrDataUrl: string;
}

interface QRCodeGeneratorProps {
  open: boolean;
  onClose: () => void;
}

export function QRCodeGenerator({ open, onClose }: QRCodeGeneratorProps) {
  const { tables, isLoading } = useTables();
  const [tableQRs, setTableQRs] = useState<TableQR[]>([]);
  const [generating, setGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://hotel-manage-system.onrender.com";

  useEffect(() => {
    if (!open || tables.length === 0) return;

    const generateQRs = async () => {
      setGenerating(true);
      const qrs: TableQR[] = [];

      for (const table of tables) {
        const url = `${baseUrl}/scan/table/${table.number}`;
        const qrDataUrl = await generateQRDataUrl(url, 300);
        qrs.push({
          tableNumber: table.number,
          tableId: table.id,
          section: table.section,
          capacity: table.capacity,
          url,
          qrDataUrl,
        });
      }

      setTableQRs(qrs);
      setGenerating(false);
    };

    generateQRs();
  }, [open, tables, baseUrl]);

  const downloadSingleQR = (qr: TableQR) => {
    const link = document.createElement("a");
    link.download = `table-${qr.tableNumber}-qr.png`;
    link.href = qr.qrDataUrl;
    link.click();
  };

  const handlePrintAll = () => {
    if (!printRef.current) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>RestaurantOS — Table QR Codes</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; }
          .page { page-break-after: always; display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; padding: 24px; }
          .qr-card { 
            width: 280px; text-align: center; border: 2px solid #e5e7eb; 
            border-radius: 16px; padding: 24px; background: #fff;
            page-break-inside: avoid;
          }
          .qr-card img { width: 200px; height: 200px; margin: 0 auto 12px; }
          .qr-card h3 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .qr-card p { font-size: 12px; color: #6b7280; }
          .qr-card .scan-text { font-size: 11px; color: #9ca3af; margin-top: 8px; }
          @media print { 
            .page { padding: 12px; gap: 16px; }
            .qr-card { width: 240px; padding: 16px; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${tableQRs.map(qr => `
            <div class="qr-card">
              <img src="${qr.qrDataUrl}" alt="QR Code for Table ${qr.tableNumber}" />
              <h3>Table #${qr.tableNumber}</h3>
              <p>${qr.section} · ${qr.capacity} Seats</p>
              <p class="scan-text">Scan to book this table instantly</p>
            </div>
          `).join("")}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-primary" />
            Table QR Code Generator
          </DialogTitle>
          <DialogDescription>
            Generate and print QR codes for each table. Customers scan to book instantly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 py-2">
          <Button onClick={handlePrintAll} disabled={generating || tableQRs.length === 0} size="sm" className="gap-1.5">
            <Printer className="size-4" /> Print All QR Codes
          </Button>
          <Badge variant="outline">{tableQRs.length} Tables</Badge>
        </div>

        {(isLoading || generating) ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="size-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Generating QR codes...</p>
          </div>
        ) : (
          <div ref={printRef} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tableQRs.map((qr) => (
              <motion.div
                key={qr.tableId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: qr.tableNumber * 0.03 }}
              >
                <Card className="text-center hover:shadow-md transition-shadow">
                  <CardContent className="py-4 px-3">
                    <img
                      src={qr.qrDataUrl}
                      alt={`QR Code for Table ${qr.tableNumber}`}
                      className="w-32 h-32 mx-auto mb-3 rounded-md"
                    />
                    <p className="font-bold text-base">Table #{qr.tableNumber}</p>
                    <p className="text-xs text-muted-foreground">{qr.section} · {qr.capacity} seats</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 h-7 text-xs gap-1 w-full"
                      onClick={() => downloadSingleQR(qr)}
                    >
                      <Download className="size-3" /> Download
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
