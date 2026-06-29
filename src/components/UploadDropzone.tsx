import { CloudUpload } from "lucide-react";
import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useRef } from "react";

export function UploadDropzone({
  progress,
  fileCount,
  onFilesSelect,
  disabled,
}: {
  progress: number;
  fileCount: number;
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    onFilesSelect(Array.from(fileList));
  };

  return (
    <Box
      sx={{
        border: "2px dashed",
        borderColor: "divider",
        borderRadius: 2,
        p: 2.5,
        minHeight: 180,
        display: "grid",
        placeItems: "center",
        background: "#F8FAFC",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          background: "rgba(37, 99, 235, 0.04)",
          borderColor: "primary.main",
        },
      }}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
      }}
      onDrop={(event) => {
        if (disabled) return;
        event.preventDefault();
        handleFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        hidden
        type="file"
        multiple
        disabled={disabled}
        accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <Stack spacing={1.5} alignItems="center" maxWidth={280}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            bgcolor: "rgba(59, 130, 246, 0.2)",
            display: "grid",
            placeItems: "center",
            color: "primary.main",
          }}
        >
          <CloudUpload size={22} />
        </Box>
        <Box textAlign="center">
          <Typography variant="body2" fontWeight={600}>
            Drag & drop vessel videos
          </Typography>
          <Typography variant="caption" color="text.secondary">
            MP4, MOV, or AVI
          </Typography>
        </Box>
        <Button size="small" variant="contained" disabled={disabled} onClick={() => inputRef.current?.click()}>
          Browse Files
        </Button>
        {fileCount > 0 ? (
          <Typography variant="body2" fontWeight={600}>
            {fileCount} video{fileCount > 1 ? "s" : ""} selected
          </Typography>
        ) : null}
        <Box width="100%">
          <Typography variant="caption" color="text.secondary">
            Upload progress
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 1, height: 8, borderRadius: 999 }}
          />
        </Box>
      </Stack>
    </Box>
  );
}
