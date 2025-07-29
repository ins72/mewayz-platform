import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Smartphone, Cloud, Users, Shield, Zap } from 'lucide-react';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: <Code size={32} />,
      title: "Web Development",
      description: "Modern, responsive websites built with cutting-edge technologies."
    },
    {
      icon: <Smartphone size={32} />,
      title: "Mobile Apps",
      description: "Native and cross-platform mobile applications for iOS and Android."
    },
    {
      icon: <Cloud size={32} />,
      title: "Cloud Solutions",
      description: "Scalable cloud infrastructure and deployment solutions."
    },
    {
      icon: <Users size={32} />,
      title: "Team Collaboration",
      description: "Efficient project management and team collaboration tools."
    },
    {
      icon: <Shield size={32} />,
      title: "Security First",
      description: "Enterprise-grade security and data protection measures."
    },
    {
      icon: <Zap size={32} />,
      title: "Performance",
      description: "Lightning-fast applications optimized for speed and efficiency."
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="hero-title">
              Transform Your Business with
              <span className="text-gradient"> Modern Technology</span>
            </h1>
            <p className="hero-description">
              We help businesses leverage cutting-edge technology to drive growth, 
              improve efficiency, and create exceptional digital experiences.
            </p>
            <div className="hero-buttons">
              <Link to="/services" className="btn btn-primary">
                Explore Services
                <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get Started
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-visual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="card-content">
                <div className="code-line"></div>
                <div className="code-line short"></div>
                <div className="code-line"></div>
                <div className="code-line short"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <div className="container">
          <motion.div 
            className="section-header text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">
              Why Choose <span className="text-gradient">TechVision</span>
            </h2>
            <p className="section-description">
              We deliver exceptional results through innovation, expertise, and dedication to excellence.
            </p>
          </motion.div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div 
            className="cta-content text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="cta-title">
              Ready to Start Your <span className="text-gradient">Digital Journey</span>?
            </h2>
            <p className="cta-description">
              Let's discuss how we can help transform your business with innovative technology solutions.
            </p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn btn-primary">
                Contact Us
                <ArrowRight size={16} />
              </Link>
              <Link to="/about" className="btn btn-secondary">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 