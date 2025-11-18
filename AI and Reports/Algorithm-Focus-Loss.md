# Focus-Loss Prediction Algorithm – Design (Person 4)

## 1. Purpose
This document explains how the system predicts **when a student is likely to lose focus** during a study session.  
The goal is to trigger a **focus warning alert** at the right time to improve productivity and prevent burnout.

This is a **simple, rule-based algorithm**, not machine learning — exactly what our project requires.

---

## 2. Inputs Required (From Backend)
The backend sends these values to the AI module:

- `student_id` — the student being monitored  
- `course_id` — optional (some students may have course-specific models)  
- `elapsed_minutes` — how long the current study session has been running  
- `focus_loss_minutes` — predicted time when the student usually begins losing focus  
- `average_session_minutes` — backup estimate if `focus_loss_minutes` is unknown  

---

## 3. How `focus_loss_minutes` Is Calculated (Training Phase)
The AI calculates `focus_loss_minutes` by analyzing the student’s **recent study_sessions** (typically 10–30 sessions).

### The system checks each session for:
- `duration_minutes`  
- `focus_rating` (1–5)  
- `mood_before → mood_after`  
- `distractions` count  
- `session start time` (to evaluate hour-of-day performance)

### Focus-loss point is detected when:
- `mood_after < mood_before`  
- OR `focus_rating` drops below 3  
- OR distractions increase significantly at the end of the session  

From this, the algorithm estimates the **average point of focus decline**, for example:

 
This is saved in the `focus_models` table under the student’s profile.

---

## 4. Real-Time Focus Warning Logic (75% Rule)
During an active study session, the backend periodically sends:

```json
{
  "student_id": "123",
  "course_id": "INFO2413",
  "elapsed_minutes": 50
}
The AI calculates the warning threshold using:

warning_threshold = focus_loss_minutes × 0.75

If predicted focus-loss is 65 minutes:

warning_threshold = 65 × 0.75 = 48.75 minutes

