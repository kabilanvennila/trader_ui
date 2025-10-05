import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

function Transfers() {
  // State for Add New Transfer form
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Get transfers from context
  const { transfers } = useAppContext();

  // Calculate totals
  const totalDeposits = transfers.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transfers.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
  const totalCapital = totalDeposits - totalWithdrawals;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white', position: 'relative' }}>
      {/* Main Content Container - Max Width 1280px with Vertical Grid Lines */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: '1280px',
        margin: '0 auto',
        backgroundColor: 'white',
        minHeight: '100vh',
        backgroundImage: `
          repeating-linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px, transparent calc(100% / 16)),
          linear-gradient(to right, rgba(217, 217, 217, 0.5) 0px, rgba(217, 217, 217, 0.5) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 1px 100%',
        backgroundPosition: 'left top, right top',
        backgroundRepeat: 'no-repeat'
      }}>
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
            {/* Name: yugendran */}
            <span 
              style={{
                color: '#1E3F66',
                fontSize: '45px',
                fontFamily: 'Freehand, cursive',
                lineHeight: '1',
                fontWeight: 'normal',
                fontStyle: 'italic'
              }}
            >
              yugendran
            </span>
          </div>

          {/* Right: Navigation - Width from left edge to 6th vertical line */}
          <nav style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: 'white',
            width: 'calc(100% / 16 * 6 - 2px)',
            height: '53px',
            marginLeft: '1px',
            marginRight: '1px',
            borderTop: '1px dashed #DEE2E8',
            borderBottom: '1px dashed #DEE2E8'
          }}>
            <Link to="/" style={{
              color: '#8E9FB2',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400',
              fontSize: '16px',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>Analyse</Link>
            <Link to="/transfers" style={{
              color: '#1E3F66',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              fontSize: '16px',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>Transfers</Link>
            <button style={{
              color: '#8E9FB2',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400',
              fontSize: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>Strategy</button>
            <button style={{
              color: '#8E9FB2',
              fontFamily: 'Inter, sans-serif',
              fontWeight: '400',
              fontSize: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>Setup</button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ marginTop: '80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)' }}>
          {/* Left: Summary Containers - 7 columns */}
          <div style={{ gridColumn: 'span 7', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderLeft: '1px solid rgba(217, 217, 217, 0.5)', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
            {/* Total Capital */}
            <div style={{
              backgroundColor: '#F9FAFB',
              padding: '40px',
              boxSizing: 'border-box',
              borderBottom: '1px solid rgba(217, 217, 217, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '180px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1E3F66' }}>
                Total Capital
              </div>
              <div>
                <div style={{ fontSize: '45px', fontWeight: '900', fontFamily: 'Inter Tight, sans-serif', color: '#1E3F66', lineHeight: '1.2' }}>
                  ₹{totalCapital.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Total Deposits */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              boxSizing: 'border-box',
              borderBottom: '1px solid rgba(217, 217, 217, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '180px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1E3F66' }}>
                Total Deposits
              </div>
              <div>
                <div style={{ fontSize: '45px', fontWeight: '900', fontFamily: 'Inter Tight, sans-serif', color: '#10B981', lineHeight: '1.2' }}>
                  +₹{totalDeposits.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Total Withdrawals */}
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '180px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', fontFamily: 'Inter, sans-serif', color: '#1E3F66' }}>
                Total Withdrawals
              </div>
              <div>
                <div style={{ fontSize: '45px', fontWeight: '900', fontFamily: 'Inter Tight, sans-serif', color: '#EF4444', lineHeight: '1.2' }}>
                  -₹{totalWithdrawals.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Transfers Table - 9 columns */}
          <section style={{ gridColumn: 'span 9', marginBottom: '0', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '11.11%' }} /> {/* Date - 1 column */}
                <col style={{ width: '22.22%' }} /> {/* Type - 2 columns */}
                <col style={{ width: '22.22%' }} /> {/* Amount - 2 columns */}
                <col style={{ width: '33.33%' }} /> {/* Notes - 3 columns */}
                <col style={{ width: '11.11%' }} /> {/* Actions - 1 column */}
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: 'white' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>Date</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Type</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Amount</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Notes</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((transfer) => (
                  <tr 
                    key={transfer.id}
                    className="table-row"
                    style={{
                      backgroundColor: 'white',
                      transition: 'background-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                  >
                    {/* Date */}
                    <td style={{ padding: '16px', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280' }}>{transfer.date.month}</span>
                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#1F2937' }}>{transfer.date.day}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td style={{ padding: '16px', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: transfer.type === 'deposit' ? '#D1FAE5' : '#FEE2E2',
                        color: transfer.type === 'deposit' ? '#065F46' : '#991B1B'
                      }}>
                        {transfer.type === 'deposit' ? '↓ Deposit' : '↑ Withdrawal'}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: '16px', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: transfer.type === 'deposit' ? '#10B981' : '#EF4444'
                      }}>
                        {transfer.type === 'deposit' ? '+' : '-'}₹{transfer.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Notes */}
                    <td style={{ padding: '16px', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>
                      <span style={{ fontSize: '14px', fontWeight: '400', color: '#6B7280' }}>
                        {transfer.method}
                      </span>
                    </td>

                    {/* Actions - Delete Button */}
                    <td style={{ padding: '16px', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', textAlign: 'center' }}>
                      <button 
                        onClick={() => console.log('Delete transfer:', transfer.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: '#EF4444',
                          fontSize: '18px'
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add New Transfer Button - Last 3 columns */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsFormOpen(true)}
                style={{
                  width: 'calc(100% / 9 * 3)',
                  height: '40px',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10B981'}
              >
                Add New Transfer
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Add New Transfer Form - Full Screen (Placeholder) */}
      {isFormOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease-in-out',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '40px',
            gap: '20px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFormOpen(false)}
            style={{
              backgroundColor: '#2D3748',
              border: 'none',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '20px',
              fontWeight: '600'
            }}
          >
            ×
          </button>

          {/* Form Content Container */}
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              height: 'calc(100vh - 80px)',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            {/* Form Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                fontFamily: 'Inter, sans-serif',
                color: '#000',
                margin: 0
              }}>Add Transfer</h2>
            </div>

            {/* Form Content - Placeholder */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              backgroundColor: '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <p style={{
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                color: '#6B7280'
              }}>Transfer form will be implemented here</p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Transfers;
