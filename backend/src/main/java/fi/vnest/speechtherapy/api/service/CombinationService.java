package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.dto.*;
import fi.vnest.speechtherapy.api.model.AllowedCombination;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.repository.AllowedCombinationRepository;
import fi.vnest.speechtherapy.api.repository.WordRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CombinationService {

    private static final String CORRECT_MESSAGE = "Oikein! Hyvä lause.";
    private static final String INCORRECT_MESSAGE = "Väärin. Tuo lause ei ole sallittu.";
    private static final String UNKNOWN_SUBJECT = "[Unknown Subject]";
    private static final String UNKNOWN_VERB = "[Unknown Verb]";
    private static final String UNKNOWN_OBJECT = "[Unknown Object]";

    private final AllowedCombinationRepository combinationRepository;
    private final WordRepository wordRepository;

    @Autowired
    public CombinationService(AllowedCombinationRepository combinationRepository, WordRepository wordRepository) {
        this.combinationRepository = combinationRepository;
        this.wordRepository = wordRepository;
    }

    /**
     * Retrieves all combinations, optionally filtered by verb ID.
     */
    public List<AllowedCombination> findAll(Long verbId) {
        return verbId != null
                ? combinationRepository.findByVerbId(verbId)
                : combinationRepository.findAll();
    }

    /**
     * Creates a single new combination.
     * Throws NoSuchElementException if any word ID is invalid.
     */
    @Transactional
    public AllowedCombination createCombination(CombinationRequest request) {
        Word subject = findWordOrThrow(request.getSubjectId(), "Subject");
        Word verb = findWordOrThrow(request.getVerbId(), "Verb");
        Word object = findWordOrThrow(request.getObjectId(), "Object");

        validateCombinationDoesNotExist(request, subject, verb, object);

        return combinationRepository.save(new AllowedCombination(subject, verb, object));
    }

    /**
     * Creates a batch of combinations (Verb x Subjects x Objects).
     * Skips combinations that already exist and counts only created ones.
     */
    @Transactional
    public List<AllowedCombination> createCombinationsBatch(CombinationBatchRequest batchRequest) {
        Word verb = findWordOrThrow(batchRequest.getVerbId(), "Verb");
        Map<Long, Word> wordMap = fetchWordsAsMap(batchRequest.getSubjectIds(), batchRequest.getObjectIds());

        List<AllowedCombination> combinationsToSave = buildCombinationsToSave(
                verb,
                batchRequest.getSubjectIds(),
                batchRequest.getObjectIds(),
                wordMap
        );

        return combinationRepository.saveAll(combinationsToSave);
    }

    /**
     * Deletes a specific combination by ID.
     */
    @Transactional
    public void deleteCombination(Long id) {
        if (!combinationRepository.existsById(id)) {
            throw new NoSuchElementException("Allowed combination not found with ID: " + id);
        }

        combinationRepository.deleteById(id);
    }

    /**
     * Deletes all combinations associated with a specific verb ID.
     * Throws NoSuchElementException if the verb ID doesn't exist.
     */
    @Transactional
    public void deleteCombinationsByVerb(Long verbId) {
        if (!wordRepository.existsById(verbId)) {
            throw new NoSuchElementException("Verb word not found with ID: " + verbId);
        }

        combinationRepository.deleteAllByVerbId(verbId);
    }

    /**
     * Retrieves data structure for generating sentence building exercises.
     *
     * @param limit Maximum number of verbs to include (currently unused but supports future feature).
     */
    public SuggestionResponse getExerciseSuggestions(Integer limit) {
        List<AllowedCombination> allCombinations = combinationRepository.findAll();

        CombinationGrouping grouping = groupCombinationsByVerb(allCombinations);
        List<VerbSuggestion> verbSuggestions = buildVerbSuggestions(grouping);

        List<WordReference> subjectRefs = fetchWordReferences(grouping.allSubjectIds);
        List<WordReference> objectRefs = fetchWordReferences(grouping.allObjectIds);

        return new SuggestionResponse(verbSuggestions, subjectRefs, objectRefs);
    }

    /**
     * Validates if a specific S-V-O combination exists.
     */
    public ValidationResponse validateCombination(ValidationRequest request) {
        Optional<AllowedCombination> combination = combinationRepository.findBySubjectIdAndVerbIdAndObjectId(
                request.subjectId(),
                request.verbId(),
                request.objectId()
        );

        return combination.map(this::buildValidResponse).orElseGet(() -> buildInvalidResponse(request));
    }

    private Word findWordOrThrow(Long wordId, String wordType) {
        return wordRepository.findById(wordId)
                .orElseThrow(() -> new NoSuchElementException(
                        wordType + " word not found with ID: " + wordId
                ));
    }

    private void validateCombinationDoesNotExist(CombinationRequest request, Word subject, Word verb, Word object) {
        if (combinationRepository.findBySubjectIdAndVerbIdAndObjectId(
                request.getSubjectId(), request.getVerbId(), request.getObjectId()).isPresent()) {
            throw new IllegalArgumentException(String.format(
                    "Combination already exists: %s %s %s",
                    subject.getText(), verb.getText(), object.getText()
            ));
        }
    }

    private Map<Long, Word> fetchWordsAsMap(List<Long> subjectIds, List<Long> objectIds) {
        List<Long> allIds = new ArrayList<>(subjectIds);
        allIds.addAll(objectIds);

        return wordRepository.findAllById(allIds)
                .stream()
                .collect(Collectors.toMap(Word::getId, word -> word));
    }

    private List<AllowedCombination> buildCombinationsToSave(
            Word verb,
            List<Long> subjectIds,
            List<Long> objectIds,
            Map<Long, Word> wordMap) {

        List<AllowedCombination> combinationsToSave = new ArrayList<>();

        for (Long subjectId : subjectIds) {
            Word subject = wordMap.get(subjectId);
            if (subject == null) continue;

            for (Long objectId : objectIds) {
                Word object = wordMap.get(objectId);
                if (object == null) continue;

                if (isNewCombination(subjectId, verb.getId(), objectId)) {
                    combinationsToSave.add(new AllowedCombination(subject, verb, object));
                }
            }
        }

        return combinationsToSave;
    }

    private boolean isNewCombination(Long subjectId, Long verbId, Long objectId) {
        return combinationRepository.findBySubjectIdAndVerbIdAndObjectId(subjectId, verbId, objectId).isEmpty();
    }

    private CombinationGrouping groupCombinationsByVerb(List<AllowedCombination> combinations) {
        CombinationGrouping grouping = new CombinationGrouping();

        for (AllowedCombination combo : combinations) {
            Long verbId = combo.getVerb().getId();
            Long subjectId = combo.getSubject().getId();
            Long objectId = combo.getObject().getId();

            grouping.verbWords.put(verbId, combo.getVerb());
            grouping.verbToSubjectIds.computeIfAbsent(verbId, k -> new HashSet<>()).add(subjectId);
            grouping.verbToObjectIds.computeIfAbsent(verbId, k -> new HashSet<>()).add(objectId);
            grouping.allSubjectIds.add(subjectId);
            grouping.allObjectIds.add(objectId);
        }

        return grouping;
    }

    private List<VerbSuggestion> buildVerbSuggestions(CombinationGrouping grouping) {
        return grouping.verbWords.values().stream()
                .map(verb -> new VerbSuggestion(
                        verb.getId(),
                        verb.getText(),
                        grouping.verbToSubjectIds.getOrDefault(verb.getId(), Collections.emptySet()).stream().toList(),
                        grouping.verbToObjectIds.getOrDefault(verb.getId(), Collections.emptySet()).stream().toList()
                ))
                .collect(Collectors.toList());
    }

    private List<WordReference> fetchWordReferences(Set<Long> wordIds) {
        return wordRepository.findAllById(wordIds).stream()
                .map(WordReference::fromEntity)
                .collect(Collectors.toList());
    }

    private ValidationResponse buildValidResponse(AllowedCombination combo) {
        String sentence = formatSentence(
                combo.getSubject().getText(),
                combo.getVerb().getText(),
                combo.getObject().getText()
        );
        return new ValidationResponse(true, sentence, CORRECT_MESSAGE);
    }

    private ValidationResponse buildInvalidResponse(ValidationRequest request) {
        Word subject = wordRepository.findById(request.subjectId()).orElse(null);
        Word verb = wordRepository.findById(request.verbId()).orElse(null);
        Word object = wordRepository.findById(request.objectId()).orElse(null);

        String sentence = formatSentence(
                subject != null ? subject.getText() : UNKNOWN_SUBJECT,
                verb != null ? verb.getText() : UNKNOWN_VERB,
                object != null ? object.getText() : UNKNOWN_OBJECT
        );

        return new ValidationResponse(false, sentence, INCORRECT_MESSAGE);
    }

    private String formatSentence(String subject, String verb, String object) {
        return String.format("%s %s %s", subject, verb, object);
    }

    private static class CombinationGrouping {
        Map<Long, Set<Long>> verbToSubjectIds = new HashMap<>();
        Map<Long, Set<Long>> verbToObjectIds = new HashMap<>();
        Map<Long, Word> verbWords = new HashMap<>();
        Set<Long> allSubjectIds = new HashSet<>();
        Set<Long> allObjectIds = new HashSet<>();
    }
}