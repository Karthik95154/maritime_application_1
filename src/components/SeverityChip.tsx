import { Chip } from "@mui/material";
import type { Severity } from "../types";

const severityMap: Record<string, { color: string; text: string }> = {
  High: { color: "#FDEBEC", text: "#E55252" },
  Medium: { color: "#FFF3DD", text: "#D98200" },
  Low: { color: "#E8F7EF", text: "#22A861" },
};

const defaultPalette = { color: "#F3F4F6", text: "#6B7280" };

export function SeverityChip({ severity }: { severity: Severity | string }) {
  // Normalize the severity string to capitalize first letter if it's not strictly matched
  const normalizedSeverity = severity 
    ? String(severity).charAt(0).toUpperCase() + String(severity).slice(1).toLowerCase() 
    : "Unknown";
    
  const palette = severityMap[normalizedSeverity] || defaultPalette;
  
  return (
    <Chip
      label={severity || "Unknown"}
      size="small"
      sx={{
        bgcolor: palette.color,
        color: palette.text,
        fontWeight: 700,
        borderRadius: 2,
      }}
    />
  );
}
