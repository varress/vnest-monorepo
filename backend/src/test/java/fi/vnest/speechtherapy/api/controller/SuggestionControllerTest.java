package fi.vnest.speechtherapy.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vnest.speechtherapy.api.dto.SuggestionResponse;
import fi.vnest.speechtherapy.api.dto.ValidationRequest;
import fi.vnest.speechtherapy.api.dto.ValidationResponse;
import fi.vnest.speechtherapy.api.service.CombinationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = SuggestionController.class,
        excludeAutoConfiguration = org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class)
@TestPropertySource(properties = {
    "app.users=test@example.com:password:Test User:ADMIN",
    "server.servlet.session.timeout=30m"
})
class SuggestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CombinationService combinationService;

    private SuggestionResponse suggestionResponse;
    private ValidationRequest validationRequest;
    private ValidationResponse validationResponse;

    @BeforeEach
    void setUp() {
        suggestionResponse = new SuggestionResponse(
            new ArrayList<>(),  // verbs
            new ArrayList<>(),  // subjects
            new ArrayList<>()   // objects
        );

        validationRequest = new ValidationRequest(1L, 2L, 3L);

        validationResponse = new ValidationResponse(true, "test sentence", "Valid combination");
    }

    @Test
    void getSuggestions_ShouldReturnSuggestions() throws Exception {
        when(combinationService.getExerciseSuggestions(null)).thenReturn(suggestionResponse);

        mockMvc.perform(get("/api/suggestions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    void getSuggestions_WithLimit_ShouldReturnLimitedSuggestions() throws Exception {
        when(combinationService.getExerciseSuggestions(10)).thenReturn(suggestionResponse);

        mockMvc.perform(get("/api/suggestions")
                        .param("limit", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    void getSuggestions_WithDifficulty_ShouldIgnoreDifficulty() throws Exception {
        when(combinationService.getExerciseSuggestions(null)).thenReturn(suggestionResponse);

        mockMvc.perform(get("/api/suggestions")
                        .param("difficulty", "easy")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getSuggestionsByVerb_WhenVerbExists_ShouldReturnSuggestions() throws Exception {
        when(combinationService.getSuggestionsByVerb(2L)).thenReturn(suggestionResponse);

        mockMvc.perform(get("/api/suggestions/2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    void getSuggestionsByVerb_WhenVerbNotFound_ShouldReturn404() throws Exception {
        when(combinationService.getSuggestionsByVerb(999L))
                .thenThrow(new NoSuchElementException("Verb not found"));

        mockMvc.perform(get("/api/suggestions/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void validateCombination_WhenValid_ShouldReturnValid() throws Exception {
        when(combinationService.validateCombination(any(ValidationRequest.class)))
                .thenReturn(validationResponse);

        mockMvc.perform(post("/api/suggestions/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(true))
                .andExpect(jsonPath("$.data.message").value("Valid combination"));
    }

    @Test
    void validateCombination_WhenInvalid_ShouldReturnInvalid() throws Exception {
        ValidationResponse invalidResponse = new ValidationResponse(false, "test sentence", "Invalid combination");
        when(combinationService.validateCombination(any(ValidationRequest.class)))
                .thenReturn(invalidResponse);

        mockMvc.perform(post("/api/suggestions/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.valid").value(false))
                .andExpect(jsonPath("$.data.message").value("Invalid combination"));
    }

    @Test
    void validateCombination_WithInvalidRequest_ShouldReturn400() throws Exception {
        // Invalid request with null values
        String invalidJson = "{\"subject_id\": null, \"verb_id\": null, \"object_id\": null}";

        mockMvc.perform(post("/api/suggestions/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
}
