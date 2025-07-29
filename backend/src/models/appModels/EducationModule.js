const mongoose = require('mongoose');

const educationModuleSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  institution_info: {
    institution_name: String,
    institution_type: {
      type: String,
      enum: ['university', 'college', 'high_school', 'middle_school', 'elementary', 'preschool', 'training_center', 'online_academy']
    },
    accreditation: [String],
    license_number: String,
    address: {
      street: String,
      city: String,
      state: String,
      zip_code: String,
      country: String
    },
    contact_info: {
      phone: String,
      fax: String,
      email: String,
      website: String,
      emergency_contact: String
    },
    academic_calendar: {
      semester_system: { type: String, enum: ['semester', 'quarter', 'trimester', 'year_round'] },
      current_term: String,
      term_start_date: Date,
      term_end_date: Date,
      holidays: [{ name: String, date: Date }],
      exam_periods: [{ name: String, start_date: Date, end_date: Date }]
    }
  },
  student_management: {
    students: [{
      student_id: { type: String, unique: true },
      demographics: {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        middle_name: String,
        date_of_birth: Date,
        gender: String,
        ssn: { type: String, select: false }, // Encrypted for FERPA compliance
        address: {
          street: String,
          city: String,
          state: String,
          zip_code: String,
          country: String
        },
        contact: {
          phone: String,
          email: String,
          parent_guardian: [{
            name: String,
            relationship: String,
            phone: String,
            email: String,
            is_emergency_contact: Boolean,
            can_pickup: Boolean,
            receives_communications: Boolean
          }]
        }
      },
      academic_info: {
        grade_level: String,
        class_year: String,
        enrollment_date: Date,
        graduation_date: Date,
        student_status: {
          type: String,
          enum: ['enrolled', 'graduated', 'transferred', 'withdrawn', 'suspended', 'on_leave']
        },
        gpa: Number,
        credit_hours_completed: Number,
        credit_hours_attempted: Number,
        academic_standing: String, // good_standing, probation, suspension
        major: String,
        minor: [String],
        advisor: String,
        anticipated_graduation: Date
      },
      financial_info: {
        tuition_balance: Number,
        financial_aid: [{
          aid_type: String, // scholarship, grant, loan, work_study
          amount: Number,
          academic_year: String,
          status: String,
          disbursement_dates: [Date]
        }],
        payment_plan: String,
        billing_address: {
          street: String,
          city: String,
          state: String,
          zip_code: String,
          country: String
        }
      },
      health_records: {
        immunizations: [{
          vaccine_name: String,
          date_administered: Date,
          healthcare_provider: String,
          lot_number: String,
          expiration_date: Date
        }],
        allergies: [String],
        medical_conditions: [String],
        emergency_medications: [String],
        health_insurance: {
          provider: String,
          policy_number: { type: String, select: false },
          group_number: String
        }
      },
      special_services: {
        iep_status: Boolean, // Individualized Education Program
        section_504_plan: Boolean,
        english_language_learner: Boolean,
        gifted_program: Boolean,
        special_accommodations: [String],
        support_services: [String]
      },
      discipline_records: [{
        incident_date: Date,
        incident_type: String,
        description: String,
        action_taken: String,
        staff_member: String,
        resolved: Boolean,
        parent_contacted: Boolean
      }],
      created_at: { type: Date, default: Date.now },
      last_updated: { type: Date, default: Date.now }
    }],
    enrollment: [{
      enrollment_id: String,
      student_id: String,
      course_id: String,
      semester: String,
      enrollment_date: Date,
      enrollment_status: {
        type: String,
        enum: ['enrolled', 'dropped', 'withdrawn', 'completed', 'audit']
      },
      grade: String,
      credit_hours: Number,
      attendance_percentage: Number,
      final_grade_date: Date
    }]
  },
  course_management: {
    courses: [{
      course_id: String,
      course_code: String, // e.g., MATH101
      course_name: String,
      description: String,
      department: String,
      credit_hours: Number,
      prerequisites: [String],
      corequisites: [String],
      learning_objectives: [String],
      syllabus: String,
      textbooks: [{
        title: String,
        author: String,
        isbn: String,
        edition: String,
        required: Boolean
      }],
      assessment_methods: [{
        type: String, // exam, quiz, assignment, project, participation
        weight_percentage: Number,
        description: String
      }],
      grading_scale: [{
        letter_grade: String,
        min_percentage: Number,
        max_percentage: Number,
        gpa_points: Number
      }]
    }],
    class_sections: [{
      section_id: String,
      course_id: String,
      section_number: String,
      semester: String,
      instructor_id: String,
      max_enrollment: Number,
      current_enrollment: Number,
      room: String,
      building: String,
      schedule: [{
        day: String,
        start_time: String,
        end_time: String
      }],
      delivery_method: {
        type: String,
        enum: ['in_person', 'online', 'hybrid', 'distance_learning']
      },
      course_materials: [{
        material_type: String,
        title: String,
        url: String,
        file_path: String,
        required: Boolean
      }]
    }],
    assignments: [{
      assignment_id: String,
      course_id: String,
      section_id: String,
      title: String,
      description: String,
      assignment_type: String,
      due_date: Date,
      points_possible: Number,
      submission_method: String, // online, in_person, email
      late_policy: String,
      rubric: [{
        criteria: String,
        points: Number,
        description: String
      }],
      attachments: [String]
    }]
  },
  faculty_staff: [{
    employee_id: String,
    personal_info: {
      first_name: String,
      last_name: String,
      title: String,
      department: String,
      position: String,
      employment_type: String, // full_time, part_time, adjunct, substitute
      hire_date: Date,
      employee_status: String // active, on_leave, terminated
    },
    credentials: {
      highest_degree: String,
      certifications: [String],
      teaching_license: String,
      areas_of_expertise: [String],
      professional_development: [{
        course_name: String,
        completion_date: Date,
        hours: Number,
        provider: String
      }]
    },
    contact_info: {
      office_location: String,
      phone: String,
      email: String,
      office_hours: [{
        day: String,
        start_time: String,
        end_time: String
      }]
    },
    teaching_load: {
      courses_assigned: [String],
      max_students: Number,
      preparation_periods: Number,
      extra_duties: [String]
    },
    performance_evaluations: [{
      evaluation_date: Date,
      evaluator: String,
      overall_rating: String,
      strengths: [String],
      areas_for_improvement: [String],
      goals: [String],
      action_plan: String
    }]
  }],
  learning_management: {
    online_courses: [{
      course_id: String,
      platform_type: String, // moodle, canvas, blackboard, custom
      course_url: String,
      access_settings: {
        start_date: Date,
        end_date: Date,
        enrollment_key: String,
        guest_access: Boolean
      },
      content_modules: [{
        module_name: String,
        module_order: Number,
        content_items: [{
          item_type: String, // video, document, quiz, assignment, discussion
          title: String,
          description: String,
          content_url: String,
          estimated_time_minutes: Number,
          completion_required: Boolean
        }]
      }],
      discussion_forums: [{
        forum_name: String,
        description: String,
        posts: [{
          author: String,
          content: String,
          posted_at: Date,
          replies: [{
            author: String,
            content: String,
            posted_at: Date
          }]
        }]
      }],
      gradebook_integration: Boolean,
      proctoring_enabled: Boolean
    }],
    assessments: [{
      assessment_id: String,
      course_id: String,
      assessment_type: String, // quiz, exam, survey
      title: String,
      instructions: String,
      time_limit_minutes: Number,
      attempts_allowed: Number,
      questions: [{
        question_id: String,
        question_type: String, // multiple_choice, true_false, essay, short_answer
        question_text: String,
        points: Number,
        answer_choices: [String],
        correct_answer: String,
        feedback: String
      }],
      auto_grade: Boolean,
      release_scores_immediately: Boolean
    }]
  },
  grading_analytics: {
    grade_reports: [{
      student_id: String,
      course_id: String,
      semester: String,
      grades: [{
        assignment_id: String,
        points_earned: Number,
        points_possible: Number,
        percentage: Number,
        letter_grade: String,
        submission_date: Date,
        late_submission: Boolean,
        feedback: String
      }],
      current_grade: Number,
      final_grade: String,
      gpa_impact: Number
    }],
    class_analytics: [{
      course_id: String,
      section_id: String,
      semester: String,
      enrollment_count: Number,
      completion_rate: Number,
      average_grade: Number,
      grade_distribution: [{
        letter_grade: String,
        count: Number,
        percentage: Number
      }],
      student_engagement: {
        average_login_frequency: Number,
        assignment_submission_rate: Number,
        discussion_participation_rate: Number
      },
      learning_outcomes: [{
        outcome: String,
        mastery_percentage: Number,
        assessment_method: String
      }]
    }]
  },
  ferpa_compliance: {
    privacy_settings: {
      directory_information: {
        name: { type: Boolean, default: true },
        address: { type: Boolean, default: false },
        phone: { type: Boolean, default: false },
        email: { type: Boolean, default: true },
        date_of_birth: { type: Boolean, default: false },
        major: { type: Boolean, default: true },
        enrollment_status: { type: Boolean, default: true },
        graduation_date: { type: Boolean, default: true }
      },
      consent_records: [{
        student_id: String,
        consent_type: String, // directory_info, transcript_release, photo_release
        granted: Boolean,
        date_granted: Date,
        expiration_date: Date,
        witness: String
      }]
    },
    access_controls: {
      role_based_access: { type: Boolean, default: true },
      need_to_know_basis: { type: Boolean, default: true },
      audit_trail_enabled: { type: Boolean, default: true },
      session_timeout_minutes: { type: Number, default: 1800 }
    },
    audit_log: [{
      timestamp: Date,
      user_id: String,
      action: String,
      student_record_accessed: String,
      purpose: String,
      ip_address: String,
      success: Boolean,
      data_exported: Boolean
    }],
    data_retention: {
      student_records_years: { type: Number, default: 7 },
      financial_records_years: { type: Number, default: 7 },
      discipline_records_years: { type: Number, default: 5 },
      health_records_years: { type: Number, default: 10 },
      automated_purge_enabled: { type: Boolean, default: false }
    },
    incident_management: [{
      incident_id: String,
      incident_type: String, // unauthorized_access, data_breach, improper_disclosure
      description: String,
      affected_students: [String],
      discovery_date: Date,
      reported_date: Date,
      resolution_date: Date,
      corrective_actions: [String],
      reported_to_authorities: Boolean
    }]
  },
  parent_portal: {
    parent_accounts: [{
      parent_id: String,
      linked_students: [String],
      access_permissions: {
        view_grades: Boolean,
        view_attendance: Boolean,
        view_assignments: Boolean,
        view_discipline: Boolean,
        receive_communications: Boolean,
        schedule_conferences: Boolean
      },
      communication_preferences: {
        email_notifications: Boolean,
        sms_notifications: Boolean,
        portal_messages: Boolean,
        emergency_only: Boolean
      },
      last_login: Date,
      account_status: String // active, suspended, restricted
    }],
    communications: [{
      communication_id: String,
      sender: String,
      recipients: [String],
      student_id: String,
      subject: String,
      message: String,
      communication_type: String, // announcement, progress_report, discipline, emergency
      sent_date: Date,
      read_receipts: [{
        recipient: String,
        read_date: Date
      }],
      reply_required: Boolean,
      priority: String // high, medium, low
    }]
  },
  transportation: {
    bus_routes: [{
      route_id: String,
      route_name: String,
      driver_name: String,
      bus_number: String,
      capacity: Number,
      stops: [{
        stop_id: String,
        stop_name: String,
        address: String,
        pickup_time: String,
        dropoff_time: String,
        students_assigned: [String]
      }],
      route_active: Boolean,
      special_needs_equipped: Boolean
    }],
    transportation_requests: [{
      request_id: String,
      student_id: String,
      request_type: String, // regular, field_trip, special_event
      pickup_location: String,
      dropoff_location: String,
      date_needed: Date,
      approved: Boolean,
      approved_by: String,
      approval_date: Date
    }]
  },
  facilities_resources: {
    classrooms: [{
      room_id: String,
      building: String,
      room_number: String,
      capacity: Number,
      equipment: [String],
      accessibility_features: [String],
      room_type: String, // lecture, lab, computer, library, gym
      booking_calendar: [{
        date: Date,
        start_time: String,
        end_time: String,
        reserved_by: String,
        purpose: String
      }]
    }],
    library_resources: [{
      resource_id: String,
      resource_type: String, // book, ebook, journal, database, media
      title: String,
      author: String,
      isbn: String,
      availability_status: String,
      location: String,
      checkout_history: [{
        student_id: String,
        checkout_date: Date,
        due_date: Date,
        return_date: Date,
        overdue: Boolean
      }]
    }],
    technology_resources: [{
      device_id: String,
      device_type: String, // laptop, tablet, projector, smart_board
      model: String,
      serial_number: String,
      location: String,
      condition: String,
      assigned_to: String,
      checkout_date: Date,
      return_due_date: Date,
      maintenance_history: [{
        service_date: Date,
        issue_description: String,
        resolution: String,
        cost: Number
      }]
    }]
  },
  reporting_analytics: {
    academic_reports: [{
      report_type: String,
      generated_date: Date,
      parameters: mongoose.Schema.Types.Mixed,
      data: mongoose.Schema.Types.Mixed,
      generated_by: String,
      recipients: [String]
    }],
    compliance_reports: [{
      report_type: String, // ferpa_audit, enrollment_statistics, graduation_rates
      reporting_period: String,
      submission_date: Date,
      submitted_to: String,
      status: String,
      report_data: mongoose.Schema.Types.Mixed
    }],
    performance_metrics: {
      student_retention_rate: Number,
      graduation_rate: Number,
      average_gpa: Number,
      college_readiness_percentage: Number,
      standardized_test_scores: [{
        test_name: String,
        average_score: Number,
        grade_level: String,
        year: String
      }],
      teacher_retention_rate: Number,
      student_teacher_ratio: Number
    }
  },
  integration_settings: {
    sis_integration: {
      system_name: String,
      api_endpoint: String,
      authentication: mongoose.Schema.Types.Mixed,
      sync_frequency: String,
      last_sync: Date
    },
    lms_integration: {
      platform: String,
      api_key: { type: String, select: false },
      single_sign_on: Boolean,
      grade_passback: Boolean
    },
    financial_system: {
      system_name: String,
      integration_type: String,
      automatic_billing: Boolean,
      payment_gateway: String
    },
    state_reporting: {
      state_code: String,
      reporting_system: String,
      automated_submissions: Boolean,
      compliance_checks: Boolean
    }
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
educationModuleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to log FERPA audit trail
educationModuleSchema.methods.logAccess = function(userId, action, studentId, purpose, ipAddress, success, dataExported = false) {
  this.ferpa_compliance.audit_log.push({
    timestamp: new Date(),
    user_id: userId,
    action: action,
    student_record_accessed: studentId,
    purpose: purpose,
    ip_address: ipAddress,
    success: success,
    data_exported: dataExported
  });
};

// Method to check FERPA compliance
educationModuleSchema.methods.checkFERPACompliance = function() {
  const compliance = {
    privacy_controls_active: this.ferpa_compliance.access_controls.role_based_access,
    audit_logging_enabled: this.ferpa_compliance.access_controls.audit_trail_enabled,
    consent_records_current: this.ferpa_compliance.privacy_settings.consent_records.length > 0,
    data_retention_configured: this.ferpa_compliance.data_retention.student_records_years > 0,
    overall_compliant: true
  };
  
  compliance.overall_compliant = Object.values(compliance).every(status => status === true);
  return compliance;
};

// Method to enroll student in course
educationModuleSchema.methods.enrollStudent = function(studentId, courseId, sectionId, semester, creditHours) {
  const enrollment = {
    enrollment_id: new mongoose.Types.ObjectId().toString(),
    student_id: studentId,
    course_id: courseId,
    section_id: sectionId,
    semester: semester,
    enrollment_date: new Date(),
    enrollment_status: 'enrolled',
    credit_hours: creditHours,
    attendance_percentage: 0
  };
  
  this.student_management.enrollment.push(enrollment);
  return enrollment;
};

// Method to calculate student GPA
educationModuleSchema.methods.calculateStudentGPA = function(studentId) {
  const enrollments = this.student_management.enrollment.filter(e => 
    e.student_id === studentId && e.enrollment_status === 'completed' && e.grade
  );
  
  if (enrollments.length === 0) return 0;
  
  let totalPoints = 0;
  let totalCredits = 0;
  
  enrollments.forEach(enrollment => {
    // Convert letter grade to GPA points (simplified)
    const gradePoints = this.getGradePoints(enrollment.grade);
    totalPoints += gradePoints * enrollment.credit_hours;
    totalCredits += enrollment.credit_hours;
  });
  
  return totalCredits > 0 ? Math.round((totalPoints / totalCredits) * 100) / 100 : 0;
};

// Helper method to convert grades to GPA points
educationModuleSchema.methods.getGradePoints = function(letterGrade) {
  const gradeScale = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  
  return gradeScale[letterGrade] || 0;
};

// Method to generate academic transcript
educationModuleSchema.methods.generateTranscript = function(studentId) {
  const student = this.student_management.students.find(s => s.student_id === studentId);
  
  if (!student) {
    throw new Error('Student not found');
  }
  
  const enrollments = this.student_management.enrollment.filter(e => 
    e.student_id === studentId && e.enrollment_status === 'completed'
  );
  
  const transcript = {
    student_info: {
      name: `${student.demographics.first_name} ${student.demographics.last_name}`,
      student_id: student.student_id,
      date_of_birth: student.demographics.date_of_birth,
      major: student.academic_info.major,
      graduation_date: student.academic_info.graduation_date
    },
    academic_record: enrollments.map(enrollment => {
      const course = this.course_management.courses.find(c => c.course_id === enrollment.course_id);
      return {
        course_code: course?.course_code || 'N/A',
        course_name: course?.course_name || 'N/A',
        semester: enrollment.semester,
        credit_hours: enrollment.credit_hours,
        grade: enrollment.grade
      };
    }),
    summary: {
      total_credits_attempted: student.academic_info.credit_hours_attempted,
      total_credits_completed: student.academic_info.credit_hours_completed,
      cumulative_gpa: this.calculateStudentGPA(studentId),
      academic_standing: student.academic_info.academic_standing
    },
    generated_date: new Date()
  };
  
  return transcript;
};

// Method to generate compliance report
educationModuleSchema.methods.generateComplianceReport = function() {
  const report = {
    institution: this.institution_info.institution_name,
    report_date: new Date(),
    ferpa_status: this.checkFERPACompliance(),
    enrollment_statistics: {
      total_students: this.student_management.students.length,
      active_students: this.student_management.students.filter(s => s.academic_info.student_status === 'enrolled').length,
      graduation_rate: this.reporting_analytics.performance_metrics.graduation_rate || 0
    },
    privacy_metrics: {
      audit_log_entries: this.ferpa_compliance.audit_log.length,
      consent_records: this.ferpa_compliance.privacy_settings.consent_records.length,
      privacy_incidents: this.ferpa_compliance.incident_management.length,
      open_incidents: this.ferpa_compliance.incident_management.filter(i => !i.resolution_date).length
    },
    academic_performance: {
      average_gpa: this.reporting_analytics.performance_metrics.average_gpa || 0,
      retention_rate: this.reporting_analytics.performance_metrics.student_retention_rate || 0,
      teacher_student_ratio: this.reporting_analytics.performance_metrics.student_teacher_ratio || 0
    },
    recommendations: []
  };
  
  // Add recommendations based on compliance status
  if (!report.ferpa_status.overall_compliant) {
    report.recommendations.push('Address FERPA compliance gaps in privacy controls');
  }
  
  if (report.privacy_metrics.open_incidents > 0) {
    report.recommendations.push('Resolve open privacy incidents and strengthen data protection');
  }
  
  return report;
};

module.exports = mongoose.model('EducationModule', educationModuleSchema); 