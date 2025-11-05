CREATE TABLE IF NOT EXISTS word (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    type VARCHAR(20) CHECK (type IN ('SUBJECT', 'VERB', 'OBJECT')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_word_type ON word(type);
CREATE INDEX idx_word_text ON word(text);

CREATE TABLE IF NOT EXISTS allowed_combination (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES word(id) ON DELETE CASCADE,
    verb_id BIGINT NOT NULL REFERENCES word(id) ON DELETE CASCADE,
    object_id BIGINT NOT NULL REFERENCES word(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (subject_id, verb_id, object_id),
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES word(id),
    CONSTRAINT fk_verb FOREIGN KEY (verb_id) REFERENCES word(id),
    CONSTRAINT fk_object FOREIGN KEY (object_id) REFERENCES word(id)
);

CREATE INDEX idx_combination_verb ON allowed_combination(verb_id);
CREATE INDEX idx_combination_subject ON allowed_combination(subject_id);
CREATE INDEX idx_combination_object ON allowed_combination(object_id);