package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.ApiResponse;
import fi.vnest.speechtherapy.api.dto.SuggestionResponse;
import fi.vnest.speechtherapy.api.dto.ValidationRequest;
import fi.vnest.speechtherapy.api.dto.ValidationResponse;
import fi.vnest.speechtherapy.api.service.CombinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing Exercise Suggestions and Sentence Validation.
 */
@RestController
@RequestMapping("/api/suggestions")
@Tag(name = "Suggestions", description = "API for exercise suggestions and sentence validation")
public class SuggestionController {

    private final CombinationService combinationService;

    @Autowired
    public SuggestionController(CombinationService combinationService) {
        this.combinationService = combinationService;
    }

    @Operation(
            summary = "Get exercise suggestions",
            description = "Retrieves exercise suggestions with random word combinations for language practice"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved suggestions",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @GetMapping
    public ResponseEntity<ApiResponse<SuggestionResponse>> getSuggestions(
            @Parameter(description = "Difficulty level (future feature, currently ignored)", example = "easy")
            @RequestParam(required = false) String difficulty,
            @Parameter(description = "Maximum number of suggestions to return", example = "10")
            @RequestParam(required = false) Integer limit) {

        // Note: Difficulty is currently ignored as per requirements, but included in signature for completeness.
        SuggestionResponse suggestions = combinationService.getExerciseSuggestions(limit);
        return ResponseEntity.ok(new ApiResponse<>(true, suggestions));
    }

    @Operation(
            summary = "Get suggestions by verb",
            description = "Retrieves exercise suggestions filtered by a specific verb ID"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved suggestions",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Verb not found"
    )
    @GetMapping("/{verb_id}")
    public ResponseEntity<ApiResponse<SuggestionResponse>> getSuggestionsByVerb(
            @Parameter(description = "Verb ID", example = "1")
            @PathVariable Long verb_id) {

        SuggestionResponse suggestionResponse = combinationService.getSuggestionsByVerb(verb_id);

        return ResponseEntity.ok(new ApiResponse<>(true, suggestionResponse));
    }

    @Operation(
            summary = "Validate sentence combination",
            description = "Validates whether a user-formed sentence (subject-verb-object combination) is correct"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Validation completed successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request body"
    )
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidationResponse>> validateCombination(
            @Parameter(description = "Validation request containing subject, verb, and object IDs")
            @Valid @RequestBody ValidationRequest request) {

        ValidationResponse validationResult = combinationService.validateCombination(request);
        return ResponseEntity.ok(new ApiResponse<>(true, validationResult));
    }
}
