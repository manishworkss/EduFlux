package com.smart.tuition.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeeSummaryDto {
    private Double totalFee;
    private Double paidAmount;
    private Double pendingAmount;
    private Double overdueAmount;
}
