package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.model.AllowedCombination;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.service.CombinationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CombinationController.class,
        excludeAutoConfiguration = org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class)
@TestPropertySource(properties = {
    "app.users=test@example.com:password:Test User:ADMIN",
    "server.servlet.session.timeout=30m"
})
class CombinationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CombinationService combinationService;

    private AllowedCombination combination;
    private Word subjectWord;
    private Word verbWord;
    private Word objectWord;

    @BeforeEach
    void setUp() {
        subjectWord = new Word();
        subjectWord.setId(1L);
        subjectWord.setText("lapsi");
        subjectWord.setType(WordType.SUBJECT);

        verbWord = new Word();
        verbWord.setId(2L);
        verbWord.setText("juosta");
        verbWord.setType(WordType.VERB);

        objectWord = new Word();
        objectWord.setId(3L);
        objectWord.setText("pallo");
        objectWord.setType(WordType.OBJECT);

        combination = new AllowedCombination();
        combination.setId(1L);
        combination.setSubject(subjectWord);
        combination.setVerb(verbWord);
        combination.setObject(objectWord);
    }

    @Test
    void getAllCombinations_ShouldReturnAllCombinations() throws Exception {
        List<AllowedCombination> combinations = Arrays.asList(combination);
        when(combinationService.findAll(null)).thenReturn(combinations);

        mockMvc.perform(get("/api/combinations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    void getAllCombinations_WithVerbFilter_ShouldReturnFilteredCombinations() throws Exception {
        List<AllowedCombination> combinations = Arrays.asList(combination);
        when(combinationService.findAll(2L)).thenReturn(combinations);

        mockMvc.perform(get("/api/combinations")
                        .param("verb_id", "2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void getAllCombinations_WhenNoCombinations_ShouldReturnEmptyArray() throws Exception {
        when(combinationService.findAll(null)).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/combinations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void getCombination_WhenExists_ShouldReturnCombination() throws Exception {
        when(combinationService.findById(1L)).thenReturn(combination);

        mockMvc.perform(get("/api/combinations/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    void getCombination_WhenNotFound_ShouldReturn404() throws Exception {
        when(combinationService.findById(999L))
                .thenThrow(new NoSuchElementException("Combination not found"));

        mockMvc.perform(get("/api/combinations/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCombination_WhenExists_ShouldReturn204() throws Exception {
        doNothing().when(combinationService).deleteCombination(1L);

        mockMvc.perform(delete("/api/combinations/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.success").value(true));

        verify(combinationService, times(1)).deleteCombination(1L);
    }

    @Test
    void deleteCombination_WhenNotFound_ShouldReturn404() throws Exception {
        doThrow(new NoSuchElementException("Combination not found"))
                .when(combinationService).deleteCombination(999L);

        mockMvc.perform(delete("/api/combinations/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCombinationsByVerb_ShouldReturn204() throws Exception {
        doNothing().when(combinationService).deleteCombinationsByVerb(2L);

        mockMvc.perform(delete("/api/combinations/by-verb/2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.success").value(true));

        verify(combinationService, times(1)).deleteCombinationsByVerb(2L);
    }
}
