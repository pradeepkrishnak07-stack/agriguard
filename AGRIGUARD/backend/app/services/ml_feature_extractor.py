"""
AGRIGUARD Feature Extractor for Plant Pathology Vision Model
Derived from plant_disease_training.ipynb (Cell 12 - Research Paper Implementation)

Extracts 55 invariant visual biomarkers:
1. Shape features (11): 7 log-scaled Hu moments + 4 contour geometry metrics
2. Texture features (20): 4 GLCM Sobel gradient statistics + 16 normalized Local Binary Pattern bins
3. Color features (21): 15 RGB channel moments + 6 HSV channel moments
4. Edge features (3): Canny edge density, total contour length, mean contour length
"""

import cv2
import numpy as np

IMG_SIZE = (128, 128)
TOTAL_FEATURE_DIM = 55


def extract_pathology_features(bgr_img: np.ndarray) -> np.ndarray:
    """
    Extracts 55-dimensional feature vector from a BGR image array.
    Identical pipeline for both training and real-time backend inference.
    """
    if bgr_img is None:
        return np.zeros(TOTAL_FEATURE_DIM, dtype=np.float32)

    # Standardize image size
    if bgr_img.shape[0] != IMG_SIZE[0] or bgr_img.shape[1] != IMG_SIZE[1]:
        bgr_img = cv2.resize(bgr_img, IMG_SIZE)

    gray = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2GRAY)
    rgb = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2RGB)
    hsv = cv2.cvtColor(bgr_img, cv2.COLOR_BGR2HSV)

    features = []

    # 1. SHAPE FEATURES (11 features)
    shape_feats = []
    try:
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            contour = max(contours, key=cv2.contourArea)
            # 7 Hu moments (log transformed)
            moments = cv2.moments(contour)
            hu_moments = cv2.HuMoments(moments).flatten()
            hu_moments = -np.sign(hu_moments) * np.log10(np.abs(hu_moments) + 1e-10)
            shape_feats.extend(hu_moments.tolist())

            # 4 Contour geometry descriptors
            area = cv2.contourArea(contour)
            perimeter = cv2.arcLength(contour, True)
            circularity = 4 * np.pi * area / (perimeter ** 2) if perimeter > 0 else 0.0
            x, y, w, h = cv2.boundingRect(contour)
            aspect_ratio = float(w) / h if h > 0 else 0.0
            hull = cv2.convexHull(contour)
            hull_area = cv2.contourArea(hull)
            solidity = float(area) / hull_area if hull_area > 0 else 0.0

            eccentricity = 0.0
            if len(contour) >= 5:
                try:
                    ellipse = cv2.fitEllipse(contour)
                    major_axis = max(ellipse[1])
                    minor_axis = min(ellipse[1])
                    eccentricity = np.sqrt(1 - (minor_axis ** 2) / (major_axis ** 2)) if major_axis > 0 else 0.0
                except Exception:
                    eccentricity = 0.0

            shape_feats.extend([circularity, aspect_ratio, solidity, eccentricity])
        else:
            shape_feats.extend([0.0] * 11)
    except Exception:
        shape_feats.extend([0.0] * 11)

    shape_feats = shape_feats[:11] if len(shape_feats) >= 11 else shape_feats + [0.0] * (11 - len(shape_feats))
    features.extend(shape_feats)

    # 2. TEXTURE FEATURES (20 features: 4 GLCM Sobel stats + 16 LBP bins)
    texture_feats = []
    try:
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        grad_mag = np.sqrt(sobelx ** 2 + sobely ** 2)
        grad_dir = np.arctan2(sobely, sobelx)
        texture_feats.extend([
            float(np.mean(grad_mag)),
            float(np.std(grad_mag)),
            float(np.mean(grad_dir)),
            float(np.std(grad_dir))
        ])

        # 16-bin LBP
        h_g, w_g = gray.shape
        lbp_image = np.zeros_like(gray, dtype=np.uint8)
        c = gray[1:-1, 1:-1]
        p0 = (gray[:-2, :-2] >= c).astype(np.uint8) << 0
        p1 = (gray[:-2, 1:-1] >= c).astype(np.uint8) << 1
        p2 = (gray[:-2, 2:] >= c).astype(np.uint8) << 2
        p3 = (gray[1:-1, 2:] >= c).astype(np.uint8) << 3
        p4 = (gray[2:, 2:] >= c).astype(np.uint8) << 4
        p5 = (gray[2:, 1:-1] >= c).astype(np.uint8) << 5
        p6 = (gray[2:, :-2] >= c).astype(np.uint8) << 6
        p7 = (gray[1:-1, :-2] >= c).astype(np.uint8) << 7
        lbp_inner = p0 | p1 | p2 | p3 | p4 | p5 | p6 | p7
        lbp_image[1:-1, 1:-1] = lbp_inner

        hist, _ = np.histogram(lbp_image.ravel(), bins=256, range=[0, 256])
        hist = hist.astype(np.float32) / (hist.sum() + 1e-10)
        texture_feats.extend(hist[:16].tolist())
    except Exception:
        texture_feats.extend([0.0] * 20)

    texture_feats = texture_feats[:20] if len(texture_feats) >= 20 else texture_feats + [0.0] * (20 - len(texture_feats))
    features.extend(texture_feats)

    # 3. COLOR FEATURES (21 features: 15 RGB stats + 6 HSV stats)
    color_feats = []
    try:
        # RGB stats (5 stats x 3 channels = 15)
        for ch in range(3):
            cdata = rgb[:, :, ch].ravel()
            color_feats.extend([
                float(np.mean(cdata)),
                float(np.std(cdata)),
                float(np.median(cdata)),
                float(np.min(cdata)),
                float(np.max(cdata))
            ])

        # HSV stats (2 stats x 3 channels = 6)
        for ch in range(3):
            hdata = hsv[:, :, ch].ravel()
            color_feats.extend([
                float(np.mean(hdata)),
                float(np.std(hdata))
            ])
    except Exception:
        color_feats.extend([0.0] * 21)

    color_feats = color_feats[:21] if len(color_feats) >= 21 else color_feats + [0.0] * (21 - len(color_feats))
    features.extend(color_feats)

    # 4. EDGE FEATURES (3 features: density, total length, avg length)
    edge_feats = []
    try:
        edges = cv2.Canny(gray, 50, 150)
        edge_density = float(np.sum(edges > 0)) / (gray.shape[0] * gray.shape[1])
        edge_contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if edge_contours:
            total_len = float(sum(cv2.arcLength(cnt, True) for cnt in edge_contours))
            avg_len = total_len / len(edge_contours)
        else:
            total_len = 0.0
            avg_len = 0.0
        edge_feats = [edge_density, total_len, avg_len]
    except Exception:
        edge_feats = [0.0, 0.0, 0.0]

    edge_feats = edge_feats[:3] if len(edge_feats) >= 3 else edge_feats + [0.0] * (3 - len(edge_feats))
    features.extend(edge_feats)

    arr = np.array(features, dtype=np.float32)
    np.nan_to_num(arr, copy=False, nan=0.0, posinf=0.0, neginf=0.0)
    return arr
