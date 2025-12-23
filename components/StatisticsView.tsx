
import React, { useState, useEffect } from 'react';
import { Candidate } from '../types';
import { downloadAveragedReportHtml, exportToExcel } from '../utils/exportUtils';
import { BarChart3, TrendingUp, Users, Award, Calculator, Hash, FileDown, MessageSquareText, ChevronDown, ChevronUp, User, Tag, Building2, FileSpreadsheet } from 'lucide-react';

interface StatisticsViewProps {
  candidates: Candidate[];
}

interface GroupData {
  idCode: string;
  name: string;
  enName: string;
  records: Candidate[];
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ candidates }) => {
  // 存储管理员/用户编辑后的最终反馈和基础信息
  const [editedFeedbacks, setEditedFeedbacks] = useState<Record<string, string>>({});
  const [editedNames, setEditedNames] = useState<Record<string, string>>({});
  const [editedEnNames, setEditedEnNames] = useState<Record<string, string>>({});
  const [editedOrgs, setEditedOrgs] = useState<Record<string, string>>({});
  
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  // 核心逻辑：按“组号-组内序号”进行分组聚合
  const aggregatedData = candidates.reduce((acc, c) => {
    const group = (c.group || '').padStart(2, '0');
    const index = (c.groupIndex || '').padStart(2, '0');
    const idCode = `${group}-${index}`;
    
    if (!acc[idCode]) {
      acc[idCode] = {
        idCode,
        name: c.name || '未命名',
        enName: c.enName,
        records: []
      };
    }
    acc[idCode].name = c.name || acc[idCode].name;
    acc[idCode].enName = c.enName || acc[idCode].enName;
    acc[idCode].records.push(c);
    
    return acc;
  }, {} as Record<string, GroupData>);

  const groups = (Object.values(aggregatedData) as GroupData[]).sort((a, b) => 
    a.idCode.localeCompare(b.idCode, undefined, { numeric: true, sensitivity: 'base' })
  );

  // 初始化反馈内容和考生基础信息
  useEffect(() => {
    const initialFeedbacks: Record<string, string> = {};
    const initialNames: Record<string, string> = {};
    const initialEnNames: Record<string, string> = {};
    const initialOrgs: Record<string, string> = {};

    groups.forEach(g => {
      // 提取反馈
      if (!editedFeedbacks[g.idCode]) {
        initialFeedbacks[g.idCode] = g.records
          .filter(r => r.feedback)
          .map(r => `【评委 ${r.judgeUsername || '系统'}】:\n${r.feedback}`)
          .join('\n\n---\n\n');
      }
      // 提取姓名/英文名/机构（取最后一条记录的值）
      const lastRecord = g.records[g.records.length - 1];
      if (!editedNames[g.idCode]) initialNames[g.idCode] = lastRecord.name || '';
      if (!editedEnNames[g.idCode]) initialEnNames[g.idCode] = lastRecord.enName || '';
      if (!editedOrgs[g.idCode]) initialOrgs[g.idCode] = lastRecord.organization || '';
    });

    if (Object.keys(initialFeedbacks).length > 0) setEditedFeedbacks(prev => ({ ...initialFeedbacks, ...prev }));
    if (Object.keys(initialNames).length > 0) setEditedNames(prev => ({ ...initialNames, ...prev }));
    if (Object.keys(initialEnNames).length > 0) setEditedEnNames(prev => ({ ...initialEnNames, ...prev }));
    if (Object.keys(initialOrgs).length > 0) setEditedOrgs(prev => ({ ...initialOrgs, ...prev }));
  }, [candidates]);

  const handleExportFinalReport = (group: GroupData) => {
    // 1. 计算各项均分
    const criteriaIds = ["1_1", "1_2", "2_1", "2_2", "2_3", "3_1", "3_2"];
    const avgScores: Record<string, number> = {};
    
    criteriaIds.forEach(id => {
      const sum = group.records.reduce((s, r) => s + (r.scores[id] || 0), 0);
      avgScores[id] = parseFloat((sum / group.records.length).toFixed(1));
    });

    // 2. 计算总分均分
    const totalSum = group.records.reduce((s, r) => s + r.totalScore, 0);
    const avgTotal = (totalSum / group.records.length).toFixed(1);

    // 3. 获取合并后的教学环节
    const allStages = Array.from(new Set(group.records.flatMap(r => r.selectedStages || [])));

    // 4. 调用导出
    downloadAveragedReportHtml(
      group.idCode,
      editedNames[group.idCode] || group.name,
      editedEnNames[group.idCode] || group.enName,
      editedOrgs[group.idCode] || group.records[0]?.organization || '',
      group.records[0]?.group || '?',
      group.records[0]?.groupIndex || '?',
      group.records[0]?.category || 'PU0',
      allStages,
      avgScores,
      avgTotal,
      editedFeedbacks[group.idCode] || ''
    );
  };

  const totalJudgments = candidates.length;
  const avgSystemScore = totalJudgments > 0 
    ? (candidates.reduce((sum, c) => sum + c.totalScore, 0) / totalJudgments).toFixed(1) 
    : '0';

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      {/* 顶部标题与一键导出按钮 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl text-white">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">成绩汇总统计 & 学术报告中心</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Academic Summary Center</p>
          </div>
        </div>
        
        <button 
          onClick={() => exportToExcel(candidates)}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 group"
        >
          <FileSpreadsheet className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          一键导出全员成绩汇总表
        </button>
      </div>

      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">总评分人次</p>
            <p className="text-2xl font-black text-slate-800">{totalJudgments}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">考生数 (按ID)</p>
            <p className="text-2xl font-black text-slate-800">{groups.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">全场平均分</p>
            <p className="text-2xl font-black text-slate-800">{avgSystemScore}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">最高分</p>
            <p className="text-2xl font-black text-slate-800">
              {candidates.length > 0 ? Math.max(...candidates.map(c => c.totalScore)) : 0}
            </p>
          </div>
        </div>
      </div>

      {/* 详细统计表 */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-50 rounded-2xl">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-50 z-20">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-40">识别码</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest w-40">考生姓名</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">均分详情 / 操作</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right w-48">导出最终报告</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-300 font-bold">暂无评估数据</td>
                </tr>
              ) : (
                groups.map((group) => {
                  const avg = (group.records.reduce((s, r) => s + r.totalScore, 0) / group.records.length).toFixed(1);
                  const isExpanded = expandedRow === group.idCode;
                  
                  return (
                    <React.Fragment key={group.idCode}>
                      <tr className={`transition-colors ${isExpanded ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'}`}>
                        <td className="px-6 py-6 align-top">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl font-black text-sm border border-blue-100 shadow-sm">
                            <Hash className="w-3.5 h-3.5" />
                            {group.idCode}
                          </div>
                        </td>
                        <td className="px-6 py-6 align-top">
                          <div className="flex flex-col">
                            <span className="text-base font-black text-slate-800 leading-tight">
                              {editedNames[group.idCode] || group.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">
                              {editedEnNames[group.idCode] || group.enName || '-'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg flex items-baseline gap-1.5">
                                <span className="text-[10px] font-black text-slate-400">均分</span>
                                <span className="text-lg font-black">{avg}</span>
                              </div>
                              <button 
                                onClick={() => setExpandedRow(isExpanded ? null : group.idCode)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                              >
                                <MessageSquareText className="w-4 h-4" />
                                {isExpanded ? '收起终审意见' : '审核最终意见'}
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {group.records.map((r, idx) => (
                                <div key={idx} className="px-2 py-1 bg-white border border-slate-100 rounded text-[10px] text-slate-400 font-bold">
                                  {r.judgeUsername}: <span className="text-slate-700">{r.totalScore}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-right align-top">
                          <button 
                            onClick={() => handleExportFinalReport(group)}
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 ml-auto"
                          >
                            <FileDown className="w-5 h-5" />
                            导出均分报告
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-blue-50/20">
                          <td colSpan={4} className="px-8 py-6">
                            <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-xl space-y-8 animate-in slide-in-from-top-2 duration-300">
                              
                              {/* 基础信息修正区 */}
                              <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <User className="w-4 h-4 text-blue-500" />
                                  考生基础资料修正 (用于修正录入错误)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 ml-1">
                                      <Tag className="w-3 h-3" /> 中文姓名
                                    </div>
                                    <input 
                                      type="text"
                                      value={editedNames[group.idCode] || ''}
                                      onChange={(e) => setEditedNames(prev => ({...prev, [group.idCode]: e.target.value}))}
                                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                      placeholder="修正姓名"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 ml-1">
                                      <Tag className="w-3 h-3" /> 英文/拼音名
                                    </div>
                                    <input 
                                      type="text"
                                      value={editedEnNames[group.idCode] || ''}
                                      onChange={(e) => setEditedEnNames(prev => ({...prev, [group.idCode]: e.target.value}))}
                                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                      placeholder="修正英文名"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 ml-1">
                                      <Building2 className="w-3 h-3" /> 所属机构
                                    </div>
                                    <input 
                                      type="text"
                                      value={editedOrgs[group.idCode] || ''}
                                      onChange={(e) => setEditedOrgs(prev => ({...prev, [group.idCode]: e.target.value}))}
                                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none font-bold text-slate-700 transition-all"
                                      placeholder="修正机构名称"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 反馈建议编辑区 */}
                              <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex justify-between items-center">
                                  <label className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquareText className="w-4 h-4" />
                                    汇总终审建议编辑
                                  </label>
                                  <span className="text-[10px] font-bold text-slate-400 italic">
                                    * 该反馈将出现在最终导出的 HTML 报告中
                                  </span>
                                </div>
                                <textarea 
                                  value={editedFeedbacks[group.idCode] || ''}
                                  onChange={(e) => setEditedFeedbacks(prev => ({...prev, [group.idCode]: e.target.value}))}
                                  className="w-full h-48 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none leading-relaxed text-sm font-medium text-slate-700"
                                  placeholder="输入汇总后的最终评估反馈..."
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
