package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.service.WordService;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = WordController.class,
        excludeAutoConfiguration = org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class)
@TestPropertySource(properties = {
    "app.users=test@example.com:password:Test User:ADMIN",
    "server.servlet.session.timeout=30m"
})
class WordControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private WordService wordService;

    private Word subjectWord;
    private Word verbWord;

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
    }

    @Test
    void getAllWords_ShouldReturnAllWords() throws Exception {
        List<Word> words = Arrays.asList(subjectWord, verbWord);
        when(wordService.findAll(null)).thenReturn(words);

        mockMvc.perform(get("/api/words")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].text").value("lapsi"))
                .andExpect(jsonPath("$.data[1].text").value("juosta"));
    }

    @Test
    void getAllWords_WithTypeFilter_ShouldReturnFilteredWords() throws Exception {
        List<Word> words = Arrays.asList(subjectWord);
        when(wordService.findAll(WordType.SUBJECT)).thenReturn(words);

        mockMvc.perform(get("/api/words")
                        .param("type", "SUBJECT")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].type").value("SUBJECT"));
    }

    @Test
    void getAllWords_WhenNoWords_ShouldReturnEmptyArray() throws Exception {
        when(wordService.findAll(null)).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/words")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void getWord_WhenWordExists_ShouldReturnWord() throws Exception {
        when(wordService.findById(1L)).thenReturn(subjectWord);

        mockMvc.perform(get("/api/words/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.text").value("lapsi"))
                .andExpect(jsonPath("$.data.type").value("SUBJECT"));
    }

    @Test
    void getWord_WhenWordNotFound_ShouldReturn404() throws Exception {
        when(wordService.findById(999L)).thenThrow(new NoSuchElementException("Word not found"));

        mockMvc.perform(get("/api/words/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
