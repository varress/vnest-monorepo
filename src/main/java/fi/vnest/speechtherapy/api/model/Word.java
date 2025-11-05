package fi.vnest.speechtherapy.api.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "word", indexes = {
        @Index(name = "idx_word_type", columnList = "type"),
        @Index(name = "idx_word_text", columnList = "text")
})
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "word_seq")
    @SequenceGenerator(name = "word_seq", sequenceName = "word_id_seq", allocationSize = 1)
    private Long id;

    @Column(nullable = false, length = 255)
    private String text;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WordType type;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Word() {
    }

    public Word(String text, WordType type) {
        this.text = text;
        this.type = type;
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

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    // --- Utility Methods (Optional but Recommended) ---

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}