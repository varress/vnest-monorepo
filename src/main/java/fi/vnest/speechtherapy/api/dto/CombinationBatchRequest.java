package fi.vnest.speechtherapy.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CombinationBatchRequest {

    @NotNull(message = "Verb ID is required")
    @JsonProperty("verb_id")
    Long verbId;

    @NotEmpty(message = "At least one subject ID is required")
    @JsonProperty("subject_ids")
    List<Long> subjectIds;

    @NotEmpty(message = "At least one object ID is required")
    @JsonProperty("object_ids")
    List<Long> objectIds;

    public Long getVerbId() {
        return verbId;
    }

    public void setVerbId(Long verbId) {
        this.verbId = verbId;
    }

    public List<Long> getSubjectIds() {
        return subjectIds;
    }

    public void setSubjectIds(List<Long> subjectIds) {
        this.subjectIds = subjectIds;
    }

    public List<Long> getObjectIds() {
        return objectIds;
    }

    public void setObjectIds(List<Long> objectIds) {
        this.objectIds = objectIds;
    }
}
