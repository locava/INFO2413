# Focus-Loss Prediction Algorithm – Design (Person 4)

## 1. Purpose
This algorithm predicts when a student is likely to lose focus during a study session.  
It allows the backend to trigger a **focus warning alert** at the right time.

This is a simple, rule-based algorithm — no machine learning is required for this project.

---

## 2. Inputs Required
The AI needs the following information from the backend:

- `student_id` – the student being monitored  
- `course_id` – optional per-course model  
- `elapsed_minutes` – how long the current study session has been active  
- `focus_loss_minutes` – predicted focus drop time (from focus_models)  
- `average_session_minutes` – fallback if no model exists  

---

## 3. How We Calculate `focus_loss_minutes` (During Model Training)

When the system trains or updates the student's focus model, it uses their recent sessions:

### Data Checked Per Session:
- `duration_minutes`  
- `focus_rating` (1–5 scale)  
- `mood_before → mood_after`  
- `distractions` count  
- time of day session started  

### How the AI detects focus drop:
The system identifies the *approximate point* where performance decreases:
- mood_after is lower than mood_before  
- OR focus_rating drops below 3  
- OR distractions increase later in the session  

From these patterns, AI estimates a number such as:


This value is saved in `focus_models.focus_loss_minutes`.

---

## 4. Real-Time Focus Warning Logic (75% Rule)

During an active study session, the backend periodically sends:

```json
{
  "student_id": "123",
  "course_id": "INFO2413",
  "elapsed_minutes": 50
}

warning_threshold = focus_loss_minutes × 0.75

warning_threshold = 65 × 0.75 = 48.75 minutes


{
  "student_id": "123",
  "course_id": "INFO2413",
  "elapsed_minutes": 50,
  "focus_loss_minutes": 65,
  "threshold_minutes": 48.75,
  "trigger_alert": true,
  "reason": "Elapsed time passed 75% of predicted focus-loss point."
}


{
  "trigger_alert": false
}



---

# 🎉 You're done!

Paste that text into **Algorithm-Focus-Loss.md**, click **Commit**, and your AI folder is fully correct and ready for submission.

If you want, I can check the other files too — just send me another screenshot.



