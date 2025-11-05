package fi.vnest.speechtherapy.api.dto;

import java.util.List;

/**
 * DTO for responding to the bulk combination creation request.
 */
public record CombinationBatchResponse(
        int created,
        List<CombinationResponse> combinations
) {}
