package meilearning.com.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import meilearning.com.backend.entity.enums.FacilityStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFacilityRequest {
    private String name;
    private String address;
    private String phone;
    private String manager;
    private FacilityStatus status;
}
