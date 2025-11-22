# AI Module Design – Smart Study & Productivity Tracker — FINAL

## 1. Purpose of the AI Module
The AI module analyzes students’ study behaviour and turns raw study logs into:

- insights about when and how they study best  
- predictions about when their focus will drop  
- automatic alerts when they are close to losing focus (75% rule)  
- weekly and monthly reports for students, instructors, and admins  

**Person 4 role:** design only.  
**Person 3 role:** implement these specs in backend/services.

This document is the **final SRS/SDD-aligned specification** for the AI + Reports system.

---

## 2. Responsibilities of the AI Module

### 2.1 Pattern Analysis (FR-AI1)
Using recent `study_sessions`, the AI must:
- Identify **peak study hours** per student (best time-of-day performance).
- Detect **common distractions** (phone, social media, noise, etc.).
- Track **mood trends** and relate them to productivity.

### 2.2 Focus Model per Student (FR-AI2)
Maintain a per-student focus profile:
- `typical_focus_loss_minutes` — predicted time when focus starts dropping.
- `average_session_minutes` — historical average length.
- `preferred_start_hour` — hour with best focus performance.
- `confidence` — reliability score based on available data.

Models may exist:
- globally per student (course_id = NULL)
- per course (course_id set)

### 2.3 Real-Time Focus Monitoring (FR-AI3 / FR-N2)
- Monitor `active_sessions` periodically (cron/worker).
- Compute `elapsed_minutes` from `active_sessions.start_time`.
- Trigger **focus-loss warning alerts at 75%** of window.
- Ensure **idempotency** using `active_sessions.last_alert_pct_sent`.
- Create alerts for **student + instructor**, then enqueue notifications.

### 2.4 Report Generation
Produce JSON reports and store in `reports` table:
- Student weekly report
- Student monthly report
- Instructor course summary
- System diagnostics report (admin)

### 2.5 Notification Queue Support
- When alerts are triggered, insert into `notification_queue`
  with status `"QUEUED"` and channel `"EMAIL"`.
- Backend dispatcher sends and updates status (`SENT`, `FAILED`, `RETRYING`).

---

## 3. Data Requirements (AI Inputs)

> The AI module does **not** query the DB directly.  
> Backend supplies data or AI-service fetchers defined by Person 3.

### 3.1 `study_sessions` (core training input)
Minimum fields required:
- `session_id`
- `student_id`
- `course_id`
- `date`
- `start_time`
- `duration_minutes`
- `mood` (string)
- `distractions` (text list)

Optional (if later added):
- `focus_rating` (1–5)
- `mood_before`
- `mood_after`

### 3.2 `focus_models` (AI outputs stored)
- `focus_model_id`
- `student_id`
- `course_id` nullable (global model)
- `typical_focus_loss_minutes`
- `average_session_minutes`
- `preferred_start_hour`
- `confidence`
- `updated_at`

### 3.3 `active_sessions` (real-time monitoring)
- `active_session_id`
- `student_id`
- `course_id`
- `start_time`
- `last_checked_at`
- `last_alert_pct_sent`

### 3.4 `alerts` + `notification_queue`
**alerts**
- `alert_id`
- `recipient_user_id`
- `student_id`
- `course_id`
- `active_session_id`
- `alert_type` (e.g., `"FOCUS_LOSS_APPROACHING"`)
- `trigger_pct` (0.75)
- `window_minutes`
- `status` (`QUEUED`, `RESOLVED`)
- `created_at`

**notification_queue**
- `notification_id`
- `alert_id`
- `recipient_user_id`
- `channel` (`EMAIL`)
- `status` (`QUEUED`, `SENT`, `FAILED`, `RETRYING`)
- `created_at`
- `sent_at` nullable

---

## 4. Focus-Loss Prediction Algorithm (FINAL)

### 4.1 Training Phase — Building `typical_focus_loss_minutes`

**Goal:** estimate a student’s typical focus-loss window from recent study sessions.

#### Heuristic signals of focus decline
A session suggests a “focus drop point” when **near the end of the session** any of these occur:
- mood worsens (if mood_before/after exists later)
- focus rating drops below 3 (if focus_rating exists later)
- distractions appear more frequently late-session
- session runs much longer than student’s average

#### Training pseudocode
```pseudo
function trainFocusModel(studentId, courseId=null):
    sessions = last N study_sessions for studentId (filter by courseId if provided)
    if sessions.count < 3:
        return default model:
            typical_focus_loss_minutes = 60
            confidence = 0.70

    focusDropCandidates = []

    for s in sessions:
        dropPoint = estimateDropMinute(s)  // heuristic extraction
        if dropPoint not null:
            focusDropCandidates.append(dropPoint)

    if focusDropCandidates empty:
        avgSession = average(s.duration_minutes)
        typical = round(avgSession * 0.75)
        confidence = 0.70
    else:
        typical = round(average(focusDropCandidates))
        confidence = min(0.95, 0.60 + (focusDropCandidates.count / sessions.count))

    save to focus_models(studentId, courseId, typical, avgSession, preferred_start_hour, confidence)
