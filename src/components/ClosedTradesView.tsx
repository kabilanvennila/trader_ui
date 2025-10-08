import { Trade } from '../types/api';

interface ClosedTradesViewProps {
  trades: Trade[];
  totalCapital: number;
  formatCompactNumber: (value: string) => string;
  styles: any;
  openMenuId: string | null;
  toggleMenu: (id: string) => void;
  handleModifyClosedTrade: (trade: Trade) => void;
  handleDeleteTrade: (trade: Trade) => void;
  renderBiasIcon: (bias: 'bullish' | 'bearish' | 'neutral') => JSX.Element;
  getBiasCellColor: (bias: 'bullish' | 'bearish' | 'neutral') => string;
  getBiasCellClass: (bias: 'bullish' | 'bearish' | 'neutral') => string;
}

const ClosedTradesView: React.FC<ClosedTradesViewProps> = ({
  trades,
  totalCapital,
  formatCompactNumber,
  styles,
  openMenuId,
  toggleMenu,
  handleModifyClosedTrade,
  handleDeleteTrade,
  renderBiasIcon,
  getBiasCellColor,
  getBiasCellClass
}) => {
  // Filter only closed trades
  const closedTrades = trades.filter(t => t.status === 'closed');

  return (
    <>
      {/* Capital Growth Chart Section */}
      <section style={{
        borderBottom: '1px solid rgba(217, 217, 217, 0.5)',
        backgroundColor: 'transparent',
        padding: '32px 40px 32px 40px',
        marginBottom: '40px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827', fontFamily: 'Inter, sans-serif', marginBottom: '8px' }}>
            Account Value
          </div>
          {(() => {
            // Calculate closed P&L
            const closedPnL = closedTrades.reduce((sum, t) => {
              const value = parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, ''));
              return sum + (t.profitLoss.isProfit ? value : -value);
            }, 0);
            const totalCapitalWithPnL = totalCapital + closedPnL;
            
            // Calculate deployed capital for closed trades
            const closedDeployedCapital = closedTrades.reduce((sum, t) => {
              return sum + parseFloat(t.capital.value.replace(/[₹,]/g, ''));
            }, 0);
            
            const percentageReturn = closedDeployedCapital > 0 ? ((closedPnL / closedDeployedCapital) * 100) : 0;
            
            return (
              <>
                <div style={{ fontSize: '40px', fontWeight: '700', color: '#111827', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>
                  ₹{formatCompactNumber(totalCapitalWithPnL.toLocaleString('en-IN'))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', color: closedPnL >= 0 ? '#10B981' : '#EF4444' }}>{closedPnL >= 0 ? '▲' : '▼'}</span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: closedPnL >= 0 ? '#10B981' : '#EF4444', fontFamily: 'Inter, sans-serif' }}>
                    ₹{formatCompactNumber(Math.abs(closedPnL).toLocaleString('en-IN'))} ({Math.abs(percentageReturn).toFixed(2)}%)
                  </span>
                  <span style={{ fontSize: '14px', color: '#6B7280', fontFamily: 'Inter, sans-serif' }}>All Time</span>
                </div>
              </>
            );
          })()}
        </div>
        
        {/* Simple Line Chart */}
        <div style={{ position: 'relative', height: '280px', width: 'calc(100% + 80px)', marginLeft: '-40px', marginRight: '-40px', marginBottom: '16px' }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 280" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            
            {/* Growth line - Based on actual trade dates and values */}
            {(() => {
              const startingCapital = totalCapital;
              const startDate = new Date(2025, 9, 1); // Oct 1, 2025
              const endDate = new Date(2026, 2, 31); // March 31, 2026
              const timeRange = endDate.getTime() - startDate.getTime();
              
              // Build data points with actual dates and running capital
              let runningCapital = startingCapital;
              const dataPoints = [{ x: 0, y: startingCapital }];
              
              if (closedTrades.length > 0) {
                // Spread trades between Oct 1 and Oct 7 (today)
                const tradingDays = 6; // Oct 1 to Oct 7
                const daysPerTrade = tradingDays / closedTrades.length;
                
                closedTrades.forEach((trade, index) => {
                  const tradePnL = parseFloat(trade.profitLoss.value.replace(/[₹,+-]/g, '')) * (trade.profitLoss.isProfit ? 1 : -1);
                  runningCapital += tradePnL;
                  
                  // Place trade between Oct 1 and Oct 7
                  const daysFromStart = (index + 1) * daysPerTrade;
                  const tradeDate = new Date(startDate.getTime() + daysFromStart * 24 * 60 * 60 * 1000);
                  const xPosition = (tradeDate.getTime() - startDate.getTime()) / timeRange;
                  
                  dataPoints.push({ x: xPosition, y: runningCapital });
                });
              } else {
                // If no closed trades, just show flat line at start
                dataPoints.push({ x: 0.01, y: startingCapital });
              }
              
              const minY = Math.min(...dataPoints.map(p => p.y));
              const maxY = Math.max(...dataPoints.map(p => p.y));
              const range = maxY - minY || 1;
              
              // Calculate baseline Y position (starting capital)
              const baselineY = 280 - ((startingCapital - minY) / range) * 260 - 10;
              
              const pathData = dataPoints.map((point, i) => {
                const x = point.x * 1000;
                const y = 280 - ((point.y - minY) / range) * 260 - 10;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ');
              
              // Create area fill path with baseline
              const lastPoint = dataPoints[dataPoints.length - 1];
              const lastX = lastPoint.x * 1000;
              const areaPath = `${pathData} L ${lastX} ${baselineY} L 0 ${baselineY} Z`;
              
              return (
                <>
                  <defs>
                    {/* Positive gradient (green) */}
                    <linearGradient id="positiveGradientHistory" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#10B981', stopOpacity: 0.05 }} />
                    </linearGradient>
                    {/* Negative gradient (red) */}
                    <linearGradient id="negativeGradientHistory" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#EF4444', stopOpacity: 0.05 }} />
                      <stop offset="100%" style={{ stopColor: '#EF4444', stopOpacity: 0.3 }} />
                    </linearGradient>
                    
                    {/* Clip path for positive area (above baseline) */}
                    <clipPath id="positiveClipHistory">
                      <rect x="0" y="0" width="1000" height={baselineY} />
                    </clipPath>
                    
                    {/* Clip path for negative area (below baseline) */}
                    <clipPath id="negativeClipHistory">
                      <rect x="0" y={baselineY} width="1000" height={280 - baselineY} />
                    </clipPath>
                  </defs>
                  
                  {/* Positive area fill (above baseline) */}
                  <path 
                    d={areaPath} 
                    fill="url(#positiveGradientHistory)" 
                    clipPath="url(#positiveClipHistory)"
                  />
                  
                  {/* Negative area fill (below baseline) */}
                  <path 
                    d={areaPath} 
                    fill="url(#negativeGradientHistory)" 
                    clipPath="url(#negativeClipHistory)"
                  />
                  
                  {/* Baseline (starting capital) - subtle line */}
                  <line 
                    x1="0" 
                    y1={baselineY} 
                    x2={lastX} 
                    y2={baselineY} 
                    stroke="#D1D5DB" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  
                  {/* Line stroke - green above baseline */}
                  <path 
                    d={pathData} 
                    stroke="#10B981" 
                    strokeWidth="2" 
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    clipPath="url(#positiveClipHistory)"
                  />
                  
                  {/* Line stroke - red below baseline */}
                  <path 
                    d={pathData} 
                    stroke="#EF4444" 
                    strokeWidth="2" 
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    clipPath="url(#negativeClipHistory)"
                  />
                </>
              );
            })()}
          </svg>
          
          {/* Time Scale - Oct 2025 to March 2026 across 16 columns */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', marginBottom: '8px', marginLeft: '0', marginRight: '0' }}>
            {(() => {
              const startDate = new Date(2025, 9, 1); // Oct 1, 2025
              const endDate = new Date(2026, 2, 31); // March 31, 2026
              const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const timestamps = [];
              
              for (let i = 0; i < 16; i++) {
                const daysOffset = (totalDays / 15) * i; // 15 intervals for 16 points
                const date = new Date(startDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
                const month = date.toLocaleDateString('en-US', { month: 'short' });
                const day = date.getDate();
                
                timestamps.push(
                  <div key={i} style={{ flex: '1 1 0', fontSize: '10px', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                    {month} {day}
                  </div>
                );
              }
              
              return timestamps;
            })()}
          </div>
        </div>
      </section>

      {/* Metrics Section - 4 Boxes */}
      <section style={{
        borderTop: '1px dashed #DEE2E8',
        borderBottom: '1px dashed #DEE2E8',
        borderLeft: '1px solid rgba(217, 217, 217, 0.5)',
        borderRight: '1px solid rgba(217, 217, 217, 0.5)',
        marginBottom: '40px'
      }}>
        <div className="flex" style={{ height: '270px', gap: '1px' }}>
          {/* Box 1: Total Profit/Loss */}
          <div style={{ width: 'calc((100% - 3px) / 4)', backgroundColor: (() => {
            const closedPnL = closedTrades.reduce((sum, t) => {
              const value = parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, ''));
              return sum + (t.profitLoss.isProfit ? value : -value);
            }, 0);
            return closedPnL >= 0 ? '#D1FAE5' : '#FEE2E2';
          })(), boxSizing: 'border-box', overflow: 'hidden' }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div style={styles.contentAnchor}>Total Profit / Loss</div>
              <div>
                {(() => {
                  const closedPnL = closedTrades.reduce((sum, t) => {
                    const value = parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, ''));
                    return sum + (t.profitLoss.isProfit ? value : -value);
                  }, 0);
                  const closedDeployedCapital = closedTrades.reduce((sum, t) => {
                    return sum + parseFloat(t.capital.value.replace(/[₹,]/g, ''));
                  }, 0);
                  const percentageReturn = closedDeployedCapital > 0 ? ((closedPnL / closedDeployedCapital) * 100) : 0;
                  
                  return (
                    <>
                      <div style={styles.mainNumber}>
                        {formatCompactNumber((closedPnL >= 0 ? '+₹' : '-₹') + Math.abs(closedPnL).toLocaleString('en-IN'))}
                      </div>
                      <div style={{ ...styles.percentage, marginTop: '12px', color: closedPnL >= 0 ? '#10B981' : '#EF4444' }}>
                        {Math.abs(percentageReturn).toFixed(1)}%
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Box 2: Max Profit */}
          <div style={{ width: 'calc((100% - 3px) / 4)', backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div style={styles.contentAnchor}>Maximum Profit on a single Trade</div>
              <div>
                {(() => {
                  const profitTrades = closedTrades.filter(t => t.profitLoss.isProfit);
                  if (profitTrades.length === 0) return (
                    <>
                      <div style={styles.mainNumber}>0%</div>
                      <div style={{ ...styles.percentage, marginTop: '12px' }}>₹0</div>
                    </>
                  );
                  const maxProfitTrade = profitTrades.reduce((max, t) => {
                    const profitValue = parseFloat(t.profitLoss.value.replace(/[₹,+]/g, ''));
                    const capital = parseFloat(t.capital.value.replace(/[₹,]/g, ''));
                    const percentage = capital > 0 ? (profitValue / capital) * 100 : 0;
                    
                    const maxProfitValue = parseFloat(max.profitLoss.value.replace(/[₹,+]/g, ''));
                    const maxCapital = parseFloat(max.capital.value.replace(/[₹,]/g, ''));
                    const maxPercentage = maxCapital > 0 ? (maxProfitValue / maxCapital) * 100 : 0;
                    
                    return percentage > maxPercentage ? t : max;
                  });
                  
                  const profitValue = parseFloat(maxProfitTrade.profitLoss.value.replace(/[₹,+]/g, ''));
                  const capital = parseFloat(maxProfitTrade.capital.value.replace(/[₹,]/g, ''));
                  const percentage = capital > 0 ? ((profitValue / capital) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <>
                      <div style={{ ...styles.mainNumber, color: '#10B981' }}>{percentage}%</div>
                      <div style={{ ...styles.percentage, marginTop: '12px' }}>{formatCompactNumber(profitValue.toLocaleString('en-IN'))}</div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Box 3: Max Loss */}
          <div style={{ width: 'calc((100% - 3px) / 4)', backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div style={styles.contentAnchor}>Maximum Loss on a single Trade</div>
              <div>
                {(() => {
                  const lossTrades = closedTrades.filter(t => !t.profitLoss.isProfit);
                  if (lossTrades.length === 0) return (
                    <>
                      <div style={styles.mainNumber}>0%</div>
                      <div style={{ ...styles.percentage, marginTop: '12px' }}>₹0</div>
                    </>
                  );
                  const maxLossTrade = lossTrades.reduce((max, t) => {
                    const lossValue = Math.abs(parseFloat(t.profitLoss.value.replace(/[₹,+-]/g, '')));
                    const capital = parseFloat(t.capital.value.replace(/[₹,]/g, ''));
                    const percentage = capital > 0 ? (lossValue / capital) * 100 : 0;
                    
                    const maxLossValue = Math.abs(parseFloat(max.profitLoss.value.replace(/[₹,+-]/g, '')));
                    const maxCapital = parseFloat(max.capital.value.replace(/[₹,]/g, ''));
                    const maxPercentage = maxCapital > 0 ? (maxLossValue / maxCapital) * 100 : 0;
                    
                    return percentage > maxPercentage ? t : max;
                  });
                  
                  const lossValue = parseFloat(maxLossTrade.profitLoss.value.replace(/[₹,+-]/g, ''));
                  const capital = parseFloat(maxLossTrade.capital.value.replace(/[₹,]/g, ''));
                  const percentage = capital > 0 ? ((Math.abs(lossValue) / capital) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <>
                      <div style={{ ...styles.mainNumber, color: '#EF4444' }}>{percentage}%</div>
                      <div style={{ ...styles.percentage, marginTop: '12px' }}>{maxLossTrade.profitLoss.value}</div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Box 4: Win Rate */}
          <div style={{ width: 'calc((100% - 3px) / 4)', backgroundColor: 'white', boxSizing: 'border-box', overflow: 'hidden', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={styles.section4Label}>Total Trades</div>
                <div style={styles.mainNumberSmall}>{closedTrades.length}</div>
              </div>
              <div style={{ borderBottom: '1px dotted #D1D5DB', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={styles.section4Label}>Total Wins</div>
                <div style={styles.mainNumberSmall}>{closedTrades.filter(t => t.profitLoss.isProfit).length}</div>
              </div>
              <div style={{ borderBottom: '1px dotted #D1D5DB', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={styles.section4Label}>Total Loss</div>
                <div style={styles.mainNumberSmall}>{closedTrades.filter(t => !t.profitLoss.isProfit).length}</div>
              </div>
              <div style={{ borderBottom: '1px dotted #D1D5DB', margin: '16px 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={styles.section4Label}>Win%</div>
                <div style={styles.mainNumberSmall}>
                  {(() => {
                    const wins = closedTrades.filter(t => t.profitLoss.isProfit).length;
                    const winPercentage = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(1) : '0.0';
                    return `${winPercentage}%`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closed Trades Table */}
      <section style={{ borderLeft: '1px solid rgba(217, 217, 217, 0.5)', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', backgroundColor: 'transparent' }}>
          <colgroup>
            <col style={{ width: 'calc(100% / 16 * 1)' }} />
            <col style={{ width: 'calc(100% / 16 * 2)' }} />
            <col style={{ width: 'calc(100% / 16 * 1)' }} />
            <col style={{ width: 'calc(100% / 16 * 2)' }} />
            <col style={{ width: 'calc(100% / 16 * 1)' }} />
            <col style={{ width: 'calc(100% / 16 * 2)' }} />
            <col style={{ width: 'calc(100% / 16 * 4)' }} />
            <col style={{ width: 'calc(100% / 16 * 1)' }} />
            <col style={{ width: 'calc(100% / 16 * 1)' }} />
            <col style={{ width: 'calc(100% / 16 * 1)' }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: 'white', borderTop: '1px dashed #DEE2E8' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Inst</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Bias</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Setup/Strategy</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Lots</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Profit / Loss</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Max Loss</span>
                  <span>Max Profit</span>
                </div>
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Capital</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>@Risk</th>
              <th style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8' }}></th>
            </tr>
          </thead>
          <tbody>
            {closedTrades.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '60px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#9CA3AF', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8' }}>
                  No closed trades found
                </td>
              </tr>
            ) : (
              closedTrades.map((trade) => (
                <tr key={trade.id} className="table-row">
                  {/* Date */}
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#1F2937', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', border: '3px solid #1E3F66', overflow: 'hidden', width: '31px', height: '36px' }}>
                      <div style={{ backgroundColor: '#1E3F66', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: '700', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>{trade.date.month}</div>
                      <div style={{ backgroundColor: 'white', color: '#1E3F66', textAlign: 'center', fontSize: '14px', fontWeight: '700', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>{trade.date.day}</div>
                    </div>
                  </td>

                  {/* Instrument */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{trade.instrument.name}</div>
                    <div style={styles.textSecondary}>Index</div>
                  </td>

                  {/* Bias */}
                  <td className={getBiasCellClass(trade.bias)} style={{ padding: '16px', backgroundColor: getBiasCellColor(trade.bias), borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {renderBiasIcon(trade.bias)}
                    </div>
                  </td>

                  {/* Setup/Strategy */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{trade.setup.type}</div>
                    <div style={styles.textSecondary}>{trade.setup.name}</div>
                  </td>

                  {/* Lots */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{trade.lots.value}</div>
                    <div style={styles.textSecondary}>{trade.lots.type}</div>
                  </td>

                  {/* Profit/Loss */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ ...styles.textPrimaryBold, color: trade.profitLoss.isProfit ? '#10B981' : '#EF4444' }}>
                      {trade.profitLoss.value}
                    </div>
                    <div style={{ ...styles.textSecondary, color: trade.profitLoss.isProfit ? '#10B981' : '#EF4444' }}>
                      {trade.profitLoss.percentage}
                    </div>
                  </td>

                  {/* Max Profit / Max Loss */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                      {/* Max Loss - Left side (Red) */}
                      <div style={{ flex: '0 0 70px', minWidth: '70px' }}>
                        {trade.calculatedMaxLoss ? (
                          <>
                            <div style={styles.textPrimary}>
                              ₹{formatCompactNumber(trade.calculatedMaxLoss.value)}
                            </div>
                            <div style={styles.textSecondary}>
                              {(() => {
                                const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                                const capital = parseFloat(trade.capital.value.replace(/,/g, ''));
                                const percentage = capital > 0 ? ((calculatedLoss / capital) * 100).toFixed(1) : '0.0';
                                return `${percentage}%`;
                              })()}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={styles.textPrimary}>{formatCompactNumber(trade.maxLoss.value)}</div>
                            <div style={styles.textSecondary}>{trade.maxLoss.percentage}</div>
                          </>
                        )}
                      </div>
                      <div style={{ flex: '1 1 auto', position: 'relative' }}>
                        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          {(() => {
                            if (trade.calculatedMaxProfit && trade.calculatedMaxLoss) {
                              const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                              const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                              const totalRange = calculatedProfit + calculatedLoss;
                              const lossRatio = totalRange > 0 ? calculatedLoss / totalRange : 0.5;
                              return (
                                <>
                                  <div style={{ width: `${lossRatio * 100}%`, backgroundColor: '#EF4444' }}></div>
                                  <div style={{ width: `${(1 - lossRatio) * 100}%`, backgroundColor: '#10B981' }}></div>
                                </>
                              );
                            } else if (trade.calculatedMaxProfit) {
                              const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                              const maxLoss = parseFloat(trade.maxLoss.value.replace(/,/g, ''));
                              const totalRange = calculatedProfit + maxLoss;
                              const lossRatio = totalRange > 0 ? maxLoss / totalRange : 0.5;
                              return (
                                <>
                                  <div style={{ width: `${lossRatio * 100}%`, backgroundColor: '#EF4444' }}></div>
                                  <div style={{ width: `${(1 - lossRatio) * 100}%`, backgroundColor: '#10B981' }}></div>
                                </>
                              );
                            } else {
                              return (
                                <div style={{ width: '100%', backgroundColor: '#E5E7EB' }}></div>
                              );
                            }
                          })()}
                        </div>
                        {/* Slider position based on actual P&L */}
                        <div style={{ 
                          position: 'absolute', 
                          left: (() => {
                            // Calculate slider position based on actual P&L
                            if (trade.calculatedMaxProfit && trade.calculatedMaxLoss) {
                              const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                              const calculatedLoss = parseFloat(trade.calculatedMaxLoss.value.replace(/,/g, ''));
                              const actualPnL = parseFloat(trade.profitLoss.value.replace(/[₹,+]/g, ''));
                              const totalRange = calculatedProfit + calculatedLoss;
                              
                              // Position slider based on where actual P&L falls
                              const position = totalRange > 0 ? ((actualPnL + calculatedLoss) / totalRange) * 100 : 50;
                              return `${Math.max(0, Math.min(100, position))}%`;
                            }
                            return '50%';
                          })(), 
                          top: '50%', 
                          transform: 'translate(-50%, -50%)', 
                          width: '3px', 
                          height: '14px', 
                          backgroundColor: '#1E3F66', 
                          borderRadius: '2px' 
                        }}></div>
                      </div>
                      {/* Max Profit - Right side (Green) */}
                      <div style={{ flex: '0 0 70px', minWidth: '70px', textAlign: 'right' }}>
                        {trade.calculatedMaxProfit ? (
                          <>
                            <div style={styles.textPrimary}>
                              ₹{formatCompactNumber(trade.calculatedMaxProfit.value)}
                            </div>
                            <div style={styles.textSecondary}>
                              {(() => {
                                const calculatedProfit = parseFloat(trade.calculatedMaxProfit.value.replace(/,/g, ''));
                                const capital = parseFloat(trade.capital.value.replace(/,/g, ''));
                                const percentage = capital > 0 ? ((calculatedProfit / capital) * 100).toFixed(1) : '0.0';
                                return `${percentage}%`;
                              })()}
                            </div>
                          </>
                        ) : (
                          <div style={{ ...styles.textSecondary, fontSize: '12px', color: '#9CA3AF' }}>
                            No strike data
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Capital */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{formatCompactNumber(trade.capital.value)}</div>
                    <div style={styles.textSecondary}>{totalCapital > 0 ? ((parseFloat(trade.capital.value.replace(/,/g, '')) / totalCapital) * 100).toFixed(1) + '%' : '0.0%'}</div>
                  </td>

                  {/* @Risk */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>
                      {totalCapital > 0 ? ((parseFloat(trade.maxLoss.value.replace(/[₹,]/g, '')) / totalCapital) * 100).toFixed(2) + '%' : '0.0%'}
                    </div>
                    <div style={styles.textSecondary}>{formatCompactNumber(trade.maxLoss.value)}</div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '0', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', position: 'relative' }}>
                    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
                      {trade.status === 'active' && (
                        <>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'pointer' }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 13L13 3M13 3H6M13 3V10" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div style={{ width: '1px' }}></div>
                        </>
                      )}
                      <div 
                        className="menu-trigger" 
                        style={{ 
                          flex: 1, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          padding: '16px', 
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease'
                        }} 
                        onClick={() => toggleMenu(`row${trade.id}`)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E5E7EB';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span style={{ fontSize: '20px', color: '#374151', fontWeight: '700', lineHeight: '1' }}>⋮</span>
                      </div>
                    </div>
                    {openMenuId === `row${trade.id}` && (
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
                        <div 
                          style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66', borderBottom: '1px solid #F3F4F6' }} 
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} 
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          onClick={() => handleModifyClosedTrade(trade)}
                        >
                          Modify
                        </div>
                        <div 
                          style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66', borderBottom: '1px solid #F3F4F6' }} 
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} 
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          onClick={() => handleDeleteTrade(trade)}
                        >
                          Delete
                        </div>
                        <div 
                          style={{ padding: '12px 16px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#1E3F66' }} 
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'} 
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          Analyse
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default ClosedTradesView;
