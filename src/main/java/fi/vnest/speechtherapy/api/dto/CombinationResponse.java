package fi.vnest.speechtherapy.api.dto;

import fi.vnest.speechtherapy.api.model.AllowedCombination;

/**
 * DTO for responding with a single AllowedCombination entity.
 */
public record CombinationResponse(
        Long id,
        WordReference subject,
        WordReference verb,
        WordReference object,
        String sentence // "Maanviljelijä ajaa traktoria"
) {
    public static CombinationResponse fromEntity(AllowedCombination combination) {
        if (combination == null) return null;

        WordReference subjectDto = WordReference.fromEntity(combination.getSubject());
        WordReference verbDto = WordReference.fromEntity(combination.getVerb());
        WordReference objectDto = WordReference.fromEntity(combination.getObject());

        // Construct the sentence for the response
        String sentence = String.format("%s %s %s",
                subjectDto.getText(),
                verbDto.getText(),
                objectDto.getText()
        );

        return new CombinationResponse(
                combination.getId(),
                subjectDto,
                verbDto,
                objectDto,
                sentence
        );
    }
}
