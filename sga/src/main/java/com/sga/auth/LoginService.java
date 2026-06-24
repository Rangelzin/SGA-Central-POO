package com.sga.auth;

import com.sga.model.Pessoa;
import com.sga.config.SecurityConfig;

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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LoginService {

    private final PessoaRepository pessoaRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleScopeMapper roleScopeMapper;
    private final JwtEncoder jwtEncoder;

    public LoginResponse login(LoginRequest request) {
        Optional<Pessoa> optPessoa = pessoaRepository.findByEmail(request.getEmail());

        if(optPessoa.isEmpty() || !isPasswordCorrect(request.getSenha(), optPessoa.get().getSenha())) {
            throw new BadCredentialsException("Usuário ou senha incorretos!");
        }

        Pessoa pessoaSalva = optPessoa.get();
        List<String> scopes = roleScopeMapper.getScopes(optPessoa.get().getRole()).stream()
                .toList();

        long expiresIn = 7200L;
        JwtClaimsSet jwtTokens = JwtClaimsSet.builder()
                .issuer("sga-backend")
                .subject(pessoaSalva.getNome())
                .expiresAt(Instant.now().plusSeconds(expiresIn))
                .issuedAt(Instant.now())
                .claim("email", pessoaSalva.getEmail())
                .claim("scope", scopes)
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(jwtTokens)).getTokenValue();

        return LoginResponse.builder()
                .acessToken(token)
                .expiresIN(expiresIn)
                .build();
    }

    private boolean isPasswordCorrect(String password, String savedPassword){
        return passwordEncoder.matches(password,savedPassword);
    }
}
