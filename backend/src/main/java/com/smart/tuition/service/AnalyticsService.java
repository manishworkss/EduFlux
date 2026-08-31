package com.smart.tuition.service;

import com.smart.tuition.dto.AnalyticsDashboardDto;
import com.smart.tuition.entity.Payment;
import com.smart.tuition.entity.Student;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.PaymentStatus;
import com.smart.tuition.repository.PaymentRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import com.smart.tuition.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final StudentFeeRepository studentFeeRepository;

    public AnalyticsDashboardDto getDashboardData(Long adminId) {
        AnalyticsDashboardDto dto = new AnalyticsDashboardDto();
        
        List<Student> students = studentRepository.findByAdmin_UserId(adminId);
        List<Payment> payments = paymentRepository.findByStudent_Admin_UserId(adminId);
        List<StudentFee> fees = studentFeeRepository.findByStudent_Admin_UserId(adminId);

        dto.setTotalStudents(students.size());
        dto.setActiveStudents(students.stream().filter(s -> s.getUser() != null && s.getUser().getUserId() != null).count());

        BigDecimal totalCollected = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .map(p -> BigDecimal.valueOf(p.getAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalFeeCollection(totalCollected);

        BigDecimal totalPending = fees.stream()
                .filter(f -> f.getStatus() == FeeStatus.PENDING)
                .map(f -> BigDecimal.valueOf(f.getAmount() - f.getPaidAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalPendingFees(totalPending);

        BigDecimal totalOverdue = fees.stream()
                .filter(f -> f.getStatus() == FeeStatus.OVERDUE)
                .map(f -> BigDecimal.valueOf(f.getAmount() - f.getPaidAmount()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalOverdueFees(totalOverdue);

        dto.setSuccessfulPayments(payments.stream().filter(p -> p.getStatus() == PaymentStatus.SUCCESS).count());
        dto.setFailedPayments(payments.stream().filter(p -> p.getStatus() == PaymentStatus.FAILED).count());

        // For "Fees Due Soon", we can count fees that are PENDING and dueDate is within next 7 days
        // Assuming StudentFee has a dueDate, let's check it. If not, just put 0 for now.
        long dueSoon = fees.stream()
                .filter(f -> f.getStatus() == FeeStatus.PENDING && f.getDueDate() != null && 
                        f.getDueDate().isAfter(java.time.LocalDate.now().minusDays(1)) &&
                        f.getDueDate().isBefore(java.time.LocalDate.now().plusDays(8)))
                .count();
        dto.setFeesDueSoon(dueSoon);

        // Chart Data
        Map<String, BigDecimal> monthlyCollectionMap = new HashMap<>();
        Map<String, Long> monthlyPaymentCountMap = new HashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMMM yyyy");

        payments.stream().filter(p -> p.getStatus() == PaymentStatus.SUCCESS).forEach(p -> {
            String month = p.getPaymentDate().format(monthFormatter);
            monthlyCollectionMap.put(month, monthlyCollectionMap.getOrDefault(month, BigDecimal.ZERO).add(BigDecimal.valueOf(p.getAmount())));
            monthlyPaymentCountMap.put(month, monthlyPaymentCountMap.getOrDefault(month, 0L) + 1);
        });

        List<AnalyticsDashboardDto.MonthlyCollectionDto> monthlyCollections = new ArrayList<>();
        monthlyCollectionMap.forEach((k, v) -> {
            AnalyticsDashboardDto.MonthlyCollectionDto m = new AnalyticsDashboardDto.MonthlyCollectionDto();
            m.setMonth(k);
            m.setAmount(v);
            monthlyCollections.add(m);
        });
        dto.setMonthlyCollection(monthlyCollections);

        List<AnalyticsDashboardDto.MonthlyPaymentCountDto> monthlyCounts = new ArrayList<>();
        monthlyPaymentCountMap.forEach((k, v) -> {
            AnalyticsDashboardDto.MonthlyPaymentCountDto m = new AnalyticsDashboardDto.MonthlyPaymentCountDto();
            m.setMonth(k);
            m.setCount(v);
            monthlyCounts.add(m);
        });
        dto.setMonthlyPaymentCount(monthlyCounts);

        Map<String, BigDecimal> courseCollectionMap = new HashMap<>();
        payments.stream().filter(p -> p.getStatus() == PaymentStatus.SUCCESS && p.getStudent() != null && p.getStudent().getCourse() != null).forEach(p -> {
            String cName = p.getStudent().getCourse().getCourseName();
            courseCollectionMap.put(cName, courseCollectionMap.getOrDefault(cName, BigDecimal.ZERO).add(BigDecimal.valueOf(p.getAmount())));
        });
        
        List<AnalyticsDashboardDto.CourseCollectionDto> courseCollections = new ArrayList<>();
        courseCollectionMap.forEach((k, v) -> {
            AnalyticsDashboardDto.CourseCollectionDto c = new AnalyticsDashboardDto.CourseCollectionDto();
            c.setCourseName(k);
            c.setAmount(v);
            courseCollections.add(c);
        });
        dto.setCourseWiseCollection(courseCollections);

        Map<String, Long> paymentMethodMap = new HashMap<>();
        payments.stream().filter(p -> p.getStatus() == PaymentStatus.SUCCESS).forEach(p -> {
            paymentMethodMap.put(p.getPaymentMethod(), paymentMethodMap.getOrDefault(p.getPaymentMethod(), 0L) + 1);
        });
        dto.setPaymentMethodDistribution(paymentMethodMap);

        Map<String, Long> courseDist = new HashMap<>();
        students.stream().filter(s -> s.getCourse() != null).forEach(s -> {
            String cName = s.getCourse().getCourseName();
            courseDist.put(cName, courseDist.getOrDefault(cName, 0L) + 1);
        });
        dto.setCourseWiseStudentDistribution(courseDist);

        AnalyticsDashboardDto.FeeStatusDistributionDto feeDist = new AnalyticsDashboardDto.FeeStatusDistributionDto();
        feeDist.setPending(fees.stream().filter(f -> f.getStatus() == FeeStatus.PENDING).count());
        feeDist.setPaid(fees.stream().filter(f -> f.getStatus() == FeeStatus.PAID).count());
        feeDist.setOverdue(fees.stream().filter(f -> f.getStatus() == FeeStatus.OVERDUE).count());
        dto.setFeeStatusDistribution(feeDist);

        return dto;
    }
}
