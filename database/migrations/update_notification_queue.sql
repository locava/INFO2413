-- Migration: Update notification_queue table for email integration
-- Date: 2025-11-25
-- Description: Add provider_message_id and attempts columns for email tracking

-- Add provider_message_id column (for email service message IDs)
ALTER TABLE notification_queue 
ADD COLUMN IF NOT EXISTS provider_message_id VARCHAR(255);

-- Add attempts column (for retry tracking)
ALTER TABLE notification_queue 
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;

-- Add error_message column (for debugging failed notifications)
ALTER TABLE notification_queue 
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create index on attempts for retry queries
CREATE INDEX IF NOT EXISTS idx_nq_attempts 
ON notification_queue (attempts);

-- Update existing records to have 0 attempts
UPDATE notification_queue 
SET attempts = 0 
WHERE attempts IS NULL;

-- Make attempts NOT NULL after setting defaults
ALTER TABLE notification_queue 
ALTER COLUMN attempts SET NOT NULL;

-- Add comment
COMMENT ON COLUMN notification_queue.provider_message_id IS 'Message ID from email provider (e.g., Gmail, SendGrid)';
COMMENT ON COLUMN notification_queue.attempts IS 'Number of delivery attempts made';
COMMENT ON COLUMN notification_queue.error_message IS 'Error message from last failed attempt';

