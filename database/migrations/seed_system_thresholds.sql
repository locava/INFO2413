-- Seed system thresholds with default values

INSERT INTO system_thresholds (name, value_numeric, value_text, is_critical)
VALUES 
  ('weekly_min_hours', 10.00, NULL, false),
  ('default_focus_loss_minutes', 60.00, NULL, false),
  ('min_students_for_aggregates', 5.00, NULL, true),
  ('max_session_duration_hours', 8.00, NULL, false),
  ('focus_alert_threshold_percent', 75.00, NULL, true),
  ('weekly_report_day', NULL, 'Monday', false),
  ('notification_batch_size', 50.00, NULL, false)
ON CONFLICT (name) DO NOTHING;

