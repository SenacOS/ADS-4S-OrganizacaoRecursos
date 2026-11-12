CREATE INDEX idx_reservas_fila_aprovacao
    ON reservas (status, restrita, inicio_utc, id);
