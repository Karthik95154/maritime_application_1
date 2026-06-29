import { Dialog, IconButton, Box } from "@mui/material";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export function ImagePreviewModal({ open, onClose, imageUrl }: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "transparent",
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }
      }}
    >
      <Box sx={{ position: "relative", maxWidth: "100%", maxHeight: "90vh" }}>
        <IconButton 
          onClick={onClose}
          sx={{ 
            position: "absolute", 
            top: 8, 
            right: 8, 
            backgroundColor: "rgba(0,0,0,0.5)", 
            color: "white",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" }
          }}
        >
          <X />
        </IconButton>
        <Box 
          component="img" 
          src={imageUrl} 
          alt="Preview" 
          sx={{ 
            maxWidth: "100%", 
            maxHeight: "90vh", 
            objectFit: "contain",
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
          }} 
        />
      </Box>
    </Dialog>
  );
}
