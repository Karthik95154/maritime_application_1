import cv2
import numpy as np


def polygon_area(segmentation):

    if segmentation is None:
        return 0

    polygon = np.array(
        segmentation,
        dtype=np.int32
    )

    return float(
        cv2.contourArea(polygon)
    )


def polygon_centroid(segmentation):

    if segmentation is None:
        return None

    polygon = np.array(
        segmentation,
        dtype=np.int32
    )

    M = cv2.moments(polygon)

    if M["m00"] == 0:
        return None

    cx = int(M["m10"] / M["m00"])
    cy = int(M["m01"] / M["m00"])

    return (cx, cy)


def segmentation_to_mask(
    segmentation,
    image_shape
):

    mask = np.zeros(
        image_shape[:2],
        dtype=np.uint8
    )

    polygon = np.array(
        segmentation,
        dtype=np.int32
    )

    cv2.fillPoly(
        mask,
        [polygon],
        255
    )

    return mask
