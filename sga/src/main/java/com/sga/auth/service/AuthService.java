package com.sga.auth.service;

import com.sga.auth.dto.LoginRequest;
import com.sga.auth.dto.LoginResponse;
import com.sga.auth.dto.MeResponse;
import com.sga.auth.mapper.RoleScopeMapper;
import com.sga.model.Pessoa;
import com.sga.repository.PessoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PessoaRepository pessoaRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleScopeMapper roleScopeMapper;
    private final JwtEncoder jwtEncoder;

    private static final long ACCESS_TOKEN_EXPIRY = 3600L; // 1h

    public LoginResponse login(LoginRequest request) {
        Pessoa pessoa = pessoaRepository.findByEmail(request.getEmail())
                .filter(p -> passwordEncoder.matches(request.getSenha(), p.getSenha()))
                .orElseThrow(() -> new BadCredentialsException("Usuário ou senha incorretos!"));

        String token = gerarAccessToken(pessoa);

        return LoginResponse.builder()
                .acessToken(token)
                .expiresIN(ACCESS_TOKEN_EXPIRY)
                .build();
    }

    public MeResponse me(String email) {
        Pessoa pessoa = pessoaRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado!"));

        return MeResponse.builder()
                .id(pessoa.getId().toString())
                .nome(pessoa.getNome())
                .email(pessoa.getEmail())
                .role(pessoa.getRole())
                .scopes(roleScopeMapper.getScopes(pessoa.getRole()))
                .build();
    }

    private String gerarAccessToken(Pessoa pessoa) {
        List<String> scopes = roleScopeMapper.getScopes(pessoa.getRole());

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("sga-backend")
                .subject(pessoa.getNome())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(ACCESS_TOKEN_EXPIRY))
                .claim("email", pessoa.getEmail())
                .claim("pessoaId", pessoa.getId().toString())
                .claim("role", pessoa.getRole().name())
                .claim("scope", scopes)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}
