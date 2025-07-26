package com.mySociety.controller;

import com.mySociety.model.User;
import com.mySociety.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");

        String token = authService.login(username, password);

        if (token != null) {
            User user = authService.validateToken(token); // Get user details for response
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("userId", user.getId());
            if (user.getResident() != null) {
                response.put("residentId", user.getResident().getId());
                response.put("flatNumber", user.getResident().getFlatNumber());
            }
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestHeader("Authorization") String token) {
        if (token != null && token.startsWith("Bearer ")) {
            authService.logout(token.substring(7)); // Remove "Bearer " prefix
            return ResponseEntity.ok("Logged out successfully");
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid token");
    }

    // Helper method for token validation in other controllers
    private User validateAndGetUser(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            return authService.validateToken(token.substring(7));
        }
        return null;
    }
}