import React, { useState } from 'react';
import { Search, Compass, ShieldCheck, Award, MessageSquare, Mail, FileText, Activity, ChevronDown, ChevronRight, PlayCircle } from 'lucide-react';

const Help = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      category: 'GROUP REGISTRATION',
      questions: [
        { q: 'How do I join a private project group?', a: 'To join a private group, navigate to Group Registration on your student dashboard, select the module, and enter the private invite code provided by your group leader.' },
        { q: 'What is the maximum group size?', a: 'Group limits are set individually by the module lecturer. You can see the capacity limit on the Group Registration table.' },
      ]
    },
    {
      category: 'EARNING EXPERT STATUS',
      questions: [
        { q: "What are the requirements for 'Expert' badges?", a: 'To qualify as an Expert, you must be a minimum of Year 2 and hold an A+ (Mastered) grade in the respective module. Additional requirements include institutional verification.' }
      ]
    },
    {
      category: 'RESOURCE APPROVALS',
      questions: [
        { q: 'How long does resource approval take?', a: 'Lecturers typically review and approve uploaded resources within 48-72 hours. You will receive an email notification upon approval.' }
      ]
    }
  ];

  return (
    <div className="bg-[#f8f9fc] min-h-screen pb-20">
      {/* Header Search Section */}
      <div className="bg-white border-b border-gray-100 py-20 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          How can we help you today?
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto mb-8">
          Search our knowledge base or browse the categories below to get started with PeerBridge.
        </p>
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative flex items-center shadow-lg rounded-xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-shadow">
            <div className="pl-4 pr-2 bg-white flex items-center">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for 'How to join a group', 'Expert badges'..."
              className="w-full py-4 text-gray-700 outline-none"
            />
            <div className="pr-2 bg-white">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Content (Left Side) */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Quick Start Guides */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Compass className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Quick Start Guides</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Students */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-lg mb-4">
                  <div className="text-blue-600 font-bold">👤</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Students</h3>
                <p className="text-sm text-gray-500 mb-6 flex-grow">
                  Learn how to find study groups and access premium resources.
                </p>
                <button className="w-full border border-blue-200 text-blue-600 rounded-lg py-2 hover:bg-blue-50 transition-colors text-sm font-semibold">
                  Start Tour
                </button>
              </div>

              {/* Experts */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="w-10 h-10 bg-indigo-50 flex items-center justify-center rounded-lg mb-4">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Experts</h3>
                <p className="text-sm text-gray-500 mb-6 flex-grow">
                  Master session management and growing your reputation score.
                </p>
                <button className="w-full border border-indigo-200 text-indigo-600 rounded-lg py-2 hover:bg-indigo-50 transition-colors text-sm font-semibold">
                  Start Tour
                </button>
              </div>

              {/* Lecturers */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="w-10 h-10 bg-purple-50 flex items-center justify-center rounded-lg mb-4">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Lecturers</h3>
                <p className="text-sm text-gray-500 mb-6 flex-grow">
                  Guidelines for content moderation and institutional reporting.
                </p>
                <button className="w-full border border-purple-200 text-purple-600 rounded-lg py-2 hover:bg-purple-50 transition-colors text-sm font-semibold">
                  Start Tour
                </button>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-700 font-bold rounded">?</div>
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl overflow-hidden divide-y divide-gray-100">
              {faqs.map((faqGroup, gIdx) => (
                <div key={gIdx} className="p-2">
                  <h4 className="text-xs font-bold text-primary-500 tracking-wider uppercase px-4 pt-4 pb-2">
                    {faqGroup.category}
                  </h4>
                  {faqGroup.questions.map((item, qIdx) => {
                    const idx = `${gIdx}-${qIdx}`;
                    const isOpen = openFaq === idx;
                    return (
                      <div key={qIdx} className="border-b border-gray-50 last:border-0">
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-700 text-sm">{item.q}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-500 text-sm leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* Video Tutorials */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Video Tutorials</h2>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4 rotate-180 text-gray-500" />
                </button>
                <button className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Video 1 */}
              <div>
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video mb-3 group cursor-pointer block">
                  <img src="https://images.unsplash.com/photo-1610484826967-09c5720700c7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Getting Started" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-primary-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-medium">
                    2:14
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Getting Started in 2 Minutes</h4>
                <p className="text-gray-500 text-xs mt-1">Platform overview for new users.</p>
              </div>

              {/* Video 2 */}
              <div>
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video mb-3 group cursor-pointer block">
                  <img src="https://images.unsplash.com/photo-1577896849786-738ed6c78bd3?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Manage Session" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-primary-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-medium">
                    5:42
                  </div>
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Managing Your First Session</h4>
                <p className="text-gray-500 text-xs mt-1">How to lead a collaborative project.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar (Right Side) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Contact Support */}
           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg">
                 <HeadphonesIcon className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-bold text-gray-900">Contact Support</h3>
             </div>
             <p className="text-sm text-gray-500 mb-6">
               Can't find what you're looking for? Our team is here to help you succeed.
             </p>
             
             <button className="w-full flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-4 mb-3 transition-colors shadow-sm">
               <div className="flex items-center gap-3 text-left">
                 <MessageSquare className="w-5 h-5 flex-shrink-0" />
                 <div>
                   <p className="font-bold text-sm">Live Chat</p>
                   <p className="text-xs text-blue-200">Usually replies in 5 mins</p>
                 </div>
               </div>
               <div className="w-2 h-2 rounded-full bg-green-400"></div>
             </button>

             <button className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-4 mb-3 transition-colors">
               <div className="flex items-center gap-3 text-left">
                 <Mail className="w-5 h-5 flex-shrink-0 text-blue-500" />
                 <div>
                   <p className="font-bold text-sm">Email Support</p>
                   <p className="text-xs text-gray-400">Response within 24 hours</p>
                 </div>
               </div>
             </button>

             <button className="w-full flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl p-4 transition-colors">
               <div className="flex items-center gap-3 text-left">
                 <FileText className="w-5 h-5 flex-shrink-0 text-blue-500" />
                 <div>
                   <p className="font-bold text-sm">Full Documentation</p>
                   <p className="text-xs text-gray-400">Technical API & Integrations</p>
                 </div>
               </div>
             </button>
           </div>

           {/* Trending Topics */}
           <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Trending Topics</h3>
             <ul className="space-y-3 shrink-0">
               <li>
                 <a href="#" className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors">
                   <Activity className="w-4 h-4" /> Academic integrity policy
                 </a>
               </li>
               <li>
                 <a href="#" className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors">
                   <Activity className="w-4 h-4" /> Resetting your password
                 </a>
               </li>
               <li>
                 <a href="#" className="flex items-center gap-2 text-sm text-blue-500 hover:text-blue-700 transition-colors">
                   <Activity className="w-4 h-4" /> Managing subscription tiers
                 </a>
               </li>
             </ul>
           </div>

           {/* System Status */}
           <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                 <ShieldCheck className="w-5 h-5 text-green-600" />
               </div>
               <div>
                 <p className="text-sm font-bold text-slate-800">System Status</p>
                 <p className="text-xs text-slate-500 uppercase">All systems operational</p>
               </div>
             </div>
             <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Details</a>
           </div>

        </div>

      </div>
    </div>
  );
};

// Quick helper icon replacing lucide-react if missing Headphones
const HeadphonesIcon = ({className}) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 11V9a6 6 0 00-12 0v2m12 0a2 2 0 012 2v4a2 2 0 01-2 2h-2v-6h2zm-12 0a2 2 0 00-2 2v4a2 2 0 002 2h2v-6h-2z" />
  </svg>
);

export default Help;
