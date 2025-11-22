package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.dto.GroupRequest;
import fi.vnest.speechtherapy.api.dto.WordRequest;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordGroup;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.repository.GroupRepository;
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

    @Mock
    GroupRepository groupRepository;

    @InjectMocks
    private WordService wordService;

    private Word subjectWord;
    private Word verbWord;
    private Word objectWord;
    private WordGroup group;

    @BeforeEach
    void setUp() {
        group = new WordGroup("animals", "animal related");

        subjectWord = new Word();
        subjectWord.setId(1L);
        subjectWord.setText("cat");
        subjectWord.setType(WordType.SUBJECT);

        verbWord = new Word();
        verbWord.setId(2L);
        verbWord.setText("eats");
        verbWord.setType(WordType.VERB);
        verbWord.setGroup(group);

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

    @Test
    void getAllGroups_ReturnsListOfGroups() {
        List<WordGroup> groups = List.of(group);
        when(groupRepository.findAll()).thenReturn(groups);

        List<WordGroup> result = wordService.getAllGroups();

        assertEquals(1, result.size());
        assertEquals(groups, result);
        verify(groupRepository).findAll();
    }

    @Test
    void createGroup_WithValidRequest_CreatesAndReturnsGroup() {
        GroupRequest request = new GroupRequest();
        request.setName("new group");
        request.setDescription("desc");

        WordGroup saved = new WordGroup("new group", "desc");
        saved.setId(10L);

        when(groupRepository.save(any(WordGroup.class))).thenReturn(saved);

        WordGroup result = wordService.createGroup(request);

        assertNotNull(result);
        assertEquals(10L, result.getId());
        assertEquals("new group", result.getName());
        assertEquals("desc", result.getDescription());

        verify(groupRepository).save(argThat(g ->
                g.getName().equals("new group") &&
                        g.getDescription().equals("desc")
        ));
    }

    @Test
    void updateGroup_WithValidId_UpdatesAndReturnsGroup() {
        Long id = 1L;

        GroupRequest request = new GroupRequest();
        request.setName("updated");
        request.setDescription("updated desc");

        when(groupRepository.findById(id)).thenReturn(Optional.of(group));

        WordGroup saved = new WordGroup("updated", "updated desc");
        saved.setId(id);

        when(groupRepository.save(any(WordGroup.class))).thenReturn(saved);

        WordGroup result = wordService.updateGroup(id, request);

        assertEquals(id, result.getId());
        assertEquals("updated", result.getName());
        assertEquals("updated desc", result.getDescription());

        verify(groupRepository).findById(id);
        verify(groupRepository).save(argThat(g ->
                g.getName().equals("updated") &&
                        g.getDescription().equals("updated desc")
        ));
    }

    @Test
    void updateGroup_WithNonExistentId_ThrowsNoSuchElementException() {
        Long id = 999L;
        GroupRequest request = new GroupRequest();
        request.setName("x");
        request.setDescription("y");

        when(groupRepository.findById(id)).thenReturn(Optional.empty());

        NoSuchElementException ex = assertThrows(
                NoSuchElementException.class,
                () -> wordService.updateGroup(id, request)
        );

        assertTrue(ex.getMessage().contains("Group not found with id: " + id));

        verify(groupRepository).findById(id);
        verify(groupRepository, never()).save(any());
    }

    @Test
    void deleteGroup_WhenUnused_DeletesSuccessfully() {
        Long id = 1L;

        when(groupRepository.findById(id)).thenReturn(Optional.of(group));
        when(wordRepository.countByGroup(group)).thenReturn(0L);

        wordService.deleteGroup(id);

        verify(groupRepository).findById(id);
        verify(wordRepository).countByGroup(group);
        verify(groupRepository).delete(group);
    }

    @Test
    void deleteGroup_WhenInUse_ThrowsIllegalStateException() {
        Long id = 1L;

        when(groupRepository.findById(id)).thenReturn(Optional.of(group));
        when(wordRepository.countByGroup(group)).thenReturn(3L);

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> wordService.deleteGroup(id)
        );

        assertTrue(ex.getMessage().contains("Cannot delete group that is in use"));

        verify(wordRepository).countByGroup(group);
        verify(groupRepository, never()).delete(any());
    }

    @Test
    void deleteGroup_WithNonExistentId_ThrowsNoSuchElementException() {
        Long id = 999L;
        when(groupRepository.findById(id)).thenReturn(Optional.empty());

        NoSuchElementException ex = assertThrows(
                NoSuchElementException.class,
                () -> wordService.deleteGroup(id)
        );

        assertTrue(ex.getMessage().contains("Group not found with id: " + id));

        verify(groupRepository).findById(id);
        verify(wordRepository, never()).countByGroup(any());
        verify(groupRepository, never()).delete(any());
    }
}
