import React from 'react';
import { motion } from 'framer-motion';
import { Code, Smartphone, Cloud, Users, Zap, Check } from 'lucide-react';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: <Code size={32} />,
      title: "Web Development",
      description: "Modern, responsive websites and web applications built with cutting-edge technologies.",
      features: ["React & Next.js", "Node.js Backend", "Database Design", "API Integration"]
    },
    {
      icon: <Smartphone size={32} />,
      title: "Mobile Development",
      description: "Native and cross-platform mobile applications for iOS and Android platforms.",
      features: ["React Native", "iOS Development", "Android Development", "App Store Deployment"]
    },
    {
      icon: <Cloud size={32} />,
      title: "Cloud Solutions",
      description: "Scalable cloud infrastructure and deployment solutions for modern applications.",
      features: ["AWS/Azure/GCP", "Docker & Kubernetes", "CI/CD Pipelines", "Monitoring & Logging"]
    },
    {
      icon: <Users size={32} />,
      title: "Consulting",
      description: "Expert technology consulting to help you make informed decisions.",
      features: ["Technical Architecture", "Technology Selection", "Performance Optimization", "Security Audits"]
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$2,999",
      description: "Perfect for small businesses",
      features: ["5 Pages Website", "Mobile Responsive", "Contact Form", "Basic SEO", "1 Month Support"]
    },
    {
      name: "Professional",
      price: "$5,999",
      description: "Ideal for growing businesses",
      features: ["10 Pages Website", "CMS Integration", "E-commerce Setup", "Advanced SEO", "3 Months Support", "Performance Optimization"]
    },
    {
      name: "Enterprise",
      price: "$12,999",
      description: "For large-scale projects",
      features: ["Unlimited Pages", "Custom Features", "Advanced Analytics", "Priority Support", "6 Months Support", "Security Hardening"]
    }
  ];

  return (
    <div className="services">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="container">
          <motion.div 
            className="services-hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="services-title">
              Our <span className="text-gradient">Services</span>
            </h1>
            <p className="services-subtitle">
              Comprehensive technology solutions to help your business grow and succeed in the digital world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="services-grid-section section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">What We Offer</h2>
            <p className="section-description">
              From concept to deployment, we handle every aspect of your digital transformation.
            </p>
          </motion.div>

          <div className="services-grid">
            {services.map((service, index) => (
              <motion.div
                key={index}
                className="service-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="service-icon">
                  {service.icon}
                </div>
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
                <ul className="service-features">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">Pricing Plans</h2>
            <p className="section-description">
              Choose the perfect plan for your business needs
            </p>
          </motion.div>

          <div className="pricing-grid">
            {pricing.map((plan, index) => (
              <motion.div
                key={index}
                className={`pricing-card ${index === 1 ? 'featured' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {index === 1 && <div className="featured-badge">Most Popular</div>}
                <div className="pricing-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">/project</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="btn btn-primary pricing-btn">
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta section">
        <div className="container">
          <motion.div 
            className="cta-content text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              Ready to Start Your <span className="text-gradient">Project</span>?
            </h2>
            <p className="cta-description">
              Let's discuss your requirements and create something amazing together.
            </p>
            <div className="cta-buttons">
              <a href="/contact" className="btn btn-primary">
                Get Free Quote
                <Zap size={16} />
              </a>
              <a href="/contact" className="btn btn-secondary">
                Schedule Call
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Services; 