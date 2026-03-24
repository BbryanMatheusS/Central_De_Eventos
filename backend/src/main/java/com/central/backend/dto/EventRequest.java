package com.central.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class EventRequest {
    private String name;
    private String location;
    private LocalDate eventDate;
    private LocalTime eventTime;
}
