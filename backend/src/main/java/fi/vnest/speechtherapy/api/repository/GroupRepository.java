package fi.vnest.speechtherapy.api.repository;

import fi.vnest.speechtherapy.api.model.WordGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<WordGroup, Long> {
    Optional<WordGroup> findByName(String name);
}
