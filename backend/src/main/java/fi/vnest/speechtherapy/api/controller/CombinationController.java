package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.*;
import fi.vnest.speechtherapy.api.model.AllowedCombination;
import fi.vnest.speechtherapy.api.service.CombinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing AllowedCombination entities.
 * Exceptions are handled by GlobalExceptionHandler.
 */
@RestController
@RequestMapping("/api/combinations")
@Tag(name = "Combinations", description = "API for retrieving valid word combinations (Subject-Verb-Object)")
public class CombinationController {

    private final CombinationService combinationService;

    @Autowired
    public CombinationController(CombinationService combinationService) {
        this.combinationService = combinationService;
    }

    @Operation(
            summary = "Get all combinations",
            description = "Retrieves all valid word combinations, optionally filtered by verb ID"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved combinations",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @GetMapping
    public ResponseEntity<ApiResponse<List<CombinationResponse>>> getAllCombinations(
            @Parameter(description = "Filter by verb ID", example = "1")
            @RequestParam(required = false) Long verb_id) {

        List<AllowedCombination> combinations = combinationService.findAll(verb_id);
        List<CombinationResponse> responseData = combinations.stream()
                .map(CombinationResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, responseData));
    }


    @Operation(
            summary = "Delete combination",
            description = "Deletes a specific combination by its ID"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "Successfully deleted combination"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Combination not found"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCombination(
            @Parameter(description = "Combination ID", example = "1")
            @PathVariable Long id) {
        combinationService.deleteCombination(id);
        return new ResponseEntity<>(new ApiResponse<>(true, null), HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Delete combinations by verb",
            description = "Deletes all combinations associated with a specific verb ID"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "Successfully deleted combinations"
    )
    @DeleteMapping("/by-verb/{verb_id}")
    public ResponseEntity<ApiResponse<Void>> deleteCombinationsByVerb(
            @Parameter(description = "Verb ID", example = "1")
            @PathVariable Long verb_id) {
        combinationService.deleteCombinationsByVerb(verb_id);
        // Return 204 No Content for successful deletion
        return new ResponseEntity<>(new ApiResponse<>(true, null), HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Get combination by ID",
            description = "Retrieves a specific word combination by its ID"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved combination",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Combination not found"
    )
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CombinationResponse>> getCombination(
            @Parameter(description = "Combination ID", example = "1")
            @PathVariable Long id) {
        AllowedCombination combination = combinationService.findById(id);
        CombinationResponse combinationResponse = CombinationResponse.fromEntity(combination);
        return ResponseEntity.ok(new ApiResponse<>(true, combinationResponse));

    }
}
