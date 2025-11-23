package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.ApiResponse;
import fi.vnest.speechtherapy.api.dto.WordResponse;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.service.WordService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/words")
@Tag(name = "Words", description = "Public API for retrieving words for vnest speech therapy app")
public class WordController {

    private final WordService wordService;

    @Autowired
    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    @Operation(
            summary = "Get all words",
            description = "Retrieves available words, optionally filtered by type (SUBJECT, VERB, OBJECT)"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved words",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @GetMapping()
    public ResponseEntity<ApiResponse<List<WordResponse>>> getAllWords(
            @Parameter(description = "Filter by word type (SUBJECT, VERB, OBJECT)", example = "VERB")
            @RequestParam(required = false) WordType type) {

        List<Word> words = wordService.findAll(type);

        List<WordResponse> responseData = words.stream()
                .map(WordResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, responseData));
    }

    @Operation(
            summary = "Get word by ID",
            description = "Retrieves a specific word by its ID"
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved word",
            content = @Content(schema = @Schema(implementation = ApiResponse.class))
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Word not found"
    )
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WordResponse>> getWord(
            @Parameter(description = "Word ID", example = "1")
            @PathVariable Long id) {
        Word word = wordService.findById(id);
        WordResponse wordResponse = WordResponse.fromEntity(word);
        return ResponseEntity.ok(new ApiResponse<>(true, wordResponse));

    }

}
