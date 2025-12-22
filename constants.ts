
import { TeachingCategory } from './types';

export const ASSESSMENT_CRITERIA = [
  {
    category: "1. 教学设计与内容 (30分)",
    items: [
      { id: "1_1", point: "1.1 教学目标与内容：目标明确，内容准确，重难点突出，逻辑清晰，结构完整。", max: 15 },
      { id: "1_2", point: "1.2 教学环节与活动：导入新颖，过渡自然，时间分配合理，活动设计有效支撑目标。", max: 15 }
    ]
  },
  {
    category: "2. 课堂呈现与互动 (40分)",
    items: [
      { id: "2_1", point: "2.1 语言表达与发音：表达清晰、流畅，语速适中；发音标准，语音语调自然，无明显错误。", max: 15 },
      { id: "2_2", point: "2.2 教学方法与课件：教学方法多样，运用恰当，能激发学生兴趣；课件清晰美观，有效辅助教学。", max: 15 },
      { id: "2_3", point: "2.3 师生互动与课堂管理：有效提问，及时反馈，能调动学生参与，良好课堂氛围，有效掌控秩序。", max: 10 }
    ]
  },
  {
    category: "3. 教师素养 (30分)",
    items: [
      { id: "3_1", point: "3.1 专业素养：熟悉教材，理解学情，知识储备扎实，教学专业性强。", max: 15 },
      { id: "3_2", point: "3.2 教态仪表与情感：仪容仪表得体，精神饱满，教态自然大方，富有亲和力与感染力。", max: 15 }
    ]
  }
];

export const TEACHING_STAGES: Record<TeachingCategory, string[]> = {
  [TeachingCategory.PU0]: ["Greeting", "Warm-up", "Presentation", "Practice", "Production", "Summary"],
  [TeachingCategory.PU1]: ["Greeting", "Warm-up", "Pre-task", "Task cycle", "Post-task", "Summary"]
};
