import type { Exercise, LearningModule, ResourceLink } from '../../core/types'

type Rule = (source: string) => boolean

const compact = (source: string) => source.trim().replace(/\r/g, '').split('\n').map((line) => line.trimEnd()).join('\n')
const has = (...patterns: RegExp[]): Rule => (source) => patterns.every((pattern) => pattern.test(source))
const exactOr = (solution: string, alternatives: string[] = []): Rule => (source) => [solution, ...alternatives].some((answer) => compact(source) === compact(answer))

const ex = (
  id: string,
  title: string,
  prompt: string,
  starter: string,
  solution: string,
  hints: string[],
  rule: Rule = exactOr(solution),
  feedback?: string,
): Exercise => ({
  id: `python-${id}`,
  kind: title.includes('修复') ? 'repair' : title.includes('补全') ? 'complete' : 'create',
  title,
  prompt,
  starter,
  solution,
  hints,
  feedback,
  validate: (_value, source) => rule(source),
})

const lesson = (
  id: string,
  number: string,
  title: string,
  summary: string,
  sections: { heading: string; body: string }[],
  example: string,
  goals: string[],
  exercises: Exercise[],
  note?: string,
): LearningModule['lessons'][number] => {
  const detail = teaching[id] ?? { walkthrough: [], checkpoints: [] }
  const lecture = lectureDetails[id]
  const lectureSections = lecture ? [
    { heading: '前置知识：这课真正需要什么', body: lecture.prerequisites },
    { heading: '为什么这样设计：从问题到规则', body: lecture.reasoning },
    { heading: '常见误区', body: lecture.misconception },
    { heading: '无 AI 验收标准', body: lecture.acceptance },
  ] : []
  return { id, number, title, eyebrow: 'PYTHON 系统教程', summary, chapter: `第 ${Number(number)} 章 · ${title}`, sections: [...sections, ...(zeroBaseGuides[id] ?? []), ...lectureSections], example, goals, exercises, note, walkthrough: detail.walkthrough, checkpoints: detail.checkpoints, resources: detail.resources }
}

// 每个示例都配一份“读代码路线”。初学者最容易卡住的不是记不住关键字，
// 而是不知道一段代码应该从哪一行开始读、每一行之后数据变成了什么。
const teaching: Record<string, { walkthrough: { code: string; explanation: string }[]; checkpoints: string[]; resources?: ResourceLink[] }> = {
  start: {
    walkthrough: [
      { code: 'name = "Ada"', explanation: '创建一个名为 name 的变量，并把字符串 Ada 绑定给它。等号在这里表示赋值，不是在问“是否相等”。' },
      { code: 'print(f"Hello, {name}!")', explanation: 'print 负责输出；f-string 会先把大括号里的 name 替换成 Ada，再把完整句子打印出来。' },
    ],
    checkpoints: ['把 Ada 改成自己的名字，预测输出后再运行。', '故意删掉结尾引号，观察 SyntaxError 指向哪一行。', '确认文件名以 .py 结尾，并在文件所在目录运行它。', '创建 .venv 后用 python -c "import sys; print(sys.executable)" 确认当前解释器路径。'],
    resources: [
      { label: 'Python 官网下载', url: 'https://www.python.org/downloads/', description: '只从 python.org 获取解释器；Windows、macOS、Linux 都从这里选择安装包。' },
      { label: '推荐稳定版本：Python 3.14.7', url: 'https://www.python.org/downloads/release/python-3147/', description: '本课程编写时的最新 3.14 稳定维护版。不要选 alpha、beta、旧版 embeddable package。' },
      { label: '官方文档与教程', url: 'https://docs.python.org/3/', description: '查语法、标准库和安装使用说明；Windows 用户可重点看 Python setup and usage。' },
    ],
  },
  values: {
    walkthrough: [
      { code: 'name = input("姓名：")', explanation: '程序暂停等待输入；无论输入什么，input() 返回的都是 str（字符串），包括看起来像数字的 18。' },
      { code: 'score = int(input("分数："))', explanation: '先调用 input 读文本，再用 int 把文本解析成整数。顺序不能反过来；输入 abc 会触发 ValueError。' },
      { code: 'print(f"{name} 得了 {score} 分")', explanation: '花括号里可以放变量，f-string 负责格式化；score 仍然是数字，后续还可以继续计算。' },
    ],
    checkpoints: ['分别输入 60、60.5 和 abc，记录哪一种能被 int 接受。', '比较 print("分数：", score) 和 print(f"分数：{score}") 的空格差异。', '用 type(name) 和 type(score) 验证两个变量的类型。'],
  },
  strings: {
    walkthrough: [
      { code: 'raw = "  Python  "', explanation: 'raw 保存原始文本，首尾空格也属于字符串内容；先保留原值便于对照清理前后差异。' },
      { code: 'word = raw.strip().lower()', explanation: '方法可以连续调用：strip() 去两端空白，返回的新字符串再调用 lower() 转小写。字符串本身不会被原地改写。' },
      { code: 'print(f"语言：{word}")', explanation: '把处理后的 word 插回输出模板。数据处理和显示格式分开，今后更换输入时不需要重写整句文本。' },
    ],
    checkpoints: ['手算 "  PyThOn  ".strip().lower() 的结果。', '验证 text[:3] 不包含下标 3；用长度为 3、4 的文本各测一次。', '尝试 text[0] = "X"，理解为什么字符串不能直接修改字符。'],
  },
  conditions: {
    walkthrough: [
      { code: 'score = int(input())', explanation: '先把分数变成整数，否则后面的比较可能是在比较字符串，或在转换阶段直接报错。' },
      { code: 'if score >= 60:', explanation: '这一行提出一个真假问题：“score 是否大于等于 60？”冒号表示下面要开始一个属于 if 的代码块。' },
      { code: '    print("及格")', explanation: '前面的 4 个空格不是装饰，而是告诉 Python 这行属于 if。条件为 False 时，Python 会跳过它并执行 else 分支。' },
    ],
    checkpoints: ['用 59、60、61 测试，确认边界值 60 的归类。', '把 and 读成“同时满足”，把 or 读成“至少一个满足”，各写一个例子。', '检查每个 if / elif / else 后是否有冒号、代码块是否统一缩进。'],
  },
  loops: {
    walkthrough: [
      { code: 'total = 0', explanation: '累加器先从 0 开始；这是处理“还没有加任何数”时的合理初始状态。' },
      { code: 'for number in range(1, 6):', explanation: 'range 产生 1、2、3、4、5，右端 6 不包含。for 每轮把其中一个值放进 number。' },
      { code: '    total += number', explanation: '每轮都把当前 number 加到 total。循环结束时 total 保存了所有轮次的累计结果，而不是最后一个 number。' },
    ],
    checkpoints: ['写出每轮的 total：0 → 1 → 3 → 6 → 10 → 15。', '分别观察 range(5)、range(1, 6)、range(1, 6, 2) 生成什么。', '检查 while 循环中是否同时存在“改变条件的变量”的语句。'],
  },
  collections: {
    walkthrough: [
      { code: 'scores = [72, 88, 91]', explanation: '列表按顺序保存多个分数，索引从 0 开始：scores[0] 是 72，scores[-1] 是 91。' },
      { code: 'scores.append(95)', explanation: 'append 会直接修改原列表，在末尾加入 95；它返回 None，所以不要把 scores = scores.append(95) 写在一起。' },
      { code: 'student = {"name": "Ada", "score": max(scores)}', explanation: '字典用有意义的键组织不同字段；max(scores) 先得到最高分，再把结果保存到 score 键。' },
    ],
    checkpoints: ['区分第 1 个元素和下标 1：列表第 1 个元素是 scores[0]。', '分别用 student["score"] 和 student.get("missing") 观察已存在/不存在的键。', '遍历列表时先写 for score in scores，再决定是否加 if 筛选。'],
  },
  functions: {
    walkthrough: [
      { code: 'def is_even(number):', explanation: 'def 只是定义规则，还没有执行；number 是调用者将来传入的参数，冒号后面是函数体。' },
      { code: '    return number % 2 == 0', explanation: '% 求余数。偶数除以 2 的余数是 0，比较结果是 True 或 False；return 把这个结果交还给调用者并立即结束函数。' },
      { code: 'print(is_even(8))', explanation: '调用时把 8 传给 number，函数返回 True，再由外层 print 负责显示。return 和 print 的职责不同。' },
    ],
    checkpoints: ['测试 is_even(0)、is_even(7) 和 is_even(-2)，不要只测示例中的 8。', '把函数里的 print 改成 return，观察调用者是否能继续使用结果。', '给函数写一句话职责：输入什么、返回什么、是否产生副作用。'],
  },
  files: {
    walkthrough: [
      { code: 'try:', explanation: '把可能失败的操作放进 try；这里的风险是用户输入的文本不能转换成整数。' },
      { code: '    age = int(input("年龄："))', explanation: '输入合法时，age 得到整数并继续走 else；输入 hello 时，int 抛出 ValueError，程序转到对应的 except。' },
      { code: 'except ValueError:', explanation: '只捕获“值的格式不适合转换”这一类预期错误，并给用户可理解的提示；不要用裸 except 把真正的 bug 隐藏起来。' },
    ],
    checkpoints: ['把输入设为 18 和 abc，各走一遍 try / else 与 try / except。', '打开文件时比较 r、w、a：读、覆盖写、追加写。', '确认 with 代码块结束后文件会自动关闭，不需要忘记调用 close()。'],
  },
  modules: {
    walkthrough: [
      { code: 'from math import sqrt', explanation: '从标准库 math 中直接导入 sqrt；导入写在顶部，读者一眼就能知道程序依赖什么。' },
      { code: 'area = side * side', explanation: '先用普通表达式算面积，并把结果命名为 area。好的变量名能让公式变成可读的程序。' },
      { code: 'print(f"对角线：{side * sqrt(2):.2f}")', explanation: 'sqrt(2) 参与表达式计算；: .2f（实际写作 :.2f）要求结果保留两位小数，格式化只影响显示，不改变数值本身。' },
    ],
    checkpoints: ['区分 import math 后的 math.sqrt(9) 与 from math import sqrt 后的 sqrt(9)。', '给 side 输入 0、3、-3，思考程序是否需要额外校验。', '遇到新问题先查标准库是否已有能力，再决定是否自己实现。'],
  },
  algorithm: {
    walkthrough: [
      { code: 'numbers = [int(value) for value in input().split()]', explanation: '先读一整行并按空格切开，再逐个转换为整数，最后收集成列表。列表推导式只是把这三个动作压缩在一行。' },
      { code: 'passed = [number for number in numbers if number >= 60]', explanation: '遍历 numbers，只收集满足 >= 60 的元素；“筛选”不会改变原来的 numbers，而是产生新列表 passed。' },
      { code: 'if passed:', explanation: '空列表会被当作 False，非空列表会被当作 True。先做这个判断，才能避免 len(passed) 为 0 时除以 0。' },
    ],
    checkpoints: ['测试空行、只有 59、包含 60、全部 100 这四种输入。', '把列表推导式展开成 for + if，确认每一步顺序后再压缩。', '先写输入/输出样例，再写变量和处理步骤，最后补边界测试。'],
  },
}

// 每课都有可实际执行的最小闭环：复制、运行、比对，再故意改错一处。
// 这比只给术语定义更适合第一次接触 Python 的学习者。
const zeroBaseGuides: Record<string, { heading: string; body: string }[]> = {
  start: [{ heading: '从新建文件到看到结果', body: '在任意空文件夹中新建 **hello.py**，复制保存后，在该文件夹终端执行第二个代码块。\n\n~~~python\nname = "小明"\nprint("你好，" + name)\n~~~\n\n~~~powershell\npython hello.py\n~~~\n\n预期看到：**你好，小明**。如果没有输出，先确认文件实际叫 hello.py，而不是 hello.py.txt；Windows 可开启“文件扩展名”检查。' }],
  environment: [{ heading: '一个完整的小项目长什么样', body: '创建 venv 后，文件夹可以先保持这样简单：\n\n~~~text\nmy-first-project/\n├── .venv/       # Python 自动生成；不要手动编辑\n└── hello.py     # 你写的程序\n~~~\n\n每次学习只做三件事：打开终端 → cd 到项目目录 → 激活 .venv。关闭终端后，下次需要再次激活。' }],
  values: [
    { heading: '跟着运行：输入不是数字本身', body: '保存为 age.py 后运行。程序会停下来等你输入；输入 18 并回车，预期输出 19。\n\n~~~python\nage_text = input("请输入年龄：")\nage = int(age_text)\nprint(age + 1)\n~~~\n\n把 int 删除后再输入 18，会报 TypeError。这证明 input 得到的是文本。要允许小数时使用 float。' },
    { heading: '变量的读法', body: '从上到下读：先把 10 放进 score，再把 5 加进去，最后输出 15。等号右边先计算，左边最后更新。\n\n~~~python\nscore = 10\nscore = score + 5\nprint(score)\n~~~\n\n不要把 = 当作数学等号：score = score + 5 的意思是“用新值覆盖旧值”。' },
  ],
  strings: [
    { heading: '跟着运行：清理再显示', body: '复制并运行，观察空格和大小写如何被处理。\n\n~~~python\nraw_name = "  ALICE  "\nname = raw_name.strip().title()\nprint(name)\nprint(len(name))\n~~~\n\n预期输出 Alice 和 5。若写成 raw_name.strip 而没有括号，得到的是“方法本身”，不是处理后的文本。' },
    { heading: '索引先从小例子开始', body: '下标从 0 开始。先运行再改数字预测结果。\n\n~~~python\nword = "Python"\nprint(word[0])    # P\nprint(word[-1])   # n\nprint(word[1:4])  # yth\n~~~\n\nword[6] 会报 IndexError，因为最后一个合法下标是 5。切片 word[1:100] 不会报错。' },
  ],
  conditions: [
    { heading: '跟着运行：先用边界值验证规则', body: '保存为 grade.py，分别输入 59、60、100。程序只会执行一个分支。\n\n~~~python\nscore = int(input("分数："))\nif score >= 60:\n    print("及格")\nelse:\n    print("未及格")\n~~~\n\n若报 IndentationError，删除行首空格后重新输入 4 个空格；不要混用 Tab 与空格。若 60 被判成未及格，检查是否误写成 > 60。' },
    { heading: '把中文条件翻成代码', body: '“年龄在 18 到 60 之间，包含两端”可先写成展开形式。\n\n~~~python\nage = 20\nif age >= 18 and age <= 60:\n    print("符合条件")\n~~~\n\n先读左半边，再读右半边，最后用 and 连接。确认理解后，再学习 18 <= age <= 60 的简写。' },
  ],
  loops: [
    { heading: '跟着运行：让每一轮都看得见', body: 'i 是当前轮次，total 是到当前为止的累计值。\n\n~~~python\ntotal = 0\nfor i in range(1, 4):\n    total = total + i\n    print("本轮：", i, "累计：", total)\n~~~\n\n最后一轮累计为 6。range(1, 4) 的 4 是停止线，不会被取到。' },
    { heading: 'while 的安全检查', body: 'while 必须有初始值、继续条件和每轮更新。\n\n~~~python\ni = 0\nwhile i < 3:\n    print(i)\n    i += 1\n~~~\n\n若程序不停输出同一个值，按 Ctrl+C 停止，再检查 i += 1 是否缩进在循环里面。' },
  ],
  collections: [{ heading: '跟着运行：列表与字典各解决什么', body: '列表回答“按顺序有哪几个”，字典回答“某个名字对应什么”。\n\n~~~python\nfruits = ["苹果", "香蕉"]\nfruits.append("橙子")\nstudent = {"name": "Ada", "score": 90}\nprint(fruits[0])\nprint(student["score"])\n~~~\n\n预期输出苹果和 90。列表越界会报 IndexError；字典键不存在会报 KeyError。' }],
  functions: [{ heading: '跟着运行：定义不等于执行', body: 'Python 先记住 double 这条规则；直到最后一行调用，函数体才执行。\n\n~~~python\ndef double(number):\n    return number * 2\n\nresult = double(5)\nprint(result)\n~~~\n\n预期输出 10。若函数输出 None，通常是漏写 return，或把 return 错写成 print。' }],
  files: [
    { heading: '跟着运行：先写入，再读取', body: '在空项目目录运行，它会创建 message.txt，再把内容读回来。\n\n~~~python\nwith open("message.txt", "w", encoding="utf-8") as file:\n    file.write("第一份文件")\n\nwith open("message.txt", encoding="utf-8") as file:\n    print(file.read())\n~~~\n\nw 表示覆盖写；想保留旧内容请改用 a。' },
    { heading: '错误要对用户友好', body: '把“输入的不是整数”变成一条提示。\n\n~~~python\ntry:\n    count = int(input("数量："))\nexcept ValueError:\n    print("请输入整数，例如 3")\nelse:\n    print("两倍是：", count * 2)\n~~~\n\n不要写只有 except: 的裸捕获；它会连拼写错误也隐藏。' },
  ],
  modules: [
    { heading: '跟着运行：标准库无需安装', body: 'math 是 Python 自带的标准库；不需要 pip install。不要把自己的文件命名为 math.py。\n\n~~~python\nimport math\nnumber = 81\nprint(math.sqrt(number))\n~~~\n\n预期输出 9.0。若报 partially initialized module，检查文件是否误叫 math.py。' },
    { heading: '第三方库与标准库的区别', body: '第三方库要在已激活的 venv 中安装，安装后立刻用 import 验证。\n\n~~~powershell\npython -m pip install requests\npython -c "import requests; print(requests.__version__)"\n~~~\n\nimport 成功说明当前解释器确实看得到这个库。' },
  ],
  algorithm: [{ heading: '做题前的固定四步', body: '先写：1. 输入是什么；2. 输出几行；3. 中间处理；4. 最小值和边界值。下面是“统计及格人数”的展开版：\n\n~~~python\nscores = [59, 60, 88]\ncount = 0\nfor score in scores:\n    if score >= 60:\n        count += 1\nprint(count)\n~~~\n\n预期输出 2。先确认这种展开版正确，再学习更短的列表推导式。' }],
}

type LectureDetail = { prerequisites: string; reasoning: string; misconception: string; acceptance: string }

// 这些不是通用鸡汤；每一项都对应本课的一个可验证误解或能力。
const lectureDetails: Record<string, LectureDetail> = {
  start: { prerequisites: '只需要会创建文件和打开终端；不需要先理解算法、内存或任何第三方库。', reasoning: '程序必须先以文本文件保存，解释器才能按从上到下的顺序读取它。终端只是把“请解释器运行这个文件”这件事明确说出来，因此“保存—运行—看结果”是之后一切调试的最小闭环。', misconception: '> 错误理解：安装 Python 后，双击任何文件就算会运行程序。\n>\n> 为什么错：双击会隐藏工作目录和报错窗口，出问题时没有线索。\n>\n> 正确理解：先在终端中运行 python 文件名，才能同时看清目录、命令和完整报错。', acceptance: '不看资料，新建 hello.py、在正确目录运行它；故意写错一个引号，并能根据 SyntaxError 的文件名和行号修复。' },
  environment: { prerequisites: '需要已经能在终端运行 python --version；不需要懂包管理或 Git。', reasoning: 'Python 会从当前解释器关联的位置寻找已安装模块。不同项目若共用一处位置，版本要求会互相影响；venv 的设计就是让“项目代码”和“项目依赖的解释器路径”成对隔离。', misconception: '> 错误理解：venv 是另一个 Python 语言版本，或必须每次重新创建。\n>\n> 为什么错：它主要是隔离解释器路径与包目录；创建一次后可重复激活。\n>\n> 正确理解：新项目创建一次 .venv；每次新开终端只需进入目录并激活。', acceptance: '不看资料创建、激活、退出 .venv；用 sys.executable 证明当前解释器路径包含 .venv；安装并导入一个第三方库。' },
  values: { prerequisites: '会运行一个 .py 文件即可。', reasoning: '计算机需要知道数据如何参与运算，因此值有类型。输入设备给程序的是字符序列；int 的作用不是“让输入更像数字”，而是检查并把字符序列解析成整数，解析失败才会报 ValueError。', misconception: '> 错误理解：屏幕上看起来是 18，它就天然能加 1。\n>\n> 为什么错："18" 是两个字符，18 才是整数值。\n>\n> 正确理解：先用 type 检查，再决定是否用 int 或 float 转换。', acceptance: '能解释 input 的返回类型；写出读取两个整数并求和的程序；预测 "2" + "3" 与 int("2") + int("3") 的不同结果。' },
  strings: { prerequisites: '理解变量保存值，知道 input 得到文本。', reasoning: '文本需要保持字符顺序，Python 用字符串表示它。索引是为了精确定位一个字符；切片采用左闭右开，是为了让片段长度等于结束下标减开始下标，并方便首尾相接。', misconception: '> 错误理解：切片 text[1:4] 会包含下标 4。\n>\n> 为什么错：结束下标是停止位置，不是最后一个元素。\n>\n> 正确理解：它取 1、2、3；长度正好是 4 - 1。', acceptance: '能手算三个索引/切片结果；能解释 strip 与 lower 为什么要接收返回值；能处理一行带首尾空格的用户名。' },
  conditions: { prerequisites: '会把文本转换为整数，知道 True 和 False 是两种布尔值。', reasoning: '程序需要根据数据走不同路径，比较表达式把“规则”变成 True/False。冒号后用缩进划定分支范围，避免依赖大括号或行尾标记；边界值必须由 >= 与 > 的选择精确表达。', misconception: '> 错误理解：if 后的缩进只是排版好看。\n>\n> 为什么错：Python 用缩进定义代码块，缩进变化会改变控制流。\n>\n> 正确理解：同一代码块统一 4 个空格，并为每条规则测试边界值。', acceptance: '不看资料写出包含 60 的及格判断；解释 and 与 or 的区别；用 59、60、61 验证自己的程序。' },
  loops: { prerequisites: '会写 if，能读懂整数变量更新。', reasoning: '重复不是把同一行复制十次，而是“对一串数据重复同一规则”。for 负责逐个取值；while 负责在条件为真时继续，因此必须设计一个会让条件变假的更新步骤。累加器把每轮的部分结果保存下来。', misconception: '> 错误理解：range(5) 产生 1 到 5。\n>\n> 为什么错：range 的默认起点是 0，停止值不包含。\n>\n> 正确理解：range(5) 是 0 到 4；用打印或手算表验证。', acceptance: '手写 range(1, 6) 的所有值；写出 1 到 100 的求和；能指出一段 while 为什么无限循环。' },
  collections: { prerequisites: '会变量、字符串和 for 循环。', reasoning: '当数据不止一个值，需先表达数据之间的关系：列表以位置和顺序为主，字典以名称到值的对应为主。索引从 0 起是序列位置的约定；键不是位置，必须准确匹配。', misconception: '> 错误理解：student.score 和 student["score"] 总是等价。\n>\n> 为什么错：前者是对象属性语法，普通字典按键取值。\n>\n> 正确理解：对 dict 使用方括号或 get；不确定键存在时优先 get。', acceptance: '能选择列表或字典表示一个问题并说明原因；遍历列表求最大值；安全处理一个可能不存在的字典键。' },
  functions: { prerequisites: '会条件与循环，能读懂变量赋值。', reasoning: '函数把“重复的一组步骤”命名并隔离。参数是调用时提供的输入，return 是交给调用者的输出；分开它们才能让同一规则处理不同数据，也能单独测试。', misconception: '> 错误理解：函数里 print 了结果，调用者就拿到了结果。\n>\n> 为什么错：print 只显示值，表达式结果仍可能是 None。\n>\n> 正确理解：需要继续计算的结果必须 return，再由外层决定是否 print。', acceptance: '能定义一个带两个参数并返回结果的函数；能预测调用结果；能解释参数、局部变量和返回值分别是什么。' },
  files: { prerequisites: '会字符串、函数和基本的报错阅读。', reasoning: '内存中的变量随程序结束消失，文件用于持久保存数据。打开文件占用系统资源，with 把“使用结束后一定关闭”写进结构；异常则把可预期失败从正常路径中分离。', misconception: '> 错误理解：w 只是普通写入，不会影响旧内容。\n>\n> 为什么错：w 会从头覆盖原文件。\n>\n> 正确理解：读用 r，覆盖写用 w，追加用 a；操作真实文件前先确认模式。', acceptance: '写出读写 UTF-8 文本的 with 代码；解释 w 与 a；输入 abc 时能用 ValueError 给出提示而不是让程序崩溃。' },
  modules: { prerequisites: '会函数调用，知道项目中的文件和目录。', reasoning: '模块让相关代码按文件组织，import 明确当前程序依赖什么。标准库随解释器提供；第三方库必须安装到当前环境，因此 import 失败时应先检查解释器和安装位置。', misconception: '> 错误理解：只要终端显示安装成功，所有项目都能 import。\n>\n> 为什么错：包安装在某一个解释器/venv；另一个环境看不到它。\n>\n> 正确理解：在目标项目激活 venv，再用 python -m pip 安装并立即验证 import。', acceptance: '分别写出 import math 与 from math import sqrt 的调用形式；能解释标准库和第三方库的差别；能排查 ModuleNotFoundError。' },
  algorithm: { prerequisites: '完成前面变量、条件、循环和列表的入门内容。', reasoning: '题目文字不能直接变成代码，必须先变成输入、状态、规则和输出。先用小样例手算，才能发现边界和变量含义；再把重复规则写成循环或函数。列表推导式只是展开循环的压缩写法，不是新魔法。', misconception: '> 错误理解：能一行写完才算会 Python。\n>\n> 为什么错：短代码会隐藏控制流，未验证前更难定位错误。\n>\n> 正确理解：先写展开版本、测对边界，再按需要压缩。', acceptance: '不看资料把一道小题拆成输入—处理—输出；至少设计 4 个边界测试；能把一行列表推导式展开成 for + if。' },
}

export const pythonModule: LearningModule = {
  id: 'python-level-2',
  name: 'Python 系统教程',
  language: 'Python',
  editor: 'python',
  available: true,
  description: '45 个独立章节，从第一行可运行代码，到面向对象、类型注解与异步编程。',
  lessons: [
    lesson('start', '01', '让程序跑起来', '先建立“保存、运行、观察输出”的完整闭环。', [
      { heading: '推荐版本与下载来源', body: '优先使用 Python 3 的稳定版本。本课程编写时推荐 Python 3.14.7；如果你的学校、考试或项目明确要求 3.12/3.13，就以要求为准，不要为了追新版本破坏兼容性。请从上方“Python 官网下载”进入 python.org，不要从来路不明的“绿色版”或第三方打包站下载。' },
      { heading: 'Windows 安装时看清选项', body: `下载安装程序后，普通学习选择 **64-bit installer** 即可；安装界面如果出现“Add Python to PATH”，建议勾选，它会让终端认识 python 命令。安装完成后，关闭当前 PowerShell、重新打开一个，再复制执行：

~~~powershell
python --version
py --list
~~~

第一条应显示 Python 3 的版本号。第二条仅 Windows 有，用来列出已安装的版本；有多个 Python 时，先看清版本，不要反复覆盖安装。` },
      { heading: '验证不是只看安装成功', body: `按顺序完成这三步。每一步成功，才做下一步：

~~~powershell
# 1. 能否找到解释器
python --version

# 2. 能否执行一行代码
python -c "print(2 + 3)"

# 3. 在 hello.py 所在目录运行脚本
python hello.py
~~~

它们分别验证“命令找得到 Python”“Python 真能执行”“你能运行自己保存的文件”。macOS/Linux 常用 **python3** 替代 **python**；以电脑实际输出为准。` },
      { heading: 'Python 到底做什么', body: 'Python 解释器会按顺序读取源文件，把每条语句转换成动作并执行。学习编程不是背 API，而是学会把一个目标拆成数据、步骤和结果。第一关要建立“编辑文件 → 运行 → 观察输出 → 修改再运行”的闭环。' },
      { heading: '脚本、终端与交互式解释器', body: '交互式解释器适合快速试一行代码，输入 exit() 可以退出；.py 脚本适合保存完整程序。运行脚本前，先用 pwd（PowerShell 可用 Get-Location）确认当前目录，再执行 python hello.py。遇到“找不到文件”，先检查目录和文件名，不要急着改代码。' },
      { heading: '读错误信息的习惯', body: '报错最后一行通常告诉你错误类型，回溯中会指出文件和行号。先读类型，再回到对应行附近定位；SyntaxError 多半是语法/缩进，NameError 多半是名字不存在，TypeError 常是操作的类型不匹配。一次只改一个原因，再重新运行验证。' },
    ], 'name = "Ada"\nprint(f"Hello, {name}!")', ['能保存并运行一个 .py 文件', '能区分 print 的输出和变量的值', '知道从错误类型与行号开始排错'], [
      ex('start-1', '补全第一条输出', '补全代码，让程序输出 Hello, Python!。', 'print(', 'print("Hello, Python!")', ['输出文本要用 print。', '文本需要放在引号中。', '别忘了右括号。'], exactOr('print("Hello, Python!")', ['print(\'Hello, Python!\')']), '这条语句调用 print，把一个字符串交给解释器输出。'),
      ex('start-3', '写出最小程序', '写一个程序：保存名字 Ada，然后输出这个名字。', '', 'name = "Ada"\nprint(name)', ['先创建变量 name。', 'Ada 是字符串，需要引号。', 'print 输出变量时不要再加引号。'], has(/name\s*=\s*["']Ada["']/i, /print\s*\(\s*name\s*\)/), '变量保存数据，print(name) 读取变量并输出它的当前值。'),
      ex('start-5', '创建虚拟环境', '写出在当前项目目录创建 .venv 虚拟环境的命令。', '', 'python -m venv .venv', ['使用 python -m 可以明确由哪个解释器执行模块。', '虚拟环境模块叫 venv。', '最后写环境目录名 .venv。']),
    ], '提示：本专栏在浏览器中检查代码结构，不会在你的电脑上替你执行 Python。建议每次提交后，复制到本机解释器再跑一次。'),
    lesson('environment', '02', '项目、venv 与安装第三方库', '从零理解虚拟环境：为什么需要它、怎么创建、如何确认自己没有装错地方。', [
      { heading: '先分清 4 个名字', body: `**Python 解释器** 是运行 **.py** 文件的程序。**pip** 是下载和安装第三方库的工具。**项目目录** 是你的代码、数据和说明文件放在一起的文件夹。**venv（虚拟环境）** 是项目目录里的一套独立 Python 与已安装库的清单。

可以把电脑想成一栋楼：系统 Python 是公共厨房；每个项目的 venv 是自己的小厨房。项目 A 需要 **requests 2.x**，项目 B 需要另一个版本时，两个小厨房互不干扰。venv 不会复制你的代码，也不是云端账号；它只是本机某个项目专用的运行环境。` },
      { heading: '每个新项目的固定流程（Windows PowerShell）', body: `以下命令可以逐行复制。把 **my-first-project** 换成你想要的英文项目名；**mkdir** 会创建文件夹，**cd** 会进入它。

~~~powershell
mkdir my-first-project
cd my-first-project
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
~~~

成功激活后，命令行最左侧通常会出现 **(.venv)**。它只是提示，不是唯一证据；下一节的检查命令更可靠。` },
      { heading: 'macOS / Linux 的对应流程', body: `在 Terminal 中，创建命令几乎一样，只有 Python 命令和“激活”路径常不同：

~~~bash
mkdir my-first-project
cd my-first-project
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
~~~

如果 **python3 -m venv** 提示 venv 不可用，请先按系统提示安装相应的 Python venv 组件；不要随意用 **sudo pip install**。` },
      { heading: '安装包：永远让当前 Python 来运行 pip', body: `例如要安装网页请求库 requests，激活 venv 后执行：

~~~powershell
python -m pip install requests
python -m pip show requests
python -c "import requests; print(requests.__version__)"
~~~

不要优先写裸的 **pip install requests**。当电脑有多个 Python 时，裸 pip 可能属于另一套解释器；**python -m pip** 明确表示“用此刻这个 python 的 pip”。` },
      { heading: '怎么确认真的用对 venv', body: `激活后复制下面命令。输出路径中应含有 **.venv**：

~~~powershell
python -c "import sys; print(sys.executable)"
python -m pip --version
~~~

若路径没有 **.venv**，先确认你在项目目录，再重新激活。退出虚拟环境只需执行 **deactivate**；它不会删除环境，也不会卸载任何包。` },
      { heading: '零基础最常遇到的 4 个问题', body: `- **“python 不是内部或外部命令”**：关闭并重开终端；检查安装时是否勾选 PATH。Windows 可试 **py --version**。
- **PowerShell 不允许运行 Activate.ps1**：这是执行策略限制，不是 Python 损坏。可在当前窗口执行 **Set-ExecutionPolicy -Scope Process Bypass** 后再激活；它只影响这一个窗口。
- **ModuleNotFoundError**：先激活 venv，再用 **python -m pip install 包名** 安装，并用 **python -c "import 包名"** 验证。
- **把 .venv 提交到 Git**：不需要。把 **.venv/** 写入 **.gitignore**；别人用同一份依赖清单重新创建即可。` },
    ], 'import sys\nprint(sys.executable)  # 路径中应出现 .venv', ['能用自己的话解释 venv 隔离了什么', '能创建、激活与退出 .venv', '能用 python -m pip 安装并验证一个库', '知道 ModuleNotFoundError 时先检查当前解释器'], [
      ex('environment-1', '创建虚拟环境', '写出在当前项目目录创建 .venv 的命令。', '', 'python -m venv .venv', ['用 python -m 运行 venv 模块。', '环境目录名使用 .venv。', '命令不需要 sudo 或管理员权限。']),
      ex('environment-2', '激活 PowerShell 环境', '写出 Windows PowerShell 中激活当前目录 .venv 的命令。', '', '.\\.venv\\Scripts\\Activate.ps1', ['从当前目录开始写 .\\。', 'Windows 的激活脚本在 Scripts 文件夹。', 'PowerShell 脚本后缀是 .ps1。'], has(/^\s*\.\\\.venv\\Scripts\\Activate\.ps1\s*$/i), '激活只改变当前终端窗口使用的 Python；关闭窗口后需要重新激活。'),
      ex('environment-3', '安装 requests', '用当前 Python 的 pip 安装 requests。', '', 'python -m pip install requests', ['不要先写裸 pip。', 'python -m pip 让 pip 与当前解释器匹配。', '安装动作是 install。'], has(/python\s+-m\s+pip\s+install\s+requests/i), '使用 python -m pip 能避开“库被安装到另一个 Python”的常见问题。'),
    ], '记住这个顺序：进入项目目录 → 创建 .venv（第一次才需要）→ 激活 → 安装/运行。每次重新打开终端，只需回到项目目录并重新激活。'),
    lesson('values', '03', '变量、类型与输入输出', '让程序从外界接收数据，并做出可预测的结果。', [
      { heading: '值有类型', body: '字符串 str、整数 int、浮点数 float 和布尔值 bool 的行为不同。input() 永远先返回字符串，所以 input() 得到的 "12" 不能直接当数字做加法，计算前要显式转换成 int 或 float。' },
      { heading: '赋值不是相等', body: 'score = 90 的意思是把 90 绑定到 score；score == 90 才是比较。变量可以重新绑定，但每次都要想清楚：此刻保存的值和类型是什么？用 type(value) 可以检查类型。' },
      { heading: '输出要对齐题意', body: 'print 默认在多个参数之间加空格并在结尾换行。f-string 适合把变量嵌进文本，例如 f"得分：{score}"。考试或作业中，输出多一个空格也可能不符合要求。' },
    ], 'name = input("姓名：")\nscore = int(input("分数："))\nprint(f"{name} 得了 {score} 分")', ['能判断常见值的类型', '能把输入转换为数字', '能用 f-string 生成清晰输出'], [
      ex('values-1', '补全数字输入', '读取一行整数并保存到 age。', 'age = ', 'age = int(input())', ['input() 的结果是字符串。', '整数转换函数叫 int。', '把 input() 放进 int()。'], has(/age\s*=\s*int\s*\(\s*input\s*\(\s*\)\s*\)/), '转换发生在输入之后：先读文本，再把文本解析成整数。'),
      ex('values-2', '修复赋值语句', '修复把姓名 Ada 保存到 name 的语句。', 'name == "Ada"', 'name = "Ada"', ['这里要“保存”，不是比较。', '保存值使用一个等号。', 'Ada 是字符串。'], has(/name\s*=\s*["']Ada["']/), '一个等号改变变量绑定，两个等号才是条件判断。'),
    ]),
    lesson('strings', '04', '字符串与格式化', '处理文本、索引和输出格式，写出不靠猜的字符串程序。', [
      { heading: '字符串是有顺序的文本', body: '字符串可以索引和切片：text[0] 是第一个字符，text[-1] 是最后一个字符，text[1:4] 取下标 1、2、3。切片的结束位置不包含在结果里，这是最常见的边界错误之一。' },
      { heading: '方法会产生新字符串', body: 'text.strip() 去掉两端空白，text.lower() 转小写，text.replace(old, new) 替换内容。字符串不可原地修改；需要保存结果时写成 text = text.strip()。' },
      { heading: '格式化比拼接更稳', body: 'f-string 用大括号插入表达式，适合同时输出文字和变量。先明确最终输出长什么样，再选择 print、f-string 或 join，不要用一串难以维护的加号拼接。' },
    ], 'raw = "  Python  "\nword = raw.strip().lower()\nprint(f"语言：{word}")', ['能正确使用索引和切片', '会调用常用字符串方法', '能写出指定格式的文本输出'], [
      ex('strings-1', '补全切片', '取出 text 的前 3 个字符。', 'text[', 'text[:3]', ['切片左边空着表示从头开始。', '结束位置写 3。', '切片不包含下标 3。']),
      ex('strings-2', '清理用户输入', '把 name 两端的空格去掉，并把结果保存回 name。', 'name = name.', 'name = name.strip()', ['去两端空白的方法是 strip。', '方法需要括号。', '要重新赋值，清理结果才会保存。'], has(/name\s*=\s*name\.strip\s*\(\s*\)/), 'strip() 返回清理后的新字符串，不会自动改变原变量。'),
    ]),
    lesson('conditions', '08', '条件、比较与布尔逻辑', '把“如果……那么……”翻译成清楚、可检查的代码。', [
      { heading: '条件是一条问题', body: 'if 后面必须是能得到 True 或 False 的表达式，并以冒号结束。常见比较符号有 ==、!=、>、>=、<、<=。代码块由缩进决定，建议始终使用 4 个空格。' },
      { heading: '组合条件', body: 'and 要求两边都为真，or 只要一边为真，not 会反转真假。复杂条件可以加括号。先用自然语言说清楚，再写代码，能显著减少“看起来差不多”的逻辑错误。' },
      { heading: '分支要覆盖边界', body: '判断分数时要考虑刚好及格、刚好不及格；判断范围时要确认端点是否包含。elif 按顺序检查，前面条件已经成立后，后面的分支不会再执行。' },
    ], 'score = int(input())\nif score >= 60:\n    print("及格")\nelse:\n    print("继续努力")', ['能写出带冒号和缩进的分支', '能区分 > 与 >= 的边界', '能组合两个布尔条件'], [
      ex('conditions-1', '补全及格条件', '60 分也算及格，补全 if 条件。', 'if score ', 'if score >= 60:', ['“包含 60”意味着要带等号。', '大于等于写作 >=。', '条件行末尾要有冒号。'], has(/if\s+score\s*>=\s*60\s*:/), '边界值 60 是测试条件的好例子：先写规则，再用 59、60、61 验证。'),
      ex('conditions-2', '修复登录判断', '只有用户名和密码都正确时才输出登录成功。', 'if user == "admin" or password == "1234":\n    print("登录成功")', 'if user == "admin" and password == "1234":\n    print("登录成功")', ['两个条件必须同时成立。', '同时成立使用 and。', '保留两个比较和缩进。'], has(/if\s+user\s*==\s*["']admin["']\s+and\s+password\s*==\s*["']1234["']\s*:/), 'or 会让“只对一个条件”也通过；权限判断通常需要 and。'),
    ]),
    lesson('loops', '11', '循环与循环不变量', '让重复工作可控，学会追踪每一轮的变量变化。', [
      { heading: 'for 适合遍历', body: 'for item in items 会依次取出每个元素。range(start, stop, step) 生成整数序列，stop 永远不包含在内；range(1, 4) 是 1、2、3。' },
      { heading: 'while 要有出口', body: 'while 在条件为真时反复执行。循环体里必须有某件事让条件最终变假，否则程序会无限循环。写 while 前先想好：初值是什么、每轮怎么变、什么时候停。' },
      { heading: '累加器是小型算法', body: 'total = 0 是累加器的初始状态，每轮用 total += number 更新。手算循环时做一张表，记录轮次、当前元素和 total，比凭感觉猜输出可靠。' },
    ], 'total = 0\nfor number in range(1, 6):\n    total += number\nprint(total)', ['能读懂 range 的开闭范围', '能写出不会死循环的 while', '能用累加器解决求和问题'], [
      ex('loops-1', '补全遍历范围', '打印 1、2、3，补全 range。', 'for number in range(', 'for number in range(1, 4):\n    print(number)', ['range 的结束值不包含。', '要包含 3，结束值写 4。', '循环体需要缩进并打印 number。'], has(/for\s+number\s+in\s+range\s*\(\s*1\s*,\s*4\s*\)\s*:/, /print\s*\(\s*number\s*\)/), '把“包含 1 到 3”翻译成 range(1, 4)，这是边界思维的基本训练。'),
      ex('loops-2', '修复 while 出口', '修复循环变量没有变化的问题，让程序输出 0、1、2 后停止。', 'i = 0\nwhile i < 3:\n    print(i)', 'i = 0\nwhile i < 3:\n    print(i)\n    i += 1', ['条件依赖 i。', '每轮输出后让 i 增加。', '使用 i += 1。'], has(/while\s+i\s*<\s*3\s*:/, /print\s*\(\s*i\s*\)/, /i\s*\+=\s*1/), '检查 while 时必须同时找“条件”和“改变条件的语句”。'),
    ]),
    lesson('collections', '15', '列表、字典与可变数据', '选择合适的数据结构，并能安全地遍历和更新它们。', [
      { heading: '列表保存有顺序的数据', body: '列表可以放多个值，索引从 0 开始。append(value) 在末尾添加，len(items) 获取长度，for item in items 遍历全部元素。不要把“第几个”误当成“下标几”。' },
      { heading: '字典保存对应关系', body: '字典用 key 找 value，例如 student["score"]。键应该稳定且有意义；遍历键值对用 for key, value in data.items()。访问不确定存在的键时，可以考虑 get。' },
      { heading: '原地修改与重新绑定', body: 'items.append(4) 会修改列表本身；items = items + [4] 会创建新列表并重新绑定。学习阶段先选择更直观的写法，调试时明确每一步数据长什么样。' },
    ], 'scores = [72, 88, 91]\nscores.append(95)\nstudent = {"name": "Ada", "score": max(scores)}\nprint(student["score"])', ['能使用列表索引、append 和 len', '能读写字典键值', '能选择列表或字典表达数据关系'], [
      ex('collections-1', '补全列表访问', '取出 names 的最后一个元素。', 'names[', 'names[-1]', ['最后一个元素可以用负索引。', '负索引从 -1 开始。', '补上右方括号。']),
      ex('collections-2', '修复字典访问', '修复读取 student 中 score 的语句。', 'print(student.score)', 'print(student["score"])', ['字典不是对象属性访问。', '用方括号写键。', 'score 是字符串键。'], has(/print\s*\(\s*student\s*\[\s*["']score["']\s*\]\s*\)/), '点号适合对象属性；字典的键值访问使用方括号。'),
    ]),
    lesson('functions', '21', '函数：拆分问题与返回结果', '把重复逻辑封装成可测试、可复用的小部件。', [
      { heading: '函数有输入和输出', body: 'def 定义函数，参数是调用者提供的输入，return 是函数交还的结果。return 会立即结束函数；没有 return 时，函数默认返回 None。不要把 print 的展示误当成 return 的结果。' },
      { heading: '局部变量与参数', body: '函数内部创建的局部变量通常只在函数内部使用。参数名可以和外部变量名不同；调用时把实际值传入。每个函数尽量只负责一件事，名字用动词或清晰的动作描述。' },
      { heading: '先写例子再抽象', body: '遇到长题目时，先用一个具体输入手算正确结果，再找出重复步骤，最后提取成函数。函数不是为了显得高级，而是为了让每一部分都能单独验证。' },
    ], 'def is_even(number):\n    return number % 2 == 0\n\nprint(is_even(8))', ['能定义带参数的函数', '能正确使用 return', '能把一段重复逻辑提取出来'], [
      ex('functions-1', '补全返回值', '定义 add(a, b)，返回两个参数的和。', 'def add(a, b):\n', 'def add(a, b):\n    return a + b', ['函数体需要缩进。', '返回语句是 return。', '返回 a + b。'], has(/def\s+add\s*\(\s*a\s*,\s*b\s*\)\s*:/, /return\s+a\s*\+\s*b/), 'return 让调用者拿到结果，所以 result = add(2, 3) 可以继续参与计算。'),
      ex('functions-2', '修复函数调用', '调用 greet 函数，并把返回值保存到 message。', 'message = greet', 'message = greet("Ada")', ['调用函数需要括号。', '把 Ada 作为字符串参数。', '保存调用结果到 message。'], has(/message\s*=\s*greet\s*\(\s*["']Ada["']\s*\)/), '写函数名不等于调用函数；括号表示现在传入参数并执行。'),
    ]),
    lesson('files', '24', '文件、异常与资源管理', '让程序能读取真实数据，并面对输入不理想的情况。', [
      { heading: '用 with 管理文件', body: 'with open("notes.txt", encoding="utf-8") as file: 会在代码块结束时自动关闭文件。读取文本常用 read、readline 或 for line in file；写入时要明确 w 会覆盖原内容，a 会追加到末尾。' },
      { heading: '异常是可预期的分支', body: '用户输入非数字、文件不存在都可能发生。try 放可能失败的代码，except 捕获特定异常并给出可理解的处理。不要用裸 except 吞掉所有错误，那会让真正的 bug 消失。' },
      { heading: '先判断能否恢复', body: '如果输入错误可以重新提示，就捕获 ValueError；如果文件不存在，可以提示路径或使用默认内容。异常处理的目标不是让所有错误都安静，而是让可预期的问题有清晰出口。' },
    ], 'try:\n    age = int(input("年龄："))\nexcept ValueError:\n    print("请输入整数")\nelse:\n    print(f"明年：{age + 1}")', ['能用 with 读取文本文件', '知道 r、w、a 的区别', '能捕获具体异常并给出反馈'], [
      ex('files-1', '修复文件模式', '以追加模式打开 log.txt。', 'with open("log.txt", "w") as file:', 'with open("log.txt", "a") as file:', ['w 会覆盖旧内容。', '追加模式是 a。', '保留 with 和 as file 的结构。'], has(/with\s+open\s*\(\s*["']log\.txt["']\s*,\s*["']a["']\s*\)\s+as\s+file\s*:/), '涉及日志时通常不希望每次运行都抹掉历史，先判断需求再选模式。'),
      ex('files-2', '补全安全读取', '使用 with 读取 data.txt 的全部内容，并保存到 content。', 'with open("data.txt", encoding="utf-8") as file:\n', 'with open("data.txt", encoding="utf-8") as file:\n    content = file.read()', ['文件代码块要缩进。', '读取全部内容的方法是 read。', '把结果保存到 content。'], has(/with\s+open\s*\(\s*["']data\.txt["']\s*,\s*encoding\s*=\s*["']utf-8["']\s*\)\s+as\s+file\s*:/, /content\s*=\s*file\.read\s*\(\s*\)/), 'with 同时表达“打开、使用、自动关闭”，比手动 close 更不容易漏资源。'),
    ]),
    lesson('modules', '26', '模块、标准库与可读性', '学会复用已有能力，而不是把所有代码堆在一个文件里。', [
      { heading: 'import 是依赖声明', body: 'import math 后通过 math.sqrt(9) 使用模块里的函数；from random import randint 则直接引入名字。导入通常放在文件顶部，便于读者知道程序依赖什么。' },
      { heading: '标准库解决常见问题', body: 'datetime 处理日期，pathlib 处理路径，json 处理结构化文本，statistics 做基础统计。先看模块提供的能力，再决定是否自己造轮子；考试题中也常要求辨认导入和调用关系。' },
      { heading: '可读性是正确性的一部分', body: '使用有意义的变量名，函数保持短小，重复逻辑集中管理。注释应该解释原因或约束，而不是把每一行翻译成中文。能让未来的自己快速复查，就是好的代码。' },
    ], 'from math import sqrt\n\nside = float(input())\narea = side * side\nprint(f"面积：{area:g}")\nprint(f"对角线：{side * sqrt(2):.2f}")', ['能读懂 import 和 from ... import', '知道常见标准库的适用场景', '能用命名和拆分提升可读性'], [
      ex('modules-1', '补全模块调用', '导入 math，并计算 16 的平方根。', 'import math\nprint(', 'import math\nprint(math.sqrt(16))', ['模块名是 math。', '平方根函数是 sqrt。', '调用时要写 math.sqrt。'], has(/import\s+math/, /print\s*\(\s*math\.sqrt\s*\(\s*16\s*\)\s*\)/), 'math.sqrt(16) 说明“函数属于哪个模块”，点号不要省略。'),
      ex('modules-2', '修复导入方式', '修复导入 randint 的语句。', 'import random.randint', 'from random import randint', ['from ... import ... 是直接导入名字的写法。', '模块名是 random。', '被导入的函数是 randint。'], has(/from\s+random\s+import\s+randint/), '两种 import 写法都能复用能力，但调用形式不同：random.randint(...) 或 randint(...)。'),
    ]),
    lesson('algorithm', '29', '综合题：把需求变成程序', '用“输入—处理—输出—测试”完成一个小型真实任务。', [
      { heading: '先写数据流', body: '拿到题目不要立刻敲代码。先写输入是什么、输出是什么、中间需要哪些变量；再用一个最小样例手算。这样能把“不会写”拆成几个可验证的小问题。' },
      { heading: '拆出规则和边界', body: '把自然语言中的“至少、超过、不足、每个、所有”圈出来，它们往往对应 >=、>、循环和列表。再补测 0、1、刚好达到阈值、空列表等边界。' },
      { heading: '复盘不只看对错', body: '完成后记录：这题的核心模式、第一次错在哪里、哪个测试暴露了问题、下次看到什么关键词可以联想到这个模式。复盘记录比抄一份标准答案更能迁移。' },
    ], 'numbers = [int(value) for value in input().split()]\npassed = [number for number in numbers if number >= 60]\nprint(len(passed))\nif passed:\n    print(sum(passed) / len(passed))', ['能从题目提取输入、处理和输出', '能主动测试边界情况', '能把列表、条件和函数知识组合起来'], [
      ex('algorithm-1', '补全输入解析', '读取一行空格分隔的整数，生成 numbers 列表。', 'numbers = [', 'numbers = [int(value) for value in input().split()]', ['先用 input 读取一整行。', 'split 把文本切成多个片段。', '每个片段用 int 转换。'], has(/numbers\s*=\s*\[\s*int\s*\(\s*value\s*\)\s+for\s+value\s+in\s+input\s*\(\s*\)\.split\s*\(\s*\)\s*\]/), '列表推导式把“遍历、转换、收集”压缩成一行，但要先能说清它展开后的三步。'),
      ex('algorithm-2', '修复边界判断', '只有列表非空时才计算平均值，修复可能除以 0 的代码。', 'average = sum(scores) / len(scores)\nprint(average)', 'if scores:\n    average = sum(scores) / len(scores)\n    print(average)', ['空列表在条件中会被当成 False。', '把计算放进 if 代码块。', '两行代码都要缩进。'], has(/if\s+scores\s*:/, /average\s*=\s*sum\s*\(\s*scores\s*\)\s*\/\s*len\s*\(\s*scores\s*\)/, /print\s*\(\s*average\s*\)/), '先处理空输入，再做除法，是把“边界测试”落实到代码里的典型方式。'),
      ex('algorithm-3', '完成成绩分析', '写程序读取若干整数成绩，输出及格人数和及格成绩平均分；没有及格成绩时只输出 0。', '', 'scores = [int(value) for value in input().split()]\npassed = [score for score in scores if score >= 60]\nprint(len(passed))\nif passed:\n    print(sum(passed) / len(passed))', ['先解析一行整数。', '用条件筛出大于等于 60 的成绩。', '先输出人数，非空时再算平均分。'], has(/scores\s*=\s*\[\s*int\s*\(\s*value\s*\)\s+for\s+value\s+in\s+input\s*\(\s*\)\.split\s*\(\s*\)\s*\]/, /passed\s*=\s*\[\s*score\s+for\s+score\s+in\s+scores\s+if\s+score\s*>=\s*60\s*\]/, /print\s*\(\s*len\s*\(\s*passed\s*\)\s*\)/, /if\s+passed\s*:/, /print\s*\(\s*sum\s*\(\s*passed\s*\)\s*\/\s*len\s*\(\s*passed\s*\)\s*\)/), '这道题把输入解析、筛选、计数、平均值和空列表边界串在一起，建议分别测试：空行、59、60、100。'),
    ], '建议节奏：每课先读目标，再不看示例写第一版；提交后把代码复制到本机 Python 运行，最后把一次错误写进自己的复盘记录。'),
    lesson('operators', '05', '运算符：把规则写准确', '一节课讲清算术、比较、逻辑与成员运算，避免“看起来对”的条件。', [
      { heading: '先区分“计算”与“判断”', body: '算术运算符会产生数值：`+`、`-`、`*`、`/`、`//`、`%`、`**`。比较运算符会产生布尔值：`==`、`!=`、`>`、`>=`、`<`、`<=`。例如 `17 // 5` 的结果是 `3`，`17 % 5` 的结果是 `2`；前者是整除后的商，后者是余数。' },
      { heading: '真实例子：判断优惠资格', body: '商店规则是“会员或订单满 200 元可免运费，但黑名单用户不可以”。不要把条件挤成一行后凭感觉读；先给每个判断起名字，再组合。`and` 比 `or` 优先执行，因此复杂条件用括号表达意图。\n\n~~~python\nis_member = True\namount = 128\nis_blocked = False\ncan_ship_free = (is_member or amount >= 200) and not is_blocked\nprint(can_ship_free)  # True\n~~~' },
      { heading: '`in` 是“是否包含”，不是相等', body: '`"py" in "python"` 是 True，因为前者是后者的一部分；`"py" == "python"` 是 False，因为它们不是同一个字符串。对列表、字典也能使用 `in`：对字典检查的是**键**，不是值。' },
      { heading: '常见误区：`=` 与 `==`', body: '`score = 60` 是把值保存到变量；`score == 60` 是提出“它是否等于 60”这个问题。Python 不允许在 `if` 中误用 `=`，报错时先检查条件行。' },
    ], 'age = 18\nweekend = True\nprice = 80\n\nif age < 12 or age >= 60:\n    price *= 0.5\nelif weekend:\n    price *= 0.8\n\nprint(f"票价：{price:g} 元")', ['能解释 `/`、`//`、`%` 各自的结果', '能用括号写出可读的复合条件', '知道 `in` 在字典中检查键'], [
      ex('operators-1', '补全余数判断', '当 number 是偶数时输出“偶数”。', 'if number ', 'if number % 2 == 0:\n    print("偶数")', ['偶数除以 2 的余数是 0。', '余数运算符是 %。', '条件行末尾需要冒号。'], has(/number\s*%\s*2\s*==\s*0/)),
      ex('operators-2', '写出范围条件', '年龄在 18 到 60（含两端）之间时输出“可报名”。', '', 'if 18 <= age <= 60:\n    print("可报名")', ['Python 可以连续比较。', '两端都包含，所以使用 <=。', '也可写成 age >= 18 and age <= 60。'], has(/18\s*<=\s*age\s*<=\s*60|age\s*>=\s*18\s+and\s+age\s*<=\s*60/)),
    ]),
    lesson('tuples-sets', '17', '元组与集合：约束与去重', '当数据不应修改或不应重复时，选对容器比多写判断更重要。', [
      { heading: '元组：固定的一组值', body: '元组用圆括号表示，例如 `point = (3, 5)`。它适合“坐标、日期、函数返回的多个结果”这类结构固定的数据。元组不能用 `point[0] = 9` 修改；这种限制能提前暴露意外修改。只有一个元素时必须写逗号：`one = (42,)`，否则 `(42)` 只是数字。' },
      { heading: '集合：不重复、无固定顺序', body: '集合用花括号表示，例如 `{"Python", "Python", "SQL"}` 会自动变成两个元素。它特别适合去重和“是否存在”的快速查询。不要按下标访问集合，也不要依赖它的显示顺序；若需要稳定顺序，使用 `sorted(tags)` 得到新列表。' },
      { heading: '真实例子：清理报名名单', body: '下面程序保留第一次出现的名字顺序，同时找出重复报名者。这里列表负责顺序，集合负责快速记忆“已经见过”。\n\n~~~python\nnames = ["Ada", "Lin", "Ada", "Mo", "Lin"]\nseen = set()\nunique = []\nduplicates = set()\n\nfor name in names:\n    if name in seen:\n        duplicates.add(name)\n    else:\n        seen.add(name)\n        unique.append(name)\n\nprint(unique)             # [\'Ada\', \'Lin\', \'Mo\']\nprint(sorted(duplicates)) # [\'Ada\', \'Lin\']\n~~~' },
      { heading: '集合运算读法', body: '`a | b` 是并集（任一集合出现）；`a & b` 是交集（两个都出现）；`a - b` 是差集（只在 a）。用于比较两份权限、两次报名或两份标签时很清楚。' },
    ], 'coordinate = (12, 8)\nallowed_roles = {"editor", "admin"}\nrole = "editor"\n\nprint(coordinate[0])\nprint(role in allowed_roles)', ['能说明元组为何不可变', '能用集合去重', '能用集合判断成员是否存在'], [
      ex('tuples-sets-1', '创建单元素元组', '创建只含字符串 Python 的元组 languages。', '', 'languages = ("Python",)', ['单元素元组需要逗号。', '字符串需要引号。', '变量名是 languages。'], has(/languages\s*=\s*\(\s*["']Python["']\s*,\s*\)/)),
      ex('tuples-sets-2', '对列表去重', '将 items 去重后保存到 unique_items。', '', 'unique_items = set(items)', ['set 可以接收列表。', '结果是集合。', '不要把 set 写成 list。'], has(/unique_items\s*=\s*set\s*\(\s*items\s*\)/)),
    ]),
    lesson('iteration-tools', '14', 'enumerate 与 zip：带着位置遍历', '处理“第几个”和“两个列表一一对应”时，不必手动维护下标。', [
      { heading: '`enumerate` 同时给位置和值', body: '普通 `for name in names` 只拿到值。需要序号时写 `for index, name in enumerate(names, start=1)`；`start=1` 让展示给用户的序号从 1 开始，列表下标仍然从 0 开始。' },
      { heading: '`zip` 把对应数据配成对', body: '`zip(names, scores)` 每轮取两个序列的同一位置。它会在**最短序列结束时停止**，所以若两个列表必须严格等长，应先检查 `len(names) == len(scores)`。' },
      { heading: '真实例子：生成成绩单', body: '每个学生和其分数按位置对应；`enumerate` 只负责行号，`zip` 只负责配对。职责分开，读代码时就容易验证。\n\n~~~python\nnames = ["Ada", "Lin", "Mo"]\nscores = [92, 78, 100]\n\nfor line, (name, score) in enumerate(zip(names, scores), start=1):\n    print(f"{line}. {name}: {score}")\n~~~\n\n输出会是 `1. Ada: 92`、`2. Lin: 78`、`3. Mo: 100`。' },
      { heading: '不要一边遍历一边随意改列表', body: '遍历时删除或插入原列表，容易跳过元素。需要筛选时创建新列表；需要位置和值时用 `enumerate`，不要手动写 `i = i + 1`。' },
    ], 'tasks = ["安装 Python", "运行脚本", "写函数"]\nfor number, task in enumerate(tasks, start=1):\n    print(f"{number}. {task}")', ['能用 enumerate 展示从 1 开始的序号', '能用 zip 并行遍历两份相关数据', '知道 zip 遇到长度不等时的行为'], [
      ex('iteration-tools-1', '补全带序号的遍历', '从 1 开始打印每个 name 的序号和名字。', 'for index, name in ', 'for index, name in enumerate(names, start=1):\n    print(index, name)', ['函数名是 enumerate。', '把 names 作为第一个参数。', 'start=1 让显示序号从 1 开始。'], has(/enumerate\s*\(\s*names\s*,\s*start\s*=\s*1\s*\)/)),
      ex('iteration-tools-2', '配对姓名和分数', '遍历 names 与 scores，每轮得到 name 和 score。', 'for name, score in ', 'for name, score in zip(names, scores):\n    print(name, score)', ['配对函数叫 zip。', '顺序传入 names, scores。', '循环行末尾需要冒号。'], has(/zip\s*\(\s*names\s*,\s*scores\s*\)/)),
    ]),
    lesson('comprehensions', '20', '列表推导式：把筛选写紧凑', '先读懂展开版循环，再用推导式表达“遍历、转换、筛选”。', [
      { heading: '推导式的固定阅读顺序', body: '`[expression for item in items if condition]` 从中间开始读：逐个取 `item`，若满足 `condition`，就把 `expression` 收集起来。最后的 `if` 是筛选，不是 `if/else` 语句块。' },
      { heading: '从展开版到推导式', body: '下面两段代码结果相同。学习时先写左边，确认正确再压缩成右边。\n\n~~~python\n# 展开版\nsquares = []\nfor number in numbers:\n    if number % 2 == 0:\n        squares.append(number ** 2)\n\n# 推导式\nsquares = [number ** 2 for number in numbers if number % 2 == 0]\n~~~' },
      { heading: '真实例子：标准化标签', body: '表单输入常含空格和大小写差异。先清理，再丢弃空标签：\n\n~~~python\nraw_tags = [" Python ", "", "WEB", "  data"]\ntags = [tag.strip().lower() for tag in raw_tags if tag.strip()]\nprint(tags)  # [\'python\', \'web\', \'data\']\n~~~\n\n这里 `tag.strip()` 在条件中判断清理后是否非空，在表达式中得到最终值。短小但仍能读懂时才使用推导式。' },
      { heading: '何时不要写推导式', body: '如果需要多步处理、`try/except`、打印调试信息或嵌套超过一层，展开成普通循环通常更清晰。简短不是目标；能被未来的自己读懂才是。' },
    ], 'numbers = [1, 2, 3, 4, 5]\neven_squares = [number ** 2 for number in numbers if number % 2 == 0]\nprint(even_squares)  # [4, 16]', ['能按固定顺序读列表推导式', '能把循环和 append 改写为推导式', '知道复杂逻辑应保留展开循环'], [
      ex('comprehensions-1', '筛选及格分数', '从 scores 创建只含 60 分及以上的 passed 列表。', '', 'passed = [score for score in scores if score >= 60]', ['先写要收集的 score。', '中间写 for score in scores。', '最后用 if score >= 60 筛选。'], has(/passed\s*=\s*\[\s*score\s+for\s+score\s+in\s+scores\s+if\s+score\s*>=\s*60\s*\]/)),
      ex('comprehensions-2', '转换为小写', '把 words 的每个元素转小写，保存到 lower_words。', '', 'lower_words = [word.lower() for word in words]', ['表达式是 word.lower()。', '逐个遍历 words。', '结果用方括号收集。'], has(/lower_words\s*=\s*\[\s*word\.lower\s*\(\s*\)\s+for\s+word\s+in\s+words\s*\]/)),
    ]),
    lesson('scope-defaults', '23', '作用域、默认参数与关键字参数', '让函数调用清楚、可预测，不依赖“刚好存在”的外部变量。', [
      { heading: '函数优先使用参数和返回值', body: '函数内部的变量是局部变量，离开函数后通常不能访问。与其让函数偷偷读取外部的 `tax_rate`，不如把需要的数据作为参数传入，结果用 return 交还。这样同一个函数能用不同输入测试。' },
      { heading: '默认参数只适合稳定的默认值', body: '例如 `def greet(name, prefix="你好"):` 允许 `greet("Ada")` 和 `greet("Ada", "欢迎")`。默认值应表达真实的常用情况。**不要**把列表、字典、集合当作默认值，因为它们会在多次调用之间共享。需要可变容器时用 `None` 作为默认值，再在函数内创建。' },
      { heading: '关键字参数让调用像一句话', body: '`send_message(text="已保存", urgent=True)` 明确每个值的含义，尤其适合多个同类型参数。位置参数必须排在关键字参数前面。' },
      { heading: '真实例子：安全地积累待办项', body: '每次没有传入列表时，函数都会新建一个，而不是复用上次的列表。\n\n~~~python\ndef add_task(title, tasks=None):\n    if tasks is None:\n        tasks = []\n    tasks.append(title)\n    return tasks\n\nfirst = add_task("学习函数")\nsecond = add_task("写练习")\nprint(first)   # [\'学习函数\']\nprint(second)  # [\'写练习\']\n~~~' },
    ], 'def format_price(amount, currency="CNY"):\n    return f"{amount:.2f} {currency}"\n\nprint(format_price(19.9))\nprint(format_price(19.9, currency="USD"))', ['能说明局部变量的可见范围', '能设计简单且安全的默认参数', '能读写关键字参数调用'], [
      ex('scope-defaults-1', '添加默认问候语', '定义 greet(name, prefix="你好")，并返回拼好的文本。', '', 'def greet(name, prefix="你好"):\n    return f"{prefix}，{name}"', ['参数默认值用 = 写在参数列表中。', '函数体需要缩进。', '返回 f-string。'], has(/def\s+greet\s*\(\s*name\s*,\s*prefix\s*=\s*["']你好["']\s*\)\s*:/, /return\s+f["']/)),
      ex('scope-defaults-2', '避免可变默认值', '当 tasks 没有传入时，在函数中创建空列表。', 'def add_task(title, tasks=None):\n', 'def add_task(title, tasks=None):\n    if tasks is None:\n        tasks = []\n    tasks.append(title)\n    return tasks', ['默认值先使用 None。', '在函数内判断 is None。', '再创建新的 []。'], has(/tasks\s+is\s+None/, /tasks\s*=\s*\[\s*\]/, /tasks\.append\s*\(\s*title\s*\)/)),
    ]),
    lesson('json-paths', '27', '路径与 JSON：读写真实数据', '使用 pathlib 和 json 处理文件，不再手写脆弱的路径字符串。', [
      { heading: 'pathlib 让路径跨平台', body: '`Path("data") / "profile.json"` 会按当前系统组合路径，不需要自己猜 `/` 或 `\\`。先用 `path.exists()` 判断文件是否存在；读取文本时明确 `encoding="utf-8"`，避免中文在不同电脑上乱码。' },
      { heading: 'JSON 是数据格式，不是 Python 代码', body: 'JSON 对象在 Python 中通常变成字典，JSON 数组变成列表。用 `json.loads()` 解析一段文本，用 `json.load(file)` 解析已打开的文件；保存时用 `json.dump(data, file, ensure_ascii=False, indent=2)`，这样中文保留可读且有缩进。' },
      { heading: '完整例子：保存学习档案', body: '下面程序把字典写入 JSON，再读回来。先运行一次，目录中会出现 `profile.json`。\n\n~~~python\nfrom pathlib import Path\nimport json\n\npath = Path("profile.json")\nprofile = {"name": "Ada", "completed": ["变量", "循环"]}\n\npath.write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8")\nloaded = json.loads(path.read_text(encoding="utf-8"))\nprint(loaded["name"])\n~~~' },
      { heading: '两类常见错误', body: '`FileNotFoundError` 表示文件路径或当前工作目录不对；先打印 `Path.cwd()`，不要立刻改文件名。`JSONDecodeError` 表示文件不是合法 JSON，例如少了引号或多了逗号；先定位报错行，再用最小样例确认格式。' },
    ], 'from pathlib import Path\nimport json\n\npath = Path("settings.json")\nsettings = {"theme": "dark", "font_size": 16}\npath.write_text(json.dumps(settings, ensure_ascii=False), encoding="utf-8")', ['能用 Path 组合和检查文件路径', '能区分 json.load 与 json.loads', '能保存可读的 UTF-8 JSON'], [
      ex('json-paths-1', '组合文件路径', '创建指向 data/scores.json 的 Path 对象 path。', '', 'from pathlib import Path\npath = Path("data") / "scores.json"', ['先从 pathlib 导入 Path。', 'Path("data") 表示目录。', '使用 / 组合下一级。'], has(/from\s+pathlib\s+import\s+Path/, /Path\s*\(\s*["']data["']\s*\)\s*\/\s*["']scores\.json["']/)),
      ex('json-paths-2', '读取 JSON 文件', '打开 profile.json 并用 json.load 读取到 profile。', '', 'import json\nwith open("profile.json", encoding="utf-8") as file:\n    profile = json.load(file)', ['先 import json。', 'json.load 接收文件对象。', '不要写 json.loads(file)。'], has(/import\s+json/, /profile\s*=\s*json\.load\s*\(\s*file\s*\)/)),
    ]),
    lesson('classes', '28', '类与对象：给数据加行为', '当多个相似实体都需要保存状态和执行同类动作时，再使用类。', [
      { heading: '类不是“更高级的字典”', body: '字典很适合一份简单数据。类适合把“这类东西有什么数据、能做什么”放在一起。例如一个 BankAccount 有 owner、balance，也有 deposit 方法；数据和操作它的规则彼此靠近。' },
      { heading: '`self` 是当前对象', body: '`__init__` 在创建对象时执行。`self.owner = owner` 把传入的 owner 保存到这个对象；`self.balance` 表示这个对象自己的余额。调用 `ada.deposit(50)` 时，Python 会把 ada 自动传给 self。' },
      { heading: '真实例子：不允许负数余额', body: '方法可以维护对象内部的约束。这里取款失败时返回 False，让调用者决定怎样提示用户。\n\n~~~python\nclass BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def withdraw(self, amount):\n        if amount <= 0 or amount > self.balance:\n            return False\n        self.balance -= amount\n        return True\n\naccount = BankAccount("Ada", 100)\nprint(account.withdraw(30))  # True\nprint(account.balance)       # 70\n~~~' },
      { heading: '什么时候先不要用类', body: '一次性的脚本、两三个独立函数、简单的字典数据，都不必为了“面向对象”强行写类。先让程序正确且清楚；当你发现同一组数据和操作反复一起出现，再抽象为类。' },
    ], 'class Counter:\n    def __init__(self):\n        self.value = 0\n\n    def increment(self):\n        self.value += 1\n\ncounter = Counter()\ncounter.increment()\nprint(counter.value)  # 1', ['能解释类、对象和 self 的关系', '能在 __init__ 中初始化对象状态', '能用方法更新同一对象的数据'], [
      ex('classes-1', '创建简单类', '定义 Student 类；初始化时将 name 保存到 self.name。', '', 'class Student:\n    def __init__(self, name):\n        self.name = name', ['类名 Student 首字母大写。', '__init__ 的第一个参数是 self。', '用 self.name 保存参数 name。'], has(/class\s+Student\s*:/, /def\s+__init__\s*\(\s*self\s*,\s*name\s*\)\s*:/, /self\.name\s*=\s*name/)),
      ex('classes-2', '调用对象方法', '创建 Counter 对象 counter，再调用它的 increment 方法。', '', 'counter = Counter()\ncounter.increment()', ['创建对象时调用类名。', '结果保存到 counter。', '方法调用使用点号和括号。'], has(/counter\s*=\s*Counter\s*\(\s*\)/, /counter\.increment\s*\(\s*\)/)),
    ]),
    lesson('number-format', '06', '数字、精度与格式化', '处理金额、比例和四舍五入时，先区分“计算结果”与“显示结果”。', [
      { heading: '整数和浮点数不会总是一起工作', body: '`int` 是整数，`float` 是带小数点的近似值。`5 / 2` 的结果是 `2.5`，即使两边都是整数；`5 // 2` 才是向下取整后的 `2`。金额和科学计算涉及浮点数时，可能看到 `0.1 + 0.2` 显示成接近而不等于 0.3 的小误差，这是二进制表示方式造成的。' },
      { heading: 'round 用于计算，格式说明用于展示', body: '`round(3.14159, 2)` 得到数值 `3.14`；`f"{3.14159:.2f}"` 得到文本 `"3.14"`。前者适合继续计算，后者适合给用户看。若题目要求固定两位小数，使用 `:.2f`，不要依赖 print 的默认显示。' },
      { heading: '真实例子：计算含税订单', body: '每一步都保留数值，最后才格式化。\n\n~~~python\nsubtotal = 128.5\ntax_rate = 0.06\ntotal = subtotal * (1 + tax_rate)\nprint(f"小计：¥{subtotal:.2f}")\nprint(f"应付：¥{total:.2f}")\n~~~\n\n不要写 `total = f"{subtotal * 1.06:.2f}"` 再继续加钱，因为 total 已经变成字符串。' },
      { heading: '百分比和千位分隔符', body: '`f"{0.875:.1%}"` 显示 `87.5%`；`f"{1234567:,}"` 显示 `1,234,567`。它们只改变输出的样子，不改变原变量。' },
    ], 'ratio = 7 / 8\ncount = 1234567\nprint(f"完成率：{ratio:.1%}")\nprint(f"访问量：{count:,}")', ['能区分 / 和 //', '能说明 round 与 :.2f 的差别', '能用 f-string 输出金额和百分比'], [
      ex('number-format-1', '固定两位小数', '输出 amount，格式要求是固定两位小数。', 'print(f"金额：', 'print(f"金额：{amount:.2f}")', ['变量放进花括号。', '两位小数写 :.2f。', 'f-string 需要在引号前写 f。'], has(/f["'][^"']*\{\s*amount\s*:\.2f\s*\}/)),
      ex('number-format-2', '计算整除和余数', '将 17 除以 5 的整商保存到 quotient，余数保存到 remainder。', '', 'quotient = 17 // 5\nremainder = 17 % 5', ['整除运算符是 //。', '余数运算符是 %。', '两个结果各保存一个变量。'], has(/quotient\s*=\s*17\s*\/\/\s*5/, /remainder\s*=\s*17\s*%\s*5/)),
    ]),
    lesson('string-tools', '07', '字符串方法与 f-string 细节', '把用户输入处理干净，再用稳定的格式输出。', [
      { heading: '先清理，再判断', body: '`strip()` 去掉首尾空白，`lower()` 统一成小写，`split()` 按空白切成列表。用户输入 `"  YES  "` 时，直接和 `"yes"` 比较会失败；写成 `answer.strip().lower() == "yes"` 才是在比较处理后的值。' },
      { heading: '替换、查找与安全访问', body: '`text.replace("-", " ")` 返回替换后的新字符串；`text.count("a")` 统计出现次数；`text.startswith("#")` 判断开头。`find()` 找不到时返回 -1，而 `index()` 找不到会抛出错误；不确定内容是否存在时优先使用 `in` 或 `find()`。' },
      { heading: 'f-string 可以放表达式', body: '花括号内不仅能写变量，也能写简单表达式，例如 `f"{name.title()} 有 {len(items)} 项"`。字典键的引号要和 f-string 外层引号错开：`f"分数：{student[\'score\']}"`。不要把复杂业务逻辑塞进花括号，先算成变量再显示。' },
      { heading: '真实例子：生成用户名', body: '先去掉空格、统一小写、把内部空格替换为点，最后再组合。\n\n~~~python\nname = "  Ada Lovelace  "\nclean = name.strip().lower().replace(" ", ".")\nusername = f"{clean}@syntaxlab.dev"\nprint(username)  # ada.lovelace@syntaxlab.dev\n~~~' },
    ], 'title = "python 入门"\nprint(title.title())\nprint(f"长度：{len(title)}")', ['能串联常用字符串方法', '能解释字符串方法为何需要保存结果', '能在 f-string 中使用简单表达式'], [
      ex('string-tools-1', '标准化回答', '将 answer 去首尾空格并转小写，保存到 clean。', '', 'clean = answer.strip().lower()', ['先调用 strip。', '再调用 lower。', '把结果保存到 clean。'], has(/clean\s*=\s*answer\.strip\s*\(\s*\)\.lower\s*\(\s*\)/)),
      ex('string-tools-2', '格式化字典字段', '输出 student 字典中 name 键的值，格式为“姓名：Ada”一类文本。', '', 'print(f"姓名：{student[\'name\']}")', ['使用 f-string。', '字典值用 student[\'name\'] 读取。', '外层使用双引号更清楚。'], has(/print\s*\(\s*f["'][\s\S]*student\s*\[\s*["']name["']\s*\]/)),
    ]),
    lesson('boolean-branches', '09', '布尔值、真值与多分支', '不仅能写 if，更要理解每个条件为什么会走到那个分支。', [
      { heading: '布尔值只有 True 和 False', body: '比较通常得到布尔值，例如 `score >= 60`。也可以把条件先保存为命名清楚的变量：`is_passing = score >= 60`。这样调试时能直接 print 它，不必在一长串条件中猜哪里错了。' },
      { heading: '空值也能用于判断，但要读得清楚', body: '空字符串 `""`、空列表 `[]`、空字典 `{}`、数字 `0`、`None` 在条件中都视为 False；非空内容视为 True。因此 `if tasks:` 可读作“如果有任务”。但要判断是否缺失时，写 `if value is None:`，不要写 `value == None`。' },
      { heading: 'elif 按顺序，不会回头', body: 'Python 从上到下检查分支，命中一个就跳过剩余分支。所以成绩判断应先写更严格的 `>= 90`，再写 `>= 60`；如果反过来，90 分会被第一个条件提前拦住。' },
      { heading: '真实例子：给成绩分类', body: '边界测试应至少包含 59、60、89、90、100。\n\n~~~python\nscore = 90\nif score < 0 or score > 100:\n    result = "无效分数"\nelif score >= 90:\n    result = "优秀"\nelif score >= 60:\n    result = "及格"\nelse:\n    result = "待提高"\nprint(result)\n~~~' },
    ], 'tasks = []\nif tasks:\n    print("开始第一项：", tasks[0])\nelse:\n    print("今天没有待办")', ['能识别常见的真值和假值', '能按从严格到宽松的顺序组织 elif', '能使用 is None 判断缺失值'], [
      ex('boolean-branches-1', '判断空列表', '当 tasks 非空时输出“有任务”。', '', 'if tasks:\n    print("有任务")', ['空列表会被当作 False。', '直接把 tasks 放到 if 后。', '条件行需要冒号。'], has(/if\s+tasks\s*:/)),
      ex('boolean-branches-2', '判断 None', '当 result 是 None 时输出“尚无结果”。', '', 'if result is None:\n    print("尚无结果")', ['使用 is None。', '不要用 == None。', '条件行最后有冒号。'], has(/if\s+result\s+is\s+None\s*:/)),
    ]),
    lesson('match-case', '10', 'match / case：按固定选项分流', '当一个值要匹配多个明确选项时，match 比一长串 == 更易读。', [
      { heading: '适用场景：有限且明确的类别', body: 'Python 3.10+ 支持 `match value:`。每个 `case` 匹配一种可能，`case _:` 是兜底分支。它适合命令、星期、状态码等离散选项；范围判断如 `score >= 60` 仍应使用 if。' },
      { heading: '字符串命令要先标准化', body: '用户可能输入 `ADD`、`add` 或两边有空格。先用 `command = input().strip().lower()`，再 match，才能把同一种命令放进同一个分支。' },
      { heading: '真实例子：简单菜单', body: '每个 case 的缩进都属于 match；下划线不是变量名，而是“其余所有情况”。\n\n~~~python\ncommand = "help"\nmatch command:\n    case "add":\n        print("新增一项")\n    case "list":\n        print("显示清单")\n    case "help":\n        print("可用命令：add / list / quit")\n    case _:\n        print("未知命令")\n~~~' },
      { heading: '兼容性提示', body: '如果课程环境或考试要求 Python 3.9 及更早版本，`match` 会报 SyntaxError，此时改用 if / elif。先用 `python --version` 确认解释器。' },
    ], 'command = input("命令：").strip().lower()\nmatch command:\n    case "quit":\n        print("再见")\n    case _:\n        print("继续处理")', ['知道 match 适合固定选项而非数值范围', '能使用 case _ 处理未知输入', '能在使用前确认 Python 版本'], [
      ex('match-case-1', '补全退出命令', '匹配 command 为 quit 时输出“再见”。', 'match command:\n', 'match command:\n    case "quit":\n        print("再见")', ['match 后面写 command。', 'case 之后写字符串 quit。', '两个语句都要遵循缩进。'], has(/match\s+command\s*:/, /case\s+["']quit["']\s*:/)),
      ex('match-case-2', '添加兜底分支', '为 match 语句添加未知命令的兜底输出。', 'match command:\n    case "start":\n        print("开始")', 'match command:\n    case "start":\n        print("开始")\n    case _:\n        print("未知命令")', ['兜底模式是下划线。', '写作 case _:。', '它应和其他 case 对齐。'], has(/case\s+_\s*:/)),
    ]),
    lesson('range-loop', '12', 'range 与 for：精确控制次数', '把“重复几次”变成可验证的范围，而不是不断猜边界。', [
      { heading: 'range 的结束值永远不取到', body: '`range(5)` 是 0、1、2、3、4；`range(2, 5)` 是 2、3、4；`range(10, 0, -2)` 是 10、8、6、4、2。读 range 时先问：起点、停止线、步长分别是什么？' },
      { heading: '索引遍历只在真正需要位置时使用', body: '只需要元素时优先 `for name in names`。需要位置和值时用 `enumerate`；只有要通过下标访问相邻元素或修改特定位置时，才写 `for index in range(len(names))`。' },
      { heading: '真实例子：打印乘法表的一行', body: '循环变量 n 会依次取 1 到 9；右端的 10 只是停止线。\n\n~~~python\nbase = 7\nfor n in range(1, 10):\n    print(f"{base} × {n} = {base * n}")\n~~~' },
      { heading: '每轮只做一件清楚的事', body: '在循环前初始化累计变量；在循环内更新它；循环后使用最终结果。若循环输出与最终输出混在一起，调试时先加上“当前轮次”和“当前值”的 print。' },
    ], 'total = 0\nfor number in range(1, 101):\n    total += number\nprint(total)  # 5050', ['能手算常见 range 的序列', '能解释 range 的停止线', '能在循环中正确维护累加器'], [
      ex('range-loop-1', '倒序循环', '让 number 依次取 5、4、3、2、1。', 'for number in range(', 'for number in range(5, 0, -1):\n    print(number)', ['起点是 5。', '停止线写 0，0 不会被取到。', '步长是 -1。'], has(/range\s*\(\s*5\s*,\s*0\s*,\s*-1\s*\)/)),
      ex('range-loop-2', '累计 1 到 10', '用 for 和 total += number 计算 1 到 10 的和。', '', 'total = 0\nfor number in range(1, 11):\n    total += number\nprint(total)', ['累计变量从 0 开始。', '要包含 10，停止线写 11。', '更新写在循环体中。'], has(/total\s*=\s*0/, /range\s*\(\s*1\s*,\s*11\s*\)/, /total\s*\+=\s*number/)),
    ]),
    lesson('while-control', '13', 'while、break 与 continue', '需要“直到某件事发生”为止时使用 while，并为它设计安全出口。', [
      { heading: 'while 的三要素', body: '写 while 前先在纸上回答：初始值是什么？继续条件是什么？每轮哪里改变条件？例如倒计时有初始 `seconds = 3`、条件 `seconds > 0`、更新 `seconds -= 1`。缺任何一个都可能死循环。' },
      { heading: 'break 立即离开整个循环', body: '`break` 适合“已经找到答案，不必再找”。它跳到循环后第一行，不会执行剩余轮次。搜索列表时找到目标后 break，比继续遍历更符合意图。' },
      { heading: 'continue 跳过当前轮', body: '`continue` 会跳过本轮剩余语句，直接开始下一轮。输入清洗时可以跳过空行；要确保循环变量的更新位置不会被 continue 意外跳过。' },
      { heading: '真实例子：直到用户输入 quit', body: '把输入标准化后再判断，避免 Quit 或前后空格失效。\n\n~~~python\nwhile True:\n    command = input("命令（quit 结束）：").strip().lower()\n    if command == "quit":\n        break\n    if not command:\n        continue\n    print(f"已收到：{command}")\nprint("程序结束")\n~~~' },
    ], 'attempts = 3\nwhile attempts > 0:\n    print(f"还剩 {attempts} 次")\n    attempts -= 1\nprint("次数用完")', ['能写出 while 的初值、条件和更新', '能解释 break 和 continue 的不同', '能避免 continue 造成的死循环'], [
      ex('while-control-1', '补全倒计时更新', '让 seconds 从 3 倒数到 1 后停止。', 'seconds = 3\nwhile seconds > 0:\n    print(seconds)\n', 'seconds = 3\nwhile seconds > 0:\n    print(seconds)\n    seconds -= 1', ['条件依赖 seconds。', '每轮要让它减少。', '使用 -= 1。'], has(/seconds\s*-=?\s*1/)),
      ex('while-control-2', '找到目标后停止', '遍历 items，找到 target 时输出“找到”并停止循环。', '', 'for item in items:\n    if item == target:\n        print("找到")\n        break', ['先比较 item 与 target。', '成功时输出提示。', 'break 离开循环。'], has(/if\s+item\s*==\s*target\s*:/, /break/)),
    ]),
    lesson('list-methods', '16', '列表方法、切片与复制', '学习“会原地修改”与“会返回新列表”的区别，避免数据悄悄变掉。', [
      { heading: '常用修改方法', body: '`append(x)` 在末尾添加一个元素，`extend(items)` 逐个添加一组元素，`insert(index, x)` 插入位置，`remove(x)` 删除第一个匹配值，`pop()` 取出并删除末尾元素。它们大多直接修改原列表，通常返回 `None`。' },
      { heading: '切片产生新列表', body: '`items[:3]` 取前三项，`items[::2]` 每隔一项取一个，`items[::-1]` 得到倒序副本。切片不会修改原列表。排序也有两种：`items.sort()` 原地排序，`sorted(items)` 返回新列表。' },
      { heading: '别把同一个列表绑给两个名字', body: '`backup = items` 不是复制，两者指向同一个列表；修改 backup 也会影响 items。要复制一层列表用 `backup = items.copy()` 或 `items[:]`。嵌套列表需要进一步学习 `copy.deepcopy`，此处先不要依赖浅复制。' },
      { heading: '真实例子：维护待办清单', body: '执行完一项时，pop(0) 会同时“取出”和“删除”。\n\n~~~python\ntasks = ["安装", "练习", "复盘"]\ncurrent = tasks.pop(0)\nprint(f"正在做：{current}")\nprint(f"剩余：{tasks}")\n~~~' },
    ], 'scores = [88, 72, 95]\nranked = sorted(scores, reverse=True)\nprint(ranked)\nprint(scores)', ['能区分 append 与 extend', '能用切片获得新列表', '能解释 backup = items 不是复制'], [
      ex('list-methods-1', '追加一个元素', '将 "Python" 加到 languages 的末尾。', '', 'languages.append("Python")', ['使用 append。', '字符串需要引号。', 'append 后有括号。'], has(/languages\.append\s*\(\s*["']Python["']\s*\)/)),
      ex('list-methods-2', '复制列表', '将 items 的副本保存到 backup。', '', 'backup = items.copy()', ['调用 copy 方法。', '不要直接写 backup = items。', '方法调用需要括号。'], has(/backup\s*=\s*items\.copy\s*\(\s*\)/)),
    ]),
    lesson('dict-basics', '18', '字典：用键描述一条记录', '当每项数据有名字而不是位置时，用字典让程序像业务语言一样可读。', [
      { heading: '键和值各自扮演什么角色', body: '字典写作 `{key: value}`。键应稳定、唯一且常用字符串，例如 `{"name": "Ada", "score": 92}`。`student["score"]` 按键取值；这个键不存在会抛出 KeyError，所以不确定时使用 `student.get("score")`。' },
      { heading: '新增、更新和默认值', body: '`student["score"] = 95` 在键已有时更新、没有时新增。`data.get("visits", 0)` 表示“没有 visits 就先当作 0”，适合计数。`setdefault` 也能设置默认值，但初学阶段先用 get + 赋值更容易读。' },
      { heading: '真实例子：统计词频', body: '每次读到一个词，先拿已有次数；若没有，默认从 0 开始。\n\n~~~python\nwords = ["python", "code", "python"]\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)  # {\'python\': 2, \'code\': 1}\n~~~' },
      { heading: '避免把 get 当成万能修复', body: '若键理论上必须存在，例如课程对象必须有 name，使用 `student["name"]` 更容易暴露不完整数据。get 适合“可选字段”或“没有就采用默认值”的业务规则。' },
    ], 'profile = {"name": "Ada", "level": 1}\nprofile["level"] += 1\nprint(profile["level"])  # 2', ['能读写字典中的字段', '能用 get 提供合理默认值', '能用字典完成简单计数'], [
      ex('dict-basics-1', '读取字典分数', '将 student 中 score 键的值保存到 score。', '', 'score = student["score"]', ['使用方括号。', '键 score 是字符串。', '结果保存到 score。'], has(/score\s*=\s*student\s*\[\s*["']score["']\s*\]/)),
      ex('dict-basics-2', '安全获得默认值', '将 visits 的值读到 count；键不存在时使用 0。', '', 'count = data.get("visits", 0)', ['方法是 get。', '第一个参数是键 visits。', '第二个参数是默认值 0。'], has(/count\s*=\s*data\.get\s*\(\s*["']visits["']\s*,\s*0\s*\)/)),
    ]),
    lesson('dict-loop', '19', '遍历字典：键、值与键值对', '读清楚循环变量代表什么，才能正确处理多条结构化数据。', [
      { heading: '三种遍历方式', body: '`for key in data:` 和 `for key in data.keys():` 都遍历键；`for value in data.values():` 遍历值；`for key, value in data.items():` 同时遍历键值对。最常用也最清楚的是 items，因为两个变量的来源一眼可见。' },
      { heading: '不要在遍历时修改同一个字典的键', body: '循环中新增或删除正在遍历的字典键，可能引发 RuntimeError。若确实要删，先遍历 `list(data)` 的副本，或更好地创建一个满足条件的新字典。更新已有键的值通常是安全的，但仍要确保规则清楚。' },
      { heading: '真实例子：格式化个人资料', body: '字典没有“固定显示顺序”的语义要求，因此展示层可以自己决定字段标签。\n\n~~~python\nprofile = {"name": "Ada", "city": "London"}\nlabels = {"name": "姓名", "city": "城市"}\nfor key, value in profile.items():\n    print(f"{labels[key]}：{value}")\n~~~' },
      { heading: '嵌套字典先逐层读取', body: '当 `student["contact"]` 本身又是字典时，先保存 `contact = student["contact"]`，再读取 `contact["email"]`。分两步比连续多层方括号更容易定位缺失在哪一层。' },
    ], 'scores = {"Ada": 92, "Lin": 78}\nfor name, score in scores.items():\n    print(f"{name}：{score}")', ['能选择 keys、values、items', '能用两个变量解包键值对', '知道遍历时避免增删字典键'], [
      ex('dict-loop-1', '遍历键值对', '让 name 和 score 分别得到 scores 中的键和值。', 'for name, score in ', 'for name, score in scores.items():\n    print(name, score)', ['使用 scores.items()。', '两个变量用逗号分隔。', '循环行末尾有冒号。'], has(/for\s+name\s*,\s*score\s+in\s+scores\.items\s*\(\s*\)\s*:/)),
      ex('dict-loop-2', '遍历所有值', '计算 scores 所有值的和。', '', 'total = sum(scores.values())', ['字典的所有值使用 values()。', 'sum 可以求和。', '结果保存到 total。'], has(/total\s*=\s*sum\s*\(\s*scores\.values\s*\(\s*\)\s*\)/)),
    ]),
    lesson('function-returns', '22', 'return、早返回与函数契约', '让函数的输入、输出和失败情形明确，调用者才知道如何使用它。', [
      { heading: '函数契约写在动手前', body: '定义函数前先用一句话说清：输入是什么、返回什么、非法输入怎么办。例如 `find_first_even(numbers)` 接收整数列表，返回第一个偶数；若没有则返回 None。这就是函数的契约。' },
      { heading: 'return 立即结束函数', body: 'return 后面的语句不会执行。遇到不符合条件的输入时可以“早返回”，减少多层 else。调用者应检查可能的 None，而不是假设一定有值。' },
      { heading: '真实例子：安全计算平均分', body: '空列表没有平均值，所以先返回 None；非空时再计算。\n\n~~~python\ndef average(numbers):\n    if not numbers:\n        return None\n    return sum(numbers) / len(numbers)\n\nresult = average([])\nif result is None:\n    print("没有数据")\nelse:\n    print(f"平均值：{result:.1f}")\n~~~' },
      { heading: 'print 不是返回值', body: '函数内 print 只把内容显示到屏幕，`result = print("x")` 得到的是 None。需要让外部继续使用计算结果时，一定 return。' },
    ], 'def is_adult(age):\n    if age < 0:\n        return False\n    return age >= 18\n\nprint(is_adult(20))', ['能先描述函数的输入和输出', '能在空数据等边界时早返回', '能区分 print 和 return'], [
      ex('function-returns-1', '空列表早返回', '当 numbers 为空时，函数返回 None。', 'def average(numbers):\n', 'def average(numbers):\n    if not numbers:\n        return None\n    return sum(numbers) / len(numbers)', ['空列表可用 not numbers 判断。', 'return None 表示没有可用结果。', '非空时再计算。'], has(/if\s+not\s+numbers\s*:/, /return\s+None/)),
      ex('function-returns-2', '返回而不是打印', '定义 double(number)，返回 number 的两倍。', '', 'def double(number):\n    return number * 2', ['函数定义使用 def。', '计算结果前写 return。', '不要用 print 代替 return。'], has(/def\s+double\s*\(\s*number\s*\)\s*:/, /return\s+number\s*\*\s*2/)),
    ]),
    lesson('exceptions-detail', '25', '异常细讲：只处理能恢复的问题', '把错误变成有意义的分支，同时保留真正 bug 的线索。', [
      { heading: '异常类型表达失败原因', body: '转换失败常见 `ValueError`，文件不存在是 `FileNotFoundError`，字典键不存在是 `KeyError`，除数为 0 是 `ZeroDivisionError`。捕获具体类型能让程序只处理预期情况，其他 bug 仍然清晰报出。' },
      { heading: 'try / except / else / finally 的职责', body: 'try 放可能失败的最小代码；except 处理该失败；else 放“没有异常才执行”的后续逻辑；finally 无论成功失败都会执行，适合必要清理。不要把整段程序都放进 try，这会让错误来源模糊。' },
      { heading: '真实例子：反复请求合法年龄', body: '异常处理只包 `int` 转换；范围规则仍用普通 if 判断。\n\n~~~python\nwhile True:\n    try:\n        age = int(input("年龄："))\n    except ValueError:\n        print("请输入整数，例如 18")\n        continue\n    if age < 0:\n        print("年龄不能为负数")\n        continue\n    break\nprint(f"已记录：{age}")\n~~~' },
      { heading: '什么时候让异常继续抛出', body: '程序员写错变量名、数据结构与预期不符、网络服务异常等，通常需要先看完整回溯并修复根因，不应随手 `except Exception: pass`。面向用户的提示和面向开发者的排错是两件事。' },
    ], 'try:\n    divisor = int(input("除数："))\n    print(100 / divisor)\nexcept ValueError:\n    print("请输入整数")\nexcept ZeroDivisionError:\n    print("除数不能为 0")', ['能根据失败原因选择异常类型', '能将 try 范围保持最小', '能结合 except 与 continue 重新请求输入'], [
      ex('exceptions-detail-1', '捕获无效整数', '捕获 int 转换产生的 ValueError。', 'try:\n    age = int(text)\n', 'try:\n    age = int(text)\nexcept ValueError:\n    print("请输入整数")', ['异常类型是 ValueError。', 'except 与 try 对齐。', 'except 行末尾要有冒号。'], has(/except\s+ValueError\s*:/)),
      ex('exceptions-detail-2', '处理不存在的文件', '读取文件时捕获 FileNotFoundError 并提示用户。', '', 'try:\n    with open("data.txt", encoding="utf-8") as file:\n        content = file.read()\nexcept FileNotFoundError:\n    print("文件不存在")', ['异常类型是 FileNotFoundError。', '打开和读取放在 try 中。', 'except 与 try 对齐。'], has(/except\s+FileNotFoundError\s*:/)),
    ]),
    lesson('testing-debugging', '30', '调试与测试：让程序自己证明自己', '别只拿一个“看起来正常”的输入试运行；为边界和错误准备明确检查。', [
      { heading: '先复现，再缩小，再修复', body: '遇到 bug 时先保存能稳定触发的问题输入；把长程序缩小到最少几行；用 print 或断点观察变量；提出一个原因后只改一件事，最后用原输入和相邻边界再次验证。不要边改边猜多个原因。' },
      { heading: 'assert 是最小测试工具', body: '`assert actual == expected` 在条件不成立时抛出 AssertionError。它适合给函数写可重复的检查：`assert is_even(2) is True`。测试应覆盖普通值、边界值、空值和错误输入，而不是只复制示例。' },
      { heading: '真实例子：测试折扣函数', body: '函数规则与测试数据并列，别人能快速看懂边界。\n\n~~~python\ndef discount(price, member):\n    return price * 0.9 if member else price\n\nassert discount(100, True) == 90\nassert discount(100, False) == 100\nassert discount(0, True) == 0\nprint("测试通过")\n~~~' },
      { heading: '读回溯的顺序', body: '先看最底部的异常类型与消息，再向上找第一个属于自己文件的行。该行不是永远的根因，但它是最可靠的起点。报错、输入和最小复现代码要一起记录。' },
    ], 'def clamp(value, low, high):\n    return max(low, min(value, high))\n\nassert clamp(5, 0, 10) == 5\nassert clamp(-1, 0, 10) == 0\nassert clamp(12, 0, 10) == 10', ['能为一个函数设计普通与边界测试', '能用 assert 写基本检查', '能按证据而不是猜测调试'], [
      ex('testing-debugging-1', '为偶数函数写断言', '断言 is_even(4) 的结果为 True。', '', 'assert is_even(4) is True', ['使用 assert 开头。', '调用 is_even(4)。', '布尔结果可用 is True 比较。'], has(/assert\s+is_even\s*\(\s*4\s*\)\s+is\s+True/)),
      ex('testing-debugging-2', '测试边界值', '断言 clamp(12, 0, 10) 返回 10。', '', 'assert clamp(12, 0, 10) == 10', ['调用 clamp。', '传入 12、0、10。', '使用 == 比较期望结果。'], has(/assert\s+clamp\s*\(\s*12\s*,\s*0\s*,\s*10\s*\)\s*==\s*10/)),
    ]),
    lesson('mini-project', '31', '项目实战：命令行待办清单', '把变量、循环、列表、函数和文件组合为一个小而完整的程序。', [
      { heading: '先定最小可用版本', body: '这个项目只做四件事：显示任务、添加任务、完成任务、退出。先让数据仅保存在运行期间，确认交互正确后，再将列表保存到 JSON。小项目的关键不是功能多，而是每个动作都有明确输入、状态变化和输出。' },
      { heading: '把每个命令拆成函数', body: '`show_tasks(tasks)` 只展示；`add_task(tasks, title)` 只新增；主循环只负责读取命令与分发。这样添加“删除任务”时不必把所有逻辑重新读一遍。' },
      { heading: '完整最小版本', body: '复制后直接运行。输入 `add 学习循环`、`list`、`done 1`、`quit` 依次体验每个分支。\n\n~~~python\ndef show_tasks(tasks):\n    if not tasks:\n        print("暂无任务")\n        return\n    for number, task in enumerate(tasks, start=1):\n        print(f"{number}. {task}")\n\ntasks = []\nwhile True:\n    command = input("命令 add/list/done/quit：").strip()\n    if command == "quit":\n        break\n    if command == "list":\n        show_tasks(tasks)\n    elif command.startswith("add "):\n        tasks.append(command[4:].strip())\n    elif command.startswith("done "):\n        index = int(command[5:]) - 1\n        print(f"已完成：{tasks.pop(index)}")\n    else:\n        print("未知命令")\n~~~' },
      { heading: '下一步改进清单', body: '为 `done` 的输入加 try/except；检查下标是否在范围内；拒绝空任务；最后把 tasks 写进 JSON。每次只加一项，并为新规则补一条测试或手动检查步骤。' },
    ], 'def show_tasks(tasks):\n    if not tasks:\n        print("暂无任务")\n        return\n    for number, task in enumerate(tasks, start=1):\n        print(f"{number}. {task}")', ['能从需求中识别状态、命令和函数', '能用循环维持命令行程序', '能为项目选择下一项小而可验证的改进'], [
      ex('mini-project-1', '添加待办任务', '将 title 添加到 tasks 列表末尾。', '', 'tasks.append(title)', ['任务列表是 tasks。', '添加方法是 append。', '传入 title。'], has(/tasks\.append\s*\(\s*title\s*\)/)),
      ex('mini-project-2', '按序号展示任务', '从 1 开始遍历 tasks，打印编号和任务文本。', '', 'for number, task in enumerate(tasks, start=1):\n    print(f"{number}. {task}")', ['使用 enumerate。', 'start=1 用于展示编号。', 'f-string 显示编号和任务。'], has(/enumerate\s*\(\s*tasks\s*,\s*start\s*=\s*1\s*\)/, /print\s*\(\s*f["'][\s\S]*\{\s*number\s*\}/)),
    ], '完成这课后，尝试自己实现一个命令：delete 2。先写清楚输入是什么、下标怎样转换、无效序号如何提示，再写代码。'),
    lesson('indentation-comments', '32', '缩进、注释与 pass', '读懂 Python 如何用缩进表示代码块，并正确使用注释和占位语句。', [
      { heading: '缩进是语法，不是排版', body: '`if`、`for`、`while`、`def`、`class`、`try` 等以冒号结尾的语句会开始代码块。同一个块内必须保持相同缩进，通常使用 4 个空格。混用 Tab 和空格可能触发 `TabError`，缩进层级错会导致逻辑改变。' },
      { heading: '注释解释“为什么”', body: '`#` 后到行末是注释。好注释说明业务规则、单位、数据来源或特殊边界；不需要把 `count += 1` 重复成“计数加一”。注释应随代码一起更新，错误注释比没有注释更危险。' },
      { heading: '文档字符串不是普通注释', body: '函数、类或模块开头的三引号字符串会成为 `__doc__`，用于说明公开用法。它是运行时可读的字符串，不是用来批量“注释掉”代码的工具。' },
      { heading: 'pass 只占位，什么也不做', body: '语法要求某个代码块不能为空，但逻辑尚未实现时可以暂用 `pass`。它不会跳过循环；跳过当前轮应用 `continue`，离开循环应用 `break`。' },
    ], 'def normalize_name(name):\n    """去掉姓名两端空白并统一大小写。"""\n    # 外部数据可能带有多余空格\n    return name.strip().title()', ['能用缩进识别代码块边界', '能区分行注释与文档字符串', '知道 pass、continue、break 的不同职责'], [
      ex('indentation-comments-1', '补全空函数', '在尚未实现的 build_report 函数中写入合法占位语句。', 'def build_report():\n    ', 'def build_report():\n    pass', ['空代码块需要一条语句。', '占位关键字是 pass。', 'pass 要缩进在函数内。'], has(/def\s+build_report\s*\(\s*\)\s*:\s*\n\s+pass/)),
      ex('indentation-comments-2', '写函数文档', '为 add(a, b) 加一行文档字符串“返回两数之和。”。', 'def add(a, b):\n    return a + b', 'def add(a, b):\n    """返回两数之和。"""\n    return a + b', ['文档字符串放在函数体第一行。', '使用三引号。', '保持 4 空格缩进。']),
    ], '缩进问题时，先打开编辑器的“显示空白字符”，再检查每个冒号后的块。'),
    lesson('none-identity', '33', 'None、真值与身份比较', '掌握“没有值”的表示方式，避免把空值、0 和 False 混为一谈。', [
      { heading: 'None 表示缺少结果', body: '`None` 是唯一的空值对象，常用于“尚未设置”或“没有找到”。函数没写 `return`，或只写 `return`，都会返回 None。调用者需要明确处理这个可能性。' },
      { heading: '用 is None，不用 == None', body: '`==` 比较值，`is` 比较是否为同一个对象。None 是单例，规范写法是 `value is None` 与 `value is not None`。不要用 is 比较字符串和数字，那会依赖实现细节。' },
      { heading: '真值判断是一组约定', body: '`None`、`False`、0、0.0、空字符串和空容器都在条件中视为假，其他大多数对象视为真。`if not items` 适合判断容器为空；若 0 是合法数据，则不能用 `if not result` 代替 `result is None`。' },
      { heading: '哨兵值让“未提供”与 None 分开', body: '有时 None 本身也是合法参数。此时可创建 `MISSING = object()`，默认参数使用 MISSING，再以 `is MISSING` 判断调用者是否真的没传值。' },
    ], 'def find_even(numbers):\n    for number in numbers:\n        if number % 2 == 0:\n            return number\n    return None\n\nresult = find_even([1, 3, 5])\nif result is None:\n    print("没有偶数")', ['能说明 None 与 0 的区别', '能正确使用 is None', '能根据业务含义选择真值判断'], [
      ex('none-identity-1', '检查缺少结果', '当 result 没有值时输出“未找到”。', '', 'if result is None:\n    print("未找到")', ['检查 None 使用 is。', '条件后加冒号。', '输出语句缩进。'], has(/if\s+result\s+is\s+None\s*:/)),
      ex('none-identity-2', '区分 0 和 None', '只在 count 为 None 时设为 0，保留已有的 0。', '', 'if count is None:\n    count = 0', ['不要写 if not count。', '0 不代表未设置。', '使用 is None。'], has(/if\s+count\s+is\s+None\s*:/, /count\s*=\s*0/)),
    ]),
    lesson('unpacking', '34', '解包、星号表达式与参数收集', '把序列按结构分配给变量，并用 * 与 ** 处理不定数量的数据。', [
      { heading: '基本解包要求数量匹配', body: '`name, score = ("Ada", 95)` 会一次绑定两个变量。右侧可以是任何可迭代对象；元素数量过多或过少都会触发 ValueError。交换变量可直接写 `left, right = right, left`。' },
      { heading: '星号变量收集剩余元素', body: '`first, *middle, last = values` 会把中间所有元素收集成列表。一次解包最多只能有一个星号目标，否则 Python 无法确定如何分配。' },
      { heading: '*args 收集位置参数', body: '在函数定义中，`*args` 把多余位置参数收集为元组；`**kwargs` 把多余关键字参数收集为字典。args/kwargs 只是惯用名，真正语法是星号。不要为了“灵活”而隐藏本应明确的参数。' },
      { heading: '调用时的 * 和 ** 是展开', body: '`function(*values)` 把序列元素作为位置参数，`function(**options)` 把字典键值作为关键字参数。字典的键必须是字符串且与参数名匹配。' },
    ], 'def summarize(title, *scores, precision=1):\n    average = sum(scores) / len(scores)\n    return f"{title}：{average:.{precision}f}"\n\noptions = {"precision": 2}\nprint(summarize("数学", 80, 90, 95, **options))', ['能完成定长与带星号解包', '能区分定义时的收集与调用时的展开', '知道 args 是元组、kwargs 是字典'], [
      ex('unpacking-1', '收集中间元素', '将 values 的首项绑定到 first，末项绑定到 last，中间项收集到 middle。', '', 'first, *middle, last = values', ['中间变量前加 *。', '三个目标用逗号分隔。', '右边是 values。'], has(/first\s*,\s*\*middle\s*,\s*last\s*=\s*values/)),
      ex('unpacking-2', '展开配置字典', '调用 connect，将 config 的键值展开为关键字参数。', '', 'connect(**config)', ['关键字展开使用两个星号。', '星号写在 config 前。', '这是函数调用。'], has(/connect\s*\(\s*\*\*config\s*\)/)),
    ]),
    lesson('sorting-callables', '35', '排序、key 函数与 lambda', '通过“先提取比较键”排序复杂数据，并掌握 lambda 的合理使用边界。', [
      { heading: 'sorted 返回新列表', body: '`sorted(iterable)` 可以处理任何可迭代对象并返回新列表；`list.sort()` 只用于列表并原地修改，返回 None。需要保留原顺序时用 sorted，明确要改变原列表时用 sort。' },
      { heading: 'key 描述“按什么比”', body: '`key` 接收一个函数，排序前对每个元素调用一次。排学生字典可写 `key=lambda student: student["score"]`；忽略大小写排文本可写 `key=str.casefold`。' },
      { heading: 'lambda 只适合短表达式', body: '`lambda x: x * 2` 创建一个匿名函数，只能包含一个表达式。当逻辑需要解释、测试或复用时，应改用 `def`。lambda 最常见的合理场景是 key 参数。' },
      { heading: '多字段排序返回元组键', body: '需要“班级升序，同班分数降序”时，可用 `key=lambda s: (s["class"], -s["score"])`。Python 依次比较元组中的字段，这比分多次手工排序更清楚。' },
    ], 'students = [\n    {"name": "Lin", "score": 88},\n    {"name": "Ada", "score": 95},\n]\nranked = sorted(students, key=lambda item: item["score"], reverse=True)\nprint(ranked)', ['能区分 sorted 与 list.sort', '能用 key 排序字典或对象', '能判断 lambda 是否过于复杂'], [
      ex('sorting-callables-1', '按长度排序', '将 words 按字符串长度排序，保存到 ordered。', '', 'ordered = sorted(words, key=len)', ['使用 sorted。', 'key 可直接传 len。', '不要写 len()。'], has(/ordered\s*=\s*sorted\s*\(\s*words\s*,\s*key\s*=\s*len\s*\)/)),
      ex('sorting-callables-2', '按分数降序', '将 students 按 score 从高到低排序。', '', 'ranked = sorted(students, key=lambda student: student["score"], reverse=True)', ['key 返回 score。', '降序设置 reverse=True。', '结果保存到 ranked。'], has(/sorted\s*\([\s\S]*key\s*=\s*lambda[\s\S]*["']score["'][\s\S]*reverse\s*=\s*True/)),
    ]),
    lesson('iterators-generators', '36', '迭代器、生成器与 yield', '理解 for 循环背后的迭代协议，并按需产生数据而不一次性占满内存。', [
      { heading: '可迭代对象与迭代器不同', body: '列表、字符串、字典等可以交给 `iter()` 得到迭代器。`next(iterator)` 每次取一项，耗尽后抛出 `StopIteration`。for 循环会自动执行这套流程。' },
      { heading: '生成器函数用 yield 暂停', body: '只要函数体包含 `yield`，调用它就返回生成器，而不是立即执行完全部代码。每次 next 运行到 yield，产生一个值并保留局部状态，下次从原位置继续。' },
      { heading: '生成器只能消费一次', body: '对同一个生成器迭代完后，再次循环不会重新产生值。需要重复使用时，重新调用生成器函数，或在数据量可控时显式转成列表。' },
      { heading: '生成器表达式适合数据流', body: '`(line.strip() for line in file)` 使用圆括号，每次只处理一行。它适合大文件和流式管道；若后续需要下标、长度或多次遍历，列表更直观。' },
    ], 'def countdown(start):\n    current = start\n    while current > 0:\n        yield current\n        current -= 1\n\nfor number in countdown(3):\n    print(number)', ['能解释 iter、next 与 StopIteration', '能用 yield 写一个有限生成器', '能在列表与生成器之间做选择'], [
      ex('iterators-generators-1', '生成偶数', '定义 even_numbers(limit)，依次 yield 从 0 开始、小于 limit 的偶数。', '', 'def even_numbers(limit):\n    for number in range(0, limit, 2):\n        yield number', ['range 步长为 2。', '每轮使用 yield。', '停止值 limit 不包含。'], has(/def\s+even_numbers\s*\(\s*limit\s*\)\s*:/, /yield\s+number/)),
      ex('iterators-generators-2', '写生成器表达式', '创建 squares，按需产生 numbers 中每个数的平方。', '', 'squares = (number ** 2 for number in numbers)', ['生成器表达式用圆括号。', '平方使用 ** 2。', '遍历 numbers。'], has(/squares\s*=\s*\(\s*number\s*\*\*\s*2\s+for\s+number\s+in\s+numbers\s*\)/)),
    ]),
    lesson('packages-main', '37', '模块、包与 __main__ 入口', '把多个 Python 文件组织成可复用的程序，并分离“被导入”与“直接运行”。', [
      { heading: '一个 .py 文件就是模块', body: '`import calculator` 会查找 calculator.py，执行其顶层代码一次，并把模块对象绑定到名字 calculator。因此顶层应主要放定义和常量，避免导入时立即读输入、写文件或发网络请求。' },
      { heading: '包用目录表达命名空间', body: '包将相关模块放进同一目录。`from app.services import users` 比含糊的短名更能表达所属领域。现代 Python 支持无 __init__.py 的命名空包，但学习项目通常保留 __init__.py 以明确边界。' },
      { heading: '__name__ 区分两种使用方式', body: '文件被直接运行时，`__name__ == "__main__"`；被导入时，__name__ 是模块名。把启动逻辑放进 `main()` 并用这个条件保护，导入后就能安全测试其中函数。' },
      { heading: '避免循环导入', body: 'a.py 导入 b.py，b.py 又导入 a.py 时，可能拿到尚未初始化完的模块。根本修复通常是抽出双方共享的数据类型或函数到第三个模块，而不是随意把 import 塞到函数里。' },
    ], 'def main():\n    print("程序开始")\n\nif __name__ == "__main__":\n    main()', ['能解释导入时会发生什么', '能组织一个基本 Python 包', '能使用 __main__ 保护启动逻辑'], [
      ex('packages-main-1', '保护程序入口', '只在当前文件直接运行时调用 main()。', '', 'if __name__ == "__main__":\n    main()', ['特殊变量是 __name__。', '直接运行时值是 __main__。', '函数调用要缩进。'], has(/if\s+__name__\s*==\s*["']__main__["']\s*:/, /main\s*\(\s*\)/)),
      ex('packages-main-2', '从子模块导入', '从 app.services.users 导入 find_user。', '', 'from app.services.users import find_user', ['使用 from ... import ...。', '模块路径用点分隔。', '导入名是 find_user。'], has(/from\s+app\.services\.users\s+import\s+find_user/)),
    ]),
    lesson('decorators', '38', '装饰器与函数包装', '在不修改函数主体的情况下增加日志、计时或权限检查。', [
      { heading: '函数也是值', body: '函数可以绑定到新变量、作为参数传入、从其他函数返回。装饰器的本质是：接收一个函数，返回一个新函数。`@trace` 只是 `work = trace(work)` 的紧凑写法。' },
      { heading: 'wrapper 负责前后加逻辑', body: '通用包装器通常定义 `wrapper(*args, **kwargs)`，在内部调用原函数，并且必须返回原函数的结果。忘记 return 会让装饰后的函数意外返回 None。' },
      { heading: 'functools.wraps 保留元数据', body: '不使用 `@wraps(function)` 时，装饰后的 `__name__`、`__doc__` 和调试信息都会变成 wrapper。wraps 会复制关键元数据，是自定义装饰器的标准做法。' },
      { heading: '带参数装饰器多一层函数', body: '`@retry(3)` 会先调用 retry(3) 获得真正的装饰器，再用它包装目标函数。因此结构是“配置层 → 装饰器层 → wrapper 层”，应先会无参数装饰器再学。' },
    ], 'from functools import wraps\n\ndef trace(function):\n    @wraps(function)\n    def wrapper(*args, **kwargs):\n        print(f"调用：{function.__name__}")\n        return function(*args, **kwargs)\n    return wrapper\n\n@trace\ndef add(a, b):\n    return a + b', ['能把 @decorator 还原成普通函数调用', '能正确透传参数和返回值', '能使用 functools.wraps'], [
      ex('decorators-1', '补全包装器返回值', '在 wrapper 中调用 function 并返回它的结果，透传所有参数。', 'def wrapper(*args, **kwargs):\n    ', 'def wrapper(*args, **kwargs):\n    return function(*args, **kwargs)', ['使用 return。', '位置参数用 *args 展开。', '关键字参数用 **kwargs 展开。'], has(/return\s+function\s*\(\s*\*args\s*,\s*\*\*kwargs\s*\)/)),
      ex('decorators-2', '保留函数信息', '在 wrapper 定义前使用 wraps(function)。', '', '@wraps(function)\ndef wrapper(*args, **kwargs):\n    return function(*args, **kwargs)', ['装饰器以 @ 开头。', '调用 wraps(function)。', '紧贴 wrapper 定义。'], has(/@wraps\s*\(\s*function\s*\)\s*\ndef\s+wrapper/)),
    ]),
    lesson('context-managers', '39', '上下文管理器与 with', '对文件、锁、连接等资源建立“进入—使用—退出”的可靠边界。', [
      { heading: 'with 保证退出逻辑被执行', body: '`with open(...) as file:` 进入时获得文件对象，代码块结束时关闭文件。即使块内抛出异常，退出逻辑也会运行，因此它比手动 close 更可靠。' },
      { heading: '协议由 __enter__ 和 __exit__ 组成', body: '对象进入 with 时调用 `__enter__`，`as` 后的变量接收其返回值；离开时调用 `__exit__`。__exit__ 返回 True 会压制异常，通常不应这样做，除非管理器明确知道如何恢复。' },
      { heading: 'contextmanager 用生成器简化实现', body: '`@contextmanager` 装饰的生成器在 yield 之前做进入准备，yield 产出 as 的值，finally 中做退出清理。这适合轻量管理器，复杂状态则用类更清晰。' },
      { heading: '多个资源可在一个 with 中管理', body: '复制文件可以写 `with open(source) as src, open(target, "w") as dst:`。资源按从左到右顺序进入，按反向顺序退出，类似稳固地叠放清理操作。' },
    ], 'from contextlib import contextmanager\n\n@contextmanager\ndef timer(label):\n    import time\n    start = time.perf_counter()\n    try:\n        yield\n    finally:\n        elapsed = time.perf_counter() - start\n        print(f"{label}: {elapsed:.3f}s")\n\nwith timer("任务"):\n    sum(range(100_000))', ['能说明 with 为什么比手动清理安全', '能读懂上下文管理协议', '能用 contextmanager 实现简单资源边界'], [
      ex('context-managers-1', '安全读取文件', '用 with 打开 data.txt，指定 UTF-8，将内容读到 content。', '', 'with open("data.txt", encoding="utf-8") as file:\n    content = file.read()', ['使用 with open。', 'as 后绑定 file。', 'read 调用缩进在块内。'], has(/with\s+open\s*\([\s\S]*encoding\s*=\s*["']utf-8["'][\s\S]*\)\s+as\s+file\s*:/, /content\s*=\s*file\.read\s*\(\s*\)/)),
      ex('context-managers-2', '确保执行清理', '在生成器上下文管理器中，无论是否出错都调用 cleanup()。', '', 'try:\n    yield\nfinally:\n    cleanup()', ['使用 try/finally。', 'yield 在 try 中。', 'cleanup 放在 finally。'], has(/try\s*:\s*\n\s+yield[\s\S]*finally\s*:\s*\n\s+cleanup\s*\(\s*\)/)),
    ]),
    lesson('oop-inheritance', '40', '继承、组合与特殊方法', '让对象通过稳定协议协作，而不是把所有关系都硬塞进继承层次。', [
      { heading: '继承表示“是一种”', body: '`class Admin(User)` 表示 Admin 可在需要 User 的地方使用。子类可重写方法，并通过 `super()` 复用父类实现。如果子类频繁破坏父类约定，这个继承关系可能是错的。' },
      { heading: '组合表示“拥有一个”', body: '订单拥有支付器、汽车拥有引擎，更适合把一个对象作为另一个对象的属性。组合的耦合更低，运行时也能替换组件，通常优先于为复用几行代码而继承。' },
      { heading: '特殊方法让对象融入 Python', body: '`__repr__` 返回面向开发者的表示，`__len__` 使对象支持 len，`__iter__` 使它可遍历，`__eq__` 定义值相等。应实现已有协议，不要自创令人意外的含义。' },
      { heading: '多态关心能力，不关心具体类名', body: '只要对象提供需要的方法，Python 代码往往不必先用 isinstance 检查。例如 `save(writer)` 可接受任何实现 write 的对象，这种“鸭子类型”让测试替身也更容易。' },
    ], 'class User:\n    def __init__(self, name):\n        self.name = name\n\n    def describe(self):\n        return self.name\n\nclass Admin(User):\n    def describe(self):\n        return f"{super().describe()} (管理员)"', ['能在继承与组合之间做选择', '能用 super 复用父类行为', '能为对象实现合适的 Python 协议'], [
      ex('oop-inheritance-1', '调用父类初始化', '在 Admin.__init__ 中把 name 交给父类初始化。', 'class Admin(User):\n    def __init__(self, name):\n        ', 'class Admin(User):\n    def __init__(self, name):\n        super().__init__(name)', ['获得父类代理使用 super()。', '调用 __init__。', '传入 name，不要再传 self。'], has(/super\s*\(\s*\)\.__init__\s*\(\s*name\s*\)/)),
      ex('oop-inheritance-2', '实现对象长度', '让 Team 的 len(team) 返回 members 的人数。', '', 'def __len__(self):\n    return len(self.members)', ['特殊方法是 __len__。', '接收 self。', '返回 self.members 的长度。'], has(/def\s+__len__\s*\(\s*self\s*\)\s*:/, /return\s+len\s*\(\s*self\.members\s*\)/)),
    ]),
    lesson('dataclasses-properties', '41', 'dataclass、属性与对象不变量', '用更少的样板代码表达数据对象，并在状态边界维护合法性。', [
      { heading: 'dataclass 为数据类生成基础方法', body: '`@dataclass` 会根据带注解的字段生成 `__init__`、`__repr__` 和 `__eq__`。它适合“主要职责是携带数据”的类，但不意味着类不能拥有方法或验证逻辑。' },
      { heading: '可变默认值必须用 default_factory', body: '列表、字典、集合不能直接写成 dataclass 字段默认值，否则多个实例可能共享状态。应写 `field(default_factory=list)`，为每个实例新建列表。' },
      { heading: 'property 把计算结果暴露为属性', body: '`@property` 让 `rectangle.area` 在内部调用方法，但对调用者保持属性语法。它适合无参数、快速、无副作用的查询；昂贵计算或可能失败的操作更应使用显式方法。' },
      { heading: '__post_init__ 维护构造后不变量', body: '生成的 __init__ 完成后会调用 `__post_init__`。可以在这里验证价格非负、结束时间不早于开始时间，非法时抛出 ValueError，确保对象一旦创建就处于合法状态。' },
    ], 'from dataclasses import dataclass, field\n\n@dataclass\nclass Course:\n    title: str\n    students: list[str] = field(default_factory=list)\n\n    @property\n    def size(self):\n        return len(self.students)', ['能定义带类型注解的 dataclass', '能正确处理可变默认值', '能使用 property 表达计算属性'], [
      ex('dataclasses-properties-1', '为列表字段建立工厂', '定义 tags 字段，每个实例都获得自己的空列表。', '', 'tags: list[str] = field(default_factory=list)', ['标注类型为 list[str]。', '调用 field。', 'default_factory 传 list，不加括号。'], has(/tags\s*:\s*list\s*\[\s*str\s*\]\s*=\s*field\s*\(\s*default_factory\s*=\s*list\s*\)/)),
      ex('dataclasses-properties-2', '定义面积属性', '为 Rectangle 定义 area 只读属性，返回 width * height。', '', '@property\ndef area(self):\n    return self.width * self.height', ['使用 @property。', '方法只接收 self。', '返回两个属性的乘积。'], has(/@property\s*\ndef\s+area\s*\(\s*self\s*\)\s*:/, /return\s+self\.width\s*\*\s*self\.height/)),
    ]),
    lesson('type-hints', '42', '类型注解、联合类型与协议', '用类型注解记录函数契约，让编辑器和检查工具更早发现数据流错误。', [
      { heading: '注解默认不做运行时校验', body: '`def greet(name: str) -> str` 是给人和工具的契约。Python 仍然允许调用者传入其他类型，所以外部输入仍需要显式解析与校验。类型检查通常在编辑器或 CI 中完成。' },
      { heading: '现代容器和联合写法', body: 'Python 3.9+ 可写 `list[str]`、`dict[str, int]`；Python 3.10+ 可写 `str | None`。联合类型表示多种可能，不应用 `Any` 把不确定性隐藏起来。' },
      { heading: 'TypeAlias 和 TypedDict 表达结构', body: '复杂类型可命名后复用。`TypedDict` 适合表达已有字典数据的固定键；如果数据同时需要行为、验证和实例方法，dataclass 通常更合适。' },
      { heading: 'Protocol 按能力定义接口', body: '协议可以表示“任何具有 write(str) 方法的对象”，而不要求继承某个具体父类。这保留了 Python 的鸭子类型风格，同时让静态检查器能验证能力是否完整。' },
    ], 'def average(values: list[float]) -> float | None:\n    if not values:\n        return None\n    return sum(values) / len(values)', ['能为参数、返回值与容器写注解', '能表达可选值和固定字典结构', '理解注解与运行时校验的边界'], [
      ex('type-hints-1', '标注查找函数', '为 find_name 标注：names 是字符串列表，返回字符串或 None。', 'def find_name(names):', 'def find_name(names: list[str]) -> str | None:', ['列表元素类型是 str。', '返回类型用 ->。', '可能缺少时使用 | None。'], has(/def\s+find_name\s*\(\s*names\s*:\s*list\s*\[\s*str\s*\]\s*\)\s*->\s*str\s*\|\s*None\s*:/)),
      ex('type-hints-2', '标注计数字典', '声明 counts 是从字符串到整数的字典。', '', 'counts: dict[str, int] = {}', ['容器类型是 dict。', '键是 str，值是 int。', '初始值是空字典。'], has(/counts\s*:\s*dict\s*\[\s*str\s*,\s*int\s*\]\s*=\s*\{\s*\}/)),
    ]),
    lesson('regex', '43', '正则表达式与文本匹配', '对具有明确模式的文本执行搜索、提取和替换，同时避免过度复杂化。', [
      { heading: '先区分 fullmatch、match 和 search', body: '`re.fullmatch` 要求整个字符串符合模式，适合格式验证；`re.match` 只从开头尝试；`re.search` 在任意位置查找第一个匹配。选错 API 会让模式本身变得不必要地复杂。' },
      { heading: '原始字符串减少双重转义', body: '正则和 Python 字符串都使用反斜杠，所以模式通常写成 `r"\\d+"`。原始字符串并不意味着正则不再解释转义，它只是让 Python 字符串层少处理一次。' },
      { heading: '分组提取结构化部分', body: '圆括号创建捕获组，`(?P<year>\\d{4})` 创建命名组。匹配后可用 `group("year")` 读取，比记住第几组更稳定。只需要分组不需要提取时用 `(?:...)`。' },
      { heading: '不是所有文本问题都需要正则', body: '固定分隔符优先用 split，前后缀优先用 startswith/endswith，简单替换优先用 replace。正则适合“格式有变化但规则可描述”的场景，并应配合边界样例测试。' },
    ], 'import re\n\npattern = re.compile(r"(?P<year>\\d{4})-(?P<month>\\d{2})-(?P<day>\\d{2})")\nmatch = pattern.fullmatch("2026-09-16")\nif match:\n    print(match.group("year"))', ['能根据任务选择 fullmatch、search 或 findall', '能使用原始字符串和命名分组', '能识别不需要正则的简单文本操作'], [
      ex('regex-1', '提取所有数字', '使用 re.findall 找出 text 中所有连续数字并保存到 numbers。', '', 'numbers = re.findall(r"\\d+", text)', ['使用 findall。', '连续数字模式是 \\d+。', '模式使用原始字符串。'], has(/numbers\s*=\s*re\.findall\s*\(\s*r["']\\d\+["']\s*,\s*text\s*\)/)),
      ex('regex-2', '验证六位验证码', '用 fullmatch 检查 code 是否恰好由 6 位数字组成。', '', 'valid = re.fullmatch(r"\\d{6}", code) is not None', ['验证整个字符串用 fullmatch。', '\\d{6} 表示六位数字。', '将匹配结果转成布尔值。'], has(/re\.fullmatch\s*\(\s*r["']\\d\{6\}["']\s*,\s*code\s*\)\s+is\s+not\s+None/)),
    ]),
    lesson('datetime', '44', '日期、时间、时区与 timedelta', '用标准类型计算时间，避免把日期当作普通字符串或秒数硬算。', [
      { heading: 'date、time、datetime 职责不同', body: '`date` 只表示日历日期，`time` 只表示一天内时间，`datetime` 组合两者。年龄、到期日通常用 date；具体事件时刻使用带时区 datetime。' },
      { heading: 'timedelta 表示时间间隔', body: '加 7 天应写 `moment + timedelta(days=7)`，不要手动改 day 字段。timedelta 会正确跨过月末和年末，但“下个自然月”并不等于固定 30 天，需要单独业务规则。' },
      { heading: '优先使用 ISO 8601 解析与输出', body: '`date.fromisoformat("2026-09-16")` 和 `value.isoformat()` 往返稳定。`strptime` 用于外部自定义格式，格式符必须与输入完全对应；展示给用户时再使用 strftime 本地化。' },
      { heading: '跨地区时刻必须带时区', body: '无 tzinfo 的 datetime 是“天真时间”，无法唯一定位全球时刻。存储事件时间通常使用 UTC，展示时用 `zoneinfo.ZoneInfo` 转到用户时区，不要用固定加 8 小时模拟所有时区。' },
    ], 'from datetime import datetime, timedelta, timezone\nfrom zoneinfo import ZoneInfo\n\ncreated = datetime.now(timezone.utc)\nexpires = created + timedelta(days=7)\nshanghai = expires.astimezone(ZoneInfo("Asia/Shanghai"))\nprint(shanghai.isoformat())', ['能根据语义选择 date 或 datetime', '能用 timedelta 完成时间计算', '能创建、转换带时区的 datetime'], [
      ex('datetime-1', '计算七天后', '将 created 的 7 天后保存到 expires。', '', 'expires = created + timedelta(days=7)', ['使用 timedelta。', '参数名是 days。', '与 created 相加。'], has(/expires\s*=\s*created\s*\+\s*timedelta\s*\(\s*days\s*=\s*7\s*\)/)),
      ex('datetime-2', '解析 ISO 日期', '将字符串“2026-09-16”解析成 date 并保存到 day。', '', 'day = date.fromisoformat("2026-09-16")', ['使用 date 类。', '方法是 fromisoformat。', '日期保持 YYYY-MM-DD。'], has(/day\s*=\s*date\.fromisoformat\s*\(\s*["']2026-09-16["']\s*\)/)),
    ]),
    lesson('async-await', '45', 'async、await 与异步并发', '在等待网络或磁盘时让同一线程继续推进其他任务。', [
      { heading: '异步适合 I/O 等待', body: '网络请求、数据库查询、高并发连接大量时间在等待外部结果，异步可以在等待期间处理其他任务。纯 CPU 密集计算不会因 async 自动变快，反而会阻塞事件循环。' },
      { heading: 'async def 调用后得到协程', body: '调用异步函数不会立即执行完整函数，而是得到 coroutine 对象。在另一个 async 函数中用 `await` 等待结果，程序入口可以用 `asyncio.run(main())`。' },
      { heading: 'gather 并发等待多个独立任务', body: '连续写两个 await 仍然是依次等待。当任务互不依赖时，可用 `await asyncio.gather(task_a(), task_b())` 共同推进。需要限流时应使用 Semaphore，不要无上限创建任务。' },
      { heading: '取消和超时也是正常控制流', body: '异步系统中用户离开、请求超时都会取消任务。清理逻辑应放在 finally 或 `async with` 上下文管理器中。不要吞掉 `CancelledError`，否则程序可能无法及时停止。' },
    ], 'import asyncio\n\nasync def fetch(name, delay):\n    await asyncio.sleep(delay)\n    return f"{name} 完成"\n\nasync def main():\n    results = await asyncio.gather(\n        fetch("A", 1),\n        fetch("B", 1),\n    )\n    print(results)\n\nasyncio.run(main())', ['能判断任务是否适合异步', '能编写并运行基本协程', '能区分顺序 await 与 gather 并发'], [
      ex('async-await-1', '等待异步结果', '在 async 函数中调用 fetch_data() 并将结果保存到 data。', '', 'data = await fetch_data()', ['异步调用前写 await。', '保存到 data。', '函数调用需要括号。'], has(/data\s*=\s*await\s+fetch_data\s*\(\s*\)/)),
      ex('async-await-2', '并发两个任务', '并发运行 load_users() 和 load_orders()，将结果解包到 users、orders。', '', 'users, orders = await asyncio.gather(load_users(), load_orders())', ['使用 asyncio.gather。', '整个 gather 需要 await。', '左边用两个变量解包。'], has(/users\s*,\s*orders\s*=\s*await\s+asyncio\.gather\s*\(\s*load_users\s*\(\s*\)\s*,\s*load_orders\s*\(\s*\)\s*\)/)),
    ], '异步程序先画清“哪些任务互相依赖”：依赖的顺序 await，独立的再考虑 gather。'),
  ].sort((first, second) => Number(first.chapter?.match(/\d+/)?.[0] ?? 99) - Number(second.chapter?.match(/\d+/)?.[0] ?? 99) || Number(first.number) - Number(second.number)),
}
