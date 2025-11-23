package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.*;
import fi.vnest.speechtherapy.api.model.AllowedCombination;
import fi.vnest.speechtherapy.api.service.CombinationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for admin features
 */
@RestController
@RequestMapping("/admin/combinations")
@Tag(name = "Admin - Combinations", description = "Admin API for managing word combinations (requires ADMIN role)")
public class AdminCombinationController {

    private final CombinationService combinationService;

    @Autowired
    public AdminCombinationController(CombinationService combinationService) {
        this.combinationService = combinationService;
    }

    @Operation(
            summary = "Create combination",
            description = "Creates a single word combination (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Combination created successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createCombination(
            @Parameter(description = "Combination creation request")
            @RequestBody @Valid CombinationRequest request) {
        AllowedCombination newCombination = combinationService.createCombination(request);
        CombinationResponse responseData = CombinationResponse.fromEntity(newCombination);
        return new ResponseEntity<>(new ApiResponse<>(true, responseData), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Create combinations in batch",
            description = "Creates multiple combinations for a verb at once (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Combinations created successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<?>> createCombinationsBatch(
            @Parameter(description = "Batch creation request")
            @RequestBody @Valid CombinationBatchRequest batchRequest) {
        List<AllowedCombination> createdCombinations = combinationService.createCombinationsBatch(batchRequest);
        List<CombinationResponse> responseList = createdCombinations.stream()
                .map(CombinationResponse::fromEntity)
                .collect(Collectors.toList());

        CombinationBatchResponse bulkResponse = new CombinationBatchResponse(
                responseList.size(),
                responseList
        );

        return new ResponseEntity<>(new ApiResponse<>(true, bulkResponse), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Delete combination",
            description = "Deletes a specific combination (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "Combination deleted successfully"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCombination(
            @Parameter(description = "Combination ID", example = "1")
            @PathVariable Long id) {
        combinationService.deleteCombination(id);
        // Return 204 No Content for successful deletion
        return new ResponseEntity<>(new ApiResponse<>(true, null), HttpStatus.NO_CONTENT);
    }

    @Operation(
            summary = "Delete combinations by verb",
            description = "Deletes all combinations for a specific verb (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "Combinations deleted successfully"
    )
    @DeleteMapping("/by-verb/{verb_id}")
    public ResponseEntity<ApiResponse<Void>> deleteCombinationsByVerb(
            @Parameter(description = "Verb ID", example = "1")
            @PathVariable Long verb_id) {
        combinationService.deleteCombinationsByVerb(verb_id);
        // Return 204 No Content for successful deletion
        return new ResponseEntity<>(new ApiResponse<>(true, null), HttpStatus.NO_CONTENT);
    }

}
