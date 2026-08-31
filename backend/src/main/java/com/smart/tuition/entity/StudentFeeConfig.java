package com.smart.tuition.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "student_fee_configs")
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudentFeeConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long configId;

    @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @NotNull(message = "Monthly fee amount is required")
    @PositiveOrZero(message = "Monthly fee must be positive or zero")
    @Column(nullable = false)
    private Double monthlyAmount;

    @NotNull(message = "Fee start month is required")
    @Column(nullable = false)
    private LocalDate feeStartMonth;

    private LocalDate effectiveFrom;

    @Column(nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
