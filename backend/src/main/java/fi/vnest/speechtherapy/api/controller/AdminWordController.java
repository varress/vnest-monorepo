package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.*;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordGroup;
import fi.vnest.speechtherapy.api.service.WordService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/admin/words")
public class AdminWordController {

    private final WordService wordService;

    @Autowired
    public AdminWordController(WordService wordService) {
        this.wordService = wordService;
    }


    /**
     * POST /api/words - Create a new word.
     */
    @PostMapping()
    public ResponseEntity<ApiResponse<WordResponse>> createWord(
            @Valid @RequestBody WordRequest request) {

        Word newWord = wordService.createWord(request);
        WordResponse responseData = WordResponse.fromEntity(newWord);

        return new ResponseEntity<>(new ApiResponse<>(true, responseData), HttpStatus.CREATED);
    }

    /**
     * GET /admin/words/groups - Get all available groups
     */
    @GetMapping("/groups")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getAllGroups() {
        List<GroupResponse> groups = wordService.getAllGroups()
                .stream()
                .map(GroupResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(new ApiResponse<>(true, groups));
    }

    /**
     * PUT /api/words/:id - Update an existing word.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<WordResponse>> updateWord(
            @PathVariable Long id,
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

    /**
     * DELETE /api/words/:id - Delete a word.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWord(@PathVariable Long id) {
        try {
            wordService.deleteWord(id);
            // Return 204 No Content for successful deletion
            return new ResponseEntity<>(new ApiResponse<>(true, null), HttpStatus.NO_CONTENT);
        } catch (NoSuchElementException e) {
            // Return 404 Not Found if the word ID does not exist
            return new ResponseEntity<>(new ApiResponse<>(false, null), HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /admin/words/groups - Create a new group/theme
     */
    @PostMapping("/groups")
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @RequestBody GroupRequest request) {

        WordGroup newGroup = wordService.createGroup(request);
        GroupResponse responseData = GroupResponse.fromEntity(newGroup);

        return new ResponseEntity<>(new ApiResponse<>(true, responseData), HttpStatus.CREATED);
    }

    /**
     * PUT /admin/groups/:id - Update an existing group/theme
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
