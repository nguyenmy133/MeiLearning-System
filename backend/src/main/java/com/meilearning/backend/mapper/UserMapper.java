package com.meilearning.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.meilearning.backend.dto.response.UserResponse;
import com.meilearning.backend.entity.User;

/**

 * MapStruct mapper: User entity â†” DTOs.

 *

 * MapStruct tự động generate implementation class tại compile time.

 * Sá»­ dụng: @Autowired UserMapper userMapper;

 */

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);

}
