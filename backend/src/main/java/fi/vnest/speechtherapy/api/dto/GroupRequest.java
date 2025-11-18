package fi.vnest.speechtherapy.api.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for creating or updating a WordGroup entity.
 */
public class GroupRequest {

    @NotBlank(message = "Name cannot be empty")
    private String name;

    private String description;

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
