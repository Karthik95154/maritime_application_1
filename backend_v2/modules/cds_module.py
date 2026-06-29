import os
import cv2
import time
import torch
import numpy as np

from ultralytics import YOLO
from collections import defaultdict


class CDSModule:

    def __init__(

        self,

        classification_model_path,
        part_segmentation_model_path,
        defect_segmentation_model_path,

        tracker="botsort.yaml",

        device=None,

        temporal_nms_iou=0.7
    ):

        self.device = device or (
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.tracker = tracker

        self.temporal_nms_iou = temporal_nms_iou

        # =====================================================
        # LOAD MODELS
        # =====================================================

        self.classification_model = YOLO(
            classification_model_path
        )

        self.part_segmentation_model = YOLO(
            part_segmentation_model_path
        )

        self.defect_segmentation_model = YOLO(
            defect_segmentation_model_path
        )

        # =====================================================
        # TEMPORAL TRACK MEMORY
        # =====================================================

        self.track_first_seen = {}
        self.track_frequency = defaultdict(int)

    # =========================================================
    # CLASSIFICATION
    # =========================================================

    def classify_frame(self, frame):

        results = self.classification_model(frame)

        if len(results) == 0:
            return None

        r = results[0]

        class_id = int(r.probs.top1)

        return {
            "class_id": class_id,
            "class_name": r.names[class_id],
            "confidence": float(r.probs.top1conf)
        }

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
    # TEMPORAL STABLE NMS
    # =========================================================

    def temporal_stable_nms(self, result, frame_index):

        if result.boxes is None:
            return []

        boxes = result.boxes.xyxy.cpu().numpy()
        confs = result.boxes.conf.cpu().numpy()
        classes = result.boxes.cls.cpu().numpy().astype(int)

        if result.boxes.id is not None:
            track_ids = (
                result.boxes.id
                .cpu()
                .numpy()
                .astype(int)
            )
        else:
            track_ids = np.arange(len(boxes))

        detections = []

        for i in range(len(boxes)):

            track_id = int(track_ids[i])

            self.track_frequency[track_id] += 1

            if track_id not in self.track_first_seen:
                self.track_first_seen[track_id] = frame_index

            detections.append({

                "box": boxes[i].tolist(),

                "confidence": float(confs[i]),

                "class_id": int(classes[i]),

                "track_id": track_id,

                "mask_index": i,

                "first_seen":
                    self.track_first_seen[track_id],

                "track_frequency":
                    self.track_frequency[track_id]
            })

        # =====================================================
        # SORT TEMPORALLY
        # =====================================================

        detections.sort(

            key=lambda d: (

                d["first_seen"],

                -d["track_frequency"],

                -d["confidence"]
            )
        )

        keep = []
        removed = set()

        for i, det_a in enumerate(detections):

            if i in removed:
                continue

            keep.append(det_a)

            for j, det_b in enumerate(detections):

                if i == j:
                    continue

                if j in removed:
                    continue

                if det_a["class_id"] != det_b["class_id"]:
                    continue

                iou = self.compute_iou(
                    det_a["box"],
                    det_b["box"]
                )

                if iou > self.temporal_nms_iou:
                    removed.add(j)

        return keep

    # =========================================================
    # PARSE YOLO SEGMENTATION OUTPUT
    # =========================================================

    def parse_segmentation_results(

        self,
        result,
        filtered_detections
    ):

        parsed = []

        polygons = None

        if result.masks is not None:
            polygons = result.masks.xy

        for det in filtered_detections:

            mask_polygon = None

            if polygons is not None:

                mask_index = det["mask_index"]

                if mask_index < len(polygons):

                    mask_polygon = (
                        polygons[mask_index]
                        .astype(np.int32)
                        .tolist()
                    )

            parsed.append({

                "track_id": det["track_id"],

                "class_id": det["class_id"],

                "class_name":
                    result.names[det["class_id"]],

                "confidence":
                    det["confidence"],

                "bbox":
                    det["box"],

                "segmentation":
                    mask_polygon
            })

        return parsed
    
    
    def generate_color(self, class_id):

        np.random.seed(class_id)

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

    # =========================================================
    # PROCESS VIDEO FRAMES
    # =========================================================

    def process_frames(

        self,
        frames
    ):

        outputs = []

        frame_index = 0

        for frame_data in frames:

            frame_path = frame_data["frame_path"]

            frame = cv2.imread(frame_path)

            if frame is None:
                continue

            print(
                f"[INFO] Processing Frame: {frame_index}"
            )

            # =============================================
            # CLASSIFICATION
            # =============================================

            classification = self.classify_frame(frame)

            # =============================================
            # PART SEGMENTATION + TRACKING
            # =============================================

            part_results = self.part_segmentation_model.track(

                source=frame,

                persist=True,

                tracker=self.tracker,

                verbose=False
            )

            part_result = part_results[0]

            filtered_parts = self.temporal_stable_nms(
                part_result,
                frame_index
            )

            parsed_parts = self.parse_segmentation_results(
                part_result,
                filtered_parts
            )

            # =============================================
            # DEFECT SEGMENTATION + TRACKING
            # =============================================

            defect_results = (
                self.defect_segmentation_model.track(

                    source=frame,

                    persist=True,

                    tracker=self.tracker,

                    verbose=False
                )
            )

            defect_result = defect_results[0]

            filtered_defects = self.temporal_stable_nms(
                defect_result,
                frame_index
            )

            parsed_defects = (
                self.parse_segmentation_results(

                    defect_result,

                    filtered_defects
                )
            )

            # =============================================
            # FINAL OUTPUT
            # =============================================

            
            outputs.append({

                "frame_id":
                    frame_data["frame_id"],

                "timestamp":
                    frame_data["timestamp"],

                "frame_path":
                    frame_data["frame_path"],

                "classification":
                    classification,

                "part_detections":
                    parsed_parts,

                "defect_detections":
                    parsed_defects
            })

            frame_index += 1

        return outputs


# =============================================================
# TESTING
# =============================================================
"""
if __name__ == "__main__":

    cds = CDSModule(

        classification_model_path=
            "final_models/yolo26m_classification_best.pt",

        part_segmentation_model_path=
            "final_models/yolo26m_part_seg_best.pt",

        defect_segmentation_model_path=
            "final_models/yolo_seg_deformation_best.pt",

        tracker="botsort.yaml"
    )

    frames_file = "frame_extraction_testing_outputs/deformation_3/extracted_frames.json"

    import json

    with open(frames_file, "r") as f:
        frames = json.load(f)

    outputs = cds.process_frames(frames)

    print(outputs)

    output_path = os.path.join("/".join(frames_file.split("/")[:-1]), "cds_outputs.json")

    with open(output_path, "w") as f:
        json.dump(outputs, f, indent=4)
    
    cds_output_frames_folder = os.path.join("/".join(frames_file.split("/")[:-1]), "cds_output_frames")

    os.makedirs(cds_output_frames_folder, exist_ok=True)


    PADDING = 30

    for output in outputs:

        frame_id = output["frame_id"]

        frame_path = output["frame_path"]

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

        # =====================================================
        # DRAW PART SEGMENTATIONS
        # =====================================================

        for part in output["part_detections"]:

            color = cds.generate_color(
                part["class_id"]
            )

            segmentation = part["segmentation"]

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

        # =====================================================
        # DRAW DEFECT SEGMENTATIONS
        # =====================================================

        for defect in output["defect_detections"]:

            segmentation = defect["segmentation"]

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
                    (0, 0, 255)
                )

        # =====================================================
        # APPLY TRANSPARENCY
        # =====================================================

        padded_frame = cv2.addWeighted(
            overlay,
            0.35,
            padded_frame,
            0.65,
            0
        )

        # =====================================================
        # DRAW PART BOXES
        # =====================================================

        for part in output["part_detections"]:

            x1, y1, x2, y2 = map(
                int,
                part["bbox"]
            )

            # SHIFT BOXES
            x1 += PADDING
            y1 += PADDING
            x2 += PADDING
            y2 += PADDING

            color = cds.generate_color(
                part["class_id"]
            )

            cv2.rectangle(
                padded_frame,
                (x1, y1),
                (x2, y2),
                color,
                2
            )

            label = (
                f"{part['class_name']} "
                f"ID:{part['track_id']} "
                f"{part['confidence']:.2f}"
            )

            cv2.putText(
                padded_frame,
                label,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                2
            )

        # =====================================================
        # DRAW DEFECT BOXES
        # =====================================================

        for defect in output["defect_detections"]:

            x1, y1, x2, y2 = map(
                int,
                defect["bbox"]
            )

            # SHIFT BOXES
            x1 += PADDING
            y1 += PADDING
            x2 += PADDING
            y2 += PADDING

            cv2.rectangle(
                padded_frame,
                (x1, y1),
                (x2, y2),
                (0, 0, 255),
                2
            )

            label = (
                f"{defect['class_name']} "
                f"ID:{defect['track_id']} "
                f"{defect['confidence']:.2f}"
            )

            cv2.putText(
                padded_frame,
                label,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 0, 255),
                2
            )

        # =====================================================
        # SAVE OUTPUT
        # =====================================================

        output_frame_path = os.path.join(

            cds_output_frames_folder,

            f"cds_output_frame_{frame_id}.jpg"
        )

        cv2.imwrite(
            output_frame_path,
            padded_frame
        )
"""