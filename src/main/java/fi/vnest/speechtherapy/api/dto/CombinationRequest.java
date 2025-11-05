package fi.vnest.speechtherapy.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for creating a single AllowedCombination via POST /api/combinations.
 */
public class CombinationRequest {

    @NotNull(message = "Subject ID is required")
    @JsonProperty("subject_id")
    Long subjectId;

    @NotNull(message = "Verb ID is required")
    @JsonProperty("verb_id")
    Long verbId;

    @NotNull(message = "Object ID is required")
    @JsonProperty("object_id")
    Long objectId;

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Long getVerbId() {
        return verbId;
    }

    public void setVerbId(Long verbId) {
        this.verbId = verbId;
    }

    public Long getObjectId() {
        return objectId;
    }

    public void setObjectId(Long objectId) {
        this.objectId = objectId;
    }
}