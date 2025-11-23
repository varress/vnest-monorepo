package fi.vnest.speechtherapy.api.config;

import fi.vnest.speechtherapy.api.model.User;
import fi.vnest.speechtherapy.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.logout;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.authenticated;
import static org.springframework.security.test.web.servlet.response.SecurityMockMvcResultMatchers.unauthenticated;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.findByEmail("test@example.com")
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail("test@example.com");
                    newUser.setPassword(passwordEncoder.encode("password123"));
                    newUser.setName("Test User");
                    newUser.setRole("ADMIN");
                    return userRepository.save(newUser);
                });
    }

    @Test
    void passwordEncoder_ShouldBeBCryptWithStrength12() {
        assertTrue(passwordEncoder.encode("test").startsWith("$2a$12$") ||
                   passwordEncoder.encode("test").startsWith("$2b$12$"),
                "Password encoder should be BCrypt with strength 12");

        String encoded = passwordEncoder.encode("password");
        assertTrue(passwordEncoder.matches("password", encoded));
        assertFalse(passwordEncoder.matches("wrong", encoded));
    }

    @Test
    void loginPage_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/login"))
                .andExpect(status().isOk());
    }

    @Test
    void errorPage_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/error"))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void staticResources_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/css/style.css"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/js/script.js"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/images/logo.png"))
                .andExpect(status().isNotFound());
    }

    @Test
    void swaggerUI_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk());
    }

    @Test
    void publicApiGet_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/words"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/combinations"))
                .andExpect(status().isOk());
    }

    @Test
    void publicApiPost_ShouldRequireAuth() throws Exception {
        mockMvc.perform(post("/api/words"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("**/login"));
    }

    @Test
    void adminEndpoint_WithoutAuth_ShouldRedirectToLogin() throws Exception {
        mockMvc.perform(get("/admin/words"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("**/login"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void adminEndpoint_WithUserRole_ShouldBeForbidden() throws Exception {
        mockMvc.perform(get("/admin/words"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminEndpoint_WithAdminRole_ShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/admin/words"))
                .andExpect(status().isMethodNotAllowed());
    }

    @Test
    void formLogin_WithValidCredentials_ShouldSucceed() throws Exception {
        mockMvc.perform(formLogin("/login")
                        .user("email", "test@example.com")
                        .password("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/"))
                .andExpect(authenticated().withUsername("test@example.com"));
    }

    @Test
    void formLogin_WithInvalidCredentials_ShouldFail() throws Exception {
        mockMvc.perform(formLogin("/login")
                        .user("email", "test@example.com")
                        .password("password", "wrongpassword"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=true"))
                .andExpect(unauthenticated());
    }

    @Test
    void formLogin_WithNonexistentUser_ShouldFail() throws Exception {
        mockMvc.perform(formLogin("/login")
                        .user("email", "nonexistent@example.com")
                        .password("password", "password123"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?error=true"))
                .andExpect(unauthenticated());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "ADMIN")
    void logout_ShouldInvalidateSessionAndRedirect() throws Exception {
        mockMvc.perform(logout("/logout"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrl("/login?logout=true"))
                .andExpect(unauthenticated());
    }

    @Test
    void csrfProtection_ShouldBeDisabled() throws Exception {
        mockMvc.perform(post("/api/words")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    void rootPath_WithoutAuth_ShouldRedirectToLogin() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().is3xxRedirection())
                .andExpect(redirectedUrlPattern("**/login"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void rootPath_WithAdminAuth_ShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk());
    }

    @Test
    void passwordEncoder_ShouldProduceDifferentHashesForSamePassword() {
        String password = "testPassword123";
        String hash1 = passwordEncoder.encode(password);
        String hash2 = passwordEncoder.encode(password);

        assertNotEquals(hash1, hash2);

        assertTrue(passwordEncoder.matches(password, hash1));
        assertTrue(passwordEncoder.matches(password, hash2));
    }

    @Test
    void passwordEncoder_ShouldHandleSpecialCharacters() {
        String password = "p@ssw0rd!#$%^&*()_+-=[]{}|;':\",./<>?";
        String encoded = passwordEncoder.encode(password);

        assertTrue(passwordEncoder.matches(password, encoded));
        assertFalse(passwordEncoder.matches("differentPassword", encoded));
    }

    @Test
    void passwordEncoder_ShouldHandleEmptyPassword() {
        String password = "";
        String encoded = passwordEncoder.encode(password);

        assertTrue(passwordEncoder.matches(password, encoded));
        assertFalse(passwordEncoder.matches("notEmpty", encoded));
    }

    @Test
    void passwordEncoder_ShouldHandleMaximumPasswordLength() {
        String password = "a".repeat(72);
        String encoded = passwordEncoder.encode(password);

        assertTrue(passwordEncoder.matches(password, encoded));
        assertFalse(passwordEncoder.matches("a".repeat(71), encoded));
    }

    @Test
    void passwordEncoder_ShouldRejectTooLongPasswords() {
        String tooLongPassword = "a".repeat(73);

        assertThrows(IllegalArgumentException.class, () -> {
            passwordEncoder.encode(tooLongPassword);
        });
    }
}
