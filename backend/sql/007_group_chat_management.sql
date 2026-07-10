-- Group chat owner and lifecycle fields. The application adds missing columns on startup;
-- run the ALTER statements below only once when applying this migration manually.
-- ALTER TABLE conversations ADD COLUMN owner_id BIGINT NULL AFTER name;
-- ALTER TABLE conversations ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' AFTER owner_id;
UPDATE conversations c
SET owner_id = (
    SELECT MIN(cm.user_id) FROM conversation_members cm WHERE cm.conversation_id = c.id
)
WHERE c.owner_id IS NULL;

CREATE INDEX idx_conversation_owner_status ON conversations(owner_id, status);
