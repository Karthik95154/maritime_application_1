import os
import cv2
import torch
import numpy as np
from PIL import Image
from collections import deque
from sklearn.metrics.pairwise import cosine_similarity

import open_clip


class FrameExtractionModule:

    def __init__(
        self,
        output_dir="outputs/extracted_frames",
        frame_skip=5,
        blur_threshold=100,
        similarity_threshold=0.92,
        memory_size=20,
        device=None
    ):

        self.output_dir = output_dir

        self.frame_skip = frame_skip
        self.blur_threshold = blur_threshold
        self.similarity_threshold = similarity_threshold
        self.memory_size = memory_size

        os.makedirs(self.output_dir, exist_ok=True)

        self.device = device or (
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        print(f"[INFO] Using device: {self.device}")

        # =====================================================
        # LOAD CLIP MODEL
        # =====================================================

        self.model, _, self.preprocess = open_clip.create_model_and_transforms(
            "ViT-B-32",
            pretrained="laion2b_s34b_b79k"
        )

        self.model = self.model.to(self.device)
        self.model.eval()

        # =====================================================
        # SEMANTIC MEMORY
        # =====================================================

        self.embedding_memory = deque(maxlen=self.memory_size)

    # =========================================================
    # BLUR DETECTION
    # =========================================================

    def is_blurry(self, frame):

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        blur_score = cv2.Laplacian(
            gray,
            cv2.CV_64F
        ).var()

        return blur_score < self.blur_threshold, blur_score

    # =========================================================
    # CLIP EMBEDDING
    # =========================================================

    def compute_clip_embedding(self, frame):

        image = Image.fromarray(
            cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        )

        image = self.preprocess(image).unsqueeze(0).to(self.device)

        with torch.no_grad():

            embedding = self.model.encode_image(image)

            embedding /= embedding.norm(dim=-1, keepdim=True)

        return embedding.cpu().numpy()[0]

    # =========================================================
    # DUPLICATE CHECK
    # =========================================================

    def is_duplicate(self, embedding):

        if len(self.embedding_memory) == 0:
            return False, 0.0

        similarities = []

        for memory_embedding in self.embedding_memory:

            similarity = cosine_similarity(
                [embedding],
                [memory_embedding]
            )[0][0]

            similarities.append(similarity)

        max_similarity = max(similarities)

        return (
            max_similarity > self.similarity_threshold,
            max_similarity
        )

    # =========================================================
    # SAVE FRAME
    # =========================================================

    def save_frame(
        self,
        frame,
        frame_index,
        timestamp
    ):

        filename = f"frame_{frame_index:06d}.jpg"

        path = os.path.join(
            self.output_dir,
            filename
        )

        cv2.imwrite(path, frame)

        return {
            "frame_id": frame_index,
            "timestamp": timestamp,
            "frame_path": path
        }

    # =========================================================
    # MAIN PROCESSING
    # =========================================================

    def process_video(self, video_path):

        cap = cv2.VideoCapture(video_path)

        if not cap.isOpened():
            raise Exception(
                f"Could not open video: {video_path}"
            )

        fps = cap.get(cv2.CAP_PROP_FPS)

        frame_index = 0

        saved_frames = []

        total_frames = 0
        blurry_frames = 0
        duplicate_frames = 0
        unique_frames = 0

        while True:

            ret, frame = cap.read()

            if not ret:
                break

            total_frames += 1

            # =============================================
            # FRAME SKIPPING
            # =============================================

            if frame_index % self.frame_skip != 0:

                frame_index += 1
                continue

            # =============================================
            # BLUR DETECTION
            # =============================================

            is_blur, blur_score = self.is_blurry(frame)

            if is_blur:

                blurry_frames += 1

                print(
                    f"[BLUR] Frame {frame_index} "
                    f"discarded | Score: {blur_score:.2f}"
                )

                frame_index += 1
                continue

            # =============================================
            # CLIP EMBEDDING
            # =============================================

            embedding = self.compute_clip_embedding(frame)

            # =============================================
            # DUPLICATE CHECK
            # =============================================

            is_dup, similarity = self.is_duplicate(embedding)

            if is_dup:

                duplicate_frames += 1

                print(
                    f"[DUPLICATE] Frame {frame_index} "
                    f"discarded | Similarity: {similarity:.4f}"
                )

                frame_index += 1
                continue

            # =============================================
            # STORE EMBEDDING
            # =============================================

            self.embedding_memory.append(embedding)

            # =============================================
            # SAVE FRAME
            # =============================================

            timestamp = frame_index / fps

            frame_info = self.save_frame(
                frame,
                frame_index,
                timestamp
            )

            saved_frames.append(frame_info)

            unique_frames += 1

            print(
                f"[SAVED] Frame {frame_index} "
                f"| Timestamp: {timestamp:.2f}s"
            )

            frame_index += 1

        cap.release()

        # =====================================================
        # SUMMARY
        # =====================================================

        print("\n========== SUMMARY ==========")

        print(f"Total Frames: {total_frames}")
        print(f"Blur Removed: {blurry_frames}")
        print(f"Duplicates Removed: {duplicate_frames}")
        print(f"Unique Frames Saved: {unique_frames}")

        return saved_frames


# =============================================================
# TESTING
# =============================================================
"""
if __name__ == "__main__":

    output_folder = "frame_extraction_testing_outputs"
    #output_subfolder_name = "trail"
    output_subfolder_name = "deformation_3"

    base_path = os.path.join(output_folder, output_subfolder_name)
    final_output_path = base_path

    if os.path.exists(base_path):
        print(f"[INFO] Output folder already exists: {base_path}")

        suffix = 1
        while os.path.exists(f"{base_path}_{suffix}"):
            suffix += 1

        final_output_path = f"{base_path}_{suffix}"

    os.makedirs(final_output_path, exist_ok=True)

    extractor = FrameExtractionModule(
        output_dir=final_output_path,
        frame_skip=5,
        blur_threshold=200,
        similarity_threshold=0.92,
        memory_size=20
    )

    frames = extractor.process_video(
        "testing_videos/deformation_3.mp4"
    )

    print(f"\nFinal Unique Frames: {len(frames)}")

    import json

    print(json.dumps(frames, indent=4))

    with open(os.path.join(final_output_path, "extracted_frames.json"), "w") as f:
        json.dump(frames, f, indent=4)
        
"""
    
    
