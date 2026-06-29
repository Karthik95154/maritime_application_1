import { Anchor, ShieldCheck } from "lucide-react";
import { Box, Stack, Typography } from "@mui/material";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: light ? "rgba(255,255,255,0.12)" : "rgba(47,128,237,0.1)",
          color: light ? "#fff" : "primary.main",
          position: "relative",
        }}
      >
        <ShieldCheck size={18} />
        <Anchor size={12} style={{ position: "absolute", bottom: 5 }} />
      </Box>
      <Typography
        variant="h6"
        sx={{ color: light ? "#fff" : "text.primary", fontSize: 18 }}
      >
        MaritimeInspect
      </Typography>
    </Stack>
  );
}
