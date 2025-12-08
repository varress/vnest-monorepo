package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.*;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordGroup;
import fi.vnest.speechtherapy.api.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/admin/words")
@Tag(name = "Admin - Words", description = "Admin API for managing words and word groups (requires ADMIN role)")
public class AdminWordController {

    private final WordService wordService;

    @Autowired
    public AdminWordController(WordService wordService) {
        this.wordService = wordService;
    }


    @Operation(
            summary = "Create new word",
            description = "Creates a new word (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Word created successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Invalid request body"
    )
    @PostMapping()
    public ResponseEntity<ApiResponse<WordResponse>> createWord(
            @Parameter(description = "Word creation request")
            @Valid @RequestBody WordRequest request) {

        Word newWord = wordService.createWord(request);
        WordResponse responseData = WordResponse.fromEntity(newWord);

        return new ResponseEntity<>(new ApiResponse<>(true, responseData), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Get all word groups",
            description = "Retrieves all available word groups (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved groups",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getAllGroups() {
        List<GroupResponse> groups = wordService.getAllGroups()
                .stream()
                .map(GroupResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(new ApiResponse<>(true, groups));
    }

    @Operation(
            summary = "Update word",
            description = "Updates an existing word (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Word updated successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Word not found"
    )
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WordResponse>> updateWord(
            @Parameter(description = "Word ID", example = "1")
            @PathVariable Long id,
            @Parameter(description = "Word update request")
            @Valid @RequestBody WordRequest request) {
        try {
            Word updatedWord = wordService.updateWord(id, request);
            WordResponse responseData = WordResponse.fromEntity(updatedWord);
            return ResponseEntity.ok(new ApiResponse<>(true, responseData));
        } catch (NoSuchElementException e) {
            // Return 404 Not Found if the word ID does not exist
            return new ResponseEntity<>(new ApiResponse<>(false, null), HttpStatus.NOT_FOUND);
        }
    }

    @Operation(
            summary = "Delete word",
            description = "Deletes a word (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "204",
            description = "Word deleted successfully"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Word not found"
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWord(
            @Parameter(description = "Word ID", example = "1")
            @PathVariable Long id) {
        try {
            wordService.deleteWord(id);
            // Return 204 No Content for successful deletion
            return new ResponseEntity<>(new ApiResponse<>(true, null), HttpStatus.NO_CONTENT);
        } catch (NoSuchElementException e) {
            // Return 404 Not Found if the word ID does not exist
            return new ResponseEntity<>(new ApiResponse<>(false, null), HttpStatus.NOT_FOUND);
        }
    }

    @Operation(
            summary = "Create word group",
            description = "Creates a new word group (requires ADMIN role)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Group created successfully",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @PostMapping("/groups")
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @Parameter(description = "Group creation request")
            @RequestBody GroupRequest request) {

        WordGroup newGroup = wordService.createGroup(request);
        GroupResponse responseData = GroupResponse.fromEntity(newGroup);

        return new ResponseEntity<>(new ApiResponse<>(true, responseData), HttpStatus.CREATED);
    }

    /**
     * PUT /admin/groups/:id - Update an existing group
     */
    @PutMapping("/groups/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody GroupRequest request) {
        try {
            WordGroup updatedGroup = wordService.updateGroup(id, request);
            GroupResponse responseData = GroupResponse.fromEntity(updatedGroup);
            return ResponseEntity.ok(new ApiResponse<>(true, responseData));
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(new ApiResponse<>(false, null), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * DELETE /admin/words/groups/:id - Delete a group/theme
     */
    @DeleteMapping("/groups/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable Long id) {
        try {
            wordService.deleteGroup(id);
            return new ResponseEntity<>(new ApiResponse<>(true, null), HttpStatus.NO_CONTENT);
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(new ApiResponse<>(false, null), HttpStatus.NOT_FOUND);
        } catch (IllegalStateException e) {
            // If group is in use by words
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, null));
        }
    }

}
