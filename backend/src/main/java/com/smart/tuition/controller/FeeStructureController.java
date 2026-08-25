package com.smart.tuition.controller;

import com.smart.tuition.entity.FeeStructure;
import com.smart.tuition.repository.FeeStructureRepository;
import com.smart.tuition.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fee-structures")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class FeeStructureController {

    private final FeeStructureRepository feeStructureRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<List<FeeStructure>> getAllFeeStructures() {
        return ResponseEntity.ok(feeStructureRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<FeeStructure> createFeeStructure(@RequestBody FeeStructure feeStructure) {
        if (feeStructure.getCourse() != null && feeStructure.getCourse().getCourseId() != null) {
            feeStructure.setCourse(courseRepository.findById(feeStructure.getCourse().getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found")));
        }
        return ResponseEntity.ok(feeStructureRepository.save(feeStructure));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeeStructure(@PathVariable Long id) {
        feeStructureRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
