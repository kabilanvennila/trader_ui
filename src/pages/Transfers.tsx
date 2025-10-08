import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { transferApi } from '../services/api';
import Header from '../components/Header';

interface TransferFormData {
  type: 'deposit' | 'withdrawal';
  amount: string;
  notes: string;
  date: string;
}

function Transfers() {
  // State for Add New Transfer form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<TransferFormData>({
    type: 'deposit',
    amount: '',
    notes: '',
    date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });
  const [formErrors, setFormErrors] = useState<Partial<TransferFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get transfers from context
  const { transfers, refreshTransfers, loading } = useAppContext();

  // Calculate totals
  const totalDeposits = transfers.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transfers.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
  const totalCapital = totalDeposits - totalWithdrawals;

  // Form handling functions
  const handleInputChange = (field: keyof TransferFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<TransferFormData> = {};
    
    if (!formData.amount || formData.amount.trim() === '') {
      errors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.notes || formData.notes.trim() === '') {
      errors.notes = 'Notes are required';
    }
    
    if (!formData.date) {
      errors.date = 'Date is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create transfer via API
      const response = await transferApi.createTransfer({
        date: formData.date,
        type: formData.type.toUpperCase() as 'DEPOSIT' | 'WITHDRAWAL',
        amount: formData.amount,
        notes: formData.notes
      });
      
      if (response.success) {
        // Refresh transfers from API
        await refreshTransfers();
        
        // Reset form and close
        setFormData({
          type: 'deposit',
          amount: '',
          notes: '',
          date: new Date().toISOString().split('T')[0]
        });
        setFormErrors({});
        setIsFormOpen(false);
      } else {
        // Handle API error
        console.error('Failed to create transfer:', response.message);
        alert(`Failed to create transfer: ${response.message}`);
      }
    } catch (error) {
      console.error('Error creating transfer:', error);
      alert('Failed to create transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setFormData({
      type: 'deposit',
      amount: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    setFormErrors({});
  };

  const handleDeleteTransfer = async (transferId: string) => {
    if (!confirm('Are you sure you want to delete this transfer?')) {
      return;
    }

    try {
      const response = await transferApi.deleteTransfer(transferId);
      
      if (response.success) {
        // Refresh transfers from API
        await refreshTransfers();
      } else {
        alert(`Failed to delete transfer: ${response.message}`);
      }
    } catch (error) {
      console.error('Error deleting transfer:', error);
      alert('Failed to delete transfer. Please try again.');
    }
  };

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
      <Header />

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
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ 
                      padding: '40px', 
                      textAlign: 'center', 
                      color: '#6B7280',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px'
                    }}>
                      Loading transfers...
                    </td>
                  </tr>
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ 
                      padding: '40px', 
                      textAlign: 'center', 
                      color: '#6B7280',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px'
                    }}>
                      No transfers found
                    </td>
                  </tr>
                ) : (
                  transfers.map((transfer) => (
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
                    <td style={{ padding: '0', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', textAlign: 'center', overflow: 'hidden' }}>
                      <div 
                        onClick={() => handleDeleteTransfer(transfer.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#FEE2E2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2 4H14M5.5 7V12M10.5 7V12M3 4L4 14H12L13 4M6 4V2H10V4" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
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
            onClick={handleClose}
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

            {/* Form Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              backgroundColor: '#F9FAFB'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Transfer Type */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Transfer Type *
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '12px 16px',
                      border: `2px solid ${formData.type === 'deposit' ? '#10B981' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      backgroundColor: formData.type === 'deposit' ? '#F0FDF4' : 'white',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      <input
                        type="radio"
                        name="type"
                        value="deposit"
                        checked={formData.type === 'deposit'}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ color: formData.type === 'deposit' ? '#10B981' : '#6B7280' }}>↓ Deposit</span>
                    </label>
                    <label style={{
              display: 'flex',
              alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '12px 16px',
                      border: `2px solid ${formData.type === 'withdrawal' ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      backgroundColor: formData.type === 'withdrawal' ? '#FEF2F2' : 'white',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151'
                    }}>
                      <input
                        type="radio"
                        name="type"
                        value="withdrawal"
                        checked={formData.type === 'withdrawal'}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        style={{ margin: 0 }}
                      />
                      <span style={{ color: formData.type === 'withdrawal' ? '#EF4444' : '#6B7280' }}>↑ Withdrawal</span>
                    </label>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="Enter amount"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${formErrors.amount ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: 'white',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.amount && (
                    <p style={{
                      color: '#EF4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {formErrors.amount}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Notes *
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Enter notes or description"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${formErrors.notes ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: 'white',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.notes && (
                    <p style={{
                      color: '#EF4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {formErrors.notes}
                    </p>
                  )}
                </div>


                {/* Date */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `2px solid ${formErrors.date ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px',
                fontSize: '16px',
                fontFamily: 'Inter, sans-serif',
                      backgroundColor: 'white',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {formErrors.date && (
                    <p style={{
                      color: '#EF4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      fontFamily: 'Inter, sans-serif'
                    }}>
                      {formErrors.date}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'flex-end',
                  marginTop: '24px'
                }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    style={{
                      padding: '12px 24px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: 'white',
                      color: '#6B7280',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      fontFamily: 'Inter, sans-serif',
                      backgroundColor: isSubmitting ? '#9CA3AF' : '#10B981',
                      color: 'white',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'background-color 0.2s ease',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#059669';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#10B981';
                      }
                    }}
                  >
                    {isSubmitting ? 'Adding...' : 'Add Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default Transfers;
