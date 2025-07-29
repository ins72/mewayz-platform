const mongoose = require('mongoose');

const healthcareModuleSchema = new mongoose.Schema({
  organization_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  healthcare_facility: {
    facility_name: String,
    facility_type: {
      type: String,
      enum: ['hospital', 'clinic', 'private_practice', 'urgent_care', 'specialty_clinic', 'telehealth', 'pharmacy', 'laboratory']
    },
    license_number: String,
    accreditation: [String],
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
      emergency_contact: String
    },
    operating_hours: [{
      day: String,
      open_time: String,
      close_time: String,
      timezone: String
    }]
  },
  patient_management: {
    patient_records: [{
      patient_id: { type: String, unique: true },
      demographics: {
        first_name: { type: String, required: true },
        last_name: { type: String, required: true },
        date_of_birth: Date,
        gender: String,
        ssn: { type: String, select: false }, // Encrypted
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
          emergency_contact: {
            name: String,
            relationship: String,
            phone: String
          }
        }
      },
      insurance_info: [{
        provider: String,
        policy_number: { type: String, select: false }, // Encrypted
        group_number: String,
        effective_date: Date,
        expiration_date: Date,
        coverage_type: String,
        copay_amount: Number,
        deductible: Number
      }],
      medical_history: {
        allergies: [{
          allergen: String,
          reaction: String,
          severity: String,
          onset_date: Date
        }],
        chronic_conditions: [{
          condition: String,
          diagnosed_date: Date,
          status: String, // active, managed, resolved
          medications: [String]
        }],
        family_history: [{
          relationship: String,
          condition: String,
          age_of_onset: Number
        }],
        surgical_history: [{
          procedure: String,
          date: Date,
          surgeon: String,
          hospital: String,
          complications: String
        }]
      },
      current_medications: [{
        medication_name: String,
        dosage: String,
        frequency: String,
        prescribing_doctor: String,
        start_date: Date,
        end_date: Date,
        refills_remaining: Number
      }],
      vital_signs: [{
        recorded_date: Date,
        blood_pressure: {
          systolic: Number,
          diastolic: Number
        },
        heart_rate: Number,
        temperature: Number,
        weight: Number,
        height: Number,
        bmi: Number,
        oxygen_saturation: Number,
        recorded_by: String
      }],
      lab_results: [{
        test_name: String,
        test_date: Date,
        results: mongoose.Schema.Types.Mixed,
        reference_range: String,
        status: String, // normal, abnormal, critical
        ordered_by: String,
        lab_facility: String
      }],
      created_at: { type: Date, default: Date.now },
      last_updated: { type: Date, default: Date.now }
    }],
    appointments: [{
      appointment_id: String,
      patient_id: String,
      provider_id: String,
      appointment_type: {
        type: String,
        enum: ['consultation', 'follow_up', 'procedure', 'screening', 'emergency', 'telehealth']
      },
      scheduled_date: Date,
      duration_minutes: Number,
      status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']
      },
      notes: String,
      chief_complaint: String,
      diagnosis: [String],
      treatment_plan: String,
      follow_up_required: Boolean,
      next_appointment_date: Date
    }]
  },
  medical_staff: [{
    staff_id: String,
    personal_info: {
      first_name: String,
      last_name: String,
      title: String,
      specialization: [String],
      license_number: String,
      dea_number: { type: String, select: false }, // Encrypted
      npi_number: String
    },
    credentials: {
      medical_degree: String,
      board_certifications: [String],
      residency_program: String,
      fellowship_programs: [String],
      continuing_education: [{
        course_name: String,
        completion_date: Date,
        credits: Number,
        provider: String
      }]
    },
    role: {
      type: String,
      enum: ['physician', 'nurse', 'physician_assistant', 'nurse_practitioner', 'therapist', 'technician', 'administrator']
    },
    schedule: [{
      day: String,
      start_time: String,
      end_time: String,
      available: Boolean
    }],
    patient_assignments: [String], // patient IDs
    access_permissions: [String]
  }],
  clinical_workflows: [{
    workflow_name: String,
    workflow_type: {
      type: String,
      enum: ['admission', 'discharge', 'medication_administration', 'lab_ordering', 'imaging', 'referral']
    },
    steps: [{
      step_order: Number,
      step_name: String,
      responsible_role: String,
      estimated_duration: Number,
      required_documentation: [String],
      approval_required: Boolean,
      automated: Boolean
    }],
    compliance_requirements: [String],
    quality_metrics: [{
      metric_name: String,
      target_value: Number,
      current_value: Number,
      last_measured: Date
    }]
  }],
  billing_integration: {
    billing_system: String,
    insurance_verification: {
      auto_verify: Boolean,
      verification_provider: String,
      real_time_eligibility: Boolean
    },
    procedure_codes: [{
      code: String, // ICD-10, CPT codes
      description: String,
      base_cost: Number,
      insurance_reimbursement: Number
    }],
    billing_cycles: [{
      cycle_name: String,
      frequency: String, // daily, weekly, monthly
      last_run: Date,
      next_run: Date,
      automated: Boolean
    }]
  },
  hipaa_compliance: {
    data_encryption: {
      encryption_standard: { type: String, default: 'AES-256' },
      key_management: String,
      encryption_at_rest: { type: Boolean, default: true },
      encryption_in_transit: { type: Boolean, default: true }
    },
    access_controls: {
      role_based_access: { type: Boolean, default: true },
      minimum_necessary_rule: { type: Boolean, default: true },
      access_logging: { type: Boolean, default: true },
      session_timeout: { type: Number, default: 1800 } // 30 minutes
    },
    audit_trail: [{
      timestamp: Date,
      user_id: String,
      action: String,
      resource_accessed: String,
      patient_id: String,
      ip_address: String,
      success: Boolean,
      failure_reason: String
    }],
    data_backup: {
      backup_frequency: String,
      backup_retention_days: Number,
      backup_location: String,
      encryption_enabled: { type: Boolean, default: true },
      last_backup: Date,
      backup_verification: Boolean
    },
    incident_management: [{
      incident_id: String,
      incident_type: String,
      description: String,
      severity: String,
      affected_patients: [String],
      discovery_date: Date,
      resolution_date: Date,
      corrective_actions: [String],
      reported_to_authorities: Boolean,
      status: String
    }],
    business_associate_agreements: [{
      vendor_name: String,
      service_provided: String,
      agreement_date: Date,
      expiration_date: Date,
      phi_access_scope: String,
      security_requirements: [String]
    }]
  },
  telemedicine: {
    platform_integration: {
      video_platform: String,
      api_endpoint: String,
      security_features: [String]
    },
    virtual_consultations: [{
      session_id: String,
      patient_id: String,
      provider_id: String,
      scheduled_time: Date,
      actual_start_time: Date,
      duration_minutes: Number,
      connection_quality: String,
      recording_enabled: Boolean,
      recording_location: String,
      session_notes: String,
      prescription_issued: Boolean,
      follow_up_required: Boolean
    }],
    remote_monitoring: [{
      patient_id: String,
      device_type: String,
      metrics_tracked: [String],
      data_collection_frequency: String,
      alert_thresholds: mongoose.Schema.Types.Mixed,
      last_data_received: Date
    }]
  },
  quality_metrics: {
    patient_satisfaction: [{
      survey_date: Date,
      patient_id: String,
      overall_rating: Number,
      wait_time_rating: Number,
      provider_rating: Number,
      facility_rating: Number,
      communication_rating: Number,
      likelihood_to_recommend: Number,
      comments: String
    }],
    clinical_outcomes: [{
      metric_name: String,
      target_value: Number,
      current_value: Number,
      measurement_period: String,
      last_calculated: Date,
      trend: String // improving, declining, stable
    }],
    operational_efficiency: [{
      metric_name: String,
      value: Number,
      unit: String,
      benchmark: Number,
      measurement_date: Date
    }]
  },
  regulatory_compliance: {
    reporting_requirements: [{
      requirement_name: String,
      regulatory_body: String,
      frequency: String,
      last_submission: Date,
      next_due_date: Date,
      automated: Boolean,
      compliance_status: String
    }],
    quality_assurance: {
      accreditation_standards: [String],
      internal_audits: [{
        audit_date: Date,
        audit_scope: String,
        findings: [String],
        corrective_actions: [String],
        completion_date: Date
      }],
      external_audits: [{
        auditor: String,
        audit_date: Date,
        certification: String,
        findings: [String],
        compliance_score: Number
      }]
    }
  },
  emergency_procedures: {
    disaster_recovery: {
      backup_sites: [String],
      recovery_time_objective: Number, // minutes
      recovery_point_objective: Number, // minutes
      emergency_contacts: [{
        name: String,
        role: String,
        phone: String,
        email: String,
        priority: Number
      }],
      communication_plan: String,
      last_tested: Date,
      test_results: String
    },
    emergency_protocols: [{
      protocol_name: String,
      trigger_conditions: [String],
      response_steps: [String],
      responsible_staff: [String],
      communication_tree: mongoose.Schema.Types.Mixed
    }]
  },
  integration_settings: {
    ehr_system: {
      system_name: String,
      api_endpoint: String,
      authentication: mongoose.Schema.Types.Mixed,
      data_sync_frequency: String,
      last_sync: Date
    },
    laboratory_systems: [{
      lab_name: String,
      interface_type: String,
      test_catalog: [String],
      turnaround_times: mongoose.Schema.Types.Mixed
    }],
    pharmacy_systems: [{
      pharmacy_name: String,
      e_prescribing_enabled: Boolean,
      formulary_access: Boolean,
      drug_interaction_checking: Boolean
    }],
    imaging_systems: [{
      modality: String,
      dicom_enabled: Boolean,
      pacs_integration: Boolean,
      reporting_system: String
    }]
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Update timestamp on save
healthcareModuleSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Method to log HIPAA audit trail
healthcareModuleSchema.methods.logAccess = function(userId, action, resource, patientId, ipAddress, success, failureReason = null) {
  this.hipaa_compliance.audit_trail.push({
    timestamp: new Date(),
    user_id: userId,
    action: action,
    resource_accessed: resource,
    patient_id: patientId,
    ip_address: ipAddress,
    success: success,
    failure_reason: failureReason
  });
};

// Method to check HIPAA compliance
healthcareModuleSchema.methods.checkHIPAACompliance = function() {
  const compliance = {
    encryption_enabled: this.hipaa_compliance.data_encryption.encryption_at_rest && 
                       this.hipaa_compliance.data_encryption.encryption_in_transit,
    access_controls_active: this.hipaa_compliance.access_controls.role_based_access,
    audit_logging_active: this.hipaa_compliance.access_controls.access_logging,
    backup_current: this.hipaa_compliance.data_backup.last_backup && 
                   (Date.now() - this.hipaa_compliance.data_backup.last_backup) < (24 * 60 * 60 * 1000),
    overall_compliant: true
  };
  
  compliance.overall_compliant = Object.values(compliance).every(status => status === true);
  return compliance;
};

// Method to schedule patient appointment
healthcareModuleSchema.methods.scheduleAppointment = function(patientId, providerId, appointmentData) {
  const appointment = {
    appointment_id: new mongoose.Types.ObjectId().toString(),
    patient_id: patientId,
    provider_id: providerId,
    ...appointmentData,
    status: 'scheduled'
  };
  
  this.patient_management.appointments.push(appointment);
  return appointment;
};

// Method to add vital signs
healthcareModuleSchema.methods.recordVitalSigns = function(patientId, vitalSigns, recordedBy) {
  const patient = this.patient_management.patient_records.find(p => p.patient_id === patientId);
  
  if (!patient) {
    throw new Error('Patient not found');
  }
  
  const vitals = {
    ...vitalSigns,
    recorded_date: new Date(),
    recorded_by: recordedBy
  };
  
  // Calculate BMI if height and weight are provided
  if (vitalSigns.height && vitalSigns.weight) {
    const heightInMeters = vitalSigns.height / 100; // Convert cm to meters
    vitals.bmi = Math.round((vitalSigns.weight / (heightInMeters * heightInMeters)) * 10) / 10;
  }
  
  patient.vital_signs.push(vitals);
  return vitals;
};

// Method to generate compliance report
healthcareModuleSchema.methods.generateComplianceReport = function() {
  const report = {
    organization: this.organization_id,
    report_date: new Date(),
    hipaa_status: this.checkHIPAACompliance(),
    audit_summary: {
      total_access_attempts: this.hipaa_compliance.audit_trail.length,
      failed_attempts: this.hipaa_compliance.audit_trail.filter(log => !log.success).length,
      unique_users: [...new Set(this.hipaa_compliance.audit_trail.map(log => log.user_id))].length
    },
    security_metrics: {
      encryption_status: this.hipaa_compliance.data_encryption,
      backup_status: this.hipaa_compliance.data_backup,
      incidents_count: this.hipaa_compliance.incident_management.length,
      open_incidents: this.hipaa_compliance.incident_management.filter(i => i.status !== 'resolved').length
    },
    recommendations: []
  };
  
  // Add recommendations based on compliance status
  if (!report.hipaa_status.overall_compliant) {
    report.recommendations.push('Address HIPAA compliance gaps identified in the assessment');
  }
  
  if (report.audit_summary.failed_attempts > 0) {
    report.recommendations.push('Review failed access attempts and strengthen access controls');
  }
  
  return report;
};

module.exports = mongoose.model('HealthcareModule', healthcareModuleSchema); 