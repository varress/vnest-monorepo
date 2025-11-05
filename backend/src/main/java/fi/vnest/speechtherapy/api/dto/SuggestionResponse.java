package fi.vnest.speechtherapy.api.dto;

import java.util.List;

/**
 * DTO for the response of GET /api/suggestions, containing all necessary word lists.
 */
public record SuggestionResponse(
        List<VerbSuggestion> verbs,
        List<WordReference> subjects,
        List<WordReference> objects
) {
}
