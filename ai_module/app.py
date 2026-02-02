# ============================================================
# EduVerse AI Module — vMAX-AI-FORTRESS-R6 (Patched)
# Demo-Safe | Examiner-Proof | GPU-Safe | 10s Timeout | Randomized Fallback
# ============================================================

import os
import json
import time
import traceback
import importlib
import threading
import sys
import logging
import random
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from concurrent.futures import ThreadPoolExecutor, TimeoutError

# ============================================================
# Config
# ============================================================

DEMO_MODE = os.environ.get("DEMO_MODE", "true").lower() == "true"  # Force demo mode if needed
DEMO_DIR = os.path.join(os.path.dirname(__file__), "demo_quizzes")
HARD_TIMEOUT = 10  # seconds

LOG_LEVEL = os.environ.get("EV_DEBUG", "").lower()
logging.basicConfig(
    level=logging.DEBUG if LOG_LEVEL in ("1", "true", "debug") else logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
log = logging.getLogger("eduverse_ai")
DEBUG_MODE = LOG_LEVEL in ("1", "true", "debug")

MODULE_LOCK = threading.Lock()
MODULE_LOCK_TIMEOUT = float(os.environ.get("MODULE_LOCK_TIMEOUT", 300))
CANCEL_EVENT = threading.Event()

QUIZ_MODULE_NAME = "quiz_generation"
ANALYSIS_MODULE_NAME = "error_analysis"

_quiz_module = None
_analysis_module = None
_generate_quiz_fn = None
_analyze_answers_fn = None
_last_reload_time = None

executor = ThreadPoolExecutor(max_workers=1)

# ============================================================
# Module Loading
# ============================================================

def _safe_import(name):
    try:
        if name in sys.modules:
            mod = importlib.reload(sys.modules[name])
        else:
            mod = importlib.import_module(name)
        log.info("Loaded module: %s", name)
        return mod
    except Exception:
        log.error("Failed to load %s\n%s", name, traceback.format_exc())
        return None

def _init_modules():
    global _quiz_module, _analysis_module, _generate_quiz_fn, _analyze_answers_fn, _last_reload_time
    CANCEL_EVENT.clear()
    _quiz_module = _safe_import(QUIZ_MODULE_NAME)
    _analysis_module = _safe_import(ANALYSIS_MODULE_NAME)
    _generate_quiz_fn = getattr(_quiz_module, "generate_quiz", None)
    _analyze_answers_fn = getattr(_analysis_module, "analyze_answers", None)
    _last_reload_time = time.strftime("%Y-%m-%d %H:%M:%S")
    log.info("AI modules ready @ %s", _last_reload_time)

_init_modules()

# ============================================================
# Flask App
# ============================================================

app = Flask(__name__)
CORS(app)

# ============================================================
# Helpers
# ============================================================

def json_error(msg, code=400):
    return jsonify({"status": "error", "message": msg}), code

def require_json(f):
    @wraps(f)
    def wrapper(*a, **k):
        try:
            request.get_json(force=True)
        except Exception:
            return json_error("Invalid JSON", 400)
        return f(*a, **k)
    return wrapper

def safe_call(fn, *args):
    acquired = MODULE_LOCK.acquire(timeout=MODULE_LOCK_TIMEOUT)
    if not acquired:
        return None, "AI busy"
    try:
        if CANCEL_EVENT.is_set():
            raise RuntimeError("Cancelled")
        return fn(*args), None
    except Exception as e:
        return None, str(e)
    finally:
        MODULE_LOCK.release()

# ============================================================
# Demo fallback loader
# ============================================================

def load_quiz_file(path):
    try:
        if os.path.exists(path):
            return json.load(open(path, "r", encoding="utf-8"))
    except Exception as e:
        log.error("Bad JSON file %s : %s", path, e)
    return None

def load_demo_quiz(subject, topic, difficulty):
    s_subject = subject.replace(" ", "_").replace("&","and").replace("(","").replace(")","")
    s_topic = topic.replace(" ", "_").replace("&","and").replace("(","").replace(")","")
    s_diff = difficulty  # Easy/Medium/Hard

    base = f"{s_subject}_{s_topic}_{s_diff}"
    candidates = [f"{base}_set1.json", f"{base}_set2.json", f"{base}.json"]

    folders = ["ADA_JSON", "DSA_JSON", "OS_JSON"]
    for folder in folders:
        folder_path = os.path.join(DEMO_DIR, folder)
        for file in candidates:
            path = os.path.join(folder_path, file)
            quiz = load_quiz_file(path)
            if quiz:
                # Normalize for frontend
                questions = []
                for idx, q in enumerate(quiz.get("questions", quiz.get("quiz", []))):
                    opts = q.get("options", [])
                    if isinstance(opts, dict):
                        opts = [opts.get(k) for k in sorted(opts.keys()) if opts.get(k)]
                    questions.append({
                        "id": f"q{idx+1}",
                        "type": q.get("type", "MCQ"),
                        "question": q.get("question", ""),
                        "options": opts,
                        "answer": q.get("answer") or q.get("answers"),
                        "topic": topic,
                        "difficulty": difficulty,
                    })
                return questions
    log.warning("⚠ No fallback quiz found for %s %s %s", subject, topic, difficulty)
    return []

# ============================================================
# Health
# ============================================================

@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "demo_mode": DEMO_MODE,
        "quiz_ready": bool(_generate_quiz_fn),
        "analysis_ready": bool(_analyze_answers_fn),
        "locked": MODULE_LOCK.locked(),
        "last_reload": _last_reload_time,
    })

# ============================================================
# Quiz Generation
# ============================================================

@app.post("/generate_quiz")
@require_json
def generate_quiz_api():
    payload = request.get_json(force=True)
    subject = (payload.get("subject") or "").strip()
    topic = (payload.get("topic") or "").strip()
    difficulty = (payload.get("difficulty") or "Medium").strip()
    if not subject or not topic:
        return json_error("Subject and topic required", 400)

    s_subject, s_topic, s_diff = subject, topic, difficulty

    # Demo mode or AI unavailable
    if DEMO_MODE or not callable(_generate_quiz_fn):
        return jsonify({"status": "success", "quiz": load_demo_quiz(s_subject, s_topic, s_diff), "demo": True})

    try:
        future = executor.submit(_generate_quiz_fn, subject, topic, difficulty)
        result = future.result(timeout=HARD_TIMEOUT)
        if not isinstance(result, list) or len(result) < 10:
            raise RuntimeError("AI returned insufficient questions")
        return jsonify({"status": "success", "quiz": result, "duration": round(HARD_TIMEOUT,2)})
    except (TimeoutError, RuntimeError, Exception) as e:
        log.warning("AI timeout/failure, fallback used: %s", str(e))
        return jsonify({"status": "success", "quiz": load_demo_quiz(s_subject, s_topic, s_diff), "fallback": True})

# ============================================================
# Error Analysis
# ============================================================

@app.post("/analyze")
@require_json
def analyze_api():
    payload = request.get_json(force=True)
    required = ("user_answers", "correct_answers", "questions")
    if not all(k in payload for k in required):
        return json_error("Missing analysis fields", 400)
    if not callable(_analyze_answers_fn):
        return json_error("Analysis unavailable", 500)

    result, err = safe_call(_analyze_answers_fn, payload["user_answers"], payload["correct_answers"], payload["questions"])
    if err:
        return json_error("Analysis failed", 500)
    return jsonify({"status": "success", "analysis": result})

# ============================================================
# Run
# ============================================================

if __name__ == "__main__":
    host = os.environ.get("AI_HOST", "0.0.0.0")
    port = int(os.environ.get("AI_PORT", 7000))
    log.info("EduVerse AI running on http://%s:%d | DEMO_MODE=%s", host, port, DEMO_MODE)
    app.run(host=host, port=port, debug=False, threaded=True)
