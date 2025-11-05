package fi.vnest.speechtherapy.api.repository;

import fi.vnest.speechtherapy.api.model.AllowedCombination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllowedCombinationRepository extends JpaRepository<AllowedCombination, Long> {

    /**
     * Finds combinations by a specific verb ID.
     */
    List<AllowedCombination> findByVerbId(Long verbId);

    /**
     * Checks if a combination already exists based on all three word IDs.
     */
    //rename
    Optional<AllowedCombination> findBySubjectIdAndVerbIdAndObjectId(Long subjectId, Long verbId, Long objectId);

    /**
     * Deletes all combinations associated with a specific verb ID.
     */
    @Modifying
    void deleteAllByVerbId(Long verbId);
}
