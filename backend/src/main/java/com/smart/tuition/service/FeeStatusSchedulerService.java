package com.smart.tuition.service;

import com.smart.tuition.entity.Notification;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.entity.enums.NotificationType;
import com.smart.tuition.repository.NotificationRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeeStatusSchedulerService {

    private final StudentFeeRepository studentFeeRepository;
    private final NotificationRepository notificationRepository;

    // Runs every day at 00:01 AM
    @Scheduled(cron = "0 1 0 * * ?")
    @Transactional
    public void updateOverdueFees() {
        log.info("Running daily fee status check...");
        LocalDate today = LocalDate.now();
        
        List<StudentFee> fees = studentFeeRepository.findAll();
        
        for (StudentFee fee : fees) {
            if ((fee.getStatus() == FeeStatus.PENDING || fee.getStatus() == FeeStatus.PARTIAL) 
                && fee.getDueDate().isBefore(today)) {
                
                fee.setStatus(FeeStatus.OVERDUE);
                studentFeeRepository.save(fee);
                
                log.info("Marked fee {} as OVERDUE for student {}", fee.getStudentFeeId(), fee.getStudent().getEnrollmentNumber());
                
                // Create Notification
                Notification notification = new Notification();
                notification.setStudent(fee.getStudent());
                notification.setType(NotificationType.FEE_OVERDUE);
                notification.setTitle("Fee Overdue");
                
                String feeType = fee.getFeeStructure() != null ? fee.getFeeStructure().getFeeType() : "Monthly Fee";
                notification.setMessage("Your " + feeType + " of ₹" + (fee.getAmount() - fee.getPaidAmount()) + " is overdue.");
                notificationRepository.save(notification);
            }
        }
    }
}
