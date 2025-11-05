package fi.vnest.speechtherapy.api.service;

import fi.vnest.speechtherapy.api.model.User;
import fi.vnest.speechtherapy.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(UserInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.users}")
    private String usersConfig;

    @Override
    public void run(ApplicationArguments args) {
        if (usersConfig == null || usersConfig.trim().isEmpty()) {
            logger.warn("No users defined.");
            return;
        }

        String[] users = usersConfig.split(";");

        for (String userConfig : users) {
            try {
                createUserFromConfig(userConfig.trim());
            } catch (Exception e) {
                logger.error("Error creating user: " + userConfig, e);
            }
        }

        logger.info("User initialization is ready. Total of {} users.",
                userRepository.count());
    }

    private void createUserFromConfig(String config) {
        // Format: email:password:name:role
        String[] parts = config.split(":");

        if (parts.length < 3) {
            logger.error("Error in user configuration: " + config);
            return;
        }

        String email = parts[0].trim();
        String password = parts[1].trim();
        String name = parts[2].trim();
        String role = parts.length > 3 ? parts[3].trim() : "USER";

        if (userRepository.existsByEmail(email)) {
            logger.info("User {} exists, updating password.", email);
            User existingUser = userRepository.findByEmail(email).get();
            existingUser.setPassword(passwordEncoder.encode(password));
            existingUser.setName(name);
            existingUser.setRole(role);
            userRepository.save(existingUser);
        } else {
            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(password));
            user.setName(name);
            user.setRole(role);
            userRepository.save(user);
            logger.info("New user created for: {}", email);
        }
    }
}
