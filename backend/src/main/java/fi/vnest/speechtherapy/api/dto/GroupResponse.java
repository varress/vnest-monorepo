package fi.vnest.speechtherapy.api.dto;

import fi.vnest.speechtherapy.api.model.WordGroup;

/**
 * DTO for returning a Group entity to the API consumer.
 */
public class GroupResponse {
    private Long id;
    private String name;
    private String description;

    public static GroupResponse fromEntity(WordGroup group) {
        GroupResponse dto = new GroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
