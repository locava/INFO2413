-- PostgreSQL schema for Smart Study & Productivity Tracker
-- Person 2 (Database) will paste the actual CREATE TABLE statements here,
-- exported from pgAdmin4 (Scripts → CREATE Script).

-- === PASTE EXPORTED CREATE TABLE SCRIPTS BELOW THIS LINE ===

-- PostgreSQL schema for Smart Study & Productivity Tracker
-- Person 2 (Database) – exported from pgAdmin4 and cleaned for team use.

-- Enable UUID generation (required for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ==============================================
-- TABLE: users
-- ==============================================
CREATE TABLE IF NOT EXISTS public.users
(
    user_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name           varchar(120)  NOT NULL,
    email          varchar(255)  NOT NULL,
    role           varchar(20)   NOT NULL,
    password_hash  text          NOT NULL,
    phone          varchar(30),
    dob            date,
    status         varchar(20)   NOT NULL DEFAULT 'Active',
    created_at     timestamptz   NOT NULL DEFAULT now(),
    CONSTRAINT users_email_key  UNIQUE (email),
    CONSTRAINT users_role_check   CHECK (role   IN ('Student','Instructor','Administrator')),
    CONSTRAINT users_status_check CHECK (status IN ('Active','Inactive'))
);

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;


-- ==============================================
-- TABLE: students
-- ==============================================
CREATE TABLE IF NOT EXISTS public.students
(
    user_id        uuid PRIMARY KEY,
    student_number varchar(20)  NOT NULL,
    program        varchar(80),
    CONSTRAINT students_student_number_key UNIQUE (student_number),
    CONSTRAINT fk_students_user FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) ON DELETE CASCADE
);

-- ==============================================
-- TABLE: instructors
-- ==============================================
CREATE TABLE IF NOT EXISTS public.instructors
(
    user_id    uuid PRIMARY KEY,
    working_id varchar(20) NOT NULL,
    department varchar(80),
    CONSTRAINT instructors_working_id_key UNIQUE (working_id),
    CONSTRAINT fk_instructors_user FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) ON DELETE CASCADE
);

-- ==============================================
-- TABLE: courses
-- ==============================================
CREATE TABLE IF NOT EXISTS public.courses
(
    course_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_name  varchar(120) NOT NULL,
    course_code  varchar(40),
    instructor_id uuid        NOT NULL,
    is_active    boolean      NOT NULL DEFAULT true,
    CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id)
        REFERENCES public.instructors (user_id)
);

-- ==============================================
-- TABLE: system_thresholds
-- ==============================================
CREATE TABLE IF NOT EXISTS public.system_thresholds
(
    threshold_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name         varchar(80)  NOT NULL,
    value_numeric numeric(10,2),
    value_text   varchar(120),
    is_critical  boolean      NOT NULL DEFAULT false,
    updated_by   uuid,
    updated_at   timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT system_thresholds_name_key UNIQUE (name),
    CONSTRAINT fk_threshold_updated_by FOREIGN KEY (updated_by)
        REFERENCES public.users (user_id)
);

-- ==============================================
-- TABLE: notification_preferences
-- ==============================================
CREATE TABLE IF NOT EXISTS public.notification_preferences
(
    pref_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    uuid NOT NULL,
    alert_type varchar(50) NOT NULL,
    is_enabled boolean    NOT NULL DEFAULT true,
    CONSTRAINT uq_np_user_alert UNIQUE (user_id, alert_type),
    CONSTRAINT fk_np_user FOREIGN KEY (user_id)
        REFERENCES public.users (user_id) ON DELETE CASCADE
);

-- ==============================================
-- TABLE: enrollments
-- ==============================================
CREATE TABLE IF NOT EXISTS public.enrollments
(
    enrollment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    uuid NOT NULL,
    course_id     uuid NOT NULL,
    enrolled_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_enroll UNIQUE (student_id, course_id),
    CONSTRAINT fk_enroll_course FOREIGN KEY (course_id)
        REFERENCES public.courses (course_id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id)
        REFERENCES public.students (user_id) ON DELETE CASCADE
);

-- ==============================================
-- TABLE: study_sessions
-- ==============================================
CREATE TABLE IF NOT EXISTS public.study_sessions
(
    session_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id       uuid      NOT NULL,
    course_id        uuid      NOT NULL,
    date             date      NOT NULL,
    start_time       timestamptz NOT NULL,
    duration_minutes integer   NOT NULL,
    mood             varchar(40),
    distractions     text,
    is_deleted       boolean   NOT NULL DEFAULT false,
    deleted_at       timestamptz,
    CONSTRAINT study_sessions_duration_minutes_check CHECK (duration_minutes > 0),
    CONSTRAINT fk_ss_course  FOREIGN KEY (course_id)
        REFERENCES public.courses (course_id) ON DELETE CASCADE,
    CONSTRAINT fk_ss_student FOREIGN KEY (student_id)
        REFERENCES public.students (user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_student_date
    ON public.study_sessions (student_id, date)
    WHERE is_deleted = false;

-- ==============================================
-- TABLE: focus_models
-- ==============================================
CREATE TABLE IF NOT EXISTS public.focus_models
(
    focus_model_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id                 uuid NOT NULL,
    course_id                  uuid,
    typical_focus_loss_minutes integer NOT NULL,
    confidence                 numeric(5,2) NOT NULL DEFAULT 0.70,
    updated_at                 timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT uq_fm_student_course UNIQUE (student_id, course_id),
    CONSTRAINT focus_models_confidence_check CHECK (confidence BETWEEN 0 AND 1),
    CONSTRAINT focus_models_typical_focus_loss_minutes_check CHECK (typical_focus_loss_minutes BETWEEN 20 AND 240),
    CONSTRAINT fk_fm_course FOREIGN KEY (course_id)
        REFERENCES public.courses (course_id) ON DELETE CASCADE,
    CONSTRAINT fk_fm_student FOREIGN KEY (student_id)
        REFERENCES public.students (user_id) ON DELETE CASCADE
);

-- ==============================================
-- TABLE: performance_records
-- ==============================================
CREATE TABLE IF NOT EXISTS public.performance_records
(
    performance_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     uuid NOT NULL,
    course_id      uuid NOT NULL,
    assessment_name varchar(120) NOT NULL,
    score          numeric(5,2) NOT NULL,
    max_score      numeric(5,2) NOT NULL,
    recorded_at    timestamptz  NOT NULL DEFAULT now(),
    CONSTRAINT chk_pr_max_score_positive CHECK (max_score > 0),
    CONSTRAINT chk_pr_score_range        CHECK (score >= 0 AND score <= max_score),
    CONSTRAINT fk_pr_course  FOREIGN KEY (course_id)
        REFERENCES public.courses (course_id) ON DELETE CASCADE,
    CONSTRAINT fk_pr_student FOREIGN KEY (student_id)
        REFERENCES public.students (user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_performance_student_course
    ON public.performance_records (student_id, course_id);

-- ==============================================
-- TABLE: alerts
-- ==============================================
CREATE TABLE IF NOT EXISTS public.alerts
(
    alert_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type        varchar(50) NOT NULL,
    recipient_user_id uuid       NOT NULL,
    student_id        uuid       NOT NULL,
    course_id         uuid,
    trigger_detail    jsonb,
    created_at        timestamptz NOT NULL DEFAULT now(),
    status            varchar(20) NOT NULL DEFAULT 'QUEUED',
    CONSTRAINT alerts_status_check CHECK (status IN ('QUEUED','SENT','FAILED')),
    CONSTRAINT fk_alert_course    FOREIGN KEY (course_id)
        REFERENCES public.courses (course_id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_recipient FOREIGN KEY (recipient_user_id)
        REFERENCES public.users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_student   FOREIGN KEY (student_id)
        REFERENCES public.students (user_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_alerts_recipient ON public.alerts (recipient_user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_student   ON public.alerts (student_id);

-- ==============================================
-- TABLE: notification_queue
-- ==============================================
CREATE TABLE IF NOT EXISTS public.notification_queue
(
    queue_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id   uuid NOT NULL,
    channel    varchar(20) NOT NULL,
    enqueued_at timestamptz NOT NULL DEFAULT now(),
    sent_at     timestamptz,
    status      varchar(20) NOT NULL DEFAULT 'QUEUED',
    CONSTRAINT notification_queue_channel_check CHECK (channel IN ('EMAIL','IN_APP')),
    CONSTRAINT notification_queue_status_check  CHECK (status IN ('QUEUED','SENT','FAILED','RETRYING')),
    CONSTRAINT fk_nq_alert FOREIGN KEY (alert_id)
        REFERENCES public.alerts (alert_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_nq_status
    ON public.notification_queue (status);

-- ==============================================
-- TABLE: reports
-- ==============================================
CREATE TABLE IF NOT EXISTS public.reports
(
    report_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type varchar(30) NOT NULL,
    owner_id    uuid,
    course_id   uuid,
    period_start date       NOT NULL,
    period_end   date       NOT NULL,
    data         jsonb      NOT NULL,
    created_at   timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT reports_report_type_check CHECK (report_type IN ('STUDENT','CLASS','SYSTEM')),
    CONSTRAINT fk_reports_course FOREIGN KEY (course_id)
        REFERENCES public.courses (course_id) ON DELETE SET NULL,
    CONSTRAINT fk_reports_owner  FOREIGN KEY (owner_id)
        REFERENCES public.users (user_id)   ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_type_period
    ON public.reports (report_type, period_start, period_end);
