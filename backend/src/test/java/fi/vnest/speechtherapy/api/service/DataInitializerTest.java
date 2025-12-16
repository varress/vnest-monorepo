package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.dto.CombinationRequest;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordGroup;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.repository.AllowedCombinationRepository;
import fi.vnest.speechtherapy.api.repository.GroupRepository;
import fi.vnest.speechtherapy.api.repository.WordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private WordRepository wordRepository;

    @Mock
    private AllowedCombinationRepository combinationRepository;

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private CombinationService combinationService;

    @Mock
    private ApplicationArguments applicationArguments;

    @InjectMocks
    private DataInitializer dataInitializer;

    private WordGroup testGroup;
    private Word subjectWord;
    private Word verbWord;
    private Word objectWord;

    @BeforeEach
    void setUp() {
        testGroup = new WordGroup("1", "Section 1");
        testGroup.setId(1L);

        subjectWord = new Word("koira", WordType.SUBJECT);
        subjectWord.setId(1L);

        verbWord = new Word("SAADA", WordType.VERB);
        verbWord.setId(2L);
        verbWord.setGroup(testGroup);

        objectWord = new Word("luu", WordType.OBJECT);
        objectWord.setId(3L);
    }

    @Test
    void run_WhenCsvDisabled_ShouldSkipImport() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", false);

        dataInitializer.run(applicationArguments);

        verify(combinationRepository, never()).count();
        verify(wordRepository, never()).save(any());
        verify(groupRepository, never()).save(any());
    }

    @Test
    void run_WhenDatabaseAlreadyHasData_ShouldSkipImport() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        when(combinationRepository.count()).thenReturn(10L);

        dataInitializer.run(applicationArguments);

        verify(combinationRepository).count();
        verify(wordRepository, never()).save(any());
        verify(groupRepository, never()).save(any());
    }

    @Test
    void run_WithValidCsvData_ShouldImportSuccessfully() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/test_import.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock group creation
        when(groupRepository.findByName("1")).thenReturn(Optional.empty());
        when(groupRepository.save(any(WordGroup.class))).thenReturn(testGroup);

        // Mock word creation
        when(wordRepository.findByTextAndType("koira", WordType.SUBJECT)).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndType("luu", WordType.OBJECT)).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndTypeAndGroupId("SAADA", WordType.VERB, 1L)).thenReturn(Optional.empty());

        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.SUBJECT))).thenReturn(subjectWord);
        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.VERB))).thenReturn(verbWord);
        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.OBJECT))).thenReturn(objectWord);

        // Mock combination check
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        dataInitializer.run(applicationArguments);

        verify(combinationRepository, atLeastOnce()).count();
        verify(groupRepository, atLeastOnce()).save(any(WordGroup.class));
        verify(wordRepository, atLeastOnce()).save(any(Word.class));
        verify(combinationService, atLeastOnce()).createCombination(any(CombinationRequest.class));
    }

    @Test
    void run_WithNonexistentCsvFile_ShouldHandleError() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "nonexistent/file.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Should not throw exception, just log error
        assertDoesNotThrow(() -> dataInitializer.run(applicationArguments));

        verify(combinationRepository).count();
        verify(wordRepository, never()).save(any());
    }

    @Test
    void run_WithEmptyCsvFile_ShouldCompleteWithoutErrors() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/empty.csv");
        when(combinationRepository.count()).thenReturn(0L);

        dataInitializer.run(applicationArguments);

        verify(combinationRepository, atLeastOnce()).count();
        verify(wordRepository, never()).save(any());
        verify(combinationService, never()).createCombination(any());
    }

    @Test
    void run_WithInvalidCsvFormat_ShouldSkipInvalidLines() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/invalid_format.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Should not throw exception, just log errors for invalid lines
        assertDoesNotThrow(() -> dataInitializer.run(applicationArguments));

        verify(combinationRepository, atLeastOnce()).count();
    }

    @Test
    void run_WithEmptyFields_ShouldSkipInvalidLines() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/empty_fields.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Should not throw exception, just log errors for lines with empty fields
        assertDoesNotThrow(() -> dataInitializer.run(applicationArguments));

        verify(combinationRepository, atLeastOnce()).count();
    }

    @Test
    void run_WithMultipleLinesUsingSameWords_ShouldReuseWordsFromCache() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/duplicate_words.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock group creation
        when(groupRepository.findByName("1")).thenReturn(Optional.empty());
        when(groupRepository.save(any(WordGroup.class))).thenReturn(testGroup);

        // Mock word creation - should only be called once per unique word
        when(wordRepository.findByTextAndType("koira", WordType.SUBJECT)).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndType("luu", WordType.OBJECT)).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndType("lahja", WordType.OBJECT)).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndTypeAndGroupId("SAADA", WordType.VERB, 1L)).thenReturn(Optional.empty());

        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.SUBJECT && w.getText().equals("koira"))))
                .thenReturn(subjectWord);
        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.VERB && w.getText().equals("SAADA"))))
                .thenReturn(verbWord);
        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.OBJECT && w.getText().equals("luu"))))
                .thenReturn(objectWord);

        Word lahjaWord = new Word("lahja", WordType.OBJECT);
        lahjaWord.setId(4L);
        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.OBJECT && w.getText().equals("lahja"))))
                .thenReturn(lahjaWord);

        // Mock combination check
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        dataInitializer.run(applicationArguments);

        // Verify word repository save was called exactly once for "koira" (cached on subsequent uses)
        verify(wordRepository, times(1)).save(argThat(w ->
                w != null && w.getType() == WordType.SUBJECT && w.getText().equals("koira")));

        // Verify combinations were created
        verify(combinationService, atLeastOnce()).createCombination(any(CombinationRequest.class));
    }

    @Test
    void run_WhenGroupAlreadyExists_ShouldReuseExistingGroup() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/test_import.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock existing group
        when(groupRepository.findByName("1")).thenReturn(Optional.of(testGroup));

        // Mock word creation
        when(wordRepository.findByTextAndType(anyString(), any(WordType.class))).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndTypeAndGroupId(anyString(), eq(WordType.VERB), anyLong()))
                .thenReturn(Optional.empty());
        when(wordRepository.save(any(Word.class))).thenAnswer(invocation -> {
            Word word = invocation.getArgument(0);
            word.setId(1L);
            return word;
        });

        // Mock combination check
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        dataInitializer.run(applicationArguments);

        // Verify group was not created, only fetched
        verify(groupRepository, never()).save(any(WordGroup.class));
        verify(groupRepository, atLeastOnce()).findByName("1");
    }

    @Test
    void run_WhenWordAlreadyExists_ShouldReuseExistingWord() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/test_import.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock group
        when(groupRepository.findByName("1")).thenReturn(Optional.of(testGroup));

        // Mock existing words
        when(wordRepository.findByTextAndType("koira", WordType.SUBJECT)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findByTextAndTypeAndGroupId("SAADA", WordType.VERB, 1L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findByTextAndType("luu", WordType.OBJECT)).thenReturn(Optional.of(objectWord));

        // Mock combination check
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        dataInitializer.run(applicationArguments);

        // Verify words were not created, only fetched
        verify(wordRepository, never()).save(any(Word.class));
        verify(combinationService, atLeastOnce()).createCombination(any(CombinationRequest.class));
    }

    @Test
    void run_WhenCombinationAlreadyExists_ShouldNotCreateDuplicate() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/test_import.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock group and words
        when(groupRepository.findByName("1")).thenReturn(Optional.of(testGroup));
        when(wordRepository.findByTextAndType("koira", WordType.SUBJECT)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findByTextAndTypeAndGroupId("SAADA", WordType.VERB, 1L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findByTextAndType("luu", WordType.OBJECT)).thenReturn(Optional.of(objectWord));

        // Mock existing combination
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(
                subjectWord.getId(), verbWord.getId(), objectWord.getId()))
                .thenReturn(Optional.of(new fi.vnest.speechtherapy.api.model.AllowedCombination()));

        dataInitializer.run(applicationArguments);

        // Verify combination was not created
        verify(combinationService, never()).createCombination(any(CombinationRequest.class));
    }

    @Test
    void run_WithSameVerbInDifferentGroups_ShouldCreateSeparateVerbInstances() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/same_verb_different_groups.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock two different groups
        WordGroup group1 = new WordGroup("1", "Section 1");
        group1.setId(1L);
        WordGroup group2 = new WordGroup("2", "Section 2");
        group2.setId(2L);

        when(groupRepository.findByName("1")).thenReturn(Optional.empty());
        when(groupRepository.findByName("2")).thenReturn(Optional.empty());
        when(groupRepository.save(argThat(g -> g != null && g.getName().equals("1")))).thenReturn(group1);
        when(groupRepository.save(argThat(g -> g != null && g.getName().equals("2")))).thenReturn(group2);

        // Mock verb creation for different groups
        Word verb1 = new Word("SAADA", WordType.VERB);
        verb1.setId(1L);
        verb1.setGroup(group1);

        Word verb2 = new Word("SAADA", WordType.VERB);
        verb2.setId(2L);
        verb2.setGroup(group2);

        when(wordRepository.findByTextAndTypeAndGroupId("SAADA", WordType.VERB, 1L))
                .thenReturn(Optional.empty());
        when(wordRepository.findByTextAndTypeAndGroupId("SAADA", WordType.VERB, 2L))
                .thenReturn(Optional.empty());

        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.VERB && w.getGroup() != null && w.getGroup().getId().equals(1L))))
                .thenReturn(verb1);
        when(wordRepository.save(argThat(w -> w != null && w.getType() == WordType.VERB && w.getGroup() != null && w.getGroup().getId().equals(2L))))
                .thenReturn(verb2);

        // Mock other words
        when(wordRepository.findByTextAndType(anyString(), eq(WordType.SUBJECT))).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndType(anyString(), eq(WordType.OBJECT))).thenReturn(Optional.empty());
        when(wordRepository.save(argThat(w -> w != null && (w.getType() == WordType.SUBJECT || w.getType() == WordType.OBJECT))))
                .thenAnswer(invocation -> {
                    Word word = invocation.getArgument(0);
                    word.setId(System.currentTimeMillis());
                    return word;
                });

        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        dataInitializer.run(applicationArguments);

        // Verify two separate verb instances were created
        verify(wordRepository, times(1)).save(argThat(w ->
                w != null &&
                w.getType() == WordType.VERB &&
                w.getText().equals("SAADA") &&
                w.getGroup() != null &&
                w.getGroup().getId().equals(1L)));

        verify(wordRepository, times(1)).save(argThat(w ->
                w != null &&
                w.getType() == WordType.VERB &&
                w.getText().equals("SAADA") &&
                w.getGroup() != null &&
                w.getGroup().getId().equals(2L)));
    }

    @Test
    void run_WithCsvProcessingError_ShouldContinueProcessingOtherLines() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/mixed_valid_invalid.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock successful processing setup
        when(groupRepository.findByName(anyString())).thenReturn(Optional.of(testGroup));
        when(wordRepository.findByTextAndType(anyString(), any(WordType.class))).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndTypeAndGroupId(anyString(), any(WordType.class), anyLong()))
                .thenReturn(Optional.empty());
        when(wordRepository.save(any(Word.class))).thenAnswer(invocation -> {
            Word word = invocation.getArgument(0);
            word.setId(System.currentTimeMillis());
            return word;
        });
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        // Should complete without throwing exception
        assertDoesNotThrow(() -> dataInitializer.run(applicationArguments));
    }

    @Test
    void run_WithBlankLines_ShouldSkipBlankLines() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/with_blank_lines.csv");
        when(combinationRepository.count()).thenReturn(0L);

        when(groupRepository.findByName(anyString())).thenReturn(Optional.of(testGroup));
        when(wordRepository.findByTextAndType(anyString(), any(WordType.class))).thenReturn(Optional.empty());
        when(wordRepository.findByTextAndTypeAndGroupId(anyString(), any(WordType.class), anyLong()))
                .thenReturn(Optional.empty());
        when(wordRepository.save(any(Word.class))).thenAnswer(invocation -> {
            Word word = invocation.getArgument(0);
            word.setId(System.currentTimeMillis());
            return word;
        });
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        assertDoesNotThrow(() -> dataInitializer.run(applicationArguments));
    }

    @Test
    void run_VerifiesCombinationRequestContainsCorrectIds() {
        ReflectionTestUtils.setField(dataInitializer, "csvEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "csvPath", "test-data/test_import.csv");
        when(combinationRepository.count()).thenReturn(0L);

        // Mock group and words
        when(groupRepository.findByName("1")).thenReturn(Optional.of(testGroup));
        when(wordRepository.findByTextAndType("koira", WordType.SUBJECT)).thenReturn(Optional.of(subjectWord));
        when(wordRepository.findByTextAndTypeAndGroupId("SAADA", WordType.VERB, 1L)).thenReturn(Optional.of(verbWord));
        when(wordRepository.findByTextAndType("luu", WordType.OBJECT)).thenReturn(Optional.of(objectWord));
        when(combinationRepository.findBySubjectIdAndVerbIdAndObjectId(anyLong(), anyLong(), anyLong()))
                .thenReturn(Optional.empty());

        dataInitializer.run(applicationArguments);

        // Capture and verify the combination request
        ArgumentCaptor<CombinationRequest> requestCaptor = ArgumentCaptor.forClass(CombinationRequest.class);
        verify(combinationService, atLeastOnce()).createCombination(requestCaptor.capture());

        CombinationRequest capturedRequest = requestCaptor.getValue();
        assertEquals(subjectWord.getId(), capturedRequest.getSubjectId());
        assertEquals(verbWord.getId(), capturedRequest.getVerbId());
        assertEquals(objectWord.getId(), capturedRequest.getObjectId());
    }
}
