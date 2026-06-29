import { Box } from "@mui/material";
import { useAppStore } from "../store/appStore";

const severityColorMap = {
  High: "#E55252",
  Medium: "#F4B740",
  Low: "#22A861",
};

export function VesselMap({
  image,
  markers,
}: {
  image: string;
  markers: Array<{ defectId: string; x: number; y: number; severity: "High" | "Medium" | "Low" }>;
}) {
  const { selectedDefectId, setSelectedDefectId } = useAppStore();

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: 320,
        borderRadius: 3,
        overflow: "hidden",
        background: `linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.6)), url(${image}) center/cover`,
      }}
    >
      {markers.map((marker) => (
        <Box
          key={marker.defectId}
          onClick={() => setSelectedDefectId(marker.defectId)}
          sx={{
            position: "absolute",
            top: `${marker.y}%`,
            left: `${marker.x}%`,
            width: selectedDefectId === marker.defectId ? 16 : 12,
            height: selectedDefectId === marker.defectId ? 16 : 12,
            borderRadius: "50%",
            bgcolor: severityColorMap[marker.severity],
            border: "3px solid rgba(255,255,255,0.85)",
            boxShadow: "0 10px 18px rgba(15, 23, 42, 0.25)",
            cursor: "pointer",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </Box>
  );
}
