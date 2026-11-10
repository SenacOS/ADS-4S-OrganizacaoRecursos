-- SOMENTE BASE DESCARTÁVEL. Destrutivo, execução manual após backup.
-- Recriar a base descartável antes de reaplicar Flyway; não reutilizar flyway_schema_history.
DROP TABLE conflitos_evitados;
DROP TABLE movimentacoes;
DROP TABLE bloqueios_recursos;
DROP TABLE reserva_recursos;
DROP TABLE reservas;
DROP TABLE professor_competencias;
DROP TABLE materiais;
DROP TABLE professores;
DROP TABLE salas;
DROP TABLE recursos;
DROP TABLE horarios_funcionamento;
DROP TABLE configuracao_expediente;
DROP TABLE usuarios;
