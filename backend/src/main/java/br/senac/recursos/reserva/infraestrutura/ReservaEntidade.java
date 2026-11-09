package br.senac.recursos.reserva.infraestrutura;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "reservas")
public class ReservaEntidade {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  Long id;

  @Column(name = "solicitante_id", nullable = false)
  long solicitanteId;

  @Column(name = "inicio_utc", nullable = false, columnDefinition = "datetime(6)")
  Instant inicio;

  @Column(name = "fim_utc", nullable = false, columnDefinition = "datetime(6)")
  Instant fim;

  @Column(nullable = false)
  boolean restrita;

  @Column(nullable = false, length = 24)
  String status;

  @Column(name = "motivo_decisao", length = 500)
  String motivo;

  @ElementCollection
  @CollectionTable(name = "reserva_recursos", joinColumns = @JoinColumn(name = "reserva_id"))
  @Column(name = "recurso_id")
  Set<Long> recursos = new HashSet<>();

  protected ReservaEntidade() {}
}
