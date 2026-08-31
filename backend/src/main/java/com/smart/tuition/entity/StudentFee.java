package com.smart.tuition.entity;

import com.smart.tuition.entity.enums.FeeStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "student_fees", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "fee_month"})
})
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudentFee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentFeeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_structure_id", nullable = true)
    private FeeStructure feeStructure;

    @NotNull(message = "Amount is required")
    @PositiveOrZero(message = "Amount must be positive or zero")
    @Column(nullable = false)
    private Double amount;

    @NotNull(message = "Paid amount is required")
    @PositiveOrZero(message = "Paid amount must be positive or zero")
    @Column(nullable = false)
    private Double paidAmount = 0.0;

    @Column(nullable = false)
    private Double remainingAmount = 0.0;

    @NotNull(message = "Fee month is required")
    @Column(name = "fee_month", nullable = false)
    private LocalDate feeMonth;

    @NotNull(message = "Due date is required")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FeeStatus status;

    @JsonIgnore
    @OneToMany(mappedBy = "studentFee", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payment> payments = new java.util.ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void calculateRemainingAmount() {
        if (this.amount != null && this.paidAmount != null) {
            this.remainingAmount = this.amount - this.paidAmount;
            if (this.remainingAmount < 0) {
                this.remainingAmount = 0.0; // Avoid negative remaining amount
            }
        }
    }
}
