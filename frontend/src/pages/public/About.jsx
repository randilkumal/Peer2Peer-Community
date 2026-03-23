import React from 'react';
import { Target, Users, BookOpen, Shield, ArrowRight, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

// Quick badge helper
const Badge = ({ children, className }) => (
  <span className={className}>{children}</span>
);

const About = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="bg-[#0b1120] text-center pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600 rounded-full opacity-10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full opacity-10 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <Badge className="bg-primary-500/10 text-primary-400 border border-primary-500/20 mb-8 uppercase tracking-widest px-4 py-1.5 text-xs font-bold rounded-full inline-block">
            Our Mission
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-8">
            Empowering students to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">learn together.</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            PeerBridge was built by students, for students. We believe that formal classroom education is just the beginning. The real mastery comes when students teach each other.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How it all started</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                In 2024, our founders noticed a massive gap in how universities functioned. While coursework was rigorous, students were isolated. Forming study groups relied on massive chaotic WhatsApp chats, and finding past papers meant relying on older students who happens to be your friend.
              </p>
              <p>
                We realized that the smartest people in the room weren't just the professors—they were the students who had taken the exact same class last semester and mastered it. That was the spark that created PeerBridge.
              </p>
              <p>
                Today, PeerBridge connects thousands of students, enabling them to form intelligent groups, find verified resources, and book specialized 1-on-1 sessions with 'Expert' peers who have proven their mastery.
              </p>
            </div>
            <Link to="/register" className="inline-flex items-center gap-2 mt-8 text-primary-600 font-bold hover:text-primary-700 transition-colors">
              Join the movement <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary-100 rounded-[2rem] transform translate-x-4 translate-y-4 -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
              alt="Students working" 
              className="rounded-[2rem] shadow-xl w-full h-[500px] object-cover" 
            />
          </div>
        </div>
      </div>

      {/* Philosophy Grid */}
      <div className="bg-gray-50 py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Philosophy</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-16">
            Everything we build is designed to make learning more collaborative, accessible, and structured.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Collaboration First</h3>
              <p className="text-gray-600">Learning shouldn't be a solo journey. We build tools that make connecting with classmates effortless.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Reward Mastery</h3>
              <p className="text-gray-600">Students who master subjects should be empowered (and rewarded) to teach others through our Expert system.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Academic Integrity</h3>
              <p className="text-gray-600">Every resource on our platform passes through lecturer verification to ensure absolute fidelity and trust.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm text-left">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Goal Oriented</h3>
              <p className="text-gray-600">No more chaotic group projects. Our algorithms ensure robust team formations that drive results.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
