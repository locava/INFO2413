# AI Module Design – Smart Study & Productivity Tracker (Person 4)

## 1. Purpose of the AI Module

The AI module analyzes students’ study behaviour and turns raw study logs into:

- insights about when and how they study best  
- predictions about when their focus will drop  
- automatic alerts when they are close to losing focus  
- weekly and monthly reports for students, instructors, and admins  

My role (Person 4) is to **design** how this works, not to code it.  
This document explains what the AI needs, what it outputs, and how it connects to the rest of the system.

---

## 2. Responsibilities of the AI Module

The AI module is responsible for:

1. **Pattern Analysis**
   - Find peak study hours (time-of-day with best focus).
   - Detect common distractions (phone, social media, etc.).
   - Track mood and focus rating trends.

2. **Focus Model per Student**
   - Maintain `focus_loss_minutes` – when focus typically drops.
   - Maintain `average_session_minutes`.
   - Track `preferred_start_hour` – best time to study.

3. **Real-Time Focus Monitoring**
   - Given `elapsed_minutes` for a current session, decide if a **focus warning** should be triggered using the 75% rule.

4. **Report Generation**
   - Produce student weekly and monthly reports.
   - Produce instructor course-level summary reports.
   - Produce system diagnostics reports for admin.

5. **Structured JSON Output**
   - Return data in a clear JSON format that backend and frontend can use.

---

## 3. Data Requirements (What the AI Needs from the Database)

The AI does not read the database directly — the backend provides data to it.  
However, the following tables and fields must exist.

### 3.1 `study_sessions` (core input)

Used for pattern analysis and reports.

Minimum fields:

- `session_id`
- `student_id`
- `course_id`
- `start_time` (timestamp)
- `end_time` (timestamp) or `duration_minutes`
- `focus_rating` (e.g., 1–5)
- `mood_before`
- `mood_after`
- `distractions` (string or array, e.g., `"phone,social media"`)
- `notes` (optional)

### 3.2 `focus_models` (per-student focus profile)

Stores the AI model results per student (and optionally per course).

- `focus_model_id`
- `student_id`
- `course_id` (nullable)
- `focus_loss_minutes`
- `average_session_minutes`
- `preferred_start_hour`
- `last_trained_at`

### 3.3 `alerts`

Logical alerts the system generates (including focus warnings).

- `alert_id`
- `student_id`
- `course_id`
- `type` (e.g., `"FOCUS_WARNING"`)
- `message`
- `created_at`
- `resolved_at` (nullable)

### 3.4 `notification_queue`

Actual notifications to be sent.

- `notification_id`
- `recipient_user_id`
- `channel` (`"email"`, `"in_app"`, etc.)
- `subject`
- `body`
- `status` (`"pending"`, `"sent"`, `"failed"`)
- `created_at`
- `sent_at` (nullable)

---

## 4. Focus Model Behaviour (High-Level)

### 4.1 Training / Updating the Focus Model

For each student:

1. Collect the last N study sessions (for example 20–30).
2. Analyze:
   - average session length
   - when mood or focus drops
   - when distractions increase
3. Estimate:
   - `focus_loss_minutes` – point where focus usually drops.
   - `average_session_minutes`.
   - `preferred_start_hour` – hour-of-day where focus scores are highest.
4. Store these values into `focus_models`.

Training can be done nightly or whenever enough new data is available.

---

## 5. API Endpoints Required from Backend

The AI module is accessed through backend HTTP endpoints.  
These endpoints use the data structures defined below.

### 5.1 Student Summary Endpoint

**Endpoint**

`GET /api/ai/student/:studentId/summary`

**Purpose**

Quick overview of the student’s recent study patterns.

**Example Response**

```json
{
  "student_id": "123e4567",
  "time_window": "last_7_days",
  "total_minutes": 540,
  "average_session_minutes": 60,
  "peak_hours": ["18:00-20:00"],
  "most_focused_days": ["Tuesday", "Thursday"],
  "common_distractions": ["phone", "social_media"],
  "average_focus_rating": 4.2
}


