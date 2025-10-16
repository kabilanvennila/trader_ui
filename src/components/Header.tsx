import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  activePage?: 'dashboard' | 'closed';
  onPageChange?: (page: 'dashboard' | 'closed') => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onPageChange }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <>
      {/* Branding Image - Edge to Edge */}
      <div style={{ width: '100%' }}>
        <img 
          src="/branding.png" 
          alt="in the zone trader" 
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </div>

      {/* Header - 24px from branding */}
      <header style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Green Line: from left edge to 1st vertical line - Absolute positioned */}
          <div 
            style={{
              position: 'absolute',
              left: 0,
              width: 'calc(100% / 16)',
              height: '4px',
              backgroundColor: '#02D196',
              top: '50%',
              transform: 'translateY(-50%)'
            }}
          />
          
          {/* Left: Name Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'calc(100% / 16 + 24px)' }}>
            {/* Name: yugu */}
            <span 
              style={{
                color: '#1E3F66',
                fontSize: '45px',
                fontFamily: '"Seaweed Script", cursive',
                lineHeight: '1',
                fontWeight: 'normal',
                fontStyle: 'normal',
                transform: 'translateY(-8px)',
                display: 'inline-block'
              }}
            >
              yugu
            </span>
          </div>

          {/* Right: Navigation - Width from left edge to 6th vertical line */}
          <nav className="flex items-center justify-around bg-white" style={{
            width: 'calc(100% / 16 * 6 - 2px)',
            height: '53px',
            marginLeft: '1px',
            marginRight: '1px',
            borderTop: '1px dashed #DEE2E8',
            borderBottom: '1px dashed #DEE2E8'
          }}>
            {/* Home - Works as both navigation button and link */}
            {currentPath === '/' ? (
              <button 
                onClick={() => onPageChange?.('dashboard')}
                style={{
                  color: activePage === 'dashboard' ? '#1E3F66' : '#8E9FB2',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '16px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  textShadow: activePage === 'dashboard' ? '0 0 0.5px currentColor' : 'none'
                }}>Home</button>
            ) : (
              <Link to="/" style={{
                color: '#8E9FB2',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '400',
                fontSize: '16px',
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>Home</Link>
            )}

            {/* History button - works on all pages */}
            {currentPath === '/' ? (
              <button 
                onClick={() => onPageChange?.('closed')}
                style={{
                  color: activePage === 'closed' ? '#1E3F66' : '#8E9FB2',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '16px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  textShadow: activePage === 'closed' ? '0 0 0.5px currentColor' : 'none'
                }}>History</button>
            ) : (
              <Link 
                to="/" 
                state={{ openHistory: true }}
                style={{
                  color: '#8E9FB2',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: '500',
                  fontSize: '16px',
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>History</Link>
            )}

            <Link to="/transfers" style={{
              color: currentPath === '/transfers' ? '#1E3F66' : '#8E9FB2',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '500',
              fontSize: '16px',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textShadow: currentPath === '/transfers' ? '0 0 0.5px currentColor' : 'none'
            }}>Transfers</Link>

            <button style={{
              color: '#8E9FB2',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400',
              fontSize: '16px',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}>Strategy</button>

            <button style={{
              color: '#8E9FB2',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400',
              fontSize: '16px',
              cursor: 'pointer',
              background: 'none',
              border: 'none'
            }}>Setup</button>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
