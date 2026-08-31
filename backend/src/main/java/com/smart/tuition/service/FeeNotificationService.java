package com.smart.tuition.service;

import com.smart.tuition.entity.Notification;
import com.smart.tuition.entity.StudentFee;
import com.smart.tuition.entity.enums.FeeStatus;
import com.smart.tuition.repository.NotificationRepository;
import com.smart.tuition.repository.StudentFeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class FeeNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(FeeNotificationService.class);

    @Autowired
    private StudentFeeRepository studentFeeRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Checks for pending fees in their last 7 days, and overdue fees, and sends notifications.
     */
    @Transactional
    public void generateFeeReminders(LocalDate referenceDate) {
        logger.info("Generating fee reminders for reference date: {}", referenceDate);

        // Pending Reminders (last 7 days of the month)
        // Find fees where status is PENDING or PARTIAL
        // and due date is within the next 7 days or we are in the last 7 days of its month.
        // Rule: Start sending reminders during the LAST 7 DAYS of the month.
        LocalDate windowEnd = referenceDate.plusDays(7);
        // Wait, "LAST 7 DAYS of the month".
        // Let's iterate all fees that are PENDING/PARTIAL and see if we are in the last 7 days of the feeMonth
        List<StudentFee> pendingFees = studentFeeRepository.findAllPendingOrPartial();
        for (StudentFee fee : pendingFees) {
            // Check if we are in the last 7 days of the feeMonth's month.
            YearMonth ym = YearMonth.from(fee.getFeeMonth());
            LocalDate endOfMonth = ym.atEndOfMonth();
            LocalDate startOfLast7Days = endOfMonth.minusDays(6);
            
            if (!referenceDate.isBefore(startOfLast7Days) && !referenceDate.isAfter(endOfMonth)) {
                sendReminder(fee, "PENDING");
            }
        }

        // Overdue Reminders
        List<StudentFee> overdueFees = studentFeeRepository.findFeesForOverdueReminders();
        for (StudentFee fee : overdueFees) {
            sendReminder(fee, "OVERDUE");
        }
    }

    private void sendReminder(StudentFee fee, String type) {
        String message;
        if (type.equals("PENDING")) {
            if (fee.getStatus() == FeeStatus.PARTIAL) {
                message = "₹" + fee.getRemainingAmount() + " remains pending for your " + fee.getFeeMonth().getMonth() + " fee.";
            } else {
                message = "Your fee payment of ₹" + fee.getRemainingAmount() + " for " + fee.getFeeMonth().getMonth() + " is pending.";
            }
        } else { // OVERDUE
            message = "Your " + fee.getFeeMonth().getMonth() + " fee of ₹" + fee.getRemainingAmount() + " is overdue.";
        }

        Notification notification = new Notification();
        notification.setStudent(fee.getStudent());
        notification.setTitle(type + " Fee Reminder");
        notification.setMessage(message);
        notification.setIsRead(false);

        notificationRepository.save(notification);
        logger.info("Sent {} reminder for student {}, amount: {}", type, fee.getStudent().getStudentId(), fee.getRemainingAmount());
    }
}
