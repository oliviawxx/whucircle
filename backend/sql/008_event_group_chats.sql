-- Activity group chats reuse the generic conversations table.
ALTER TABLE channel_events ADD COLUMN conversation_id BIGINT NULL AFTER linked_post_id;
