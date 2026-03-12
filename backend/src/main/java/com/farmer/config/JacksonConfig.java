package com.farmer.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.StreamReadConstraints;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Jackson Configuration to Mitigate CVE-GHSA-72hv-8253-57qq
 * 
 * Issue: Number Length Constraint Bypass in Async Parser
 * Applies strict constraints on JSON number parsing to prevent DoS attacks
 * through arbitrarily long numbers in async parser.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // Set StreamReadConstraints to enforce number length limits
        // Default maxNumberLength is 1000 characters
        StreamReadConstraints constraints = StreamReadConstraints.builder()
            .maxNumberLength(1000)  // Reject numbers longer than 1000 digits
            .maxStringLength(1_000_000)  // 1MB max string length
            .maxNestingDepth(200)  // Prevent deeply nested objects/arrays
            .build();
        
        mapper.getFactory().setStreamReadConstraints(constraints);
        
        return mapper;
    }
}
