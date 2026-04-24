import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <PublicNavbar />
      
      {/* Full-width main content area */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
