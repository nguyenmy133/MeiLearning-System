package com.meilearning.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.meilearning.backend.dto.response.UserResponse;
import com.meilearning.backend.entity.User;

/**
 * MapStruct mapper: User entity â†” DTOs.
 *
 * MapStruct tá»± Ä‘á»™ng generate implementation class táº¡i compile time.
 * Sá»­ dá»¥ng: @Autowired UserMapper userMapper;
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "role", expression = "java(user.getRole().name())")
    UserResponse toResponse(User user);
}
