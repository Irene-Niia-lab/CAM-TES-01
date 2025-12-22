
import React, { useState, useEffect, useRef } from 'react';
import { Candidate, TeachingCategory } from '../types';
import { ASSESSMENT_CRITERIA, TEACHING_STAGES } from '../constants';
import { polishFeedback } from '../services/geminiService';
import { downloadCandidateHtml, generateFilename } from '../utils/exportUtils';
import { Sparkles, Download, Printer, Wand2, Fingerprint, Info, Award, MessageSquareQuote, Layers, Save, UserPlus, Building2 } from 'lucide-react';

interface AssessmentFormProps {
  candidate: Candidate;
  onChange: (updated: Candidate) => void;
  onSaveAndNew: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ candidate, onChange, onSaveAndNew }) => {
  const [isPolishing, setIsPolishing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 核心功能：当考生 ID 改变（如保存并新建）时，自动滚动到顶部
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [candidate.id]);

  const handleScoreChange = (id: string, val: string, maxScore: number) => {
    const num = Math.min(Math.max(0, parseInt(val) || 0), maxScore);
    const newScores = { ...candidate.scores, [id]: num };
    // Fix: Explicitly type reduce parameters to resolve unknown type error
    const total = Object.values(newScores).reduce((a: number, b: number) => a + b, 0);
    
    onChange({
      ...candidate,
      scores: newScores,
      totalScore: total,
      lastUpdated: new Date().toLocaleString()
    });
  };

  const handleStageToggle = (stage: string) => {
    const newStages = candidate.selectedStages.includes(stage)
      ? candidate.selectedStages.filter(s => s !== stage)
      : [...candidate.selectedStages, stage];
    onChange({ ...candidate, selectedStages: newStages });
  };

  const handleCategoryChange = (cat: TeachingCategory) => {
    onChange({ ...candidate, category: cat, selectedStages: [] });
  };

  const handlePolish = async () => {
    if (!candidate.feedback) return;
    setIsPolishing(true);
    try {
      const polished = await polishFeedback(candidate.feedback);
      onChange({ ...candidate, feedback: polished });
    } finally {
      setIsPolishing(false);
    }
  };

  const identityCode = generateFilename(candidate);

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Top Dashboard Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center no-print">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex flex-col items-center justify-center border border-blue-100">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest text-center px-1 leading-tight">识别码</span>
            <span className="text-lg font-black text-blue-700 break-all text-center px-1 leading-tight mt-1">
              {candidate.group || '?'}-{candidate.groupIndex || '?'}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-slate-900">{candidate.name || '未命名考生'}</h2>
              <span className="text-slate-400 font-medium">/</span>
              <span className="text-lg text-slate-500 font-semibold">{candidate.enName || 'No Name'}</span>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {candidate.organization || '未填写机构'}</span>
              <span>•</span>
              <span>最后更新: {candidate.lastUpdated}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onSaveAndNew}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 rounded-2xl text-white font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
          >
            <Save className="w-5 h-5" />
            保存并新建
          </button>
          <div className="w-px h-8 bg-slate-200 mx-1"></div>
          <button 
            onClick={() => downloadCandidateHtml(candidate)}
            className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-all border border-slate-200"
            title="导出单页 HTML"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-2xl text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Printer className="w-5 h-5" />
            打印报告
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pr-2 space-y-6 scroll-smooth"
      >
        {/* Candidate Information */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm no-print">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">考生信息</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">中文姓名</label>
              <input 
                type="text" 
                value={candidate.name}
                placeholder="请输入姓名"
                onChange={(e) => onChange({...candidate, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">英文/拼音姓名</label>
              <input 
                type="text" 
                value={candidate.enName}
                placeholder="Name"
                onChange={(e) => onChange({...candidate, enName: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">机构</label>
              <input 
                type="text" 
                value={candidate.organization}
                placeholder="请填写机构名称"
                onChange={(e) => onChange({...candidate, organization: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">小组编号</label>
              <input 
                type="number" 
                value={candidate.group}
                placeholder="如 01"
                onChange={(e) => onChange({...candidate, group: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter">组内序号</label>
              <input 
                type="number" 
                value={candidate.groupIndex}
                placeholder="如 01"
                onChange={(e) => onChange({...candidate, groupIndex: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all outline-none font-bold text-slate-700"
              />
            </div>
          </div>
        </section>

        {/* Teaching Stages - Two Level Selection */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm no-print">
           <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">考核环节选择</h3>
          </div>

          <div className="space-y-8">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter block mb-4">一级选项：考核体系</label>
              <div className="flex gap-4">
                {[TeachingCategory.PU0, TeachingCategory.PU1].map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-8 py-3 rounded-2xl text-base font-black transition-all border-2 ${
                      candidate.category === cat 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' 
                      : 'bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
                    }`}
                  >
                    {cat} 体系
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-tighter block mb-4">二级选项：具体教学环节</label>
              <div className="flex flex-wrap gap-3">
                {TEACHING_STAGES[candidate.category].map(stage => (
                  <button 
                    key={stage}
                    onClick={() => handleStageToggle(stage)}
                    className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border-2 ${
                      candidate.selectedStages.includes(stage)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                      : 'bg-white border-slate-100 text-slate-500 hover:border-blue-300 hover:text-blue-500'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Evaluation Matrix */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg text-white">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">专业评审打分区</h3>
            </div>
            <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase">当前总分</span>
              <span className="text-3xl font-black">{candidate.totalScore}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest w-1/4">评价维度</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">考核要点</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center w-32">满分</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-center w-32">得分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ASSESSMENT_CRITERIA.map((group, gIdx) => (
                  <React.Fragment key={gIdx}>
                    {group.items.map((item, iIdx) => (
                      <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                        {iIdx === 0 && (
                          <td rowSpan={group.items.length} className="px-6 py-8 align-top">
                            <div className="font-black text-slate-900 text-base leading-tight">
                              {group.category.split(' (')[0]}
                            </div>
                            <div className="text-xs font-bold text-slate-400 mt-2">
                              权重: {group.category.match(/\((\d+)/)?.[1] || 0}%
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-6">
                          <p className="text-slate-600 text-sm leading-relaxed font-medium">{item.point}</p>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="text-sm font-black text-slate-400">{item.max}</span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <input 
                            type="number" 
                            min="0" 
                            max={item.max}
                            value={candidate.scores[item.id] ?? ''}
                            onChange={(e) => handleScoreChange(item.id, e.target.value, item.max)}
                            className="w-20 h-12 text-center text-lg font-black text-blue-600 bg-slate-50 rounded-xl border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none group-hover:bg-white"
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Feedback Section */}
        <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600 rounded-lg text-white">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">综合反馈与评语</h3>
            </div>
            <button 
              onClick={handlePolish}
              disabled={isPolishing || !candidate.feedback}
              className="flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl font-bold hover:bg-purple-100 transition-all disabled:opacity-50 no-print border border-purple-100"
            >
              {isPolishing ? <Wand2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              AI 专家润色
            </button>
          </div>
          <textarea 
            className="w-full h-48 p-8 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-purple-50 focus:bg-white transition-all outline-none leading-relaxed text-slate-700 font-medium placeholder:text-slate-300"
            placeholder="评委请填写考生的亮点、改进点以及针对性的建议..."
            value={candidate.feedback}
            onChange={(e) => onChange({...candidate, feedback: e.target.value})}
          />
        </section>

        {/* Bottom Action Area */}
        <section className="pt-10 pb-20 no-print flex justify-center gap-6">
           <button 
            onClick={onSaveAndNew}
            className="flex items-center gap-3 px-12 py-5 bg-emerald-600 rounded-3xl text-white text-xl font-black hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 transform hover:-translate-y-1 active:scale-95"
          >
            <UserPlus className="w-7 h-7" />
            完成本次评分并开始下一位
          </button>
        </section>
      </div>
    </div>
  );
};

export default AssessmentForm;
