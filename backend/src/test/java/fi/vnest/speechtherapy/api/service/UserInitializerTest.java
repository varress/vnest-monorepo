package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.model.User;
import fi.vnest.speechtherapy.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationArguments applicationArguments;

    @InjectMocks
    private UserInitializer userInitializer;

    @Test
    void run_WithNullUsersConfig_ShouldNotCreateUsers() {
        ReflectionTestUtils.setField(userInitializer, "usersConfig", null);

        userInitializer.run(applicationArguments);

        verify(userRepository, never()).save(any(User.class));
        verify(userRepository, never()).count();
    }

    @Test
    void run_WithEmptyUsersConfig_ShouldNotCreateUsers() {
        ReflectionTestUtils.setField(userInitializer, "usersConfig", "   ");

        userInitializer.run(applicationArguments);

        verify(userRepository, never()).save(any(User.class));
        verify(userRepository, never()).count();
    }

    @Test
    void run_WithValidUserConfig_ShouldCreateNewUser() {
        String usersConfig = "admin@example.com:password123:Admin User:ADMIN";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);

        userInitializer.run(applicationArguments);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("admin@example.com", savedUser.getEmail());
        assertEquals("encoded_password", savedUser.getPassword());
        assertEquals("Admin User", savedUser.getName());
        assertEquals("ADMIN", savedUser.getRole());
        verify(userRepository).count();
    }

    @Test
    void run_WithUserConfigWithoutRole_ShouldCreateUserWithDefaultRole() {
        String usersConfig = "user@example.com:password123:Regular User";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);

        userInitializer.run(applicationArguments);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("user@example.com", savedUser.getEmail());
        assertEquals("Regular User", savedUser.getName());
        assertEquals("USER", savedUser.getRole());
    }

    @Test
    void run_WithExistingUser_ShouldUpdateUser() {
        String usersConfig = "existing@example.com:newpassword:Updated Name:ADMIN";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");

        User existingUser = new User();
        existingUser.setEmail("existing@example.com");
        existingUser.setPassword("old_encoded_password");
        existingUser.setName("Old Name");
        existingUser.setRole("USER");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(existingUser));

        userInitializer.run(applicationArguments);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User updatedUser = userCaptor.getValue();
        assertEquals("existing@example.com", updatedUser.getEmail());
        assertEquals("encoded_password", updatedUser.getPassword());
        assertEquals("Updated Name", updatedUser.getName());
        assertEquals("ADMIN", updatedUser.getRole());
    }

    @Test
    void run_WithMultipleUsers_ShouldCreateAllUsers() {
        String usersConfig = "user1@example.com:pass1:User One:ADMIN;user2@example.com:pass2:User Two:USER";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        userInitializer.run(applicationArguments);

        verify(userRepository, times(2)).save(any(User.class));
        verify(userRepository).count();
    }

    @Test
    void run_WithInvalidUserConfig_ShouldSkipInvalidUser() {
        String usersConfig = "invalid:config";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);

        userInitializer.run(applicationArguments);

        verify(userRepository, never()).save(any(User.class));
        verify(userRepository).count();
        verify(passwordEncoder, never()).encode(anyString());
    }

    @Test
    void run_WithMixedValidAndInvalidUsers_ShouldCreateOnlyValidUsers() {
        String usersConfig = "valid@example.com:pass:Valid User:ADMIN;invalid:config;another@example.com:pass2:Another User";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        userInitializer.run(applicationArguments);

        verify(userRepository, times(2)).save(any(User.class));
        verify(userRepository).count();
    }

    @Test
    void run_WithWhitespaceInConfig_ShouldTrimAndCreateUser() {
        String usersConfig = "  user@example.com : password123 : User Name : ADMIN  ";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);

        userInitializer.run(applicationArguments);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("user@example.com", savedUser.getEmail());
        assertEquals("User Name", savedUser.getName());
        assertEquals("ADMIN", savedUser.getRole());
    }

    @Test
    void run_WhenRepositoryThrowsException_ShouldContinueWithOtherUsers() {
        String usersConfig = "fail@example.com:pass:Fail User:ADMIN;success@example.com:pass:Success User:USER";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");

        when(userRepository.existsByEmail("fail@example.com")).thenReturn(false);
        when(userRepository.existsByEmail("success@example.com")).thenReturn(false);
        when(userRepository.save(argThat(user -> user.getEmail().equals("fail@example.com"))))
                .thenThrow(new RuntimeException("Database error"));

        userInitializer.run(applicationArguments);

        verify(userRepository, times(2)).save(any(User.class));
        verify(userRepository).count();
    }

    @Test
    void run_WithColonInName_ShouldHandleCorrectly() {
        String usersConfig = "user@example.com:password:Name:With:Colon:ADMIN";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);

        userInitializer.run(applicationArguments);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("user@example.com", savedUser.getEmail());
        assertEquals("Name", savedUser.getName());
        assertEquals("With", savedUser.getRole());
    }

    @Test
    void run_WithEmptyPassword_ShouldStillCreateUser() {
        String usersConfig = "user@example.com::User Name:ADMIN";
        ReflectionTestUtils.setField(userInitializer, "usersConfig", usersConfig);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);

        userInitializer.run(applicationArguments);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("user@example.com", savedUser.getEmail());
        assertEquals("User Name", savedUser.getName());
    }
}
