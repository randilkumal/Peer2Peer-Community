import { Link } from 'react-router-dom';
import { BookOpen, Twitter, Github, Linkedin, Mail } from 'lucide-react';

const PublicFooter = () => {
  const navigation = {
    platform: [
      { name: 'Features', href: '/#features' },
      { name: 'Pricing', href: '#' },
      { name: 'Institutions', href: '#' },
      { name: 'System Status', href: '/help' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Community Guidelines', href: '#' },
      { name: 'Video Tutorials', href: '/help' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Trust & Safety', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Cookie Policy', href: '#' },
    ],
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-8" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto w-full max-w-[1440px] py-14 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6 xl:col-span-1 xl:border-r xl:border-gray-200 xl:pr-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900 tracking-tight">PeerBridge</span>
            </Link>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs">
              Empowering university students globally through structured peer-to-peer collaboration, resource sharing, and expert mentorship.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-700 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:support@peerbridge.test" className="text-gray-400 hover:text-gray-700 transition-colors">
                <span className="sr-only">Email</span>
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Platform</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.platform.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Support</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-14 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 xl:text-center">
            &copy; {new Date().getFullYear()} PeerBridge Inc. Built for Students. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/about" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
            <Link to="/about" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
