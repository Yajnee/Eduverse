# ============================================================
# EduVerse Quiz Generation Engine — vMAX-EXAM-FORTRESS-R4
# STABLE | GPU-SAFE | JSON-IMMUNE | EXAM-QUALITY | DEPLOYMENT-READY
# ============================================================

import os, json, time, re, traceback
from typing import List, Dict

# ================= CONFIG =================

MODEL_DIR = os.environ.get("MERGED_MODEL_DIR", "merged_model_final")

MAX_TOKENS = int(os.environ.get("QUIZ_MAX_TOKENS", "480"))
TEMPERATURE = float(os.environ.get("QUIZ_TEMPERATURE", "0.45"))

TIMEOUT_SECONDS = int(os.environ.get("QUIZ_TIMEOUT", "70"))
BLOCK_RETRIES = int(os.environ.get("QUIZ_RETRIES", "2"))

TARGET = {"MCQ": 10, "MSQ": 5, "NAT": 5}
TOTAL_REQUIRED = 20

BAD_PATTERNS = (
    "what is",
    "define",
    "is known as",
    "which of the following",
    "choose the correct",
    "true or false",
)

# ================= LOG =================

def log(*a):
    print("[QUIZ-GEN]", *a, flush=True)

# ================= MODEL LOAD =================

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM
    from transformers.generation.utils import GenerationConfig

    DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_DIR,
        trust_remote_code=True,
        use_fast=True,
        fix_mistral_regex=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_DIR,
        device_map="auto",
        torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
        trust_remote_code=True,
    ).eval()

    log("Model loaded on", DEVICE)

except Exception:
    log("MODEL LOAD FAILURE")
    log(traceback.format_exc())
    tokenizer = model = None

# ================= PROMPT =================

PROMPT = """
Generate GATE CSE {difficulty} level {qtype} questions.

Subject: {subject}
Topic: {topic}

Rules:
- Analytical, numerical, algorithmic, or conceptual only
- No definitions or theoretical memorization
- No “What is”, no trivial statements
- Each question must strictly match GATE style
- Output ONLY JSON objects, one per question
- No arrays, no markdown, no lists, no commentary

JSON format:
{{
  "question": "....",
  "options": ["A", "B", "C", "D"],
  "answer": "A"
}}

Generate EXACTLY {count} questions.
"""

# ================= MODEL CALL =================

def call_model(prompt: str) -> str:
    enc = tokenizer(prompt, return_tensors="pt").to(model.device)

    with torch.no_grad():
        out = model.generate(
            **enc,
            max_new_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            top_p=0.92,
            do_sample=True,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.eos_token_id,
        )

    text = tokenizer.decode(out[0], skip_special_tokens=True)
    # Remove prompt echo
    return text[len(prompt):].strip()

# ================= PARSER =================

def extract_objects(text: str) -> List[Dict]:
    """Extracts JSON objects safely even if malformed."""
    blocks = re.findall(r"\{(?:[^{}]|(?R))*\}", text)
    objs = []

    for block in blocks:
        try:
            obj = json.loads(block)
            if isinstance(obj, dict) and "question" in obj and "answer" in obj:
                objs.append(obj)
        except Exception:
            continue

    return objs

# ================= VALIDATION =================

def clean_text(t: str) -> str:
    return re.sub(r"\s+", " ", t).replace("\u200b", "").strip()

def valid_question_text(text: str) -> bool:
    if not text or len(text) < 30:
        return False
    t = text.lower()
    return not any(b in t for b in BAD_PATTERNS)

def normalize_msq_answer(ans):
    if isinstance(ans, list):
        return sorted([x for x in ans if x in {"A", "B", "C", "D"}])
    if isinstance(ans, str):
        parts = re.split(r"[,\s]+", ans.strip().upper())
        return sorted([x for x in parts if x in {"A", "B", "C", "D"}])
    return []

def validate_question(q: Dict, qtype: str) -> bool:
    opts = q.get("options", [])
    ans = q.get("answer")

    if qtype in ("MCQ", "MSQ"):
        if not isinstance(opts, list) or len(opts) != 4:
            return False

    if qtype == "MCQ":
        return ans in {"A", "B", "C", "D"}

    if qtype == "MSQ":
        norm = normalize_msq_answer(ans)
        if len(norm) >= 2:
            q["answer"] = norm
            return True
        return False

    if qtype == "NAT":
        try:
            float(str(ans).strip())
            q["answer"] = str(ans).strip()
            return True
        except:
            return False

    return False

# ================= BLOCK GENERATION =================

def generate_block(subject, topic, difficulty, qtype, count, start_ts):
    collected, seen = [], set()

    for attempt in range(1, BLOCK_RETRIES + 1):

        if time.time() - start_ts > TIMEOUT_SECONDS:
            log("Timeout generating", qtype)
            break

        log(f"{qtype} generation attempt {attempt}")

        raw = call_model(
            PROMPT.format(
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                qtype=qtype,
                count=count,
            )
        )

        objs = extract_objects(raw)

        for q in objs:
            q["type"] = qtype

            q["question"] = clean_text(q.get("question", ""))

            if not valid_question_text(q["question"]):
                continue

            if not validate_question(q, qtype):
                continue

            key = q["question"].lower()
            if key not in seen:
                seen.add(key)
                collected.append(q)

        if len(collected) >= count:
            break

        # GPU-safe cleanup
        if "torch" in sys.modules:
            try:
                torch.cuda.empty_cache()
            except:
                pass

    return collected[:count]

# ================= MAIN =================

def generate_quiz(subject: str, topic: str, difficulty="Medium") -> List[Dict]:
    if not model:
        return []

    start = time.time()

    mcq = generate_block(subject, topic, difficulty, "MCQ", TARGET["MCQ"], start)
    if len(mcq) < TARGET["MCQ"]:
        log("MCQ quota failed")
        return []

    msq = generate_block(subject, topic, difficulty, "MSQ", TARGET["MSQ"], start)
    nat = generate_block(subject, topic, difficulty, "NAT", TARGET["NAT"], start)

    quiz = mcq + msq + nat

    if len(quiz) != TOTAL_REQUIRED:
        log("Final quota mismatch")
        return []

    result = []
    for i, q in enumerate(quiz, 1):
        result.append({
            "id": f"q{i}",
            "type": q["type"],
            "question": q["question"],
            "options": q.get("options", []),
            "answer": q["answer"],
            "topic": topic,
            "difficulty": difficulty,
        })

    log("Quiz generated in", round(time.time() - start, 2), "seconds")
    return result
