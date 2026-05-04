CREATE INDEX IF NOT EXISTS idx_artifacts_type_created_at ON artifacts(type, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
