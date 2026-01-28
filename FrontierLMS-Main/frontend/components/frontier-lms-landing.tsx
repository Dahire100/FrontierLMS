'use client';

import { API_URL } from '@/lib/api-config';
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FrontierLMSLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);

  const router = useRouter();

  // Fetch Schools for Partners Section
  useEffect(() => {
    console.log('FrontierLMS Landing: Using API URL:', API_URL);
    const fetchSchools = async () => {
      try {
        const response = await fetch(`${API_URL}/api/schools/active`);
        const contentType = response.headers.get('content-type');

        if (response.ok && contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setSchools(data.schools || []);
        } else {
          console.warn('Fetch Schools: Received non-JSON response', response.status, contentType);
          if (response.status !== 404) {
            const text = await response.text();
            console.warn('Response preview:', text.substring(0, 100));
          }
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error);
      }
    };
    fetchSchools();
  }, []);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institute: '',
    website: '',
    solution: '',
    message: '',
    captcha: ''
  });

  const captchaText = '76ZL72';

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.institute || !formData.solution) {
      alert('Please fill in all required fields');
      return;
    }
    if (formData.captcha === captchaText) {
      console.log('Submitting form data:', formData);
      const targetUrl = `${API_URL}/api/sales-enquiry`;
      console.log('Target URL:', targetUrl);

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const contentType = response.headers.get('content-type');

        if (!response.ok) {
          const errorText = await response.text(); // Always safe to read text
          console.error('Server error response:', errorText);

          // Try to parse JSON if possible for better error message
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.message || `Server Error (${response.status})`);
          } catch (e) {
            throw new Error(`Server Error (${response.status}): ${errorText.substring(0, 50)}...`);
          }
        }

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          alert('Thank you for your enquiry! Our team will contact you soon.');
          setFormData({
            fullName: '',
            email: '',
            phone: '',
            institute: '',
            website: '',
            solution: '',
            message: '',
            captcha: ''
          });
        } else {
          const text = await response.text();
          console.error('Received HTML/Text response instead of JSON:', text.substring(0, 100));
          throw new Error('Received invalid response from server (HTML instead of JSON). check console.');
        }
      } catch (error: any) {
        console.error('Submission Error:', error);
        alert(`Failed to submit: ${error.message}. Check console for details.`);
      }
    } else {
      alert('Incorrect CAPTCHA. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const navigateToLogin = (loginType: string) => {
    router.push(`/${loginType}-login`);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <nav className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="text-3xl font-bold text-blue-600">Frontier</span>
              <span className="ml-1 bg-orange-500 text-white px-3 py-1 rounded text-sm font-bold">LMS</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-800 hover:text-blue-600 font-medium transition">Home</a>
              <a href="#about" className="text-gray-800 hover:text-blue-600 font-medium transition">About Us</a>
              <a href="#products" className="text-gray-800 hover:text-blue-600 font-medium transition">Products</a>
              <a href="#partners" className="text-gray-800 hover:text-blue-600 font-medium transition">Partners</a>
              <a href="#contact" className="text-gray-800 hover:text-blue-600 font-medium transition">Contact Us</a>
              <button
                onClick={() => router.push('/school-registration')}
                className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Register School
              </button>
            </div>



            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-4">
              <a href="#home" className="block text-gray-800 hover:text-blue-600 font-medium">Home</a>
              <a href="#about" className="block text-gray-800 hover:text-blue-600 font-medium">About Us</a>
              <a href="#products" className="block text-gray-800 hover:text-blue-600 font-medium">Products</a>
              <a href="#partners" className="block text-gray-800 hover:text-blue-600 font-medium">Partners</a>
              <a href="#contact" className="block text-gray-800 hover:text-blue-600 font-medium">Contact Us</a>
              <button
                onClick={() => router.push('/school-registration')}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-md"
              >
                Register School
              </button>
              <div className="flex flex-col gap-2 pt-4 space-y-2">
                <button
                  onClick={() => { navigateToLogin('school-admin'); setMobileMenuOpen(false); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition"
                >
                  School Admin Login
                </button>
                <button
                  onClick={() => { navigateToLogin('teacher'); setMobileMenuOpen(false); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition"
                >
                  Teacher Login
                </button>
                <button
                  onClick={() => { navigateToLogin('student'); setMobileMenuOpen(false); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition"
                >
                  Student Login
                </button>
                <button
                  onClick={() => { navigateToLogin('parent'); setMobileMenuOpen(false); }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition"
                >
                  Parent Login
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative mt-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white min-h-[600px] flex items-center pt-16 pb-32 px-4 overflow-hidden" id="home">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <span className="inline-block px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-semibold text-sm mb-6 backdrop-blur-sm">
                  🚀 #1 Choice for Top Institutions
                </span>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
                  Next-Gen ERP for <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Smart Campuses</span>
                </h1>
                <p className="text-xl text-blue-100/80 leading-relaxed max-w-xl">
                  Streamline operations, enhance learning, and boost productivity with Frontier LMS—the complete digital ecosystem for modern education.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:translate-y-[-2px] shadow-lg hover:shadow-orange-500/30"
                >
                  Schedule Demo
                </button>
                <button
                  onClick={() => router.push('/school-registration')}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:translate-y-[-2px]"
                >
                  Register School
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-2xl rounded-full transform rotate-6"></div>
              <div className="relative bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl hover:bg-white/10 transition-colors duration-500">
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">🎓</div>
                  <div>
                    <h3 className="text-xl font-bold">Frontier Ecosystem</h3>
                    <p className="text-blue-200 text-sm">Comprehensive Education Management</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { title: 'Campus Management', desc: 'End-to-end administrative automation', icon: '🏛️' },
                    { title: 'Learning Management', desc: 'Advanced LMS with live classes', icon: '💻' },
                    { title: 'Student Success', desc: 'Analytics & performance tracking', icon: '📈' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-default border border-white/5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <p className="text-sm text-blue-200/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar (Floating) */}
      <section className="relative z-20 -mt-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100">
            {[
              { number: '5L+', label: 'Active Learners', icon: '👨‍🎓' },
              { number: '150+', label: 'Partner Institutes', icon: '🏫' },
              { number: '99%', label: 'Client Retention', icon: '🤝' },
              { number: '50+', label: ' ERP Modules', icon: '📦' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center px-4 group">
                <div className="text-3xl mb-2 grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110 inline-block">{stat.icon}</div>
                <div className="text-3xl font-bold text-slate-800 mb-1">{stat.number}</div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-white" id="about">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Our Mission</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
            Empowering Education with <br />
            <span className="text-blue-600">Smart Digital Solutions</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed">
            Frontier LMS isn't just software; it's a transformation engine for educational institutions.
            We bridge the gap between traditional teaching and modern digital administration, providing
            seamless experiences for students, teachers, parents, and administrators alike.
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-24 px-4 bg-slate-50" id="products">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-orange-500 font-bold tracking-widest text-sm uppercase">Our Suite</span>
            <h2 className="text-4xl font-bold text-slate-900 mt-2">Core Solutions</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Modular, scalable, and secure. Choose the modules that fit your institution's specific needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🏛️',
                title: 'FrontierCollege',
                desc: 'Comprehensive ERP for higher education with automated grading and attendance.'
              },
              {
                icon: '🏫',
                title: 'FrontierSchool',
                desc: 'K-12 focused management system connecting parents, teachers, and students.'
              },
              {
                icon: '📚',
                title: 'LMS & E-Learning',
                desc: 'Robust learning platform for course delivery, quizzes, and content sharing.'
              },
              {
                icon: '✅',
                title: 'EasyCheck',
                desc: 'Digital evaluation system to streamline exam checking and results publishing.'
              },
              {
                icon: '💻',
                title: 'EasyPariksha',
                desc: 'Secure AI-proctored online examination system for remote assessments.'
              },
              {
                icon: '⭐',
                title: 'Accreditation Mgr',
                desc: 'Tools to manage NAAC/NBA accreditation data and reports effectively.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border-t-4 border-blue-600 group hover:-translate-y-2">
                <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center text-3xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Split Section */}
      <section className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-10 rounded-2xl transform -rotate-2"></div>
              <img
                src="https://placehold.co/800x600/2563EB/ffffff?text=Smart+Analytics+Dashboard"
                alt="Dashboard"
                className="relative rounded-lg shadow-2xl border border-gray-100 w-full"
              />
            </div>
            <div>
              <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Why Choose Frontier?</span>
              <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-6">Everything You Need to Run a Modern Campus</h2>

              <div className="space-y-4">
                {[
                  'Unified Data Repository for all stakeholders',
                  'Mobile Apps for iOS and Android',
                  'Automated Biometric Attendance Integration',
                  'Real-time Notifications & Alerts',
                  'Advanced Reporting & Analytics Dashboard',
                  'Seamless Third-party API Integrations'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">✓</div>
                    <span className="text-slate-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-10 text-blue-600 font-bold hover:text-blue-700 flex items-center gap-2 group"
              >
                Explore Features <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-24 px-4 bg-slate-50 border-t border-slate-200" id="partners">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">Trusted by Leading Institutions</h2>
            <p className="text-slate-500 mt-2">Join over 200+ schools and colleges modernizing their education.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {(schools.length > 0 ? schools : ['S.M.K.D.E Society', 'Tilak Maharashtra Vidyalaya', 'Universal Wisdom School', 'Vishwakarma Institute', 'PCCOE Pune', 'Vishwakarma University', 'DESPU']).map((school, idx) => {
              const name = typeof school === 'string' ? school : school.schoolName;
              const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

              return (
                <a key={idx} href={`/schools/${slug}/faculty`} className="group block">
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col items-center justify-center min-h-[140px] border border-transparent hover:border-blue-100">
                    <div className="text-4xl mb-3 opacity-70 group-hover:opacity-100 transition-opacity group-hover:scale-110 transform duration-300">🏫</div>
                    <p className="text-sm font-semibold text-slate-600 group-hover:text-blue-700 text-center line-clamp-2">{name}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="text-6xl text-blue-400 opacity-50 mb-6 font-serif">"</div>
          <h3 className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
            "Moving to Frontier LMS was the best decision for our institute. The efficiency in handling student data and the ease of online exams has transformed our academic process completely."
          </h3>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full"></div>
            <div className="text-left">
              <div className="font-bold text-white">Dr. A. K. Sharma</div>
              <div className="text-blue-300 text-sm">Principal, Vishwakarma Institute</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 px-4 bg-white" id="contact">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div>
                <span className="text-orange-500 font-bold tracking-widest text-sm uppercase">Get Started</span>
                <h2 className="text-4xl font-bold text-slate-900 mt-2 mb-4">Request a Proposal</h2>
                <p className="text-slate-600 text-lg">
                  Ready to digitize your campus? Fill out the form and our team will get back to you with a customized solution and a free demo.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📧</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Email Us</h4>
                    <p className="text-slate-600">contact@frontierlms.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📞</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Call Support</h4>
                    <p className="text-slate-600">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">📍</div>
                  <div>
                    <h4 className="font-bold text-slate-900">Visit HQ</h4>
                    <p className="text-slate-600">Apex Business Court, Pune, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 p-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Enquiry Form</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Work Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                  />
                  <input
                    type="text"
                    name="institute"
                    placeholder="Institute Name"
                    value={formData.institute}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="url"
                    name="website"
                    placeholder="Institute Website (Optional)"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                  />
                  <select
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all text-slate-700"
                  >
                    <option value="">Select Interest</option>
                    <option value="college">College ERP</option>
                    <option value="school">School ERP</option>
                    <option value="lms">LMS / E-Learning</option>
                    <option value="evaluation">Online Evaluation</option>
                  </select>
                </div>

                <textarea
                  name="message"
                  placeholder="Tell us about your requirements..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                ></textarea>

                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  <div className="bg-white px-4 py-2 border border-gray-200 rounded font-mono font-bold text-lg text-slate-700 tracking-widest select-none shadow-sm">
                    {captchaText}
                  </div>
                  <input
                    type="text"
                    name="captcha"
                    placeholder="Enter Code"
                    value={formData.captcha}
                    onChange={handleChange}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 font-medium placeholder:text-gray-400"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-blue-600/30 active:scale-95"
                >
                  Submit Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 px-4 relative" >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-blue-600">Frontier</span>
                <span className="ml-1 bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">LMS</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Pune, Maharashtra, India<br />
                Frontier Campus, 13th Floor, Apex Business Court
              </p>
              <div className="flex gap-3 mb-6">
                {['f', 't', 'in', 'y'].map((social, idx) => (
                  <div key={idx} className="w-10 h-10 border-2 border-blue-600 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white cursor-pointer transition">
                    {social}
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigateToLogin('admin')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-semibold transition"
              >
                Super Admin Login
              </button>
            </div>

            <div>
              <h3 className="font-bold text-blue-600 mb-4">Quick Links</h3>
              <div className="space-y-2">
                {['About us', 'FrontierCollege', 'LMS', 'EasyCheck', 'EasyAccredit', 'FrontierSchool', 'EasyPariksha'].map((link, idx) => (
                  <a key={idx} href="#" className="block text-gray-700 hover:text-blue-600 transition">{link}</a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-blue-600 mb-4">Resources</h3>
              <div className="space-y-2">
                {['Download Brochure', 'Blogs', 'Contact Us', 'Demo', 'Certificate', 'Products Video', 'Sitemap'].map((link, idx) => (
                  <a key={idx} href="#" className="block text-gray-700 hover:text-blue-600 transition">{link}</a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-blue-600 mb-4">Get in Touch</h3>
              <div className="space-y-3 text-gray-700 text-sm">
                <p>📍 Pune, Maharashtra, India</p>
                <p>📞 +91 0000000000</p>
                <p>📞 +91 0000000000</p>
                <p>📞 +91 0000000000</p>
                <p>📧 contact@frontierlms.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-6 text-center text-gray-700 text-sm">
            © Copyright Frontier LMS 2025. All Rights Reserved
          </div>
        </div>
      </footer>

      {/* Previous fixed button removal */}

    </div>
  );
}