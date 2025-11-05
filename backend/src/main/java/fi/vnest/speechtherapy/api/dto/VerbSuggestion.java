package fi.vnest.speechtherapy.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * DTO representing a verb in the suggestions list, including its compatible word IDs.
 */
public record VerbSuggestion(
        Long id,

        String text,

        @JsonProperty("compatible_subject_ids")
        List<Long> compatibleSubjectIds,

        @JsonProperty("compatible_object_ids")
        List<Long> compatibleObjectIds
) {
}