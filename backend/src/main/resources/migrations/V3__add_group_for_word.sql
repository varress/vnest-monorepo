CREATE TABLE word_group (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

ALTER TABLE word
ADD COLUMN group_id BIGINT;

ALTER TABLE word
ADD CONSTRAINT fk_word_group
FOREIGN KEY (group_id)
REFERENCES word_group (id);