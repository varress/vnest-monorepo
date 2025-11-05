package fi.vnest.speechtherapy.api.dto;

import fi.vnest.speechtherapy.api.model.WordType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating or updating a Word entity.
 */
public class WordRequest {

    @NotBlank(message = "Text cannot be empty")
    private String text;

    @NotNull(message = "Type must be specified (SUBJECT, VERB, or OBJECT)")
    private WordType type;

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
}
