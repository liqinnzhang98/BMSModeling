package com.example.demo.controller;

import com.example.demo.dto.AuthRequestDTO;
import com.example.demo.dto.AuthResponseDTO;
import com.example.demo.dto.RegisterRequestDTO;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.response.ApiResponse;
import com.example.demo.service.CustomUserDetailsService;
import com.example.demo.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO registerRequestDTO) {

        try {
            // creating new user entity based on the register data received
            User user = new User();
            user.setEmail(registerRequestDTO.getEmail());
            user.setName(registerRequestDTO.getName());
            user.setPassword(passwordEncoder.encode(registerRequestDTO.getPassword()));
            // save the user data
            userRepository.save(user);

            // Set up the response
            ApiResponse<String> response = new ApiResponse<>(
                    201,
                    "User registered successfully",
                    null
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        }
        catch (Exception e) {
                // Handle any other unexpected errors
                ApiResponse<String> errorResponse = new ApiResponse<>(
                        500,
                        "An error occurred during registration",
                        null
                );

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO request) {
        try {
            // Attempt authentication with provided credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

            // Load user details after successful authentication
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());

            // Generate JWT token for the user
            String token = jwtUtil.generateToken(userDetails);

            // Create a successful response with the token
            ApiResponse<String> response = new ApiResponse<>(
                    200,
                    "User logged in successfully",
                    token
            );

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            // Handle invalid login credentials (wrong username or password)
            ApiResponse<String> errorResponse = new ApiResponse<>(
                    401,
                    "Invalid email or password",
                    null
            );

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        } catch (Exception e) {
            // Handle any other unexpected errors
            ApiResponse<String> errorResponse = new ApiResponse<>(
                    500,
                    "An error occurred during login",
                    null
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}