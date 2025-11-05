package fi.vnest.speechtherapy.api.controller;

import fi.vnest.speechtherapy.api.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * Global exception handler using @ControllerAdvice to provide consistent
 * error responses across all controllers.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handles JSON parsing errors (e.g., malformed JSON, invalid enum value).
     * Returns 400 Bad Request.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<String>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        String detail = "Malformed JSON request or invalid enum value provided. Error: " + ex.getMostSpecificCause().getMessage();
        return new ResponseEntity<>(new ApiResponse<>(false, detail), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles validation errors from @Valid annotation (e.g., @NotBlank failed).
     * Returns 400 Bad Request.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<List<String>>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Collect all validation error messages
        List<String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.toList());

        return new ResponseEntity<>(new ApiResponse<>(false, errors), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles business logic errors for non-existent entities (e.g., PUT/DELETE on non-existent ID).
     * Returns 404 Not Found.
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<ApiResponse<String>> handleNotFound(NoSuchElementException ex) {
        return new ResponseEntity<>(new ApiResponse<>(false, ex.getMessage()), HttpStatus.NOT_FOUND);
    }
}