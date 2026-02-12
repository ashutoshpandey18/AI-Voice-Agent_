import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ProblemSection />
      <SolutionFlowSection />
      <CoreInnovationSection />
      <VoiceUISection />
      <AdminDashboardSection />
      <ArchitectureSection />
      <ReliabilitySection />
      <Footer />
    </div>
  );
};

// Hero Section
const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Book a Table by Speaking — Not Typing
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Voice-first restaurant booking powered by a deterministic state machine and rule-based NLP.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/demo')}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Try Voice Demo
              </button>
              <button 
                onClick={() => document.getElementById('solution-flow')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium border border-gray-200 hover:border-gray-300 transition-colors"
              >
                View System Flow
              </button>
            </div>
          </motion.div>

          {/* Right: Voice console preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <VoiceConsolePreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Voice Console Preview Component
const VoiceConsolePreview = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="relative">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        {/* Waveform visual */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Voice Input</span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <WaveformAnimation isActive={isActive} />
        </div>

        {/* Transcript */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <div className="text-xs font-medium text-gray-500 mb-2">TRANSCRIPT</div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <span className="text-gray-400">User:</span>
              <span className="text-gray-900">"I need a table for 4 people tonight"</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400">Agent:</span>
              <span className="text-gray-900">"What time would you prefer?"</span>
            </div>
          </div>
        </div>

        {/* Booking card */}
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1">BOOKING DRAFT</div>
              <div className="text-sm font-medium text-gray-900">4 guests</div>
            </div>
            <div className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
              In Progress
            </div>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Date: Today</div>
            <div>Time: Pending</div>
            <div>State: AWAITING_TIME</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Waveform Animation
const WaveformAnimation = ({ isActive }: { isActive: boolean }) => {
  return (
    <div className="flex items-center justify-center h-16 gap-1">
      {[...Array(32)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-gray-900 rounded-full"
          animate={{
            height: isActive ? [8, 24, 16, 32, 12, 28, 8] : 8,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.03,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Problem Section
const ProblemSection = () => {
  const problems = [
    { title: 'Typing Friction', desc: 'Multi-step forms require typing name, phone, date, time, party size' },
    { title: 'Drop-off Rate', desc: 'Users abandon 40% of booking flows before completion' },
    { title: 'Mobile Experience', desc: 'Small screens make form input frustrating and error-prone' },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Traditional Booking is Broken
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every step adds friction. Every field loses customers.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
              <p className="text-sm text-gray-600">{problem.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Solution Flow Section
const SolutionFlowSection = () => {
  const steps = ['Voice Input', 'NLP Parser', 'State Machine', 'Weather API', 'Booking Created'];

  return (
    <section id="solution-flow" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Voice → Booking in Seconds
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A deterministic pipeline that converts natural speech into confirmed bookings.
          </p>
        </motion.div>

        <div className="relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative w-32 h-32 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-blue-400 transition-colors">
                    <span className="text-sm font-medium text-gray-900 text-center px-2">{step}</span>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <svg className="hidden md:block absolute w-8 h-8 text-gray-300" style={{ left: `${(i + 1) * 20}%`, top: '50%', transform: 'translate(-50%, -50%)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Core Innovation Section
const CoreInnovationSection = () => {
  const features = [
    { 
      title: 'State Machine Core',
      desc: 'Deterministic FSM with explicit transitions. Every conversation path is mapped.',
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z'
    },
    { 
      title: 'Rule-Based NLP',
      desc: 'Pattern matching and entity extraction. No LLM black box — fully auditable.',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    { 
      title: 'Predictable Transitions',
      desc: 'Each state has defined next states. No hallucinations, no unexpected behavior.',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    { 
      title: 'Debug-Friendly',
      desc: 'Full conversation state logs. See exactly which rule matched and why.',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4'
    },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Deterministic Conversation Engine
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            No LLM unpredictability. Pure state machine logic with rule-based NLP.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              <div className="relative p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Voice UI Section
const VoiceUISection = () => {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Voice-First Interface
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time waveform, live transcript, and instant booking confirmation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
            <div className="space-y-4">
              <ChatBubble speaker="user" message="I need a table for two tomorrow at 7pm" />
              <ChatBubble speaker="agent" message="Let me check the weather forecast for tomorrow evening..." />
              <ChatBubble speaker="agent" message="Great! 7pm works. May I have your name and phone number?" />
              <ChatBubble speaker="user" message="John Smith, 555-0123" />
              <ChatBubble speaker="agent" message="Perfect! Your table for 2 is confirmed for tomorrow at 7:00 PM." />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const ChatBubble = ({ speaker, message }: { speaker: 'user' | 'agent'; message: string }) => {
  const isUser = speaker === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-md px-4 py-3 rounded-lg ${isUser ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
        <div className="text-xs font-medium mb-1 opacity-60">{isUser ? 'You' : 'Agent'}</div>
        <div className="text-sm">{message}</div>
      </div>
    </div>
  );
};

// Admin Dashboard Section
const AdminDashboardSection = () => {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time analytics, booking management, and conversation logs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-3 divide-x divide-gray-200">
              <div className="p-6">
                <div className="text-2xl font-bold text-gray-900 mb-1">247</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-green-600 mb-1">94%</div>
                <div className="text-sm text-gray-600">Completion Rate</div>
              </div>
              <div className="p-6">
                <div className="text-2xl font-bold text-blue-600 mb-1">2.3m</div>
                <div className="text-sm text-gray-600">Avg. Duration</div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-6">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 border-b border-gray-200">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Guests</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">John Smith</td>
                    <td className="py-3 text-gray-600">Feb 13, 7:00 PM</td>
                    <td className="py-3 text-gray-600">2</td>
                    <td className="py-3"><span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Confirmed</span></td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">Sarah Johnson</td>
                    <td className="py-3 text-gray-600">Feb 14, 8:30 PM</td>
                    <td className="py-3 text-gray-600">4</td>
                    <td className="py-3"><span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">Confirmed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Architecture Section
const ArchitectureSection = () => {
  const layers = [
    { name: 'Frontend', tech: 'React + Vite + Tailwind', color: 'from-blue-500 to-blue-600' },
    { name: 'API Layer', tech: 'Express + TypeScript', color: 'from-green-500 to-green-600' },
    { name: 'Business Logic', tech: 'State Machine + NLP', color: 'from-purple-500 to-purple-600' },
    { name: 'Data Layer', tech: 'MongoDB + Mongoose', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            System Architecture
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Full-stack MERN with deterministic conversation layer.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${layer.color} rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity`} />
              <div className="relative p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <div className="text-4xl font-bold text-gray-200 mb-2">{i + 1}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{layer.name}</h3>
                <p className="text-sm text-gray-600">{layer.tech}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Reliability Section
const ReliabilitySection = () => {
  const features = [
    { title: 'Fallback States', desc: 'Every unparseable input has a recovery path' },
    { title: 'Validation Rules', desc: 'Business hours, party size, lead time checks' },
    { title: 'Weather Integration', desc: 'Outdoor seating suggestions based on forecast' },
    { title: 'Bilingual Support', desc: 'English and Hindi pattern matching' },
    { title: 'Error Recovery', desc: 'Confirmation loops prevent booking mistakes' },
    { title: 'Audit Logs', desc: 'Every state transition saved for debugging' },
  ];

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Production-Ready Reliability
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Edge case handling built into every conversation path.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-8 h-8 rounded bg-gray-900 flex items-center justify-center mb-4">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  return (
    <footer className="py-12 px-6 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex justify-center gap-6 mb-6">
          <a href="https://github.com/ashutoshpandey18/AI-Voice-Agent_" className="text-gray-600 hover:text-gray-900 transition-colors">
            GitHub
          </a>
          <a href="/admin/login" className="text-gray-600 hover:text-gray-900 transition-colors">
            Admin Login
          </a>
        </div>
        <p className="text-sm text-gray-500">
          Built with React, TypeScript, Express, and MongoDB
        </p>
      </div>
    </footer>
  );
};

export default LandingPage;
