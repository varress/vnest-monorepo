package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.dto.WordRequest;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.repository.WordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WordServiceTest {

    @Mock
    private WordRepository wordRepository;

    @InjectMocks
    private WordService wordService;

    private Word subjectWord;
    private Word verbWord;
    private Word objectWord;

    @BeforeEach
    void setUp() {
        subjectWord = new Word();
        subjectWord.setId(1L);
        subjectWord.setText("cat");
        subjectWord.setType(WordType.SUBJECT);

        verbWord = new Word();
        verbWord.setId(2L);
        verbWord.setText("eats");
        verbWord.setType(WordType.VERB);

        objectWord = new Word();
        objectWord.setId(3L);
        objectWord.setText("fish");
        objectWord.setType(WordType.OBJECT);
    }

    @Test
    void findAll_WithoutType_ReturnsAllWords() {
        List<Word> expected = List.of(subjectWord, verbWord, objectWord);
        when(wordRepository.findAll()).thenReturn(expected);

        List<Word> result = wordService.findAll(null);

        assertEquals(3, result.size());
        assertEquals(expected, result);
        verify(wordRepository).findAll();
        verify(wordRepository, never()).findByType(any());
    }

    @Test
    void findAll_WithSubjectType_ReturnsOnlySubjects() {
        List<Word> expected = List.of(subjectWord);
        when(wordRepository.findByType(WordType.SUBJECT)).thenReturn(expected);

        List<Word> result = wordService.findAll(WordType.SUBJECT);

        assertEquals(1, result.size());
        assertEquals(expected, result);
        assertEquals(WordType.SUBJECT, result.get(0).getType());
        verify(wordRepository).findByType(WordType.SUBJECT);
        verify(wordRepository, never()).findAll();
    }

    @Test
    void findAll_WithVerbType_ReturnsOnlyVerbs() {
        List<Word> expected = List.of(verbWord);
        when(wordRepository.findByType(WordType.VERB)).thenReturn(expected);

        List<Word> result = wordService.findAll(WordType.VERB);

        assertEquals(1, result.size());
        assertEquals(expected, result);
        assertEquals(WordType.VERB, result.get(0).getType());
        verify(wordRepository).findByType(WordType.VERB);
    }

    @Test
    void findAll_WithObjectType_ReturnsOnlyObjects() {
        List<Word> expected = List.of(objectWord);
        when(wordRepository.findByType(WordType.OBJECT)).thenReturn(expected);

        List<Word> result = wordService.findAll(WordType.OBJECT);

        assertEquals(1, result.size());
        assertEquals(expected, result);
        assertEquals(WordType.OBJECT, result.get(0).getType());
        verify(wordRepository).findByType(WordType.OBJECT);
    }

    @Test
    void findAll_WithTypeNotFound_ReturnsEmptyList() {
        when(wordRepository.findByType(WordType.SUBJECT)).thenReturn(List.of());

        List<Word> result = wordService.findAll(WordType.SUBJECT);

        assertTrue(result.isEmpty());
        verify(wordRepository).findByType(WordType.SUBJECT);
    }

    @Test
    void createWord_WithValidRequest_CreatesAndReturnsWord() {
        WordRequest request = new WordRequest();
        request.setText("dog");
        request.setType(WordType.SUBJECT);

        Word savedWord = new Word();
        savedWord.setId(4L);
        savedWord.setText("dog");
        savedWord.setType(WordType.SUBJECT);

        when(wordRepository.save(any(Word.class))).thenReturn(savedWord);

        Word result = wordService.createWord(request);

        assertNotNull(result);
        assertEquals(4L, result.getId());
        assertEquals("dog", result.getText());
        assertEquals(WordType.SUBJECT, result.getType());
        verify(wordRepository).save(argThat(word ->
                word.getText().equals("dog") && word.getType() == WordType.SUBJECT
        ));
    }

    @Test
    void createWord_WithVerbType_CreatesVerbWord() {
        WordRequest request = new WordRequest();
        request.setText("runs");
        request.setType(WordType.VERB);

        Word savedWord = new Word();
        savedWord.setId(5L);
        savedWord.setText("runs");
        savedWord.setType(WordType.VERB);

        when(wordRepository.save(any(Word.class))).thenReturn(savedWord);

        Word result = wordService.createWord(request);

        assertNotNull(result);
        assertEquals(WordType.VERB, result.getType());
        assertEquals("runs", result.getText());
        verify(wordRepository).save(any(Word.class));
    }

    @Test
    void createWord_WithObjectType_CreatesObjectWord() {
        WordRequest request = new WordRequest();
        request.setText("ball");
        request.setType(WordType.OBJECT);

        Word savedWord = new Word();
        savedWord.setId(6L);
        savedWord.setText("ball");
        savedWord.setType(WordType.OBJECT);

        when(wordRepository.save(any(Word.class))).thenReturn(savedWord);

        Word result = wordService.createWord(request);

        assertNotNull(result);
        assertEquals(WordType.OBJECT, result.getType());
        assertEquals("ball", result.getText());
        verify(wordRepository).save(any(Word.class));
    }

    @Test
    void updateWord_WithValidIdAndRequest_UpdatesAndReturnsWord() {
        Long wordId = 1L;
        WordRequest request = new WordRequest();
        request.setText("kitten");
        request.setType(WordType.SUBJECT);

        Word updatedWord = new Word();
        updatedWord.setId(wordId);
        updatedWord.setText("kitten");
        updatedWord.setType(WordType.SUBJECT);

        when(wordRepository.findById(wordId)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.save(any(Word.class))).thenReturn(updatedWord);

        Word result = wordService.updateWord(wordId, request);

        assertNotNull(result);
        assertEquals(wordId, result.getId());
        assertEquals("kitten", result.getText());
        assertEquals(WordType.SUBJECT, result.getType());
        verify(wordRepository).findById(wordId);
        verify(wordRepository).save(argThat(word ->
                word.getText().equals("kitten") && word.getType() == WordType.SUBJECT
        ));
    }

    @Test
    void updateWord_WithNonExistentId_ThrowsNoSuchElementException() {
        Long wordId = 999L;
        WordRequest request = new WordRequest();
        request.setText("test");
        request.setType(WordType.SUBJECT);

        when(wordRepository.findById(wordId)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> wordService.updateWord(wordId, request));

        assertTrue(exception.getMessage().contains("Word not found with ID: " + wordId));
        verify(wordRepository).findById(wordId);
        verify(wordRepository, never()).save(any());
    }

    @Test
    void updateWord_ChangingType_UpdatesTypeSuccessfully() {
        Long wordId = 1L;
        WordRequest request = new WordRequest();
        request.setText("cat");
        request.setType(WordType.OBJECT);

        Word updatedWord = new Word();
        updatedWord.setId(wordId);
        updatedWord.setText("cat");
        updatedWord.setType(WordType.OBJECT);

        when(wordRepository.findById(wordId)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.save(any(Word.class))).thenReturn(updatedWord);

        Word result = wordService.updateWord(wordId, request);

        assertEquals(WordType.OBJECT, result.getType());
        verify(wordRepository).save(argThat(word -> word.getType() == WordType.OBJECT));
    }

    @Test
    void updateWord_ChangingOnlyText_KeepsTypeUnchanged() {
        Long wordId = 1L;
        WordRequest request = new WordRequest();
        request.setText("feline");
        request.setType(WordType.SUBJECT);

        Word updatedWord = new Word();
        updatedWord.setId(wordId);
        updatedWord.setText("feline");
        updatedWord.setType(WordType.SUBJECT);

        when(wordRepository.findById(wordId)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.save(any(Word.class))).thenReturn(updatedWord);

        Word result = wordService.updateWord(wordId, request);

        assertEquals("feline", result.getText());
        assertEquals(WordType.SUBJECT, result.getType());
        verify(wordRepository).save(any(Word.class));
    }

    @Test
    void deleteWord_WithExistingId_DeletesWord() {
        Long wordId = 1L;
        when(wordRepository.existsById(wordId)).thenReturn(true);

        wordService.deleteWord(wordId);

        verify(wordRepository).existsById(wordId);
        verify(wordRepository).deleteById(wordId);
    }

    @Test
    void deleteWord_WithNonExistentId_ThrowsNoSuchElementException() {
        Long wordId = 999L;
        when(wordRepository.existsById(wordId)).thenReturn(false);

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> wordService.deleteWord(wordId));

        assertTrue(exception.getMessage().contains("Word not found with ID: " + wordId));
        verify(wordRepository).existsById(wordId);
        verify(wordRepository, never()).deleteById(any());
    }
}
