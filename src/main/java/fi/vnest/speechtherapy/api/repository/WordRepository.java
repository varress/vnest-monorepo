package fi.vnest.speechtherapy.api.repository;

import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA Repository for Word entities.
 */
@Repository
public interface WordRepository extends JpaRepository<Word, Long> {

    /**
     * Finds all words of a specific type.
     * Spring Data JPA automatically generates the query for this method name.
     */
    List<Word> findByType(WordType type);
}
