package fi.vnest.speechtherapy.api.dto;

/**
 * DTO for the response of POST /api/suggestions/validate.
 */
public record ValidationResponse(
        boolean valid,
        String sentence,
        String message
) {
}
