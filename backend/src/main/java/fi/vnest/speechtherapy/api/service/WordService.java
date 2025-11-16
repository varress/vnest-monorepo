package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.model.Word;
import fi.vnest.speechtherapy.api.model.WordGroup;
import fi.vnest.speechtherapy.api.model.WordType;
import fi.vnest.speechtherapy.api.repository.GroupRepository;
import fi.vnest.speechtherapy.api.repository.WordRepository;
import fi.vnest.speechtherapy.api.dto.WordRequest;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Business logic for managing Word entities.
 */
@Service
public class WordService {

    private final WordRepository wordRepository;
    private final GroupRepository groupRepository;

    @Autowired
    public WordService(WordRepository wordRepository, GroupRepository groupRepository) {
        this.wordRepository = wordRepository;
        this.groupRepository = groupRepository;
    }

    /**
     * Retrieves all words, optionally filtered by type.
     *
     * @param type The type to filter by (optional).
     * @return A list of Word entities.
     */
    public List<Word> findAll(WordType type) {
        if (type != null) {
            return wordRepository.findByType(type);
        }

        return wordRepository.findAll();
    }

    /**
     * Creates a new Word entity.
     *
     * @param request DTO containing word text and type.
     * @return The saved Word entity.
     */
    @Transactional
    public Word createWord(WordRequest request) {
        Word word = new Word(request.getText(), request.getType());
        return wordRepository.save(word);
    }

    /**
     * Updates an existing Word entity.
     *
     * @param id      The ID of the word to update.
     * @param request DTO containing new word text and type.
     * @return The updated Word entity.
     * @throws NoSuchElementException if the word or group is not found.
     */
    @Transactional
    public Word updateWord(Long id, WordRequest request) {
        Word word = wordRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Word not found with ID: " + id));

        word.setText(request.getText());
        word.setType(request.getType());

        WordGroup group = groupRepository.findById(request.getGroupId()).orElseThrow(() -> new NoSuchElementException("Group not found with ID: " + id));
        word.setGroup(group);

        return wordRepository.save(word);
    }

    /**
     * Deletes a Word entity and combinations associated with it.
     *
     * @param id The ID of the word to delete.
     * @throws NoSuchElementException if the word is not found.
     */
    @Transactional
    public void deleteWord(Long id) {
        if (!wordRepository.existsById(id)) {
            throw new NoSuchElementException("Word not found with ID: " + id);
        }

        wordRepository.deleteById(id);
    }

    /**
     * Find word by id.
     *
     * @param id The ID of the word.
     * @throws NoSuchElementException if the word is not found.
     */
    public Word findById(Long id) {
        return wordRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Word not found with ID: " + id));
    }

    /**
     * Get all groups
     */
    public List<WordGroup> getAllGroups() {
        return groupRepository.findAll();
    }
}
