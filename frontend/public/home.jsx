import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Shield, Globe, Award, Target, MessageSquare } from 'lucide-react';

const Home = () => {
  return (
    <div className="w-full">
      {/* 1. HERO SECTION (Dark gradient background with overlay) */}
      <section className="relative overflow-hidden bg-slate-900 pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
            alt="Students collaborating"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 mt-12 animate-fade-in-up">
            Empowering Student <br className="hidden md:block" />
            <span className="text-primary-400">Collaboration Globally</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 mb-10">
            PeerBridge is the premiere academic platform connecting students with peers and experts to maximize their educational journey.
          </p>
          <div className="flex justify-center gap-4 flex-col sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center bg-white/10 text-white px-8 py-3.5 rounded-full text-lg font-bold hover:bg-white/20 transition-all backdrop-blur-md"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* 2. WHY KNOWLEDGE SECTION */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                Why PeerBridge?
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                University life is tough. Finding reliable study groups, verified resources, and expert mentorship should not be a struggle. We bridge the gap between struggling students and academic excellence.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Your college journey doesn&apos;t have to be solo. Join thousands of students who have discovered the power of collaborative learning on PeerBridge.
              </p>
              <ul className="space-y-4">
                {[
                  'Verified academic resources across all modules',
                  'Instant access to expert-led tutoring sessions',
                  'Smart group formation algorithms for assignments',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-12 lg:mt-0 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-blue-50 rounded-3xl transform translate-x-4 translate-y-4 -z-10" />
              <img
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop"
                alt="Students studying together"
                className="rounded-3xl shadow-xl w-full object-cover h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE PILLARS & VALUES */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Core Pillars & Values</h2>
            <p className="text-xl text-gray-600">Built on principles that guarantee academic success for all our members.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust</h3>
              <p className="text-gray-600 leading-relaxed">
                Every resource and expert on our platform undergoes strict verification by lecturers and institutional admins to ensure complete academic integrity.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Knowledge</h3>
              <p className="text-gray-600 leading-relaxed">
                A massive centralized repository of module-specific knowledge, past papers, assignments, and lecture notes curated by top students.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accessibility</h3>
              <p className="text-gray-600 leading-relaxed">
                Education should know no borders. Our platform guarantees equal access to premium educational resources anytime, anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE FUTURE OF LEARNING */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center flex-row-reverse">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-3xl transform -translate-x-4 translate-y-4 -z-10" />
              <img
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                alt="Digital learning future"
                className="rounded-3xl shadow-xl w-full object-cover h-[450px]"
              />
            </div>
            <div className="order-1 lg:order-2 mb-12 lg:mb-0">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                The Future of Learning
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We are moving beyond the physical classroom. The future relies on rapid, digital peer-to-peer relationships that cross institutional barriers.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                By gamifying expert sessions and building reputation systems, PeerBridge ensures that knowledge providers are rewarded while learners get exactly what they need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET THE VISION (Testimonials/Profiles) */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">Meet the Vision</h2>
              <p className="text-xl text-gray-600">Empowering students who bring their unique perspectives together.</p>
            </div>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ArrowRight className="w-5 h-5 transform rotate-180 text-gray-600" />
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-gray-700 italic mb-6">
                "PeerBridge allowed me to find a study group exactly when I needed them. The resource library is absolutely incredible for exam prep!"
              </p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/100?img=47" alt="User" className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-gray-900">Alex Chen</h4>
                  <p className="text-sm text-gray-500">Computer Science, Year 3</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-gray-700 italic mb-6">
                "As an Expert, I've conducted over 20 sessions. The platform handles scheduling seamlessly and lets me focus on helping juniors learn."
              </p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/100?img=32" alt="User" className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-gray-900">Sarah Jenkins</h4>
                  <p className="text-sm text-gray-500">Expert Tutor, Year 4</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
              </div>
              <p className="text-gray-700 italic mb-6">
                "Deploying project assignments and tracking group formations is finally pain-free. It saves me hours of administrative work."
              </p>
              <div className="flex items-center gap-4">
                <img src="https://i.pravatar.cc/100?img=12" alt="User" className="w-12 h-12 rounded-full" />
                <div>
                  <h4 className="font-bold text-gray-900">Dr. M. Silva</h4>
                  <p className="text-sm text-gray-500">Senior Lecturer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-3xl p-8 md:p-16 text-center shadow-2xl overflow-hidden relative">
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary-500 opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500 opacity-50 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
                Ready to transform your<br className="hidden md:block" /> learning experience?
              </h2>
              <p className="text-primary-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                Join thousands of students globally. Access premium resources, join dynamic groups, and get expert help all in one place.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/register"
                  className="bg-white text-primary-700 font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors shadow-lg"
                >
                  Get Started Now
                </Link>
                <Link
                  to="/login"
                  className="bg-primary-700 border border-primary-500 text-white font-bold px-8 py-4 rounded-full hover:bg-primary-800 transition-colors"
                >
                  Student Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home