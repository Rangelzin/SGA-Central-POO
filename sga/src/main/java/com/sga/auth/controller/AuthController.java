package com.sga.auth.controller;

import com.sga.auth.dto.LoginRequest;
import com.sga.auth.dto.LoginResponse;
import com.sga.auth.dto.MeResponse;
import com.sga.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        // Stateless — frontend descarta o token
    }

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) throws Throwable {
        return authService.me(jwt.getClaim("email"));
    }
}