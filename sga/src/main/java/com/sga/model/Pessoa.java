package com.sga.model;

import java.time.LocalDate;
import java.util.UUID;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
public abstract class Pessoa {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "uuid", updatable = false, nullable = false)
    private UUID uuid;

    @Column(nullable = false)
    @NotBlank
    private String nome;
    @Column(nullable = false)
    @NotBlank
    @Email
    private String email;
    @Column(nullable = false)
    @NotBlank
    private String senha;
    @Column(nullable = false)
    @NotBlank
    private String role;
    private String matricula;
    private String cpf;

    private LocalDate dataNascimento;

    public boolean autenticar(String email, String senha) {
        return this.email.equals(email) && this.senha.equals(senha);
    }

}