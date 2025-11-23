package fi.vnest.speechtherapy.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import fi.vnest.speechtherapy.api.dto.GroupRequest;
import fi.vnest.speechtherapy.api.dto.WordRequest;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordGroup;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.service.CustomUserDetailsService;
import fi.vnest.speechtherapy.api.service.WordService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminWordController.class)
@TestPropertySource(properties = {
    "app.users=test@example.com:password:Test User:ADMIN",
    "server.servlet.session.timeout=30m"
})
class AdminWordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private WordService wordService;

    @MockBean
    private CustomUserDetailsService userDetailsService;

    private Word word;
    private WordRequest wordRequest;
    private WordGroup group;
    private GroupRequest groupRequest;

    @BeforeEach
    void setUp() {
        word = new Word();
        word.setId(1L);
        word.setText("lapsi");
        word.setType(WordType.SUBJECT);

        wordRequest = new WordRequest();
        wordRequest.setText("lapsi");
        wordRequest.setType(WordType.SUBJECT);

        group = new WordGroup("animals", "Animal related words");
        group.setId(1L);

        groupRequest = new GroupRequest();
        groupRequest.setName("animals");
        groupRequest.setDescription("Animal related words");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createWord_ShouldReturnCreatedWord() throws Exception {
        when(wordService.createWord(any(WordRequest.class))).thenReturn(word);

        mockMvc.perform(post("/admin/words")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wordRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.text").value("lapsi"))
                .andExpect(jsonPath("$.data.type").value("SUBJECT"));

        verify(wordService, times(1)).createWord(any(WordRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createWord_WithInvalidRequest_ShouldReturn400() throws Exception {
        WordRequest invalidRequest = new WordRequest();
        // Missing required fields

        mockMvc.perform(post("/admin/words")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllGroups_ShouldReturnAllGroups() throws Exception {
        List<WordGroup> groups = Arrays.asList(group);
        when(wordService.getAllGroups()).thenReturn(groups);

        mockMvc.perform(get("/admin/words/groups")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].name").value("animals"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateWord_WhenExists_ShouldReturnUpdatedWord() throws Exception {
        Word updatedWord = new Word();
        updatedWord.setId(1L);
        updatedWord.setText("updated");
        updatedWord.setType(WordType.SUBJECT);

        when(wordService.updateWord(eq(1L), any(WordRequest.class))).thenReturn(updatedWord);

        mockMvc.perform(put("/admin/words/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wordRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.text").value("updated"));

        verify(wordService, times(1)).updateWord(eq(1L), any(WordRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateWord_WhenNotFound_ShouldReturn404() throws Exception {
        when(wordService.updateWord(eq(999L), any(WordRequest.class)))
                .thenThrow(new NoSuchElementException("Word not found"));

        mockMvc.perform(put("/admin/words/999")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wordRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteWord_WhenExists_ShouldReturn204() throws Exception {
        doNothing().when(wordService).deleteWord(1L);

        mockMvc.perform(delete("/admin/words/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.success").value(true));

        verify(wordService, times(1)).deleteWord(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteWord_WhenNotFound_ShouldReturn404() throws Exception {
        doThrow(new NoSuchElementException("Word not found"))
                .when(wordService).deleteWord(999L);

        mockMvc.perform(delete("/admin/words/999")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createGroup_ShouldReturnCreatedGroup() throws Exception {
        when(wordService.createGroup(any(GroupRequest.class))).thenReturn(group);

        mockMvc.perform(post("/admin/words/groups")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(groupRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("animals"));

        verify(wordService, times(1)).createGroup(any(GroupRequest.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateGroup_WhenExists_ShouldReturnUpdatedGroup() throws Exception {
        WordGroup updatedGroup = new WordGroup("updated", "Updated description");
        updatedGroup.setId(1L);

        when(wordService.updateGroup(eq(1L), any(GroupRequest.class))).thenReturn(updatedGroup);

        mockMvc.perform(put("/admin/words/groups/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(groupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("updated"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteGroup_WhenExists_ShouldReturn204() throws Exception {
        doNothing().when(wordService).deleteGroup(1L);

        mockMvc.perform(delete("/admin/words/groups/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.success").value(true));

        verify(wordService, times(1)).deleteGroup(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteGroup_WhenInUse_ShouldReturn400() throws Exception {
        doThrow(new IllegalStateException("Group is in use"))
                .when(wordService).deleteGroup(1L);

        mockMvc.perform(delete("/admin/words/groups/1")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void createWord_WithoutAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(post("/admin/words")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(wordRequest)))
                .andExpect(status().isUnauthorized());
    }
}
