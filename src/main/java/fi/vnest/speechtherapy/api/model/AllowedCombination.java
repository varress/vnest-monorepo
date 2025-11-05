package fi.vnest.speechtherapy.api.model;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "allowed_combination", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"subject_id", "verb_id", "object_id"})
}, indexes = {
        @Index(name = "idx_combination_subject", columnList = "subject_id"),
        @Index(name = "idx_combination_verb", columnList = "verb_id"),
        @Index(name = "idx_combination_object", columnList = "object_id")
})
public class AllowedCombination {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "allowed_combination_seq")
    @SequenceGenerator(name = "allowed_combination_seq", sequenceName = "allowed_combination_id_seq", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false, foreignKey = @ForeignKey(name = "fk_subject"))
    private Word subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verb_id", nullable = false, foreignKey = @ForeignKey(name = "fk_verb"))
    private Word verb;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "object_id", nullable = false, foreignKey = @ForeignKey(name = "fk_object"))
    private Word object;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public AllowedCombination() {
    }

    public AllowedCombination(Word subject, Word verb, Word object) {
        this.subject = subject;
        this.verb = verb;
        this.object = object;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Word getSubject() {
        return subject;
    }

    public void setSubject(Word subject) {
        this.subject = subject;
    }

    public Word getVerb() {
        return verb;
    }

    public void setVerb(Word verb) {
        this.verb = verb;
    }

    public Word getObject() {
        return object;
    }

    public void setObject(Word object) {
        this.object = object;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}