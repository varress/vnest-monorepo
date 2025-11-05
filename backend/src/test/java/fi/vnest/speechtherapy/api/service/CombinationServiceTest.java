package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.dto.*;
import fi.vnest.speechtherapy.api.model.AllowedCombination;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.repository.AllowedCombinationRepository;
import fi.vnest.speechtherapy.api.repository.WordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CombinationServiceTest {

    @Mock
    private AllowedCombinationRepository combinationRepository;

    @Mock
    private WordRepository wordRepository;

    @InjectMocks
    private CombinationService combinationService;

    private Word subjectWord;
    private Word verbWord;
    private Word objectWord;
    private AllowedCombination allowedCombination;

    @BeforeEach
    void setUp() {
        subjectWord = new Word();
        subjectWord.setId(1L);
        subjectWord.setText("cat");
        subjectWord.setType(WordType.valueOf("SUBJECT"));

        verbWord = new Word();
        verbWord.setId(2L);
        verbWord.setText("eats");
        verbWord.setType(WordType.valueOf("VERB"));

        objectWord = new Word();
        objectWord.setId(3L);
        objectWord.setText("fish");
        objectWord.setType(WordType.valueOf("OBJECT"));

        allowedCombination = new AllowedCombination(subjectWord, verbWord, objectWord);
        allowedCombination.setId(1L);
    }

    @Test
    void findAll_WithoutVerbId_ReturnsAllCombinations() {
        List<AllowedCombination> expected = List.of(allowedCombination);
        when(combinationRepository.findAll()).thenReturn(expected);

        List<AllowedCombination> result = combinationService.findAll(null);

        assertEquals(expected, result);
        verify(combinationRepository).findAll();
        verify(combinationRepository, never()).findByVerbId(anyLong());
    }

    @Test
    void findAll_WithVerbId_ReturnsFilteredCombinations() {
        Long verbId = 2L;
        List<AllowedCombination> expected = List.of(allowedCombination);
        when(combinationRepository.findByVerbId(verbId)).thenReturn(expected);

        List<AllowedCombination> result = combinationService.findAll(verbId);

        assertEquals(expected, result);
        verify(combinationRepository).findByVerbId(verbId);
        verify(combinationRepository, never()).findAll();
    }

    // ========== createCombination Tests ==========

    @Test
    void createCombination_WithValidRequest_CreatesAndReturnsCombination() {
        CombinationRequest request = new CombinationRequest();
        request.setSubjectId(1L);
        request.setVerbId(2L);
        request.setObjectId(3L);

        when(wordRepository.findById(1L)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findById(2L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findById(3L)).thenReturn(Optional.of(objectWord));
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(1L, 2L, 3L))
                .thenReturn(Optional.empty());
        when(combinationRepository.save(any(AllowedCombination.class)))
                .thenReturn(allowedCombination);

        AllowedCombination result = combinationService.createCombination(request);

        assertNotNull(result);
        assertEquals(subjectWord, result.getSubject());
        assertEquals(verbWord, result.getVerb());
        assertEquals(objectWord, result.getObject());
        verify(combinationRepository).save(any(AllowedCombination.class));
    }

    @Test
    void createCombination_WithInvalidSubjectId_ThrowsNoSuchElementException() {
        CombinationRequest request = new CombinationRequest();
        request.setSubjectId(999L);
        request.setVerbId(2L);
        request.setObjectId(3L);

        when(wordRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> combinationService.createCombination(request));

        assertTrue(exception.getMessage().contains("Subject word not found"));
        verify(combinationRepository, never()).save(any());
    }

    @Test
    void createCombination_WithInvalidVerbId_ThrowsNoSuchElementException() {
        CombinationRequest request = new CombinationRequest();
        request.setSubjectId(1L);
        request.setVerbId(999L);
        request.setObjectId(3L);

        when(wordRepository.findById(1L)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> combinationService.createCombination(request));

        assertTrue(exception.getMessage().contains("Verb word not found"));
        verify(combinationRepository, never()).save(any());
    }

    @Test
    void createCombination_WithInvalidObjectId_ThrowsNoSuchElementException() {
        CombinationRequest request = new CombinationRequest();
        request.setSubjectId(1L);
        request.setVerbId(2L);
        request.setObjectId(999L);

        when(wordRepository.findById(1L)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findById(2L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> combinationService.createCombination(request));

        assertTrue(exception.getMessage().contains("Object word not found"));
        verify(combinationRepository, never()).save(any());
    }

    @Test
    void createCombination_WithExistingCombination_ThrowsIllegalArgumentException() {
        CombinationRequest request = new CombinationRequest();
        request.setSubjectId(1L);
        request.setVerbId(2L);
        request.setObjectId(3L);

        when(wordRepository.findById(1L)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findById(2L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findById(3L)).thenReturn(Optional.of(objectWord));
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(1L, 2L, 3L))
                .thenReturn(Optional.of(allowedCombination));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> combinationService.createCombination(request));

        assertTrue(exception.getMessage().contains("Combination already exists"));
        verify(combinationRepository, never()).save(any());
    }

    // ========== createCombinationsBatch Tests ==========

    @Test
    void createCombinationsBatch_WithValidRequest_CreatesMultipleCombinations() {
        CombinationBatchRequest batchRequest = new CombinationBatchRequest();
        batchRequest.setVerbId(2L);
        batchRequest.setSubjectIds(List.of(1L, 4L));
        batchRequest.setObjectIds(List.of(3L, 5L));

        Word subject2 = new Word();
        subject2.setId(4L);
        subject2.setText("dog");

        Word object2 = new Word();
        object2.setId(5L);
        object2.setText("bone");

        when(wordRepository.findById(2L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findAllById(anyList()))
                .thenReturn(List.of(subjectWord, objectWord, subject2, object2));
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());
        when(combinationRepository.saveAll(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<AllowedCombination> result = combinationService.createCombinationsBatch(batchRequest);

        assertEquals(4, result.size()); // 2 subjects x 2 objects = 4 combinations
        verify(combinationRepository).saveAll(anyList());
    }

    @Test
    void createCombinationsBatch_WithInvalidVerbId_ThrowsNoSuchElementException() {
        CombinationBatchRequest batchRequest = new CombinationBatchRequest();
        batchRequest.setVerbId(999L);
        batchRequest.setSubjectIds(List.of(1L));
        batchRequest.setObjectIds(List.of(3L));

        when(wordRepository.findById(999L)).thenReturn(Optional.empty());

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> combinationService.createCombinationsBatch(batchRequest));

        assertTrue(exception.getMessage().contains("Verb word not found"));
        verify(combinationRepository, never()).saveAll(any());
    }

    @Test
    void createCombinationsBatch_SkipsExistingCombinations() {
        CombinationBatchRequest batchRequest = new CombinationBatchRequest();
        batchRequest.setVerbId(2L);
        batchRequest.setSubjectIds(List.of(1L));
        batchRequest.setObjectIds(List.of(3L));

        when(wordRepository.findById(2L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findAllById(anyList()))
                .thenReturn(List.of(subjectWord, objectWord));
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(1L, 2L, 3L))
                .thenReturn(Optional.of(allowedCombination));
        when(combinationRepository.saveAll(anyList()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        List<AllowedCombination> result = combinationService.createCombinationsBatch(batchRequest);

        assertEquals(0, result.size());
        //verify(combinationRepository).saveAll(argThat(List::isEmpty));
    }

    // ========== deleteCombination Tests ==========

    @Test
    void deleteCombination_WithExistingId_DeletesCombination() {
        Long combinationId = 1L;
        when(combinationRepository.existsById(combinationId)).thenReturn(true);

        combinationService.deleteCombination(combinationId);

        verify(combinationRepository).deleteById(combinationId);
    }

    @Test
    void deleteCombination_WithNonExistingId_ThrowsNoSuchElementException() {
        Long combinationId = 999L;
        when(combinationRepository.existsById(combinationId)).thenReturn(false);

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> combinationService.deleteCombination(combinationId));

        assertTrue(exception.getMessage().contains("Allowed combination not found"));
        verify(combinationRepository, never()).deleteById(any());
    }

    // ========== deleteCombinationsByVerb Tests ==========

    @Test
    void deleteCombinationsByVerb_WithExistingVerbId_DeletesCombinations() {
        Long verbId = 2L;
        when(wordRepository.existsById(verbId)).thenReturn(true);

        combinationService.deleteCombinationsByVerb(verbId);

        verify(combinationRepository).deleteAllByVerbId(verbId);
    }

    @Test
    void deleteCombinationsByVerb_WithNonExistingVerbId_ThrowsNoSuchElementException() {
        Long verbId = 999L;
        when(wordRepository.existsById(verbId)).thenReturn(false);

        NoSuchElementException exception = assertThrows(NoSuchElementException.class,
                () -> combinationService.deleteCombinationsByVerb(verbId));

        assertTrue(exception.getMessage().contains("Verb word not found"));
        verify(combinationRepository, never()).deleteAllByVerbId(any());
    }

    @Test
    void getExerciseSuggestions_ReturnsCorrectStructure() {
        when(combinationRepository.findAll()).thenReturn(List.of(allowedCombination));
        when(wordRepository.findAllById(Set.of(1L))).thenReturn(List.of(subjectWord));
        when(wordRepository.findAllById(Set.of(3L))).thenReturn(List.of(objectWord));

        SuggestionResponse result = combinationService.getExerciseSuggestions(null);

        assertNotNull(result);
        assertEquals(1, result.verbs().size());
        assertEquals(1, result.subjects().size());
        assertEquals(1, result.objects().size());

        VerbSuggestion verbSuggestion = result.verbs().get(0);
        assertEquals(2L, verbSuggestion.id());
        assertEquals("eats", verbSuggestion.text());
        assertTrue(verbSuggestion.compatibleSubjectIds().contains(1L));
        assertTrue(verbSuggestion.compatibleObjectIds().contains(3L));
    }

    @Test
    void getExerciseSuggestions_WithMultipleCombinations_GroupsCorrectly() {
        Word subject2 = new Word();
        subject2.setId(4L);
        subject2.setText("dog");

        AllowedCombination otherCombination = new AllowedCombination(subject2, verbWord, objectWord);

        when(combinationRepository.findAll()).thenReturn(List.of(allowedCombination, otherCombination));

        // Mock separate calls for subjects and objects
        when(wordRepository.findAllById(argThat(ids -> {
            if (ids == null) return false;
            List<Long> idList = new ArrayList<>();
            ids.forEach(idList::add);
            return idList.size() == 2 && idList.contains(1L) && idList.contains(4L);
        }))).thenReturn(List.of(subjectWord, subject2));

        when(wordRepository.findAllById(argThat(ids -> {
            if (ids == null) return false;
            List<Long> idList = new ArrayList<>();
            ids.forEach(idList::add);
            return idList.size() == 1 && idList.contains(3L);
        }))).thenReturn(List.of(objectWord));

        SuggestionResponse result = combinationService.getExerciseSuggestions(null);

        assertNotNull(result);
        assertEquals(1, result.verbs().size());
        assertEquals(2, result.subjects().size());
        assertEquals(1, result.objects().size());

        VerbSuggestion verbSuggestion = result.verbs().get(0);
        assertEquals(2, verbSuggestion.compatibleSubjectIds().size());
        assertTrue(verbSuggestion.compatibleSubjectIds().contains(1L));
        assertTrue(verbSuggestion.compatibleSubjectIds().contains(4L));
    }


    @Test
    void validateCombination_WithValidCombination_ReturnsSuccessResponse() {
        ValidationRequest request = new ValidationRequest(1L, 2L, 3L);
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(1L, 2L, 3L))
                .thenReturn(Optional.of(allowedCombination));

        ValidationResponse result = combinationService.validateCombination(request);

        assertTrue(result.valid());
        assertEquals("cat eats fish", result.sentence());
        assertEquals("Oikein! Hyvä lause.", result.message());
    }

    @Test
    void validateCombination_WithInvalidCombination_ReturnsFailureResponse() {
        ValidationRequest request = new ValidationRequest(1L, 2L, 3L);
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(1L, 2L, 3L))
                .thenReturn(Optional.empty());
        when(wordRepository.findById(1L)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findById(2L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findById(3L)).thenReturn(Optional.of(objectWord));

        ValidationResponse result = combinationService.validateCombination(request);

        assertFalse(result.valid());
        assertEquals("cat eats fish", result.sentence());
        assertEquals("Väärin. Tuo lause ei ole sallittu.", result.message());
    }

    @Test
    void validateCombination_WithMissingWords_HandlesGracefully() {
        ValidationRequest request = new ValidationRequest(999L, 2L, 3L);
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(999L, 2L, 3L))
                .thenReturn(Optional.empty());
        when(wordRepository.findById(999L)).thenReturn(Optional.empty());
        when(wordRepository.findById(2L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findById(3L)).thenReturn(Optional.of(objectWord));

        ValidationResponse result = combinationService.validateCombination(request);

        assertFalse(result.valid());
        assertTrue(result.sentence().contains("[Unknown Subject]"));
        assertEquals("Väärin. Tuo lause ei ole sallittu.", result.message());
    }
}
