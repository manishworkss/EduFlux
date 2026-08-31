package com.smart.tuition.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class AnalyticsDashboardDto {
    private long totalStudents;
    private long activeStudents;
    private BigDecimal totalFeeCollection;
    private BigDecimal totalPendingFees;
    private BigDecimal totalOverdueFees;
    private long successfulPayments;
    private long failedPayments;
    private long feesDueSoon;

    private List<MonthlyCollectionDto> monthlyCollection;
    private List<CourseCollectionDto> courseWiseCollection;
    private Map<String, Long> paymentMethodDistribution;
    private Map<String, Long> courseWiseStudentDistribution;
    private List<MonthlyPaymentCountDto> monthlyPaymentCount;
    private FeeStatusDistributionDto feeStatusDistribution;

    @Data
    public static class MonthlyCollectionDto {
        private String month;
        private BigDecimal amount;
    }

    @Data
    public static class CourseCollectionDto {
        private String courseName;
        private BigDecimal amount;
    }

    @Data
    public static class MonthlyPaymentCountDto {
        private String month;
        private long count;
    }

    @Data
    public static class FeeStatusDistributionDto {
        private long pending;
        private long paid;
        private long overdue;
    }
}
