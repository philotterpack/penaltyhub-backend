
import React, { useState } from 'react';
import { Rule, VariableType, Operator, ActionType } from './types';

interface RulesViewProps {
  rules: Rule[];
  setRules: React.Dispatch<React.SetStateAction<Rule[]>>;
}

export const RulesView: React.FC<RulesViewProps> = ({ rules, setRules }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    variable: 'arrival_time',
    operator: '>',
    action: 'add_fixed',
    actionValue: 0
  });

  const handleAddRule = () => {
    if (!newRule.description || !newRule.value) return;
    const rule: Rule = {
      id: Date.now().toString(),
      variable: newRule.variable as VariableType,
      operator: newRule.operator as Operator,
      value: newRule.value,
      action: newRule.action as ActionType,
      actionValue: newRule.actionValue || 0,
      description: newRule.description
    };
    setRules([...rules, rule]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter">Codice <span className="text-emerald-500">Penale</span></h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2 italic">"Le regole non si discutono, si pagano."</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20">
          Nuova Regola
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rules.map(rule => (
          <div key={rule.id} className="bg-white/5 border border-white/5 p-10 rounded-[3rem] group hover:border-emerald-500/30 transition-all relative overflow-hidden flex flex-col justify-between">
            <button onClick={() => setRules(rules.filter(r => r.id !== rule.id))} className="absolute top-8 right-8 text-slate-700 hover:text-red-500 transition-colors">
              <i className="fas fa-trash-alt"></i>
            </button>
            <div>
              <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all mb-6 shadow-xl">
                <i className="fas fa-gavel"></i>
              </div>
              <h4 className="text-lg font-black uppercase tracking-tighter mb-4 italic leading-tight">{rule.description}</h4>
            </div>
            <div className="space-y-3 mt-4">
              <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 font-mono text-[9px] text-emerald-400">
                <span className="text-slate-600">CONDIZIONE: </span>{rule.variable} {rule.operator} {rule.value}
              </div>
              <div className="p-3 bg-slate-950/50 rounded-xl border border-white/5 font-mono text-[9px] text-cyan-400">
                <span className="text-slate-600">AZIONE: </span>{rule.action.replace('_', ' ')} ({rule.actionValue})
              </div>
            </div>
          </div>
        ))}
        <div onClick={() => setIsModalOpen(true)} className="border-4 border-dashed border-white/5 rounded-[3.5rem] flex flex-col items-center justify-center p-12 opacity-30 hover:opacity-100 transition-all cursor-pointer group">
           <i className="fas fa-plus text-3xl mb-4 group-hover:scale-125 transition-transform text-emerald-500"></i>
           <span className="text-xs font-black uppercase tracking-widest">Aggiungi Regola</span>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
          <div className="bg-[#0c1220] border border-white/10 w-full max-w-xl p-12 rounded-[3.5rem] shadow-2xl relative animate-in zoom-in duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><i className="fas fa-times text-xl"></i></button>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-8 text-center">Nuova <span className="text-emerald-500">Regola</span></h3>
            
            <div className="space-y-4">
              <input placeholder="Descrizione (es: Tunnel subito...)" className="w-full bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500" onChange={e => setNewRule({...newRule, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none" onChange={e => setNewRule({...newRule, variable: e.target.value as VariableType})}>
                  <option value="arrival_time">Orario Arrivo</option>
                  <option value="nutmegs">Tunnel Subiti</option>
                  <option value="is_mvp">Uomo Partita</option>
                  <option value="forgot_kit">Kit Dimenticato</option>
                  <option value="yellow_cards">Gialli</option>
                  <option value="own_goals">Autogol</option>
                </select>
                <input placeholder="Valore soglia (es: 20:00 o 2)" className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none" onChange={e => setNewRule({...newRule, value: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <select className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none" onChange={e => setNewRule({...newRule, action: e.target.value as ActionType})}>
                  <option value="add_fixed">Aggiungi Importo Fisso</option>
                  <option value="multiply_quota">Moltiplica Quota (es: 2x)</option>
                  <option value="percent_total">% del Totale Campo</option>
                </select>
                <input type="number" placeholder="Valore azione (€ o moltiplicatore)" className="bg-slate-950/50 border border-white/10 rounded-2xl px-6 py-4 font-bold outline-none text-emerald-400" onChange={e => setNewRule({...newRule, actionValue: parseFloat(e.target.value)})}/>
              </div>
            </div>

            <button onClick={handleAddRule} className="w-full bg-emerald-500 text-slate-950 py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs mt-10 hover:scale-105 transition-all">
              Salva nel Codice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
