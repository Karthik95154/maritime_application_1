import os
import json
import cv2
import numpy as np
from collections import defaultdict

from .shared.mask_utils import (
    polygon_area,
    segmentation_to_mask
)


class UniqueDefectFrameExtractor:

    def __init__(

        self,

        defect_area_default=5,

        defect_area_metrics="square meters",

        overlap_threshold=0.01
    ):

        self.defect_area_default = (
            defect_area_default
        )

        self.defect_area_metrics = (
            defect_area_metrics
        )

        self.overlap_threshold = (
            overlap_threshold
        )

    # =====================================================
    # JSON HELPERS
    # =====================================================

    def load_json(self, path):

        with open(path, "r") as f:
            return json.load(f)

    def save_json(self, data, path):

        os.makedirs(
            os.path.dirname(path),
            exist_ok=True
        )

        with open(path, "w") as f:

            json.dump(
                data,
                f,
                indent=4
            )

    # =====================================================
    # COMPUTE OVERLAP
    # =====================================================

    def compute_overlap(

        self,

        defect_segmentation,

        part_segmentation,

        image_shape
    ):

        if (

            defect_segmentation is None

            or

            part_segmentation is None
        ):

            return None

        defect_mask = segmentation_to_mask(

            defect_segmentation,

            image_shape
        )

        part_mask = segmentation_to_mask(

            part_segmentation,

            image_shape
        )

        # =============================================
        # INTERSECTION
        # =============================================

        intersection = cv2.bitwise_and(

            defect_mask,

            part_mask
        )

        overlap_area = np.sum(
            intersection > 0
        )

        part_area = np.sum(
            part_mask > 0
        )

        if part_area == 0:
            return None

        overlap_ratio = (
            overlap_area / part_area
        )

        return {

            "part_segmentation_area_px":
                int(part_area),

            "defect_overlap_area_px":
                int(overlap_area),

            "defect_overlap_ratio":
                float(overlap_ratio)
        }

    # =====================================================
    # BEST FRAME SCORING
    # =====================================================

    def compute_best_frame_score(

        self,

        segmentation_area,

        confidence,

        stability_score
    ):

        normalized_area = (
            segmentation_area / 100000
        )

        return (

            0.5 * normalized_area +

            0.3 * confidence +

            0.2 * stability_score
        )

    # =====================================================
    # PROCESS
    # =====================================================

    def process(

        self,

        temporal_json_path,

        output_json_path
    ):

        temporal_outputs = self.load_json(
            temporal_json_path
        )

        # =================================================
        # GROUP DEFECTS BY PERSISTENT ID
        # =================================================

        persistent_defect_memory = defaultdict(list)

        for frame_data in temporal_outputs:

            frame_id = frame_data["frame_id"]

            timestamp = frame_data["timestamp"]

            frame_path = frame_data["frame_path"]

            part_detections = (
                frame_data["part_detections"]
            )

            defect_detections = (
                frame_data["defect_detections"]
            )

            for defect in defect_detections:

                # =====================================
                # TEMPORAL VALIDATION CHECK
                # =====================================

                if not defect.get(
                    "is_temporally_valid",
                    True
                ):
                    continue

                persistent_id = (
                    defect[
                        "persistent_defect_id"
                    ]
                )

                segmentation_area = polygon_area(

                    defect["segmentation"]
                )

                persistent_defect_memory[
                    persistent_id
                ].append({

                    "frame_id":
                        frame_id,

                    "timestamp":
                        timestamp,

                    "frame_path":
                        frame_path,

                    "part_detections":
                        part_detections,

                    "defect_detection":
                        defect,

                    "segmentation_area":
                        segmentation_area
                })

        # =================================================
        # BUILD FINAL OUTPUT
        # =================================================

        unique_defect_outputs = {}

        # =================================================
        # PROCESS EACH DEFECT
        # =================================================

        for persistent_id, entries in (
            persistent_defect_memory.items()
        ):

            # =============================================
            # BEST FRAME SELECTION
            # =============================================

            best_entry = None

            best_score = -1

            confidence_values = []

            frame_ids = []

            timestamps = []

            for entry in entries:

                detection = (
                    entry["defect_detection"]
                )

                confidence = (
                    detection["confidence"]
                )

                stability_score = (
                    detection.get(
                        "stability_score",
                        0
                    )
                )

                segmentation_area = (
                    entry[
                        "segmentation_area"
                    ]
                )

                score = (
                    self.compute_best_frame_score(

                        segmentation_area,

                        confidence,

                        stability_score
                    )
                )

                if score > best_score:

                    best_score = score

                    best_entry = entry

                confidence_values.append(
                    confidence
                )

                frame_ids.append(
                    entry["frame_id"]
                )

                timestamps.append(
                    entry["timestamp"]
                )

            # =============================================
            # BEST DEFECT
            # =============================================

            best_detection = (
                best_entry["defect_detection"]
            )

            best_frame_path = (
                best_entry["frame_path"]
            )

            frame = cv2.imread(
                best_frame_path
            )

            if frame is None:
                continue

            image_shape = frame.shape

            # =============================================
            # OVERLAP ANALYSIS
            # =============================================

            overlapping_parts = []

            defect_segmentation = (
                best_detection["segmentation"]
            )

            for part in (
                best_entry["part_detections"]
            ):

                overlap_data = (
                    self.compute_overlap(

                        defect_segmentation,

                        part["segmentation"],

                        image_shape
                    )
                )

                if overlap_data is None:
                    continue

                if (

                    overlap_data[
                        "defect_overlap_ratio"
                    ]

                    <

                    self.overlap_threshold
                ):

                    continue

                overlapping_parts.append({

                    "part_name":
                        part["class_name"],

                    "part_track_id":
                        part["track_id"],

                    **overlap_data
                })

            # =============================================
            # FINAL DEFECT OBJECT
            # =============================================

            unique_defect_outputs[
                persistent_id
            ] = {

                "persistent_defect_id":
                    persistent_id,

                "defect_name":
                    best_detection[
                        "class_name"
                    ],

                "frames_list":
                    sorted(
                        list(set(frame_ids))
                    ),

                "timestamps":
                    sorted(
                        list(set(timestamps))
                    ),

                "best_frame":
                    best_entry["frame_id"],

                "best_frame_path":
                    best_frame_path,

                "best_frame_confidence":
                    best_detection[
                        "confidence"
                    ],

                "best_segmentation_area_px":

                    float(
                        best_entry[
                            "segmentation_area"
                        ]
                    ),

                "defect_area":
                    self.defect_area_default,

                "area_metrics":
                    self.defect_area_metrics,

                "bbox":
                    best_detection["bbox"],

                "severity":
                    "medium",

                "confidence_statistics": {

                    "max_confidence":

                        float(
                            np.max(
                                confidence_values
                            )
                        ),

                    "min_confidence":

                        float(
                            np.min(
                                confidence_values
                            )
                        ),

                    "avg_confidence":

                        float(
                            np.mean(
                                confidence_values
                            )
                        )
                },

                "overlapping_parts":
                    overlapping_parts
            }

        # =================================================
        # SAVE OUTPUT
        # =================================================

        self.save_json(

            unique_defect_outputs,

            output_json_path
        )

        print(
            f"[INFO] Unique defect outputs "
            f"saved to:"
        )

        print(output_json_path)

        return unique_defect_outputs


# =========================================================
# TESTING
# =========================================================
"""
if __name__ == "__main__":

    extractor = (
        UniqueDefectFrameExtractor(

            defect_area_default=5,

            defect_area_metrics="sq.m",

            overlap_threshold=0.01
        )
    )

    outputs = extractor.process(

        temporal_json_path=
            "frame_extraction_testing_outputs/deformation_3/temporal_module_output/temporally_stable_outputs.json",

        output_json_path=
            "frame_extraction_testing_outputs/deformation_3/unique_defect_output/unique_defect_outputs.json"
    )

    # =====================================================
    # DEBUG VISUALIZATION
    # =====================================================

    debug_output_folder = (
        "frame_extraction_testing_outputs/deformation_3/unique_defect_output"
    )

    os.makedirs(
        debug_output_folder,
        exist_ok=True
    )

    PADDING = 100

    for persistent_id, defect_data in (
        outputs.items()
    ):

        frame_path = (
            defect_data["best_frame_path"]
        )

        frame = cv2.imread(frame_path)

        if frame is None:
            continue

        # create padded image and overlay
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
        # BBOX
        # =============================================

        x1, y1, x2, y2 = map(

            int,

            defect_data["bbox"]
        )

        # shift bbox by padding
        x1 += PADDING
        y1 += PADDING
        x2 += PADDING
        y2 += PADDING

        cv2.rectangle(

            overlay,

            (x1, y1),

            (x2, y2),

            (0, 255, 0),

            2
        )

        # =============================================
        # LABEL
        # =============================================

        label_1 = (
            f"{defect_data['defect_name']}"
        )

        label_2 = (
            f"PID:{persistent_id}"
        )

        label_3 = (
            f"Frame_id:{defect_data['best_frame']}"
        )

        label_4 = (
            f"Area:"
            f"{defect_data['best_segmentation_area_px']:.0f}px"
        )

        cv2.rectangle(

            overlay,

            (x1, y1 - 90),

            (x1 + 350, y1),

            (0, 255, 0),

            -1
        )

        cv2.putText(

            overlay,

            label_1,

            (x1 + 5, y1 - 70),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.5,

            (255, 255, 255),

            2
        )

        cv2.putText(

            overlay,

            label_2,

            (x1 + 5, y1 - 50),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.5,

            (255, 255, 255),

            2
        )

        cv2.putText(

            overlay,

            label_3,

            (x1 + 5, y1 - 30),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.5,

            (255, 255, 255),

            2
        )

        cv2.putText(

            overlay,

            label_4,

            (x1 + 5, y1 - 10),

            cv2.FONT_HERSHEY_SIMPLEX,

            0.5,

            (255, 255, 255),

            2
        )

        # =============================================
        # SAVE
        # =============================================

        output_path = os.path.join(

            debug_output_folder,

            f"{persistent_id}.jpg"
        )

        cv2.imwrite(
            output_path,
            overlay
        )

        print(
            f"[DEBUG SAVED] {output_path}"
        )
        
"""