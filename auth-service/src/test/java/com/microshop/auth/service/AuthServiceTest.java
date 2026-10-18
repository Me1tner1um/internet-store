package com.microshop.auth.service;

import com.microshop.auth.dto.AuthResponse;
import com.microshop.auth.dto.LoginRequest;
import com.microshop.auth.dto.RefreshTokenRequest;
import com.microshop.auth.dto.RegisterRequest;
import com.microshop.auth.exception.InvalidTokenException;
import com.microshop.auth.exception.UserAlreadyExistsException;
import com.microshop.auth.model.Role;
import com.microshop.auth.model.User;
import com.microshop.auth.repository.UserRepository;
import com.microshop.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private UUID sampleUserId;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleUser = User.builder()
                .id(sampleUserId)
                .username("testuser")
                .email("test@example.com")
                .passwordHash("hashed-password")
                .role(Role.ROLE_USER)
                .build();
    }

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest("testuser", "test@example.com", "password123");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed-password");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateAccessToken(sampleUser)).thenReturn("access-token-123");
        when(jwtService.generateRefreshToken(sampleUser)).thenReturn("refresh-token-123");

        AuthResponse response = authService.register(req);

        assertNotNull(response);
        assertEquals("access-token-123", response.getAccessToken());
        assertEquals("refresh-token-123", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("ROLE_USER", response.getRole());
        assertEquals(sampleUserId, response.getUserId());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateUsername_throwsException() {
        RegisterRequest req = new RegisterRequest("testuser", "test@example.com", "password123");
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_duplicateEmail_throwsException() {
        RegisterRequest req = new RegisterRequest("testuser", "test@example.com", "password123");
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        LoginRequest req = new LoginRequest("testuser", "password123");
        when(userRepository.findByUsernameOrEmail(eq("testuser"), eq("testuser"))).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", "hashed-password")).thenReturn(true);
        when(jwtService.generateAccessToken(sampleUser)).thenReturn("access-token-123");
        when(jwtService.generateRefreshToken(sampleUser)).thenReturn("refresh-token-123");

        AuthResponse response = authService.login(req);

        assertNotNull(response);
        assertEquals("access-token-123", response.getAccessToken());
        assertEquals("refresh-token-123", response.getRefreshToken());
        assertEquals("testuser", response.getUsername());
    }

    @Test
    void login_invalidPassword_throwsBadCredentials() {
        LoginRequest req = new LoginRequest("testuser", "wrongpassword");
        when(userRepository.findByUsernameOrEmail(eq("testuser"), eq("testuser"))).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "hashed-password")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void login_userNotFound_throwsBadCredentials() {
        LoginRequest req = new LoginRequest("nonexistent", "password123");
        when(userRepository.findByUsernameOrEmail(eq("nonexistent"), eq("nonexistent"))).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }

    @Test
    void refreshToken_success() {
        RefreshTokenRequest req = new RefreshTokenRequest("valid-refresh-token");
        when(jwtService.isTokenValid("valid-refresh-token")).thenReturn(true);
        when(jwtService.extractUserId("valid-refresh-token")).thenReturn(sampleUserId);
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateAccessToken(sampleUser)).thenReturn("new-access-token");

        AuthResponse response = authService.refreshToken(req);

        assertNotNull(response);
        assertEquals("new-access-token", response.getAccessToken());
        assertEquals("valid-refresh-token", response.getRefreshToken());
    }

    @Test
    void refreshToken_invalidToken_throwsInvalidTokenException() {
        RefreshTokenRequest req = new RefreshTokenRequest("invalid-token");
        when(jwtService.isTokenValid("invalid-token")).thenReturn(false);

        assertThrows(InvalidTokenException.class, () -> authService.refreshToken(req));
    }
}
