const fs = require('fs');
let content = fs.readFileSync('src/components/AnalyticsDashboard.jsx', 'utf8');

// 1. Restore compareFrom and compareTo state variables
content = content.replace(
  /const \[compareFrom, setCustomCompareFrom\] = useState\(''\)\s*const \[compareTo, setCustomCompareTo\] = useState\(''\)/,
  "const [compareFrom, setCustomCompareFrom] = useState('')\n  const [compareTo, setCustomCompareTo] = useState('')"
);

// 2. Remove the old filters block at the bottom
const startFilters = content.indexOf('{/* Filters */}');
const endFilters = content.indexOf('{/* Chart */}');
if (startFilters !== -1 && endFilters !== -1) {
  content = content.slice(0, startFilters) + content.slice(endFilters);
}

// 3. Insert the new filters block at the top (after the header title)
const headerPattern = 'Panel analítico y organización</p>\n            </div>\n          </div>';
const headerEndIdx = content.indexOf(headerPattern);
if (headerEndIdx !== -1) {
  const insertIdx = headerEndIdx + headerPattern.length;
  
  const newFilters = `
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Filter */}
          <div className="relative" ref={timeframeRef}>
            <button
              onClick={() => setTimeframeOpen(!timeframeOpen)}
              className="flex items-center gap-2 bg-surface-alt rounded-xl border border-border/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:bg-border/30 transition-colors cursor-pointer"
            >
              <span className="truncate max-w-[150px]">
                {PRESETS.find(p => p.id === timeframe)?.label || 'Personalizado'}
              </span>
              <ChevronDown size={12} className="text-text-muted" />
            </button>
            {timeframeOpen && (
              <div className="absolute left-0 md:right-0 md:left-auto top-full mt-2 w-[220px] bg-white border border-border rounded-xl shadow-xl z-50 animate-slide-down overflow-hidden flex flex-col">
                <div className="p-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setTimeframe(p.id); setCustomFrom(''); setCustomTo(''); setTimeframeOpen(false); }}
                      className={\`w-full text-left px-4 py-2.5 text-xs font-semibold cursor-pointer rounded-lg mb-1 last:mb-0
                        \${timeframe === p.id ? 'bg-blue/10 text-blue' : 'text-text-primary hover:bg-surface-alt'}
                      \`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Client Filter */}
          <div className="relative" ref={clientRef}>
            <button
              onClick={() => setClientOpen(!clientOpen)}
              className="flex items-center gap-2 bg-surface-alt rounded-xl border border-border/40 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-text-primary hover:bg-border/30 transition-colors cursor-pointer"
            >
              <span className="truncate max-w-[150px]">
                {selectedClient === 'all' ? 'Todos los clientes' : selectedClient}
              </span>
              <ChevronDown size={12} className="text-text-muted" />
            </button>

            {clientOpen && (
              <div className="absolute right-0 top-full mt-2 w-[280px] bg-white border border-border rounded-xl shadow-xl z-50 animate-slide-down overflow-hidden flex flex-col">
                <div className="p-2 border-b border-border/60 bg-surface-alt/20">
                  <div className="relative">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="Buscar cliente..."
                      value={clientSearchTerm}
                      onChange={e => setClientSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-border/60 rounded-lg bg-white focus:outline-none focus:border-blue placeholder-text-muted"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <button
                    onClick={() => { setSelectedClient('all'); setClientOpen(false); setClientSearchTerm(''); }}
                    className={\`w-full text-left px-4 py-2.5 text-xs font-semibold cursor-pointer border-b border-border/10
                      \${selectedClient === 'all' ? 'bg-blue/5 text-blue' : 'text-text-primary hover:bg-surface-alt/50'}
                    \`}
                  >
                    Todos los clientes
                  </button>
                  {filteredUniqueClients.length === 0 ? (
                    <div className="px-4 py-6 text-center text-[10px] text-text-muted">No hay coincidencias</div>
                  ) : (
                    filteredUniqueClients.map(c => (
                      <button
                        key={c}
                        onClick={() => { setSelectedClient(c); setClientOpen(false); setClientSearchTerm(''); }}
                        className={\`w-full text-left px-4 py-2.5 text-xs font-semibold cursor-pointer border-b border-border/10 last:border-0 truncate
                          \${selectedClient === c ? 'bg-blue/5 text-blue' : 'text-text-primary hover:bg-surface-alt/50'}
                        \`}
                      >
                        {c}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* More Info / Compare Filter */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={\`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border \${
                (moreOpen || timeframe === 'custom' || compareMode !== 'off') ? 'bg-purple/5 border-purple text-purple' : 'bg-surface-alt border-border/40 text-text-muted hover:text-text-primary hover:bg-border/30'
              }\`}
            >
              <Calendar size={13} />
              Más opciones
              <ChevronDown size={12} className={\`transition-transform \${moreOpen ? 'rotate-180' : ''}\`} />
            </button>

            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 w-[340px] bg-white border border-border rounded-xl shadow-xl z-50 animate-slide-down">
                <div className="px-4 py-3 border-b border-border bg-surface-alt/20"><h4 className="text-sm font-bold text-text-primary">Período personalizado</h4></div>
                <div className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Inicio</label>
                      <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="w-full mt-0.5 px-2 py-1.5 text-xs border border-border rounded-lg bg-white focus:outline-none focus:border-purple" />
                    </div>
                    <span className="text-text-muted mt-4">-</span>
                    <div className="flex-1">
                      <label className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Fin</label>
                      <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="w-full mt-0.5 px-2 py-1.5 text-xs border border-border rounded-lg bg-white focus:outline-none focus:border-purple" />
                    </div>
                  </div>
                </div>
                
                <div className="px-4 py-3 border-y border-border bg-surface-alt/20"><h4 className="text-sm font-bold text-text-primary">Comparar con</h4></div>
                <div className="p-2">
                    <button onClick={() => setCompareMode('off')} className={\`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-surface-alt cursor-pointer \${compareMode === 'off' ? 'text-purple bg-purple/5' : 'text-text-primary'}\`}>Sin comparación</button>
                    <button onClick={() => setCompareMode('previous')} className={\`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-surface-alt cursor-pointer \${compareMode === 'previous' ? 'text-purple bg-purple/5' : 'text-text-primary'}\`}>Período anterior</button>
                    <button onClick={() => setCompareMode('year')} className={\`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-surface-alt cursor-pointer \${compareMode === 'year' ? 'text-purple bg-purple/5' : 'text-text-primary'}\`}>Mismo período año anterior</button>
                    <button onClick={() => setCompareMode('custom')} className={\`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-surface-alt cursor-pointer \${compareMode === 'custom' ? 'text-purple bg-purple/5' : 'text-text-primary'}\`}>Personalizado...</button>
                </div>
                {compareMode === 'custom' && (
                  <div className="p-4 border-t border-border bg-surface-alt/10">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Inicio Comp.</label>
                        <input type="date" value={compareFrom} onChange={e => setCustomCompareFrom(e.target.value)} className="w-full mt-0.5 px-2 py-1.5 text-xs border border-border rounded-lg bg-white focus:outline-none focus:border-purple" />
                      </div>
                      <span className="text-text-muted mt-4">-</span>
                      <div className="flex-1">
                        <label className="text-[9px] font-bold uppercase text-text-muted tracking-widest">Fin Comp.</label>
                        <input type="date" value={compareTo} onChange={e => setCustomCompareTo(e.target.value)} className="w-full mt-0.5 px-2 py-1.5 text-xs border border-border rounded-lg bg-white focus:outline-none focus:border-purple" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2 px-4 py-3 border-t border-border bg-surface-alt/30">
                  <button onClick={() => setMoreOpen(false)} className="px-4 py-1.5 text-xs font-bold text-purple hover:underline cursor-pointer">Cerrar</button>
                  <button onClick={() => { if(customFrom && customTo) setTimeframe('custom'); setMoreOpen(false); }} className="px-4 py-1.5 text-xs font-bold text-white bg-purple rounded-lg hover:bg-purple/90 cursor-pointer">Aplicar</button>
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportRef}>
            <button 
              onClick={() => setExportOpen(!exportOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer border border-border/40 text-text-muted hover:bg-surface-alt hover:text-text-primary"
            >
              <FileDown size={14} />
              Exportar <ChevronDown size={12} className="ml-0.5" />
            </button>
            
            {exportOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-border/40 py-1 z-50 animate-slide-down">
                <button 
                  onClick={() => { exportChartDataToExcel(chartData); setExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt hover:text-blue transition-colors cursor-pointer"
                >
                  Exportar Gráfico (Excel)
                </button>
                <button 
                  onClick={() => { exportChartDataToCSV(chartData); setExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-alt hover:text-blue transition-colors cursor-pointer"
                >
                  Exportar Gráfico (CSV)
                </button>
              </div>
            )}
          </div>

          {/* Report Button */}
          <button
            onClick={() => setReportOpen(true)}
            className={\`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] md:text-xs font-semibold transition-all cursor-pointer
              bg-white border-border/60 text-text-muted hover:text-text-primary hover:border-border shadow-sm hover:bg-surface-alt
            \`}
          >
            <Sparkles size={13} />
            Análisis de Rendimiento
          </button>
        </div>\n`;
  content = content.slice(0, insertIdx) + newFilters + content.slice(insertIdx);
}

// 4. Update the useEffect logic
content = content.replace(
  /if \(compareRef\.current && !compareRef\.current\.contains\(e\.target\)\) setCompareOpen\(false\)/g,
  "if (timeframeRef.current && !timeframeRef.current.contains(e.target)) setTimeframeOpen(false)"
);

fs.writeFileSync('src/components/AnalyticsDashboard.jsx', content);
console.log('Filters updated correctly');
