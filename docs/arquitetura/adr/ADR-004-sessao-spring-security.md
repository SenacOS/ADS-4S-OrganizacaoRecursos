# ADR-004 — Autenticação por sessão e autorização

**Estado: APROVADO** · Decisão: D09 · Requisitos: RF01, RF07 (risco R2, limitador de nota)

## Decisão
- Spring Security com sessão HTTP e cookie `HttpOnly` (`Secure` e `SameSite` em HTTPS); sem JWT e sem token no `localStorage`.
- Senhas com BCrypt; logout invalida a sessão; proteção contra session fixation.
- CSRF ativo em POST/PUT/PATCH/DELETE; o JS envia o token no cabeçalho.
- Perfis `SOLICITANTE`, `RESPONSAVEL`, `ADMINISTRADOR`; autorização por rota **e por objeto** (dono da reserva). O papel nunca vem do corpo da requisição.
- Somente `RESPONSAVEL` aprova ou rejeita reservas de recursos restritos; `ADMINISTRADOR` não recebe essa permissão por padrão.
- Erros 401/403 sem detalhes internos.

## Consequências
Simples para frontend de mesma origem. Exige o fluxo de token CSRF e testes de segurança (CT14, CT17, CT18, IDOR).
