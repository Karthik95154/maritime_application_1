import os
import json
import cv2
import torch
import numpy as np
import open_clip

from PIL import Image
from collections import defaultdict
from sklearn.metrics.pairwise import cosine_similarity

from .shared.mask_utils import (
    polygon_area,
    polygon_centroid
)


class TemporalConsistencyModule:

    def __init__(

        self,

        clip_similarity_threshold=0.88,

        iou_threshold=0.35,

        area_similarity_threshold=0.60,

        association_threshold=0.70,

        crop_padding=20,

        device=None
    ):

        self.clip_similarity_threshold = (
            clip_similarity_threshold
        )

        self.iou_threshold = iou_threshold

        self.area_similarity_threshold = (
            area_similarity_threshold
        )

        self.association_threshold = (
            association_threshold
        )

        self.crop_padding = crop_padding

        self.device = device or (
            "cuda"
            if torch.cuda.is_available()
            else "cpu"
        )

        print(
            f"[INFO] Using device: {self.device}"
        )

        # =====================================================
        # LOAD CLIP
        # =====================================================

        self.clip_model, _, self.preprocess = (
            open_clip.create_model_and_transforms(
                "ViT-B-32",
                pretrained="laion2b_s34b_b79k"
            )
        )

        self.clip_model = (
            self.clip_model.to(self.device)
        )

        self.clip_model.eval()

        # =====================================================
        # PERSISTENT DEFECT MEMORY
        # =====================================================

        self.persistent_defects = {}

        self.next_persistent_id = 1

    # =========================================================
    # JSON HELPERS
    # =========================================================

    def load_json(self, path):

        with open(path, "r") as f:
            return json.load(f)

    def save_json(self, data, path):

        os.makedirs(os.path.dirname(path), exist_ok=True)

        with open(path, "w") as f:

            json.dump(
                data,
                f,
                indent=4
            )

    # =========================================================
    # IOU
    # =========================================================

    def compute_iou(self, box1, box2):

        x1 = max(box1[0], box2[0])
        y1 = max(box1[1], box2[1])

        x2 = min(box1[2], box2[2])
        y2 = min(box1[3], box2[3])

        inter = max(0, x2 - x1) * max(0, y2 - y1)

        area1 = (
            (box1[2] - box1[0]) *
            (box1[3] - box1[1])
        )

        area2 = (
            (box2[2] - box2[0]) *
            (box2[3] - box2[1])
        )

        union = area1 + area2 - inter

        if union <= 0:
            return 0

        return inter / union

    # =========================================================
    # AREA SIMILARITY
    # =========================================================

    def compute_area_similarity(

        self,

        area1,

        area2
    ):

        if area1 == 0 or area2 == 0:
            return 0

        return min(area1, area2) / max(area1, area2)

    # =========================================================
    # CENTROID DISTANCE SCORE
    # =========================================================

    def compute_distance_score(

        self,

        centroid1,

        centroid2
    ):

        if centroid1 is None or centroid2 is None:
            return 0

        distance = np.linalg.norm(

            np.array(centroid1)
            -
            np.array(centroid2)
        )

        return 1 / (1 + distance / 100)

    # =========================================================
    # CROP DEFECT
    # =========================================================

    def crop_defect(

        self,

        frame,

        bbox
    ):

        x1, y1, x2, y2 = map(int, bbox)

        h, w = frame.shape[:2]

        x1 = max(0, x1 - self.crop_padding)
        y1 = max(0, y1 - self.crop_padding)

        x2 = min(w, x2 + self.crop_padding)
        y2 = min(h, y2 + self.crop_padding)

        crop = frame[y1:y2, x1:x2]

        return crop

    # =========================================================
    # CLIP EMBEDDING
    # =========================================================

    def compute_clip_embedding(

        self,

        image
    ):

        image = Image.fromarray(
            cv2.cvtColor(
                image,
                cv2.COLOR_BGR2RGB
            )
        )

        image = (
            self.preprocess(image)
            .unsqueeze(0)
            .to(self.device)
        )

        with torch.no_grad():

            embedding = (
                self.clip_model.encode_image(image)
            )

            embedding /= embedding.norm(
                dim=-1,
                keepdim=True
            )

        return embedding.cpu().numpy()[0]

    # =========================================================
    # CLIP SIMILARITY
    # =========================================================

    def compute_clip_similarity(

        self,

        embedding1,

        embedding2
    ):

        return cosine_similarity(

            [embedding1],
            [embedding2]

        )[0][0]

    # =========================================================
    # ASSOCIATION SCORE
    # =========================================================

    def compute_association_score(

        self,

        clip_similarity,

        iou_score,

        area_similarity,

        distance_score
    ):

        return (

            0.45 * clip_similarity +

            0.25 * iou_score +

            0.15 * area_similarity +

            0.15 * distance_score
        )

    # =========================================================
    # CREATE PERSISTENT DEFECT
    # =========================================================

    def create_persistent_defect(

        self,

        detection,

        frame_id,

        timestamp,

        embedding,

        area,

        centroid
    ):

        persistent_id = (
            f"PD_{self.next_persistent_id}"
        )

        self.next_persistent_id += 1

        self.persistent_defects[persistent_id] = {

            "persistent_id":
                persistent_id,

            "class_name":
                detection["class_name"],

            "tracker_ids_seen": [

                detection["track_id"]
            ],

            "frames_seen": [

                frame_id
            ],

            "timestamps": [

                timestamp
            ],

            "embeddings": [

                embedding
            ],

            "areas": [

                area
            ],

            "centroids": [

                centroid
            ],

            "detections": [

                detection
            ]
        }

        return persistent_id

    # =========================================================
    # FIND BEST MATCH
    # =========================================================

    def find_best_match(

        self,

        detection,

        embedding,

        area,

        centroid
    ):

        best_match = None

        best_score = 0

        bbox = detection["bbox"]

        for persistent_id, defect_memory in (
            self.persistent_defects.items()
        ):

            # =============================================
            # CLASS CHECK
            # =============================================

            if (

                defect_memory["class_name"]
                !=
                detection["class_name"]
            ):
                continue

            # =============================================
            # LAST OBSERVATION
            # =============================================

            last_embedding = (
                defect_memory["embeddings"][-1]
            )

            last_detection = (
                defect_memory["detections"][-1]
            )

            last_bbox = (
                last_detection["bbox"]
            )

            last_area = (
                defect_memory["areas"][-1]
            )

            last_centroid = (
                defect_memory["centroids"][-1]
            )

            # =============================================
            # METRICS
            # =============================================

            clip_similarity = (
                self.compute_clip_similarity(
                    embedding,
                    last_embedding
                )
            )

            iou_score = self.compute_iou(
                bbox,
                last_bbox
            )

            area_similarity = (
                self.compute_area_similarity(
                    area,
                    last_area
                )
            )

            distance_score = (
                self.compute_distance_score(
                    centroid,
                    last_centroid
                )
            )

            # =============================================
            # ASSOCIATION SCORE
            # =============================================

            association_score = (
                self.compute_association_score(

                    clip_similarity,

                    iou_score,

                    area_similarity,

                    distance_score
                )
            )

            if association_score > best_score:

                best_score = association_score

                best_match = persistent_id

        return best_match, best_score

    # =========================================================
    # UPDATE MEMORY
    # =========================================================

    def update_memory(

        self,

        persistent_id,

        detection,

        frame_id,

        timestamp,

        embedding,

        area,

        centroid
    ):

        defect_memory = (
            self.persistent_defects[
                persistent_id
            ]
        )

        defect_memory["tracker_ids_seen"].append(
            detection["track_id"]
        )

        defect_memory["frames_seen"].append(
            frame_id
        )

        defect_memory["timestamps"].append(
            timestamp
        )

        defect_memory["embeddings"].append(
            embedding
        )

        defect_memory["areas"].append(
            area
        )

        defect_memory["centroids"].append(
            centroid
        )

        defect_memory["detections"].append(
            detection
        )

    # =========================================================
    # PROCESS
    # =========================================================

    def process(

        self,

        cds_json_path,

        output_json_path
    ):

        cds_outputs = self.load_json(
            cds_json_path
        )

        temporally_stable_outputs = []

        # =====================================================
        # FRAME LOOP
        # =====================================================

        for frame_data in cds_outputs:

            frame_id = frame_data["frame_id"]

            timestamp = frame_data["timestamp"]

            frame_path = frame_data["frame_path"]

            frame = cv2.imread(frame_path)

            if frame is None:
                continue

            enriched_defects = []

            # =================================================
            # DEFECT LOOP
            # =================================================

            for detection in (
                frame_data["defect_detections"]
            ):

                segmentation = (
                    detection["segmentation"]
                )

                area = polygon_area(
                    segmentation
                )

                centroid = polygon_centroid(
                    segmentation
                )

                # =============================================
                # DEFECT CROP
                # =============================================

                crop = self.crop_defect(
                    frame,
                    detection["bbox"]
                )

                if crop.size == 0:
                    continue

                # =============================================
                # CLIP EMBEDDING
                # =============================================

                embedding = (
                    self.compute_clip_embedding(
                        crop
                    )
                )

                # =============================================
                # FIND MATCH
                # =============================================

                best_match, best_score = (
                    self.find_best_match(

                        detection,

                        embedding,

                        area,

                        centroid
                    )
                )

                # =============================================
                # CREATE / UPDATE
                # =============================================

                if (

                    best_match is not None

                    and

                    best_score
                    >=
                    self.association_threshold
                ):

                    persistent_id = best_match

                    self.update_memory(

                        persistent_id,

                        detection,

                        frame_id,

                        timestamp,

                        embedding,

                        area,

                        centroid
                    )

                else:

                    persistent_id = (
                        self.create_persistent_defect(

                            detection,

                            frame_id,

                            timestamp,

                            embedding,

                            area,

                            centroid
                        )
                    )

                # =============================================
                # ENRICH DETECTION
                # =============================================

                enriched_detection = {

                    **detection,

                    "persistent_defect_id":
                        persistent_id,

                    "association_score":
                        float(best_score),

                    "semantic_area_px":
                        float(area),

                    "semantic_centroid":
                        centroid
                }

                enriched_defects.append(
                    enriched_detection
                )

            temporally_stable_outputs.append({

                **frame_data,

                "defect_detections":
                    enriched_defects
            })

        # =====================================================
        # SAVE
        # =====================================================

        self.save_json(

            temporally_stable_outputs,

            output_json_path
        )

        print(
            f"[INFO] Temporal outputs saved:"
        )

        print(output_json_path)

        return temporally_stable_outputs


# =============================================================
# TESTING
# =============================================================
"""
if __name__ == "__main__":

    temporal_module = (
        TemporalConsistencyModule(

            clip_similarity_threshold=0.88,

            iou_threshold=0.35,

            area_similarity_threshold=0.60,

            association_threshold=0.70
        )
    )

    outputs = temporal_module.process(

        cds_json_path=
            "frame_extraction_testing_outputs/deformation_1/cds_outputs.json",

        output_json_path=
            "frame_extraction_testing_outputs/deformation_1/temporal_module_output/temporally_stable_outputs.json"
    )

    # =====================================================
    # DEBUG OUTPUT FOLDER
    # =====================================================

    debug_output_folder = (
        "frame_extraction_testing_outputs/deformation_1/temporal_module_output"
    )

    os.makedirs(
        debug_output_folder,
        exist_ok=True
    )

    # =====================================================
    # COLOR GENERATOR
    # =====================================================

    def generate_color_from_id(text):

        seed = abs(hash(text)) % (2**32)

        np.random.seed(seed)

        color = np.random.randint(
            0,
            255,
            size=3
        )

        return (
            int(color[0]),
            int(color[1]),
            int(color[2])
        )

    # =====================================================
    # VISUALIZE EACH FRAME
    # =====================================================

    PADDING = 100

    for frame_data in outputs:

        frame_id = frame_data["frame_id"]

        frame_path = frame_data["frame_path"]

        frame = cv2.imread(frame_path)

        if frame is None:
            continue

        # =====================================================
        # CREATE PADDED IMAGE
        # =====================================================

        padded_frame = cv2.copyMakeBorder(

            frame,

            PADDING,
            PADDING,
            PADDING,
            PADDING,

            borderType=cv2.BORDER_CONSTANT,

            value=(255, 255, 255)
        )

        overlay = padded_frame.copy()

        # =============================================
        # DRAW DEFECTS
        # =============================================

        for defect in (
            frame_data["defect_detections"]
        ):

            class_name = (
                defect["class_name"]
            )

            track_id = (
                defect["track_id"]
            )

            persistent_id = (
                defect["persistent_defect_id"]
            )

            association_score = (
                defect["association_score"]
            )

            semantic_area = (
                defect["semantic_area_px"]
            )

            bbox = defect["bbox"]

            segmentation = (
                defect["segmentation"]
            )

            # =========================================
            # COLOR
            # =========================================

            color = generate_color_from_id(
                persistent_id
            )

            # =========================================
            # DRAW MASK
            # =========================================

            if segmentation is not None:

                polygon = np.array(
                    segmentation,
                    dtype=np.int32
                )

                # SHIFT POLYGON
                polygon[:, 0] += PADDING
                polygon[:, 1] += PADDING

                cv2.fillPoly(
                    overlay,
                    [polygon],
                    color
                )

                cv2.polylines(

                    overlay,

                    [polygon],

                    isClosed=True,

                    color=color,

                    thickness=2
                )

            # =========================================
            # DRAW BBOX
            # =========================================

            x1, y1, x2, y2 = map(
                int,
                bbox
            )

            # SHIFT BBOX
            x1 += PADDING
            y1 += PADDING
            x2 += PADDING
            y2 += PADDING

            cv2.rectangle(

                overlay,

                (x1, y1),

                (x2, y2),

                color,

                2
            )

            # =========================================
            # LABEL
            # =========================================

            label_1 = (
                f"{class_name}"
            )

            label_2 = (
                f"TID:{track_id}"
            )

            label_3 = (
                f"PID:{persistent_id}"
            )

            label_4 = (
                f"Assoc:{association_score:.2f}"
            )

            label_5 = (
                f"Area:{semantic_area:.0f}px"
            )

            # =========================================
            # DRAW TEXT WITH BACKGROUND
            # =========================================

            text_y_positions = [
                (label_1, y1 - 75),
                (label_2, y1 - 58),
                (label_3, y1 - 41),
                (label_4, y1 - 24),
                (label_5, y1 - 7)
            ]

            for label, y_pos in text_y_positions:

                (text_width, text_height) = (
                    cv2.getTextSize(
                        label,
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.4,
                        1
                    )[0]
                )

                # Draw dark background rectangle
                cv2.rectangle(

                    overlay,

                    (x1 + 2, y_pos - text_height - 5),

                    (x1 + text_width + 8, y_pos + 5),

                    (0, 0, 0),

                    -1
                )

                # Draw bold white text
                cv2.putText(

                    overlay,

                    label,

                    (x1 + 5, y_pos),

                    cv2.FONT_HERSHEY_SIMPLEX,

                    0.4,

                    (255, 255, 255),

                    1
                )

        # =============================================
        # TRANSPARENCY
        # =============================================

        blended = cv2.addWeighted(

            overlay,

            0.40,

            padded_frame,

            0.60,

            0
        )

        # =============================================
        # SAVE
        # =============================================

        output_path = os.path.join(

            debug_output_folder,

            f"temporal_debug_{frame_id}.jpg"
        )

        cv2.imwrite(
            output_path,
            blended
        )

        print(
            f"[DEBUG SAVED] {output_path}"
        )
        
"""