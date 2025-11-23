package fi.vnest.speechtherapy.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vnest.speechtherapy.api.dto.CombinationBatchRequest;
import fi.vnest.speechtherapy.api.dto.CombinationRequest;
import fi.vnest.speechtherapy.api.model.AllowedCombination;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.service.CombinationService;
import fi.vnest.speechtherapy.api.service.CustomUserDetailsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminCombinationController.class)
@TestPropertySource(properties = {
    "app.users=test@example.com:password:Test User:ADMIN",
    "server.servlet.session.timeout=30m"
})
class AdminCombinationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CombinationService combinationService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private AllowedCombination combination;
    private CombinationRequest combinationRequest;
    private CombinationBatchRequest batchRequest;
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

        combinationRequest = new CombinationRequest();
        combinationRequest.setSubjectId(1L);
        combinationRequest.setVerbId(2L);
        combinationRequest.setObjectId(3L);

        batchRequest = new CombinationBatchRequest();
        batchRequest.setVerbId(2L);
        batchRequest.setSubjectIds(Arrays.asList(1L));
        batchRequest.setObjectIds(Arrays.asList(3L));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCombination_ShouldReturnCreatedCombination() throws Exception {
        when(combinationService.createCombination(any(CombinationRequest.class)))
                .thenReturn(combination);

        mockMvc.perform(post("/admin/combinations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(combinationRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));

        verify(combinationService, times(1)).createCombination(any(CombinationRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCombination_WithInvalidRequest_ShouldReturn400() throws Exception {
        CombinationRequest invalidRequest = new CombinationRequest();
        // Missing required fields

        mockMvc.perform(post("/admin/combinations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCombinationsBatch_ShouldReturnCreatedCombinations() throws Exception {
        List<AllowedCombination> combinations = Arrays.asList(combination);
        when(combinationService.createCombinationsBatch(any(CombinationBatchRequest.class)))
                .thenReturn(combinations);

        mockMvc.perform(post("/admin/combinations/batch")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.created").value(1))
                .andExpect(jsonPath("$.data.combinations").isArray())
                .andExpect(jsonPath("$.data.combinations.length()").value(1));

        verify(combinationService, times(1))
                .createCombinationsBatch(any(CombinationBatchRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCombinationsBatch_WithInvalidRequest_ShouldReturn400() throws Exception {
        CombinationBatchRequest invalidRequest = new CombinationBatchRequest();
        // Missing required fields

        mockMvc.perform(post("/admin/combinations/batch")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createCombinationsBatch_WithEmptyLists_ShouldReturn400() throws Exception {
        batchRequest.setSubjectIds(Arrays.asList());
        batchRequest.setObjectIds(Arrays.asList());

        mockMvc.perform(post("/admin/combinations/batch")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(batchRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCombination_WhenExists_ShouldReturn204() throws Exception {
        doNothing().when(combinationService).deleteCombination(1L);

        mockMvc.perform(delete("/admin/combinations/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.success").value(true));

        verify(combinationService, times(1)).deleteCombination(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCombination_WhenNotFound_ShouldReturn404() throws Exception {
        doThrow(new NoSuchElementException("Combination not found"))
                .when(combinationService).deleteCombination(999L);

        mockMvc.perform(delete("/admin/combinations/999")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteCombinationsByVerb_ShouldReturn204() throws Exception {
        doNothing().when(combinationService).deleteCombinationsByVerb(2L);

        mockMvc.perform(delete("/admin/combinations/by-verb/2")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.success").value(true));

        verify(combinationService, times(1)).deleteCombinationsByVerb(2L);
    }

    @Test
    void createCombination_WithoutAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(post("/admin/combinations")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(combinationRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteCombination_WithoutAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(delete("/admin/combinations/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
