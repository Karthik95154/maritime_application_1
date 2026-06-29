import { Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export function SectionCard({
  title,
  subtitle,
  action,
  icon,
  sx,
  children,
  minHeight,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
  sx?: any;
  children: ReactNode;
  minHeight?: number;
}) {
  return (
    <Card sx={{ height: '100%', minHeight, overflow: 'visible', display: 'flex', flexDirection: 'column', ...sx }}>
      <CardContent sx={{ p: 3, flexGrow: 1, '&:last-child': { pb: 3 } }}>
        {(title || action || icon) && (
          <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {icon}
              <div>
                <Typography variant="h6" fontSize={16} fontWeight={800} letterSpacing="-0.01em">
                  {title}
                </Typography>
                {subtitle ? (
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {subtitle}
                  </Typography>
                ) : null}
              </div>
            </Stack>
            {action}
          </Stack>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
