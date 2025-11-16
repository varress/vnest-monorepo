package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.ApiResponse;
import fi.vnest.speechtherapy.api.dto.WordResponse;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.service.WordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/words")
public class WordController {

    private final WordService wordService;

    @Autowired
    public WordController(WordService wordService) {
        this.wordService = wordService;
    }

    /**
     * GET /api/words - Get all words, optionally filtered by type.
     */
    @GetMapping()
    public ResponseEntity<ApiResponse<List<WordResponse>>> getAllWords(
            @RequestParam(required = false) WordType type) {

        List<Word> words = wordService.findAll(type);

        List<WordResponse> responseData = words.stream()
                .map(WordResponse::fromEntity)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, responseData));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WordResponse>> getWord(@PathVariable Long id) {
        Word word = wordService.findById(id);
        WordResponse wordResponse = WordResponse.fromEntity(word);
        return ResponseEntity.ok(new ApiResponse<>(true, wordResponse));

    }

}
