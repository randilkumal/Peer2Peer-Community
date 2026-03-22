import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <PublicNavbar />
      
      {/* Main content wrapper with top padding to account for fixed navbar */}
      <main className="flex-grow pt-20 flex flex-col">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
