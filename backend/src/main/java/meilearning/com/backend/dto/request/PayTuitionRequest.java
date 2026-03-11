package meilearning.com.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class PayTuitionRequest {
    @NotBlank
    private String paymentMethod;  // cash, bank_transfer, momo, ...
    private String paymentProofUrl;
}
