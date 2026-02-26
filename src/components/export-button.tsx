"use client";

import { useState } from "react";
import { useHeroStore } from "@/store/hero-store";
import { Button } from "@/components/ui/button";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const {
    selectedBackgroundUrl,
    logoUrl,
    logoPosition,
    logoScale,
    logoPadding,
    title,
    description,
  } = useHeroStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundUrl: selectedBackgroundUrl,
          logoUrl,
          logoPosition,
          logoScale,
          logoPadding,
          title,
          description,
        }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hero-visual.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      size="lg"
      onClick={handleExport}
      disabled={isExporting}
      className="w-full"
    >
      {isExporting ? "Exporting..." : "Export PNG"}
    </Button>
  );
}
