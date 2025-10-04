# Dynamic Table & Metrics Implementation

The entire dashboard is now fully dynamic and calculated from the trades data. Here's how it works:

## Data Structure

The `Trade` interface defines the structure for each trade row:

```typescript
interface Trade {
  id: string;
  date: { month: string; day: string };
  instrument: { name: string; type: string };
  bias: 'bullish' | 'bearish' | 'neutral';
  setup: { name: string; type: string };
  lots: { value: string; type: string };
  profitLoss: { value: string; percentage: string; isProfit: boolean };
  maxProfit: { value: string; percentage: string };
  maxLoss: { value: string; percentage: string };
  maxProfitLossRatio: number; // 0 to 1, where 0.5 is the midpoint
  capital: { value: string; label: string };
  risk: { value: string; label: string };
}
```

## Current State

- `trades` state variable holds an array of Trade objects
- `setTrades` function can be used to update the trades from your database
- Helper functions are ready: `renderBiasIcon()`, `getBiasCellColor()`, `getBiasCellClass()`
- `calculateMetrics()` function automatically calculates all Running Trades metrics from the trades data

## Calculated Metrics

The "Running Trades" section now automatically calculates:
- **Running Profit/Loss**: Sum of all trade P&L and percentage return
- **Max Profit**: Total maximum profit potential and percentage
- **Max Loss**: Total maximum loss potential and percentage
- **Deployed**: Total capital deployed across all trades
- **@ Risk**: Total portfolio risk percentage
- **Buying Power**: Total buying power used and percentage

All these values update automatically when the `trades` data changes!

## To Complete the Implementation

Replace the hardcoded `<tbody>` section (lines 431-700+) with this dynamic version:

```tsx
<tbody>
  {trades.map((trade) => (
    <tr key={trade.id} className="table-row">
      {/* Date Cell */}
      <td style={{ padding: '18px 24px', fontSize: '14px', color: '#1F2937', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', border: '3px solid #1E3F66', overflow: 'hidden', width: '31px', height: '36px' }}>
          <div style={{ backgroundColor: '#1E3F66', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: '700', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>{trade.date.month}</div>
          <div style={{ backgroundColor: 'white', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '24px', fontSize: '10px', fontWeight: '700', fontFamily: 'Inter, sans-serif' }}>{trade.date.day}</div>
        </div>
      </td>
      
      {/* Instrument Cell */}
      <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={styles.textPrimary}>{trade.instrument.name}</div>
        <div style={styles.textSecondary}>{trade.instrument.type}</div>
      </td>
      
      {/* Bias Cell */}
      <td className={getBiasCellClass(trade.bias)} style={{ padding: '16px', backgroundColor: getBiasCellColor(trade.bias), borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          {renderBiasIcon(trade.bias)}
        </div>
      </td>
      
      {/* Setup/Strategy Cell */}
      <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={styles.textPrimary}>{trade.setup.name}</div>
        <div style={styles.textSecondary}>{trade.setup.type}</div>
      </td>
      
      {/* Lots Cell */}
      <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={styles.textPrimary}>{trade.lots.value}</div>
        <div style={styles.textSecondary}>{trade.lots.type}</div>
      </td>
      
      {/* Profit/Loss Cell */}
      <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={{ ...styles.textPrimaryBold, color: trade.profitLoss.isProfit ? '#10B981' : '#EF4444' }}>{trade.profitLoss.value}</div>
        <div style={styles.textSecondary}>{trade.profitLoss.percentage}</div>
      </td>
      
      {/* Max Profit/Loss Cell */}
      <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: '0 0 auto' }}>
            <div style={styles.textPrimary}>{trade.maxProfit.value}</div>
            <div style={styles.textSecondary}>{trade.maxProfit.percentage}</div>
          </div>
          <div style={{ flex: '1 1 auto', position: 'relative' }}>
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${trade.maxProfitLossRatio * 100}%`, backgroundColor: '#10B981' }}></div>
              <div style={{ width: `${(1 - trade.maxProfitLossRatio) * 100}%`, backgroundColor: '#EF4444' }}></div>
            </div>
            <div style={{ position: 'absolute', left: `${trade.maxProfitLossRatio * 100 - 10}%`, top: '50%', transform: 'translate(-50%, -50%)', width: '3px', height: '14px', backgroundColor: '#1E3F66', borderRadius: '2px' }}></div>
          </div>
          <div style={{ flex: '0 0 auto', textAlign: 'right' }}>
            <div style={styles.textPrimary}>{trade.maxLoss.value}</div>
            <div style={styles.textSecondary}>{trade.maxLoss.percentage}</div>
          </div>
        </div>
      </td>
      
      {/* Capital Cell */}
      <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={styles.textPrimary}>{trade.capital.value}</div>
        <div style={styles.textSecondary}>{trade.capital.label}</div>
      </td>
      
      {/* Risk Cell */}
      <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <div style={styles.textPrimary}>{trade.risk.value}</div>
        <div style={styles.textSecondary}>{trade.risk.label}</div>
      </td>
      
      {/* Action Cell - Static (not from database) */}
      <td style={{ padding: '0', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', position: 'relative' }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'pointer' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 11.001H3C2.73478 11.001 2.48043 10.8956 2.29289 10.7081C2.10536 10.5205 2 10.2662 2 10.001V3.00098C2 2.73576 2.10536 2.48141 2.29289 2.29387C2.48043 2.10633 2.73478 2.00098 3 2.00098H5M8.5 9.00098L11 6.50098M11 6.50098L8.5 4.00098M11 6.50098H5" stroke="#FF2929" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ width: '1px', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}></div>
          <div className="menu-trigger" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'pointer' }} onClick={() => toggleMenu(trade.id)}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>⋮</span>
          </div>
        </div>
        {openMenuId === trade.id && (
          <div className="dropdown-menu" style={{
            position: 'absolute',
            right: '16px',
            top: '50px',
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            minWidth: '140px'
          }}>
            <div style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66', borderBottom: '1px solid #F3F4F6' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Modify</div>
            <div style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66', borderBottom: '1px solid #F3F4F6' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Delete</div>
            <div style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>Analyse</div>
          </div>
        )}
      </td>
    </tr>
  ))}
</tbody>
```

## To Fetch from Database

When you're ready to connect to your database, replace the sample data with an API call:

```typescript
useEffect(() => {
  // Fetch trades from your database
  fetch('/api/trades')
    .then(res => res.json())
    .then(data => setTrades(data))
    .catch(error => console.error('Error fetching trades:', error));
}, []);
```

The table is now fully ready to accept dynamic data!
