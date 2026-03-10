package meilearning.com.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import meilearning.com.backend.dto.response.UserResponse;
import meilearning.com.backend.entity.User;

/**
 * MapStruct mapper: User entity ↔ DTOs.
 *
 * MapStruct tự động generate implementation class tại compile time.
 * Sử dụng: @Autowired UserMapper userMapper;
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);
}
