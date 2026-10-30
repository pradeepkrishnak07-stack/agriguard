import os
import cv2
import joblib
import json
import numpy as np
from app.services.ml_feature_extractor import extract_pathology_features

model_data = joblib.load('app/models/plant_disease_model.joblib')
clf = model_data['model']
scaler = model_data['scaler']
le = model_data['label_encoder']
with open('app/models/class_mapping.json', 'r', encoding='utf-8') as f:
    mapping = json.load(f)

color_dir = r'c:\Users\ELCOT\Downloads\MAIN AGRIGUARD\AGRIGUARD\dataset\PlantVillage-Dataset-master\PlantVillage-Dataset-master\raw\color'

test_cases = [
    ('Tomato Early Blight', 'Tomato___Early_blight'),
    ('Corn Common Rust', 'Corn_(maize)___Common_rust_'),
    ('Corn Northern Leaf Blight', 'Corn_(maize)___Northern_Leaf_Blight'),
    ('Corn Healthy', 'Corn_(maize)___healthy'),
    ('Apple Scab', 'Apple___Apple_scab'),
    ('Grape Black Rot', 'Grape___Black_rot'),
    ('Potato Early Blight', 'Potato___Early_blight'),
    ('Orange Citrus Greening', 'Orange___Haunglongbing_(Citrus_greening)'),
    ('Peach Bacterial Spot', 'Peach___Bacterial_spot')
]

print("=" * 80)
print(f"{'Actual Category':26} | {'Predicted Category':44} | {'Conf':7} | {'Crop Match'}")
print("=" * 80)

for label, folder in test_cases:
    p = os.path.join(color_dir, folder)
    files = [f for f in os.listdir(p) if f.lower().endswith(('.jpg', '.png'))]
    for sample_file in [files[0], files[len(files)//2]]:
        img_path = os.path.join(p, sample_file)
        img = cv2.imread(img_path)
        feats = extract_pathology_features(img)
        scaled = scaler.transform([feats])
        probs = clf.predict_proba(scaled)[0]
        pred_idx = int(np.argmax(probs))
        conf = float(probs[pred_idx])
        meta = mapping[str(pred_idx)]
        pred_desc = f"{meta['crop_name_en']} - {meta['condition_title_en']}"
        crop_match = meta['crop_id'] in label.lower()
        print(f"{label:26} | {pred_desc[:44]:44} | {conf*100:5.1f}% | {'YES' if crop_match else 'NO'}")
