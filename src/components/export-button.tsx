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

      const contentType = res.headers.get("content-type") || "";
      if (!res.ok) {
        const errBody = contentType.includes("application/json")
          ? await res.json().then((d: { error?: string }) => d.error)
          : await res.text();
        throw new Error(typeof errBody === "string" ? errBody : errBody || "Export failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hero-visual.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Export failed";
      alert(message);
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
