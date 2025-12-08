package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.dto.CombinationRequest;
import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.repository.AllowedCombinationRepository;
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
    private fi.vnest.speechtherapy.api.service.CombinationService combinationService;

    @Value("${app.data.csv.path:data/initial_combinations.csv}")
    private String csvPath;

    @Value("${app.data.csv.enabled:true}")
    private boolean csvEnabled;

    private Map<String, Word> wordCache = new HashMap<>();

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
        String[] parts = line.split(",");

        if (parts.length != 3) {
            throw new IllegalArgumentException(
                    "Invalid CSV format. Expected 3 columns, found " + parts.length);
        }

        String subjectText = parts[0].trim();
        String verbText = parts[1].trim();
        String objectText = parts[2].trim();

        if (subjectText.isEmpty() || verbText.isEmpty() || objectText.isEmpty()) {
            throw new IllegalArgumentException("Empty word found in CSV");
        }

        // Get or create words
        Word subject = getOrCreateWord(subjectText, WordType.SUBJECT);
        Word verb = getOrCreateWord(verbText, WordType.VERB);
        Word object = getOrCreateWord(objectText, WordType.OBJECT);

        // Create combination
        createCombinationIfNotExists(subject, verb, object);
    }

    private Word getOrCreateWord(String text, WordType type) {
        String cacheKey = type + ":" + text;

        // Check cache first
        if (wordCache.containsKey(cacheKey)) {
            return wordCache.get(cacheKey);
        }

        // Check if word exists in database
        Word word = wordRepository.findByTextAndType(text, type)
                .orElseGet(() -> {
                    // Create new word
                    Word newWord = new Word(text, type);
                    Word saved = wordRepository.save(newWord);
                    logger.debug("Created new {} word: {}", type, text);
                    return saved;
                });

        // Cache the word
        wordCache.put(cacheKey, word);
        return word;
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
