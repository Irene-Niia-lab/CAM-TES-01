
import * as XLSX from 'xlsx';
import { Candidate } from '../types';

export const generateFilename = (c: Candidate) => {
  const group = (c.group || '').padStart(2, '0');
  const index = (c.groupIndex || '').padStart(2, '0');
  return `${group}-${index}-${c.name || '未命名'}`;
};

export const exportToExcel = (candidates: Candidate[]) => {
  // 按识别码排序：组号优先，组内序号次之
  const sortedCandidates = [...candidates].sort((a, b) => {
    const idA = `${(a.group || '').padStart(3, '0')}-${(a.groupIndex || '').padStart(3, '0')}`;
    const idB = `${(b.group || '').padStart(3, '0')}-${(b.groupIndex || '').padStart(3, '0')}`;
    return idA.localeCompare(idB, undefined, { numeric: true });
  });

  const data = sortedCandidates.map(c => ({
    "识别码": `${(c.group || '').padStart(2, '0')}-${(c.groupIndex || '').padStart(2, '0')}`,
    "小组": c.group,
    "组内编号": c.groupIndex,
    "姓名": c.name,
    "英文名": c.enName,
    "机构": c.organization,
    "考核类别": c.category,
    "已选教学环节": (c.selectedStages || []).join(', '),
    "1.1 得分": c.scores["1_1"] || 0,
    "1.2 得分": c.scores["1_2"] || 0,
    "2.1 得分": c.scores["2_1"] || 0,
    "2.2 得分": c.scores["2_2"] || 0,
    "2.3 得分": c.scores["2_3"] || 0,
    "3.1 得分": c.scores["3_1"] || 0,
    "3.2 得分": c.scores["3_2"] || 0,
    "总分": c.totalScore,
    "反馈意见": c.feedback,
    "评委": c.judgeUsername || '未知',
    "最后更新": c.lastUpdated
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "评分全汇总");
  
  // 设置列宽
  const wscols = [
    {wch: 15}, {wch: 8}, {wch: 10}, {wch: 12}, {wch: 15}, 
    {wch: 20}, {wch: 10}, {wch: 30}, {wch: 10}, {wch: 10},
    {wch: 10}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 10},
    {wch: 8}, {wch: 50}, {wch: 12}, {wch: 20}
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `教师考核评分总汇总_${new Date().toLocaleDateString()}.xlsx`);
};

export const downloadCandidateHtml = (c: Candidate) => {
  const identityCode = generateFilename(c);
  const htmlContent = generateTemplateHtml(
    "Teacher Evaluation System",
    identityCode,
    c.name,
    c.enName,
    c.organization,
    c.group,
    c.groupIndex,
    c.category,
    c.selectedStages,
    c.scores,
    c.totalScore.toString(),
    c.feedback,
    c.lastUpdated,
    false
  );
  downloadFile(htmlContent, `${identityCode}.html`);
};

export const downloadAveragedReportHtml = (
  idCode: string,
  name: string,
  enName: string,
  org: string,
  group: string,
  groupIndex: string,
  category: string,
  stages: string[],
  avgScores: Record<string, number>,
  avgTotal: string,
  finalFeedback: string
) => {
  const htmlContent = generateTemplateHtml(
    "Final Assessment Report",
    idCode,
    name,
    enName,
    org,
    group,
    groupIndex,
    category,
    stages,
    avgScores,
    avgTotal,
    finalFeedback,
    new Date().toLocaleString(),
    true
  );
  downloadFile(htmlContent, `Final_Report_${idCode}_${name}.html`);
};

const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const generateTemplateHtml = (
  title: string,
  idCode: string,
  name: string,
  enName: string,
  org: string,
  group: string,
  groupIndex: string,
  category: string,
  stages: string[],
  scores: Record<string, number>,
  total: string,
  feedback: string,
  time: string,
  isAveraged: boolean
) => {
  const primaryColor = '#1e293b';
  const accentColor = isAveraged ? '#4f46e5' : '#0ea5e9';
  const borderColor = '#f1f5f9';

  return `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <title>${idCode} - ${title}</title>
        <style>
            * { box-sizing: border-box; }
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif;
                background-color: #fff;
                color: #334155;
                line-height: 1.5;
                margin: 0;
                padding: 60px 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .container { max-width: 800px; width: 100%; }
            header { text-align: left; border-bottom: 2px solid ${primaryColor}; padding-bottom: 30px; margin-bottom: 50px; position: relative; }
            .badge { 
                position: absolute; right: 0; top: 0;
                background-color: ${accentColor}; color: #fff;
                padding: 6px 16px; border-radius: 4px; font-size: 12px; font-weight: 800;
                letter-spacing: 0.1em; text-transform: uppercase;
            }
            h1 { margin: 0; font-size: 28px; font-weight: 900; color: ${primaryColor}; letter-spacing: -0.02em; }
            .company { font-size: 14px; font-weight: 700; color: #94a3b8; margin-top: 5px; letter-spacing: 0.2em; text-transform: uppercase; }
            .profile-card { 
                display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; margin-bottom: 60px;
                background: #f8fafc; padding: 40px; border-radius: 12px;
            }
            .profile-item { display: flex; flex-direction: column; }
            .profile-label { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
            .profile-value { font-size: 16px; font-weight: 700; color: ${primaryColor}; }
            .full-width { grid-column: span 3; }
            .identity-code { grid-column: span 3; font-size: 24px; font-weight: 900; color: ${accentColor}; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 60px; }
            th { text-align: left; padding: 15px 0; border-bottom: 2px solid ${primaryColor}; font-size: 12px; font-weight: 800; color: ${primaryColor}; text-transform: uppercase; letter-spacing: 0.1em; }
            td { padding: 20px 0; border-bottom: 1px solid ${borderColor}; font-size: 15px; }
            .score-cell { text-align: right; font-weight: 700; color: ${primaryColor}; }
            .max-score { color: #94a3b8; font-weight: 400; font-size: 13px; margin-left: 5px; }
            .total-row td { border-bottom: none; padding-top: 40px; }
            .total-label { font-size: 18px; font-weight: 900; color: ${primaryColor}; }
            .total-value-container { text-align: right; background: ${accentColor}; color: #fff; padding: 20px 30px; border-radius: 8px; }
            .total-value { font-size: 36px; font-weight: 900; line-height: 1; }
            .total-max { font-size: 14px; opacity: 0.8; font-weight: 600; margin-left: 5px; }
            .feedback-section { margin-top: 20px; }
            .section-title { font-size: 12px; font-weight: 800; color: ${accentColor}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 25px; display: flex; align-items: center; }
            .section-title::after { content: ""; flex: 1; height: 1px; background: #e2e8f0; margin-left: 20px; }
            .feedback-content { font-size: 16px; color: #475569; line-height: 1.8; white-space: pre-wrap; padding: 0 0 0 25px; border-left: 3px solid #e2e8f0; }
            footer { margin-top: 100px; padding-top: 40px; border-top: 1px solid #e2e8f0; width: 100%; text-align: center; font-size: 12px; color: #94a3b8; }
            .footer-copyright { font-weight: 700; color: #64748b; margin-bottom: 5px; }
            @media print {
                body { padding: 0; }
                .profile-card { background: #f8fafc !important; -webkit-print-color-adjust: exact; }
                .total-value-container { background: ${accentColor} !important; -webkit-print-color-adjust: exact; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <div class="badge">${isAveraged ? 'Averaged Report' : 'Evaluation Entry'}</div>
                <h1>${title}</h1>
                <div class="company">CAMPUPRO ENGLISH</div>
            </header>
            <div class="profile-card">
                <div class="identity-code">ID: ${idCode}</div>
                <div class="profile-item">
                    <span class="profile-label">Full Name</span>
                    <span class="profile-value">${name}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">English Name</span>
                    <span class="profile-value">${enName || '—'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Organization</span>
                    <span class="profile-value">${org || '—'}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Group / No.</span>
                    <span class="profile-value">${group} - ${groupIndex}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Framework</span>
                    <span class="profile-value">${category}</span>
                </div>
                <div class="profile-item">
                    <span class="profile-label">Report Date</span>
                    <span class="profile-value">${time.split(' ')[0]}</span>
                </div>
                <div class="profile-item full-width">
                    <span class="profile-label">Teaching Stages</span>
                    <span class="profile-value">${(stages || []).join('  •  ') || 'Standard Process'}</span>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Evaluation Dimension</th>
                        <th style="text-align: right;">Score</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>1.1 教学目标与内容 (Teaching Goals & Content)</td><td class="score-cell">${scores["1_1"] || 0}<span class="max-score">/ 15</span></td></tr>
                    <tr><td>1.2 教学环节与活动 (Lesson Stages & Activities)</td><td class="score-cell">${scores["1_2"] || 0}<span class="max-score">/ 15</span></td></tr>
                    <tr><td>2.1 语言表达与发音 (Delivery & Pronunciation)</td><td class="score-cell">${scores["2_1"] || 0}<span class="max-score">/ 15</span></td></tr>
                    <tr><td>2.2 教学方法与课件 (Methodology & Materials)</td><td class="score-cell">${scores["2_2"] || 0}<span class="max-score">/ 15</span></td></tr>
                    <tr><td>2.3 师生互动与课堂管理 (Interaction & Management)</td><td class="score-cell">${scores["2_3"] || 0}<span class="max-score">/ 10</span></td></tr>
                    <tr><td>3.1 专业素养 (Professionalism)</td><td class="score-cell">${scores["3_1"] || 0}<span class="max-score">/ 15</span></td></tr>
                    <tr><td>3.2 教态仪表与情感 (Demeanor & Emotional Connect)</td><td class="score-cell">${scores["3_2"] || 0}<span class="max-score">/ 15</span></td></tr>
                    <tr class="total-row">
                        <td class="total-label">Final Evaluation Score</td>
                        <td>
                            <div class="total-value-container">
                                <span class="total-value">${total}</span><span class="total-max">/ 100</span>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div class="feedback-section">
                <div class="section-title">Academic Feedback & Suggestions</div>
                <div class="feedback-content">${feedback || 'Candidate performed within expectations. Specific areas for growth were not noted during this session.'}</div>
            </div>
            <footer>
                <div class="footer-copyright">© CAMPUPRO ENGLISH ACADEMY</div>
                <div>Generated on ${time}  |  Official Assessment Document</div>
            </footer>
        </div>
    </body>
    </html>
  `;
};
