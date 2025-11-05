package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.ApiResponse;
import fi.vnest.speechtherapy.api.dto.SuggestionResponse;
import fi.vnest.speechtherapy.api.dto.ValidationRequest;
import fi.vnest.speechtherapy.api.dto.ValidationResponse;
import fi.vnest.speechtherapy.api.service.CombinationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for managing Exercise Suggestions and Sentence Validation.
 */
@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final CombinationService combinationService;

    @Autowired
    public SuggestionController(CombinationService combinationService) {
        this.combinationService = combinationService;
    }

    /**
     * GET /api/suggestions - Get exercise data for frontend.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<SuggestionResponse>> getSuggestions(
            @RequestParam(required = false) String difficulty, // Future feature
            @RequestParam(required = false) Integer limit) {

        // Note: Difficulty is currently ignored as per requirements, but included in signature for completeness.
        SuggestionResponse suggestions = combinationService.getExerciseSuggestions(limit);
        return ResponseEntity.ok(new ApiResponse<>(true, suggestions));
    }

    /**
     * POST /api/suggestions/validate - Validate a user-formed sentence.
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidationResponse>> validateCombination(
            @Valid @RequestBody ValidationRequest request) {

        ValidationResponse validationResult = combinationService.validateCombination(request);
        return ResponseEntity.ok(new ApiResponse<>(true, validationResult));
    }
}
