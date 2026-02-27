"""
Vercel Python Serverless Function — ML Priority Prediction
Path on Vercel: /ml/predict-priority  (routed via vercel.json)

scikit-learn RandomForestClassifier trained at module load time.
Training data loaded from ml_service/training_data.json at cold start.
"""

from http.server import BaseHTTPRequestHandler
import json
import pathlib

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import hstack

# ── Training Data ────────────────────────────────────────────────────────────
# Loaded from the shared training_data.json (one level up, in ml_service/).
_DATA_FILE = pathlib.Path(__file__).parent.parent / 'ml_service' / 'training_data.json'
with open(_DATA_FILE, encoding='utf-8') as _f:
    _raw = json.load(_f)
TRAINING_DATA = [(_d['category'], _d['description'], _d['priority']) for _d in _raw]

CATEGORIES = ["Electricity", "Garbage", "Pothole", "Street Light", "Water Leakage", "Other"]
LABEL_MAP = {"Low": 0, "Medium": 1, "High": 2}
LABEL_INV = {0: "Low", 1: "Medium", 2: "High"}

# ── Build features ──────────────────────────────────────────────────────────
texts      = [row[1] for row in TRAINING_DATA]
categories = [row[0] for row in TRAINING_DATA]
labels     = [LABEL_MAP[row[2]] for row in TRAINING_DATA]

vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=1500, sublinear_tf=True)
X_text = vectorizer.fit_transform(texts)

def one_hot(cat):
    vec = [0.0] * len(CATEGORIES)
    if cat in CATEGORIES:
        vec[CATEGORIES.index(cat)] = 1.0
    return vec

X_cat = np.array([one_hot(c) for c in categories])
X = hstack([X_text, X_cat])
y = np.array(labels)

# ── Train once at module load (~0.15s) ─────────────────────────────────────
model = RandomForestClassifier(n_estimators=150, class_weight='balanced', random_state=42)
model.fit(X, y)


def predict(category: str, description: str) -> dict:
    x_text = vectorizer.transform([description])
    x_cat  = np.array([one_hot(category)])
    x      = hstack([x_text, x_cat])
    proba  = model.predict_proba(x)[0]
    pred   = int(np.argmax(proba))
    return {
        "priority":   LABEL_INV[pred],
        "confidence": round(float(proba[pred]) * 100, 1),
        "source":     "ml",
    }


# ── Vercel Serverless Handler ───────────────────────────────────────────────
class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body   = json.loads(self.rfile.read(length)) if length else {}

            category    = body.get("category", "Other")
            description = body.get("description", "")

            result = predict(category, description)
            self._respond(200, result)

        except Exception as e:
            self._respond(500, {"error": str(e)})

    def do_GET(self):
        self._respond(200, {"status": "ok", "model": "RandomForest-v1"})

    def _respond(self, code, data):
        payload = json.dumps(data).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(payload))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, *args):
        pass  # suppress default stdout logging
