import { Box, Stack, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PlayfulEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function PlayfulEmptyState({ icon, title, description }: PlayfulEmptyStateProps) {
  return (
    <Box
      sx={{
        p: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "primary.light",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            mb: 3,
            boxShadow: "0 12px 32px rgba(11, 31, 58, 0.15)",
          }}
        >
          {icon}
        </Box>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 400 }}>
          {description}
        </Typography>
      </motion.div>
    </Box>
  );
}
