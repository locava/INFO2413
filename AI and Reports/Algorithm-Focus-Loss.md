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

