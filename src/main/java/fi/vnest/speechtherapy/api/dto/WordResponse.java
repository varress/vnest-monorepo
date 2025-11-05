package fi.vnest.speechtherapy.api.dto;

import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

/**
 * DTO for returning a Word entity to the API consumer.
 */
public class WordResponse {
    private Long id;
    private String text;
    private WordType type;

    @JsonProperty("created_at")
    private Instant createdAt;

    public static WordResponse fromEntity(Word word) {
        WordResponse dto = new WordResponse();
        dto.setId(word.getId());
        dto.setText(word.getText());
        dto.setType(word.getType());
        dto.setCreatedAt(word.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public WordType getType() {
        return type;
    }

    public void setType(WordType type) {
        this.type = type;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
