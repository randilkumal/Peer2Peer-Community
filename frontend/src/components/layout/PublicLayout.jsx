import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <PublicNavbar />
      
      {/* Main content wrapper with top padding to account for fixed navbar */}
      <main className="flex-grow pt-20 pb-10 px-4 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1440px]">
          {children}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
