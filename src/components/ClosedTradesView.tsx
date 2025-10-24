import { useState } from 'react';
import { Trade, Transfer } from '../types/api';

interface ClosedTradesViewProps {
  trades: Trade[];
  totalCapital: number;
  transfers: Transfer[];
  formatCompactNumber: (value: string) => string;
  styles: any;
  openMenuId: string | null;
  toggleMenu: (id: string) => void;
  handleModifyClosedTrade: (trade: Trade) => void;
  handleDeleteTrade: (trade: Trade) => void;
  renderBiasIcon: (bias: 'bullish' | 'bearish' | 'neutral') => JSX.Element;
}

const ClosedTradesView: React.FC<ClosedTradesViewProps> = ({
  trades,
  totalCapital,
  transfers,
  formatCompactNumber,
  styles,
  openMenuId,
  toggleMenu,
  handleModifyClosedTrade,
  handleDeleteTrade,
  renderBiasIcon
}) => {
  // Filter only closed trades
  const closedTrades = trades.filter(t => t.status === 'closed');
  
  // State for tracking hovered bar
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);
  const [hoveredBarData, setHoveredBarData] = useState<{x: number, y: number, percentage: string, amount: string, isPositive: boolean} | null>(null);

  // Styles for chart section
  const chartStyles = {
    caption: {
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      color: '#1E3F66',
      opacity: 0.5,
      marginBottom: '8px'
    },
    data: {
      fontSize: '32px',
      fontFamily: 'Inter Tight, sans-serif',
      fontWeight: '800',
      color: '#1E3F66'
    }
  };

  return (
    <>
      {/* Chart Section */}
      <section style={{
        position: 'relative',
        backgroundColor: 'transparent',
        height: '450px',
        marginBottom: '64px',
        paddingLeft: '0',
        paddingRight: '0',
        paddingTop: '24px',
        paddingBottom: '40px'
      }}>
        {/* Total Returns Display - Container */}
        <div style={{
          width: 'calc(12.5% - 1px)', // 2 columns out of 16, minus 1px for grid line
          marginLeft: '1px', // Show the left grid line
          borderTop: '1px dashed #DEE2E8',
          borderBottom: '1px dashed #DEE2E8',
          padding: '24px',
          backgroundColor: 'white'
        }}>
          <div style={chartStyles.caption}>Total Returns</div>
          <div style={chartStyles.data}>
            {(() => {
              const initialCapital = 1586000;
              
              // Parse dates for chronological ordering
              const parseTradeDate = (trade: any) => {
                const monthMap: {[key: string]: number} = {
                  'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                  'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                };
                if (trade.closingDate) return new Date(trade.closingDate);
                if (trade.date) {
                  const month = monthMap[trade.date.month.toUpperCase()] ?? 9;
                  const day = parseInt(trade.date.day) || 1;
                  return new Date(2025, month, day);
                }
                return new Date(2025, 9, 1);
              };
              
              const parseTransferDate = (transfer: any) => {
                const monthMap: {[key: string]: number} = {
                  'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                  'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                };
                const month = monthMap[transfer.date.month.toUpperCase()] ?? 9;
                const day = parseInt(transfer.date.day) || 1;
                return new Date(2025, month, day);
              };
              
              // Build events
              const events: Array<{type: 'trade' | 'transfer', date: Date, data: any}> = [];
              closedTrades.forEach(trade => {
                events.push({ type: 'trade', date: parseTradeDate(trade), data: trade });
              });
              transfers.forEach(transfer => {
                events.push({ type: 'transfer', date: parseTransferDate(transfer), data: transfer });
              });
              events.sort((a, b) => a.date.getTime() - b.date.getTime());
              
              // Calculate cumulative return
              let cumulativeReturn = 0;
              let runningCapital = initialCapital;
              
              events.forEach((event) => {
                if (event.type === 'transfer') {
                  const amount = event.data.amount;
                  runningCapital += event.data.type === 'deposit' ? amount : -amount;
                } else if (event.type === 'trade') {
                  const cleanValue = event.data.profitLoss.value.replace(/[₹,]/g, '').replace(/^\+/, '');
                  const tradePnL = parseFloat(cleanValue) || 0;
                  const tradeReturnPercent = runningCapital > 0 ? (tradePnL / runningCapital) * 100 : 0;
                  cumulativeReturn += tradeReturnPercent;
                  runningCapital += tradePnL;
                }
              });
              
              return `${cumulativeReturn >= 0 ? '+' : ''}${cumulativeReturn.toFixed(2)}%`;
            })()}
          </div>
        </div>

        {/* Bar Chart - Trade Returns */}
        <div style={{ 
          marginTop: '40px',
          height: '250px',
          width: '100%',
          position: 'relative'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 1000 250" preserveAspectRatio="none">
            {(() => {
              // Parse dates
              const parseTradeDate = (trade: any) => {
                const monthMap: {[key: string]: number} = {
                  'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                  'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                };
                if (trade.closingDate) return new Date(trade.closingDate);
                if (trade.date) {
                  const month = monthMap[trade.date.month.toUpperCase()] ?? 9;
                  const day = parseInt(trade.date.day) || 1;
                  return new Date(2025, month, day);
                }
                return new Date(2025, 9, 1);
              };
              
              // Build trade returns based on individual trade capital
              // Reverse order: oldest (left) to newest (right)
              const tradeReturns = closedTrades.map(trade => {
                const cleanPnL = trade.profitLoss.value.replace(/[₹,]/g, '').replace(/^\+/, '');
                const tradePnL = parseFloat(cleanPnL) || 0;
                
                const cleanCapital = trade.capital.value.replace(/[₹,]/g, '');
                const tradeCapital = parseFloat(cleanCapital) || 1;
                
                const tradeReturnPercent = (tradePnL / tradeCapital) * 100;
                
                return {
                  type: 'trade' as const,
                  date: trade.closingDate ? new Date(trade.closingDate) : parseTradeDate(trade),
                  data: trade,
                  returnPercent: tradeReturnPercent
                };
              }).reverse();
              
              // TEST MODE: Add 100 random bars for design testing
              // const testMode = false;
              // if (testMode) {
              //   tradeReturns = [];
              //   for (let i = 0; i < 100; i++) {
              //     const randomReturn = (Math.random() - 0.5) * 10; // Random between -5% and +5%
              //     tradeReturns.push({
              //       type: 'trade' as const,
              //       date: new Date(),
              //       data: {},
              //       returnPercent: randomReturn
              //     });
              //   }
              // }
              
              if (tradeReturns.length === 0) {
                return <text x="500" y="125" textAnchor="middle" fill="#9CA3AF">No trades</text>;
              }
              
              // Find min/max return for scaling
              const allReturns = tradeReturns.map(t => t.returnPercent || 0);
              const maxReturn = Math.max(...allReturns, 0.5);
              const minReturn = Math.min(...allReturns, -0.5);
              const returnRange = maxReturn - minReturn;
              
              // Calculate baseline Y position (0% line) with padding
              const topPadding = 20;
              const bottomPadding = 20;
              const chartHeight = 250 - topPadding - bottomPadding;
              const baselineY = topPadding + chartHeight - ((0 - minReturn) / returnRange) * chartHeight;
              
              // Calculate bar width - 4px gap between bars
              const gap = 4;
              const totalBars = tradeReturns.length;
              const availableWidth = 1000;
              const barWidth = (availableWidth - (totalBars - 1) * gap) / totalBars;
              
              return (
                <>
                  {/* Baseline at 0% */}
                  <line
                    x1="0"
                    y1={baselineY}
                    x2="1000"
                    y2={baselineY}
                    stroke="#9CA3AF"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  
                  {/* Bars for each trade */}
                  {tradeReturns.map((trade, i) => {
                    const returnPercent = trade.returnPercent || 0;
                    const x = i * (barWidth + gap);
                    const barHeight = Math.abs((returnPercent / returnRange) * chartHeight);
                    
                    let y, height;
                    if (returnPercent >= 0) {
                      // Green bar going up
                      height = barHeight;
                      y = baselineY - height;
                    } else {
                      // Red bar going down
                      height = barHeight;
                      y = baselineY;
                    }
                    
                    // Calculate opacity based on hover state
                    let barOpacity = 0.8;
                    if (hoveredBarIndex !== null) {
                      barOpacity = hoveredBarIndex === i ? 1 : 0.5;
                    }
                    
                    return (
                      <rect
                        key={`bar-${i}`}
                        x={x}
                        y={y}
                        width={barWidth}
                        height={height}
                        fill={returnPercent >= 0 ? '#50D959' : '#EF4444'}
                        opacity={barOpacity}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          setHoveredBarIndex(i);
                          const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                          const barX = (x + barWidth / 2) / 1000 * (svgRect?.width || 1000);
                          // For positive bars, use top (y). For negative bars, use bottom (y + height)
                          const barYPosition = returnPercent >= 0 ? y : (y + height);
                          const barY = barYPosition / 250 * (svgRect?.height || 250);
                          
                          // Get P&L value for this trade
                          const pnlValue = trade.data.profitLoss.value;
                          
                          setHoveredBarData({
                            x: barX,
                            y: barY,
                            percentage: `${returnPercent >= 0 ? '+' : ''}${returnPercent.toFixed(2)}%`,
                            amount: pnlValue,
                            isPositive: returnPercent >= 0
                          });
                        }}
                        onMouseLeave={() => {
                          setHoveredBarIndex(null);
                          setHoveredBarData(null);
                        }}
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>
          
          {/* Custom Tooltip */}
          {hoveredBarData && (
            <div style={{
              position: 'absolute',
              left: `${hoveredBarData.x}px`,
              top: hoveredBarData.isPositive ? `${hoveredBarData.y - 12}px` : `${hoveredBarData.y + 12}px`,
              transform: hoveredBarData.isPositive ? 'translate(-50%, -100%)' : 'translateX(-50%)',
              backgroundColor: '#1E3F66',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
              <div>{hoveredBarData.percentage}</div>
              <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '2px' }}>{hoveredBarData.amount}</div>
              {/* Arrow - points down for green bars (above), points up for red bars (below) */}
              <div style={{
                position: 'absolute',
                ...(hoveredBarData.isPositive ? {
                  bottom: '-6px',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid #1E3F66'
                } : {
                  top: '-6px',
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid #1E3F66'
                }),
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0
              }} />
            </div>
          )}
        </div>

        {/* X-axis - 16 timestamps - COMMENTED OUT - Uncomment to show */}
        {/* <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          display: 'grid',
          gridTemplateColumns: 'repeat(16, 1fr)',
          paddingBottom: '16px'
        }}>
          {(() => {
            const labels = [];
            
            // Get date range from trades
            const parseTradeDate = (trade: any) => {
              const monthMap: {[key: string]: number} = {
                'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
              };
              if (trade.closingDate) return new Date(trade.closingDate);
              if (trade.date) {
                const month = monthMap[trade.date.month.toUpperCase()] ?? 9;
                const day = parseInt(trade.date.day) || 1;
                return new Date(2025, month, day);
              }
              return new Date(2025, 9, 1);
            };
            
            const tradeDates = closedTrades.map(parseTradeDate).sort((a, b) => a.getTime() - b.getTime());
            const startDate = tradeDates.length > 0 ? tradeDates[0] : new Date(2025, 9, 1);
            const endDate = tradeDates.length > 0 ? tradeDates[tradeDates.length - 1] : new Date(2026, 3, 30);
            const timeRange = endDate.getTime() - startDate.getTime();
            
            // Create 16 evenly spaced timestamps
            for (let i = 0; i < 16; i++) {
              const time = startDate.getTime() + (timeRange / 15) * i;
              const date = new Date(time);
              const month = date.toLocaleDateString('en-US', { month: 'short' });
              const day = date.getDate();
              
              labels.push(
                <div 
                  key={i} 
                  style={{ 
                    fontSize: '12px',
                    fontWeight: '400',
                    color: '#1E3F66',
                    opacity: 0.25,
                    fontFamily: 'Inter, sans-serif',
                    textAlign: 'center'
                  }}>
                  {month} {day}
                </div>
              );
            }
            
            return labels;
          })()}
        </div> */}
      </section>

      {/* Metrics Section - 4 Boxes */}
      <section style={{
        borderTop: '1px dashed #DEE2E8',
        borderBottom: '1px dashed #DEE2E8',
        marginBottom: '40px'
      }}>
        <div className="flex" style={{ height: '270px', gap: '1px' }}>
          {/* Box 1: Total Profit/Loss */}
          <div style={{ width: 'calc((100% - 3px) / 4)', backgroundColor: (() => {
            const closedPnL = closedTrades.reduce((sum, t) => {
              const cleanValue = t.profitLoss.value.replace(/[₹,]/g, '').replace(/^\+/, '');
              const value = parseFloat(cleanValue) || 0;
              return sum + value;
            }, 0);
            return closedPnL >= 0 ? '#D1FAE5' : '#FEE2E2';
          })(), boxSizing: 'border-box', overflow: 'hidden', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div style={styles.contentAnchor}>Total Profit / Loss</div>
              <div>
                {(() => {
                  const initialCapital = 1586000;
                  
                  // Use the same chronological calculation as the graph
                  const parseTradeDate = (trade: any) => {
                    const monthMap: {[key: string]: number} = {
                      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                    };
                    
                    // For closed trades, use closingDate if available
                    if (trade.closingDate) {
                      return new Date(trade.closingDate);
                    }
                    
                    // Fallback: use the date object from trade
                    if (trade.date) {
                      const month = monthMap[trade.date.month.toUpperCase()] ?? 9;
                      const day = parseInt(trade.date.day) || 1;
                      return new Date(2025, month, day);
                    }
                    
                    return new Date(2025, 9, 1);
                  };
                  
                  const parseTransferDate = (transfer: any) => {
                    const monthMap: {[key: string]: number} = {
                      'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                      'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                    };
                    const month = monthMap[transfer.date.month.toUpperCase()] ?? 9;
                    const day = parseInt(transfer.date.day) || 1;
                    return new Date(2025, month, day);
                  };
                  
                  const events: Array<{type: 'trade' | 'transfer', date: Date, data: any}> = [];
                  closedTrades.forEach(trade => {
                    events.push({ type: 'trade', date: parseTradeDate(trade), data: trade });
                  });
                  transfers.forEach(transfer => {
                    events.push({ type: 'transfer', date: parseTransferDate(transfer), data: transfer });
                  });
                  events.sort((a, b) => a.date.getTime() - b.date.getTime());
                  
                  let cumulativeReturn = 0;
                  let runningCapital = initialCapital;
                  let closedPnL = 0;
                  
                  events.forEach(event => {
                    if (event.type === 'transfer') {
                      const amount = event.data.amount;
                      if (event.data.type === 'deposit') {
                        runningCapital += amount;
                      } else {
                        runningCapital -= amount;
                      }
                    } else if (event.type === 'trade') {
                      const cleanValue = event.data.profitLoss.value.replace(/[₹,]/g, '').replace(/^\+/, '');
                      const tradePnL = parseFloat(cleanValue) || 0;
                      closedPnL += tradePnL;
                      
                      const tradeReturnPercent = runningCapital > 0 ? (tradePnL / runningCapital) * 100 : 0;
                      cumulativeReturn += tradeReturnPercent;
                      runningCapital += tradePnL;
                    }
                  });
                  
                  // Return on Initial Capital
                  const returnOnInitial = ((closedPnL / initialCapital) * 100);
                  
                  return (
                    <>
                      <div style={styles.mainNumber}>
                        {closedPnL >= 0 ? '+' : '-'}₹{formatCompactNumber(Math.abs(closedPnL).toLocaleString('en-IN'))}
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '12px', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>Cumulative</div>
                          <div style={{ ...styles.percentage, color: cumulativeReturn >= 0 ? '#10B981' : '#EF4444' }}>
                            {cumulativeReturn >= 0 ? '+' : ''}{cumulativeReturn.toFixed(2)}%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: '#6B7280', fontFamily: 'Inter, sans-serif', marginBottom: '4px' }}>On Initial</div>
                          <div style={{ ...styles.percentage, color: closedPnL >= 0 ? '#10B981' : '#EF4444' }}>
                            {returnOnInitial >= 0 ? '+' : ''}{returnOnInitial.toFixed(2)}%
                          </div>
                        </div>
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
      <section>
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
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderLeft: '1px solid rgba(217, 217, 217, 0.5)', borderRight: '1px solid rgba(217, 217, 217, 0.5)', fontFamily: 'Inter, sans-serif' }}>Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Inst</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Bias</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Setup/Strategy</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Lots</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Profit / Loss</th>
              <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Max Loss</span>
                  <span>Max Profit</span>
                </div>
              </th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>Capital</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '400', color: '#1E3F66', opacity: 0.25, fontFamily: 'Inter, sans-serif', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>@Risk</th>
              <th style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px dashed #DEE2E8', borderBottom: '1px dashed #DEE2E8' }}></th>
            </tr>
          </thead>
          <tbody>
            {closedTrades.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '60px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#9CA3AF', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderLeft: '1px solid rgba(217, 217, 217, 0.5)' }}>
                  No closed trades found
                </td>
              </tr>
            ) : (
              closedTrades.map((trade) => (
                <tr key={trade.id} className="table-row">
                  {/* Date */}
                  <td style={{ padding: '18px 24px', fontSize: '14px', color: '#1F2937', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderLeft: '1px solid rgba(217, 217, 217, 0.5)', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    {(() => {
                      // Use closing date if available, otherwise fall back to trade date
                      let month = trade.date.month;
                      let day = trade.date.day;
                      
                      if (trade.closingDate) {
                        const closingDateObj = new Date(trade.closingDate);
                        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                        month = monthNames[closingDateObj.getMonth()];
                        day = closingDateObj.getDate().toString();
                      }
                      
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', border: '2px solid #1E3F66', overflow: 'hidden', width: '31px', height: '36px' }}>
                          <div style={{ backgroundColor: '#1E3F66', color: 'white', textAlign: 'center', fontSize: '8px', fontWeight: '700', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>{month}</div>
                          <div style={{ backgroundColor: 'white', color: '#1E3F66', textAlign: 'center', fontSize: '14px', fontWeight: '700', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>{day}</div>
                        </div>
                      );
                    })()}
                  </td>

                  {/* Instrument */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
                    <div style={styles.textPrimary}>{trade.instrument.name}</div>
                    <div style={styles.textSecondary}>Index</div>
                  </td>

                  {/* Bias */}
                  <td style={{ padding: '16px', backgroundColor: 'white', borderBottom: '1px dashed #DEE2E8', borderRight: '1px solid rgba(217, 217, 217, 0.5)' }}>
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
