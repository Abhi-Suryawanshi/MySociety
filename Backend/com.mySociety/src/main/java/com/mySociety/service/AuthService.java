package com.mySociety.service;

import com.mySociety.model.User;
import com.mySociety.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    // In a real application, use a proper JWT library or Spring Security for tokens.
    // This is a very basic in-memory token store for demonstration.
    private final Map<String, User> activeTokens = new HashMap<>();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String login(String username, String password) {
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // IMPORTANT: In a real application, compare hashed passwords (e.g., using BCrypt)
            if (user.getPassword().equals(password)) { // Simple string comparison for this example
                String token = UUID.randomUUID().toString();
                activeTokens.put(token, user);
                return token;
            }
        }
        return null; // Authentication failed
    }

    public User validateToken(String token) {
        return activeTokens.get(token);
    }

    public void logout(String token) {
        activeTokens.remove(token);
    }
}