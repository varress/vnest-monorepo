package fi.vnest.speechtherapy.api.dto;

import fi.vnest.speechtherapy.api.model.Word;

/**
 * DTO for nested Word details (id and text) used within the CombinationResponse.
 * Represents a minimal reference to a Word entity.
 */
public class WordReference {
    private Long id;
    private String text;

    public static WordReference fromEntity(Word word) {
        WordReference wordReference = new WordReference();
        wordReference.setId(word.getId());
        wordReference.setText(word.getText());
        return wordReference;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setText(String text) {
        this.text = text;
    }
}
