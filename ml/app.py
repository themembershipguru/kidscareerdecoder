import joblib
from flask import Flask, jsonify, request
from flask_cors import CORS

model = joblib.load("aptitude_model.pkl")

PROFILE_CAREERS = {
    "Creative-Logical": ["Animator", "Puzzle Designer", "Inventor"],
    "Creative-Practical": ["Toy Maker", "Set Designer", "Sculptor"],
    "Creative-Scientific": ["Science Illustrator", "Museum Exhibit Designer", "Nature Filmmaker"],
    "Creative-Social": ["Drama Teacher", "Youth Workshop Leader", "Party Planner"],
    "Creative-Verbal": ["Storyboard Artist", "Podcast Producer", "Childrens Author"],
    "Logical-Practical": ["Robotics Technician", "Carpenter", "Systems Builder"],
    "Logical-Scientific": ["Lab Analyst", "Data Scientist", "Research Engineer"],
    "Logical-Social": ["Project Coordinator", "Debate Coach", "Team Strategist"],
    "Logical-Verbal": ["Technical Writer", "Editor", "Policy Analyst"],
    "Practical-Scientific": ["Field Engineer", "Lab Technician", "Environmental Tester"],
    "Practical-Social": ["Community Builder", "Coach", "Facilities Host"],
    "Practical-Verbal": ["Trainer", "How-To Guide Writer", "Workshop Instructor"],
    "Scientific-Social": ["Science Teacher", "Park Ranger", "STEM Mentor"],
    "Scientific-Verbal": ["Science Journalist", "Explainer Video Host", "Curriculum Writer"],
    "Social-Verbal": ["Counsellor", "Teacher", "Translator"],
}

app = Flask(__name__)
CORS(app)

ordered_keys = [
    "logical",
    "creative",
    "verbal",
    "social",
    "scientific",
    "practical",
]


def top_strength_from_payload(payload):
    pairs = [(k, float(payload[f"{k}_pct"])) for k in ordered_keys]
    pairs.sort(key=lambda x: (-x[1], x[0]))
    return pairs[0][0].capitalize()


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    body = request.get_json(silent=True) or {}
    logical_pct = float(body.get("logical_pct", 0))
    creative_pct = float(body.get("creative_pct", 0))
    verbal_pct = float(body.get("verbal_pct", 0))
    social_pct = float(body.get("social_pct", 0))
    scientific_pct = float(body.get("scientific_pct", 0))
    practical_pct = float(body.get("practical_pct", 0))
    age = int(body.get("age", 10))
    row = [
        [
            logical_pct,
            creative_pct,
            verbal_pct,
            social_pct,
            scientific_pct,
            practical_pct,
            age,
        ]
    ]
    profile = model.predict(row)[0]
    proba = model.predict_proba(row)[0]
    confidence = float(max(proba))
    careers = PROFILE_CAREERS.get(
        profile,
        ["Explorer", "Problem Solver", "Team Player"],
    )
    ts = top_strength_from_payload(body)
    return jsonify(
        {
            "profile": profile,
            "careers": careers,
            "top_strength": ts,
            "confidence": confidence,
            "explanation": "Based on ML classification",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
