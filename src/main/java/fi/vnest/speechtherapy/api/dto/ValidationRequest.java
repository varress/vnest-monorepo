package fi.vnest.speechtherapy.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for POST /api/suggestions/validate. Identical structure to CombinationRequest,
 * but defined separately for clarity of purpose.
 */
public record ValidationRequest(
        @NotNull(message = "Subject ID is required")
        @JsonProperty("subject_id")
        Long subjectId,

        @NotNull(message = "Verb ID is required")
        @JsonProperty("verb_id")
        Long verbId,

        @NotNull(message = "Object ID is required")
        @JsonProperty("object_id")
        Long objectId
) {
}
