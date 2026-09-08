import type { Exercise, LearningModule } from '../../core/types'

const textExercise = (id: string, title: string, prompt: string, starter: string, solution: string, hints: string[]): Exercise => ({
  id: `computer-${id}`,
  kind: title.includes('修复') ? 'repair' : title.includes('补全') ? 'complete' : 'create',
  title,
  prompt,
  starter,
  solution,
  hints,
  validate: (_value, source) => source.trim().replace(/\s+/g, ' ') === solution.trim().replace(/\s+/g, ' '),
})

const lesson = (id: string, number: string, title: string, summary: string, sections: { heading: string; body: string }[], example: string, exercises: Exercise[]): LearningModule['lessons'][number] => ({ id, number, title, eyebrow: 'COMPUTER LEVEL 2', summary, sections, example, exercises })

export const computerModule: LearningModule = {
  id: 'computer-level-2',
  name: '计算机二级入门',
  language: '计算机二级',
  editor: 'text',
  available: true,
  description: '面向考生的公共基础、办公软件与程序设计入门。',
  lessons: [
    lesson('overview', '01', '考试地图', '先弄清科目、题型和自己的学习路线。', [
      { heading: '计算机二级考什么', body: '不同科目会围绕选择题、操作题或程序设计题展开。备考第一步不是盲目刷题，而是先确认报考科目、考试大纲和软件环境。' },
      { heading: '建议的学习顺序', body: '先补公共基础，再熟悉软件或语言的基本操作，最后按题型限时练习。每次练习都记录错因，而不只记答案。' },
    ], '科目确认 → 基础知识 → 真题操作 → 限时模拟', [
      textExercise('overview-1', '补全路线', '补全一条有效的备考路线。', '科目确认 → ', '科目确认 → 基础知识 → 真题操作 → 限时模拟', ['路线的第一步是确认报考科目。', '基础知识应在真题操作之前。', '最后一步是限时模拟。']),
      textExercise('overview-2', '修复顺序', '把“限时模拟”放到路线末尾。', '基础知识 → 限时模拟 → 真题操作', '基础知识 → 真题操作 → 限时模拟', ['先练会，再提速。', '真题操作应该先于限时模拟。', '只需要调整顺序。']),
      textExercise('overview-3', '写出计划', '写出四步学习计划，使用箭头分隔。', '', '了解题型 → 跟学基础 → 分题型练习 → 模拟复盘', ['需要四个阶段。', '用 → 连接每个阶段。', '最后要包含复盘。']),
    ]),
    lesson('foundations', '02', '公共基础：数据与算法', '用最少的概念建立做选择题所需的基础。', [
      { heading: '数据结构', body: '线性结构强调元素之间的前后关系；树和图用于表达层级或网络关系。遇到题目时先判断数据之间的关系，再选择结构。' },
      { heading: '算法复杂度', body: '复杂度用于描述输入规模变大时资源消耗如何增长。备考中要能辨认常见的 O(1)、O(n) 和 O(n²) 级别。' },
    ], '顺序查找：从第一个元素开始逐个比较', [
      textExercise('foundations-1', '补全概念', '补全算法复杂度从快到慢的常见排序。', 'O(1) < ', 'O(1) < O(log n) < O(n) < O(n²)', ['常数级最稳定。', '对数级通常快于线性级。', '平方级放在最后。']),
      textExercise('foundations-2', '修复术语', '修复这句定义，使它表达“树有层级关系”。', '树：表达元素的网络关系', '树：表达元素的层级关系', ['树常用于表示上下级。', '网络关系更接近图。', '只替换最后两个字。']),
      textExercise('foundations-3', '写出判断法', '用一句话写出选择数据结构前要先观察什么。', '', '先观察数据之间的关系，再选择合适的数据结构', ['答案要包含“关系”。', '先观察，再选择。', '使用“数据结构”这个词。']),
    ]),
    lesson('word', '03', 'Word：文档排版基础', '掌握样式、段落和页面设置，少靠手动堆格式。', [
      { heading: '先结构，后外观', body: '标题使用内置标题样式，正文使用正文样式；不要靠连续空格和回车模拟排版。这样目录、导航和统一修改才能正常工作。' },
      { heading: '操作题思路', body: '先保存文件，再处理页面设置、样式和内容，最后检查分页、编号与格式要求。每完成一类要求就核对一次。' },
    ], '标题 1：计算机二级入门\n正文：先建立文档结构，再统一调整外观。', [
      textExercise('word-1', '补全原则', '补全 Word 排版原则。', '先结构，', '先结构，后外观', ['不要先调颜色和字号。', '后半句是“外观”。', '答案使用逗号连接。']),
      textExercise('word-2', '修复做法', '修复不利于自动目录的做法。', '用连续空格对齐标题', '使用标题样式组织标题', ['自动目录依赖标题层级。', '连续空格不是结构信息。', '使用“标题样式”。']),
      textExercise('word-3', '写出检查项', '写出两个 Word 操作题提交前的检查项，用“、”分隔。', '', '分页、样式', ['检查项可以从分页和样式中选择。', '使用顿号分隔。', '答案只写两项。']),
    ]),
    lesson('excel', '04', 'Excel：公式与数据', '从单元格引用、函数和排序筛选开始。', [
      { heading: '公式从等号开始', body: 'Excel 公式通常以 = 开始。相对引用会随复制变化，绝对引用使用 $ 锁定行或列，混合引用只锁定其中一部分。' },
      { heading: '先确认数据范围', body: '使用 SUM、AVERAGE、COUNTIF 等函数前，先确认数据区域和条件。排序前要选中完整数据区域，避免只排了一列。' },
    ], '=SUM(B2:B6)\n=AVERAGE(B2:B6)\n=COUNTIF(C2:C6,">=60")', [
      textExercise('excel-1', '补全公式', '补全 B2 到 B6 的求和公式。', '=SUM(', '=SUM(B2:B6)', ['函数名是 SUM。', '范围从 B2 到 B6。', '用冒号表示连续区域。']),
      textExercise('excel-2', '修复引用', '修复需要锁定税率单元格 B1 的公式。', '=A2*B1', '=A2*$B$1', ['税率复制时不能改变。', '绝对引用使用 $。', '行和列都要锁定。']),
      textExercise('excel-3', '写出函数', '写出统计 D2:D10 平均值的公式。', '', '=AVERAGE(D2:D10)', ['平均值函数是 AVERAGE。', '数据范围是 D2 到 D10。', '公式以等号开始。']),
    ]),
    lesson('powerpoint', '05', 'PowerPoint：信息表达', '让一页幻灯片只表达一个清晰重点。', [
      { heading: '内容要有层次', body: '标题说明主题，正文承载少量关键信息，图表或图片服务于观点。不要把整段讲稿原样塞进幻灯片。' },
      { heading: '母版与统一格式', body: '重复出现的字体、页脚和版式应优先通过母版或主题统一设置，再处理个别页面。' },
    ], '标题：数据变化\n要点：现象 / 原因 / 建议', [
      textExercise('powerpoint-1', '补全结构', '补全一页汇报页的三段结构。', '现象 / ', '现象 / 原因 / 建议', ['第二部分解释为什么。', '第三部分要能指导行动。', '三项用斜杠分隔。']),
      textExercise('powerpoint-2', '修复原则', '修复这条幻灯片设计原则。', '一页幻灯片放入所有讲稿', '一页幻灯片突出一个重点', ['幻灯片不是逐字稿。', '减少信息才能突出重点。', '答案包含“一个重点”。']),
      textExercise('powerpoint-3', '写出工具', '写出统一多页字体和页脚的工具。', '', '幻灯片母版', ['它负责全局版式。', '不是普通文本框。', '答案是四个字。']),
    ]),
    lesson('python', '06', 'Python：程序设计入门', '读懂变量、分支、循环和函数的基本形状。', [
      { heading: '执行顺序', body: '程序默认从上到下执行。if 根据条件选择路径，for 或 while 重复执行，函数把可复用的逻辑封装起来。' },
      { heading: '做题方法', body: '先读输入和输出，再画出变量变化；遇到循环逐轮记录关键变量。不要只凭直觉猜结果。' },
    ], 'total = 0\nfor number in [1, 2, 3]:\n    total += number\nprint(total)', [
      textExercise('python-1', '补全循环', '补全求 1 到 3 累加结果的代码骨架。', 'total = 0\n', 'total = 0\nfor number in [1, 2, 3]:\n    total += number', ['需要 for 循环。', '循环变量可以叫 number。', '累加使用 +=。']),
      textExercise('python-2', '修复条件', '修复判断分数是否及格的条件。', 'if score > 60:', 'if score >= 60:', ['60 分也应该及格。', '需要包含等于。', '使用 >=。']),
      textExercise('python-3', '写出函数', '写出一个返回两个数之和的函数。', '', 'def add(a, b):\n    return a + b', ['函数以 def 开始。', '参数是 a 和 b。', '返回 a + b。']),
    ]),
    lesson('practice', '07', '刷题与复盘', '把做题变成可重复、可改进的训练。', [
      { heading: '三遍练习法', body: '第一遍看懂题目和操作目标，第二遍独立完成并计时，第三遍只针对错题重做。重复练习时要改变顺序，确认自己掌握的是方法。' },
      { heading: '错题记录', body: '至少记录题型、错误原因、正确操作和下次提醒。若同一类错误重复出现，就把它加入下一次专项练习。' },
    ], '看懂题目 → 独立完成 → 对照评分点 → 记录错因 → 重做', [
      textExercise('practice-1', '补全复盘', '补全错题复盘流程。', '完成题目 → ', '完成题目 → 对照评分点 → 记录错因 → 重做', ['做完后不要立刻翻答案。', '评分点帮助定位丢分位置。', '最后一步是重做。']),
      textExercise('practice-2', '修复习惯', '修复一种无效的刷题习惯。', '只背答案，不记录错因', '记录错因并隔天重做', ['答案变化时，死记容易失效。', '要记录为什么错。', '隔天重做可以验证记忆。']),
      textExercise('practice-3', '写出提醒', '写一句给自己的考试提醒。', '', '先读要求，再动手操作', ['提醒要包含“要求”。', '顺序是先读，再操作。', '使用逗号连接。']),
    ]),
  ],
}
