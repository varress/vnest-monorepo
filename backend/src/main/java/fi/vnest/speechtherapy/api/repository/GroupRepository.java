package fi.vnest.speechtherapy.api.repository;

import fi.vnest.speechtherapy.api.model.WordGroup;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<WordGroup, Long> {
}
