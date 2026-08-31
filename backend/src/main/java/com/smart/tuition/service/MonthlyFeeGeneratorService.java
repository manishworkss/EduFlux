package com.smart.tuition.service;

import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.StudentFeeConfig;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.repository.StudentFeeConfigRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MonthlyFeeGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(MonthlyFeeGeneratorService.class);

    @Autowired
    private StudentFeeConfigRepository configRepository;

    @Autowired
    private StudentFeeRepository feeRepository;

    /**
     * Runs every day at 1 AM to generate fees for the current month.
     * It also catches up on any missed previous months if the system was offline.
     */
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void generateMonthlyFees() {
        logger.info("Starting scheduled monthly fee generation...");
        LocalDate currentDate = LocalDate.now();
        generateFeesUpTo(currentDate);
        logger.info("Monthly fee generation completed.");
    }

    @Transactional
    public void generateFeesUpTo(LocalDate targetDate) {
        List<StudentFeeConfig> activeConfigs = configRepository.findByActiveTrue();
        
        LocalDate targetMonth = targetDate.withDayOfMonth(1);

        for (StudentFeeConfig config : activeConfigs) {
            LocalDate startMonth = config.getEffectiveFrom() != null ? config.getEffectiveFrom().withDayOfMonth(1) : config.getFeeStartMonth().withDayOfMonth(1);
            
            // If the start month is in the future, don't generate yet
            if (startMonth.isAfter(targetMonth)) {
                continue;
            }

            // Generate for all months from startMonth up to targetMonth
            LocalDate currentIterMonth = startMonth;
            while (!currentIterMonth.isAfter(targetMonth)) {
                generateFeeForMonth(config, currentIterMonth);
                currentIterMonth = currentIterMonth.plusMonths(1);
            }
        }
    }

    private void generateFeeForMonth(StudentFeeConfig config, LocalDate feeMonth) {
        Optional<StudentFee> existingFee = feeRepository.findByStudent_StudentIdAndFeeMonth(config.getStudent().getStudentId(), feeMonth);
        
        if (existingFee.isEmpty()) {
            StudentFee newFee = new StudentFee();
            newFee.setStudent(config.getStudent());
            newFee.setFeeMonth(feeMonth);
            newFee.setAmount(config.getMonthlyAmount());
            newFee.setPaidAmount(0.0);
            newFee.setRemainingAmount(config.getMonthlyAmount());
            // Due date is typically the 10th of the month, or adjust as needed
            newFee.setDueDate(feeMonth.withDayOfMonth(10));
            newFee.setStatus(FeeStatus.PENDING);
            
            feeRepository.save(newFee);
            logger.info("Generated fee for student {} for month {}", config.getStudent().getStudentId(), feeMonth);
        }
    }
}
