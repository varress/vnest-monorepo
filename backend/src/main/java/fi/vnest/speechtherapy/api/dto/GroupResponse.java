package fi.vnest.speechtherapy.api.dto;

import fi.vnest.speechtherapy.api.model.WordGroup;

/**
 * DTO for returning a Group entity to the API consumer.
 */
public class GroupResponse {
    private Long id;
    private String name;

    public static GroupResponse fromEntity(WordGroup group) {
        GroupResponse dto = new GroupResponse();
        dto.setId(group.getId());
        dto.setName(group.getName());
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
}
