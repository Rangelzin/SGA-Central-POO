package com.sga.auth.controller;

import com.sga.auth.dto.LoginRequest;
import com.sga.auth.dto.LoginResponse;
import com.sga.auth.dto.MeResponse;
import com.sga.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://sga-frontend-app:3000" }, allowCredentials = "true")
@Tag(name = "Autenticação", description = "Login, logout e dados do usuário autenticado")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Realiza login", description = "Autentica com e-mail e senha e retorna um Bearer JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado, token retornado"),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas")
    })
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Logout", description = "Stateless — o frontend deve descartar o token.")
    @ApiResponse(responseCode = "204", description = "Logout efetuado")
    public void logout() {
        // Stateless — frontend descarta o token
    }

    @GetMapping("/me")
    @ResponseStatus(HttpStatus.OK)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Dados do usuário autenticado", description = "Retorna nome, e-mail e role do token JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dados retornados"),
            @ApiResponse(responseCode = "401", description = "Não autenticado")
    })
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authService.me(jwt.getClaim("email"));
    }
}
