package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.dto.CombinationRequest;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordGroup;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.repository.AllowedCombinationRepository;
import fi.vnest.speechtherapy.api.repository.GroupRepository;
import fi.vnest.speechtherapy.api.repository.WordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(2)
public class DataInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private AllowedCombinationRepository combinationRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private fi.vnest.speechtherapy.api.service.CombinationService combinationService;

    @Value("${app.data.csv.path:data/vnest_full.csv}")
    private String csvPath;

    @Value("${app.data.csv.enabled:true}")
    private boolean csvEnabled;

    private Map<String, Word> wordCache = new HashMap<>();
    private Map<String, WordGroup> groupCache = new HashMap<>();

    @Override
    public void run(ApplicationArguments args) {
        if (!csvEnabled) {
            logger.info("CSV data import is disabled");
            return;
        }

        // Only import if database is empty
        if (combinationRepository.count() > 0) {
            logger.info("Database already contains combinations. Skipping CSV import.");
            return;
        }

        logger.info("Starting CSV data import from: {}", csvPath);

        try {
            importCsvData();
            logger.info("CSV data import completed successfully!");
            logger.info("Total words: {}, Total combinations: {}",
                    wordRepository.count(),
                    combinationRepository.count());
        } catch (Exception e) {
            logger.error("Failed to import CSV data", e);
        }
    }

    private void importCsvData() throws Exception {
        ClassPathResource resource = new ClassPathResource(csvPath);

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            boolean isFirstLine = true;
            int lineNumber = 0;
            int successCount = 0;
            int errorCount = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                // Skip header
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                // Skip empty lines
                if (line.trim().isEmpty()) {
                    continue;
                }

                try {
                    processLine(line, lineNumber);
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    logger.error("Error processing line {}: {}", lineNumber, line, e);
                }
            }

            logger.info("Import summary: {} successful, {} errors", successCount, errorCount);
        }
    }

    private void processLine(String line, int lineNumber) {
        String[] parts = line.split(";");

        if (parts.length != 4) {
            throw new IllegalArgumentException(
                    "Invalid CSV format. Expected 4 columns, found " + parts.length);
        }

        String sectionText = parts[0].trim();
        String subjectText = parts[1].trim();
        String verbText = parts[2].trim();
        String objectText = parts[3].trim();

        if (sectionText.isEmpty() || subjectText.isEmpty() || verbText.isEmpty() || objectText.isEmpty()) {
            throw new IllegalArgumentException("Empty word found in CSV");
        }

        // Get or create group
        WordGroup group = getOrCreateGroup(sectionText);

        // Get or create words
        Word subject = getOrCreateWord(subjectText, WordType.SUBJECT, null);
        Word verb = getOrCreateWord(verbText, WordType.VERB, group);
        Word object = getOrCreateWord(objectText, WordType.OBJECT, null);

        // Create combination
        createCombinationIfNotExists(subject, verb, object);
    }

    private Word getOrCreateWord(String text, WordType type, WordGroup group) {
        String cacheKey = type + ":" + text;

        // Check cache first
        if (wordCache.containsKey(cacheKey)) {
            Word cachedWord = wordCache.get(cacheKey);
            // Update group if needed for VERB type
            if (type == WordType.VERB && group != null && !group.equals(cachedWord.getGroup())) {
                cachedWord.setGroup(group);
                cachedWord = wordRepository.save(cachedWord);
                wordCache.put(cacheKey, cachedWord);
            }
            return cachedWord;
        }

        // Check if word exists in database
        Word word = wordRepository.findByTextAndType(text, type)
                .orElseGet(() -> {
                    // Create new word
                    Word newWord = new Word(text, type);
                    if (type == WordType.VERB && group != null) {
                        newWord.setGroup(group);
                    }
                    Word saved = wordRepository.save(newWord);
                    logger.debug("Created new {} word: {} (group: {})", type, text,
                            group != null ? group.getName() : "none");
                    return saved;
                });

        // Update group if needed and word existed in database
        if (type == WordType.VERB && group != null && !group.equals(word.getGroup())) {
            word.setGroup(group);
            word = wordRepository.save(word);
        }

        // Cache the word
        wordCache.put(cacheKey, word);
        return word;
    }

    private WordGroup getOrCreateGroup(String name) {
        // Check cache first
        if (groupCache.containsKey(name)) {
            return groupCache.get(name);
        }

        // Check if group exists in database
        WordGroup group = groupRepository.findByName(name)
                .orElseGet(() -> {
                    // Create new group
                    WordGroup newGroup = new WordGroup(name, "Section " + name);
                    WordGroup saved = groupRepository.save(newGroup);
                    logger.debug("Created new group: {}", name);
                    return saved;
                });

        // Cache the group
        groupCache.put(name, group);
        return group;
    }

    private void createCombinationIfNotExists(Word subject, Word verb, Word object) {
        // Check if combination already exists
        boolean exists = combinationRepository.findBySubjectIdAndVerbIdAndObjectId(
                subject.getId(), verb.getId(), object.getId()
        ).isPresent();

        if (!exists) {
            CombinationRequest request = new CombinationRequest();
            request.setSubjectId(subject.getId());
            request.setVerbId(verb.getId());
            request.setObjectId(object.getId());

            combinationService.createCombination(request);
            logger.debug("Created combination: {} {} {}",
                    subject.getText(), verb.getText(), object.getText());
        }
    }
}
