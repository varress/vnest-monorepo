INSERT INTO word_group (name, description)
SELECT 'general', 'Default group for general verbs'
WHERE NOT EXISTS (
    SELECT 1 FROM word_group WHERE name = 'general'
);

UPDATE word
SET group_id = (SELECT id FROM word_group WHERE name = 'general')
WHERE type = 'VERB'
  AND group_id IS NULL;
