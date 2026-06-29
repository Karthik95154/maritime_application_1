import { CheckCircle2, Circle, LoaderCircle } from "lucide-react";
import { Stack, Typography } from "@mui/material";

export function ProgressStepper({
  steps,
}: {
  steps: Array<{ label: string; status: "done" | "active" | "todo" }>;
}) {
  return (
    <Stack spacing={2}>
      {steps.map((step) => {
        const icon =
          step.status === "done" ? (
            <CheckCircle2 size={18} color="#22A861" />
          ) : step.status === "active" ? (
            <LoaderCircle size={18} color="#2F80ED" />
          ) : (
            <Circle size={18} color="#94A3B8" />
          );

        return (
          <Stack key={step.label} direction="row" alignItems="center" spacing={1.25}>
            {icon}
            <Typography
              variant="body2"
              color={step.status === "active" ? "secondary.main" : "text.primary"}
              fontWeight={step.status === "active" ? 700 : 500}
            >
              {step.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
