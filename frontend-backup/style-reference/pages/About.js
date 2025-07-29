import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, Globe, Heart, Zap } from 'lucide-react';
import './About.css';

const About = () => {
  const values = [
    {
      icon: <Target size={32} />,
      title: "Innovation",
      description: "We constantly push boundaries to deliver cutting-edge solutions."
    },
    {
      icon: <Heart size={32} />,
      title: "Passion",
      description: "We're passionate about creating exceptional digital experiences."
    },
    {
      icon: <Users size={32} />,
      title: "Collaboration",
      description: "We believe in the power of teamwork and client partnerships."
    },
    {
      icon: <Award size={32} />,
      title: "Excellence",
      description: "We strive for excellence in every project we undertake."
    }
  ];

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Visionary leader with 10+ years in tech industry"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "Technical expert specializing in scalable architectures"
    },
    {
      name: "Emily Rodriguez",
      role: "Design Director",
      description: "Creative genius behind our stunning user experiences"
    },
    {
      name: "David Kim",
      role: "Lead Developer",
      description: "Full-stack wizard with expertise in modern technologies"
    }
  ];

  const stats = [
    { number: "150+", label: "Projects Completed" },
    { number: "50+", label: "Happy Clients" },
    { number: "5+", label: "Years Experience" },
    { number: "24/7", label: "Support Available" }
  ];

  return (
    <div className="about">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div 
            className="about-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="about-title">
              About <span className="text-gradient">TechVision</span>
            </h1>
            <p className="about-subtitle">
              We are a passionate team of innovators, designers, and developers 
              dedicated to transforming businesses through technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section section">
        <div className="container">
          <div className="mission-content">
            <motion.div 
              className="mission-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title">Our Mission</h2>
              <p className="section-description">
                To empower businesses with innovative technology solutions that drive growth, 
                improve efficiency, and create exceptional digital experiences. We believe 
                that technology should be accessible, intuitive, and transformative.
              </p>
              <p className="section-description">
                Our team combines deep technical expertise with creative problem-solving 
                to deliver solutions that not only meet our clients' needs but exceed 
                their expectations.
              </p>
            </motion.div>
            
            <motion.div 
              className="mission-visual"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="mission-card">
                <Globe size={48} />
                <h3>Global Impact</h3>
                <p>Connecting businesses worldwide through technology</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Our Values</h2>
            <p className="section-description">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="value-icon">
                  {value.icon}
                </div>
                <h3 className="value-title">{value.title}</h3>
                <p className="value-description">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="stat-number">{stat.number}</h3>
                <p className="stat-label">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Meet Our Team</h2>
            <p className="section-description">
              The talented individuals behind our success
            </p>
          </motion.div>

          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="member-avatar">
                  <Users size={32} />
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <p className="member-description">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta section">
        <div className="container">
          <motion.div 
            className="cta-content text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              Ready to Work with <span className="text-gradient">Us</span>?
            </h2>
            <p className="cta-description">
              Let's discuss how we can help transform your business with innovative technology solutions.
            </p>
            <div className="cta-buttons">
              <a href="/contact" className="btn btn-primary">
                Get Started
                <Zap size={16} />
              </a>
              <a href="/services" className="btn btn-secondary">
                View Services
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About; 