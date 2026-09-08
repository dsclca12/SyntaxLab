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
  return { id, number, title, eyebrow: 'PYTHON 入门路径', summary, sections: [...sections, ...(zeroBaseGuides[id] ?? []), ...lectureSections], example, goals, exercises, note, walkthrough: detail.walkthrough, checkpoints: detail.checkpoints, resources: detail.resources }
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
  name: 'Python 入门进阶',
  language: 'Python 入门',
  editor: 'python',
  available: true,
  description: '从第一行可运行代码，到能独立拆解一类小程序题。',
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
    lesson('conditions', '05', '条件、比较与布尔逻辑', '把“如果……那么……”翻译成清楚、可检查的代码。', [
      { heading: '条件是一条问题', body: 'if 后面必须是能得到 True 或 False 的表达式，并以冒号结束。常见比较符号有 ==、!=、>、>=、<、<=。代码块由缩进决定，建议始终使用 4 个空格。' },
      { heading: '组合条件', body: 'and 要求两边都为真，or 只要一边为真，not 会反转真假。复杂条件可以加括号。先用自然语言说清楚，再写代码，能显著减少“看起来差不多”的逻辑错误。' },
      { heading: '分支要覆盖边界', body: '判断分数时要考虑刚好及格、刚好不及格；判断范围时要确认端点是否包含。elif 按顺序检查，前面条件已经成立后，后面的分支不会再执行。' },
    ], 'score = int(input())\nif score >= 60:\n    print("及格")\nelse:\n    print("继续努力")', ['能写出带冒号和缩进的分支', '能区分 > 与 >= 的边界', '能组合两个布尔条件'], [
      ex('conditions-1', '补全及格条件', '60 分也算及格，补全 if 条件。', 'if score ', 'if score >= 60:', ['“包含 60”意味着要带等号。', '大于等于写作 >=。', '条件行末尾要有冒号。'], has(/if\s+score\s*>=\s*60\s*:/), '边界值 60 是测试条件的好例子：先写规则，再用 59、60、61 验证。'),
      ex('conditions-2', '修复登录判断', '只有用户名和密码都正确时才输出登录成功。', 'if user == "admin" or password == "1234":\n    print("登录成功")', 'if user == "admin" and password == "1234":\n    print("登录成功")', ['两个条件必须同时成立。', '同时成立使用 and。', '保留两个比较和缩进。'], has(/if\s+user\s*==\s*["']admin["']\s+and\s+password\s*==\s*["']1234["']\s*:/), 'or 会让“只对一个条件”也通过；权限判断通常需要 and。'),
    ]),
    lesson('loops', '06', '循环与循环不变量', '让重复工作可控，学会追踪每一轮的变量变化。', [
      { heading: 'for 适合遍历', body: 'for item in items 会依次取出每个元素。range(start, stop, step) 生成整数序列，stop 永远不包含在内；range(1, 4) 是 1、2、3。' },
      { heading: 'while 要有出口', body: 'while 在条件为真时反复执行。循环体里必须有某件事让条件最终变假，否则程序会无限循环。写 while 前先想好：初值是什么、每轮怎么变、什么时候停。' },
      { heading: '累加器是小型算法', body: 'total = 0 是累加器的初始状态，每轮用 total += number 更新。手算循环时做一张表，记录轮次、当前元素和 total，比凭感觉猜输出可靠。' },
    ], 'total = 0\nfor number in range(1, 6):\n    total += number\nprint(total)', ['能读懂 range 的开闭范围', '能写出不会死循环的 while', '能用累加器解决求和问题'], [
      ex('loops-1', '补全遍历范围', '打印 1、2、3，补全 range。', 'for number in range(', 'for number in range(1, 4):\n    print(number)', ['range 的结束值不包含。', '要包含 3，结束值写 4。', '循环体需要缩进并打印 number。'], has(/for\s+number\s+in\s+range\s*\(\s*1\s*,\s*4\s*\)\s*:/, /print\s*\(\s*number\s*\)/), '把“包含 1 到 3”翻译成 range(1, 4)，这是边界思维的基本训练。'),
      ex('loops-2', '修复 while 出口', '修复循环变量没有变化的问题，让程序输出 0、1、2 后停止。', 'i = 0\nwhile i < 3:\n    print(i)', 'i = 0\nwhile i < 3:\n    print(i)\n    i += 1', ['条件依赖 i。', '每轮输出后让 i 增加。', '使用 i += 1。'], has(/while\s+i\s*<\s*3\s*:/, /print\s*\(\s*i\s*\)/, /i\s*\+=\s*1/), '检查 while 时必须同时找“条件”和“改变条件的语句”。'),
    ]),
    lesson('collections', '07', '列表、字典与可变数据', '选择合适的数据结构，并能安全地遍历和更新它们。', [
      { heading: '列表保存有顺序的数据', body: '列表可以放多个值，索引从 0 开始。append(value) 在末尾添加，len(items) 获取长度，for item in items 遍历全部元素。不要把“第几个”误当成“下标几”。' },
      { heading: '字典保存对应关系', body: '字典用 key 找 value，例如 student["score"]。键应该稳定且有意义；遍历键值对用 for key, value in data.items()。访问不确定存在的键时，可以考虑 get。' },
      { heading: '原地修改与重新绑定', body: 'items.append(4) 会修改列表本身；items = items + [4] 会创建新列表并重新绑定。学习阶段先选择更直观的写法，调试时明确每一步数据长什么样。' },
    ], 'scores = [72, 88, 91]\nscores.append(95)\nstudent = {"name": "Ada", "score": max(scores)}\nprint(student["score"])', ['能使用列表索引、append 和 len', '能读写字典键值', '能选择列表或字典表达数据关系'], [
      ex('collections-1', '补全列表访问', '取出 names 的最后一个元素。', 'names[', 'names[-1]', ['最后一个元素可以用负索引。', '负索引从 -1 开始。', '补上右方括号。']),
      ex('collections-2', '修复字典访问', '修复读取 student 中 score 的语句。', 'print(student.score)', 'print(student["score"])', ['字典不是对象属性访问。', '用方括号写键。', 'score 是字符串键。'], has(/print\s*\(\s*student\s*\[\s*["']score["']\s*\]\s*\)/), '点号适合对象属性；字典的键值访问使用方括号。'),
    ]),
    lesson('functions', '08', '函数：拆分问题与返回结果', '把重复逻辑封装成可测试、可复用的小部件。', [
      { heading: '函数有输入和输出', body: 'def 定义函数，参数是调用者提供的输入，return 是函数交还的结果。return 会立即结束函数；没有 return 时，函数默认返回 None。不要把 print 的展示误当成 return 的结果。' },
      { heading: '局部变量与参数', body: '函数内部创建的局部变量通常只在函数内部使用。参数名可以和外部变量名不同；调用时把实际值传入。每个函数尽量只负责一件事，名字用动词或清晰的动作描述。' },
      { heading: '先写例子再抽象', body: '遇到长题目时，先用一个具体输入手算正确结果，再找出重复步骤，最后提取成函数。函数不是为了显得高级，而是为了让每一部分都能单独验证。' },
    ], 'def is_even(number):\n    return number % 2 == 0\n\nprint(is_even(8))', ['能定义带参数的函数', '能正确使用 return', '能把一段重复逻辑提取出来'], [
      ex('functions-1', '补全返回值', '定义 add(a, b)，返回两个参数的和。', 'def add(a, b):\n', 'def add(a, b):\n    return a + b', ['函数体需要缩进。', '返回语句是 return。', '返回 a + b。'], has(/def\s+add\s*\(\s*a\s*,\s*b\s*\)\s*:/, /return\s+a\s*\+\s*b/), 'return 让调用者拿到结果，所以 result = add(2, 3) 可以继续参与计算。'),
      ex('functions-2', '修复函数调用', '调用 greet 函数，并把返回值保存到 message。', 'message = greet', 'message = greet("Ada")', ['调用函数需要括号。', '把 Ada 作为字符串参数。', '保存调用结果到 message。'], has(/message\s*=\s*greet\s*\(\s*["']Ada["']\s*\)/), '写函数名不等于调用函数；括号表示现在传入参数并执行。'),
    ]),
    lesson('files', '09', '文件、异常与资源管理', '让程序能读取真实数据，并面对输入不理想的情况。', [
      { heading: '用 with 管理文件', body: 'with open("notes.txt", encoding="utf-8") as file: 会在代码块结束时自动关闭文件。读取文本常用 read、readline 或 for line in file；写入时要明确 w 会覆盖原内容，a 会追加到末尾。' },
      { heading: '异常是可预期的分支', body: '用户输入非数字、文件不存在都可能发生。try 放可能失败的代码，except 捕获特定异常并给出可理解的处理。不要用裸 except 吞掉所有错误，那会让真正的 bug 消失。' },
      { heading: '先判断能否恢复', body: '如果输入错误可以重新提示，就捕获 ValueError；如果文件不存在，可以提示路径或使用默认内容。异常处理的目标不是让所有错误都安静，而是让可预期的问题有清晰出口。' },
    ], 'try:\n    age = int(input("年龄："))\nexcept ValueError:\n    print("请输入整数")\nelse:\n    print(f"明年：{age + 1}")', ['能用 with 读取文本文件', '知道 r、w、a 的区别', '能捕获具体异常并给出反馈'], [
      ex('files-1', '修复文件模式', '以追加模式打开 log.txt。', 'with open("log.txt", "w") as file:', 'with open("log.txt", "a") as file:', ['w 会覆盖旧内容。', '追加模式是 a。', '保留 with 和 as file 的结构。'], has(/with\s+open\s*\(\s*["']log\.txt["']\s*,\s*["']a["']\s*\)\s+as\s+file\s*:/), '涉及日志时通常不希望每次运行都抹掉历史，先判断需求再选模式。'),
      ex('files-2', '补全安全读取', '使用 with 读取 data.txt 的全部内容，并保存到 content。', 'with open("data.txt", encoding="utf-8") as file:\n', 'with open("data.txt", encoding="utf-8") as file:\n    content = file.read()', ['文件代码块要缩进。', '读取全部内容的方法是 read。', '把结果保存到 content。'], has(/with\s+open\s*\(\s*["']data\.txt["']\s*,\s*encoding\s*=\s*["']utf-8["']\s*\)\s+as\s+file\s*:/, /content\s*=\s*file\.read\s*\(\s*\)/), 'with 同时表达“打开、使用、自动关闭”，比手动 close 更不容易漏资源。'),
    ]),
    lesson('modules', '10', '模块、标准库与可读性', '学会复用已有能力，而不是把所有代码堆在一个文件里。', [
      { heading: 'import 是依赖声明', body: 'import math 后通过 math.sqrt(9) 使用模块里的函数；from random import randint 则直接引入名字。导入通常放在文件顶部，便于读者知道程序依赖什么。' },
      { heading: '标准库解决常见问题', body: 'datetime 处理日期，pathlib 处理路径，json 处理结构化文本，statistics 做基础统计。先看模块提供的能力，再决定是否自己造轮子；考试题中也常要求辨认导入和调用关系。' },
      { heading: '可读性是正确性的一部分', body: '使用有意义的变量名，函数保持短小，重复逻辑集中管理。注释应该解释原因或约束，而不是把每一行翻译成中文。能让未来的自己快速复查，就是好的代码。' },
    ], 'from math import sqrt\n\nside = float(input())\narea = side * side\nprint(f"面积：{area:g}")\nprint(f"对角线：{side * sqrt(2):.2f}")', ['能读懂 import 和 from ... import', '知道常见标准库的适用场景', '能用命名和拆分提升可读性'], [
      ex('modules-1', '补全模块调用', '导入 math，并计算 16 的平方根。', 'import math\nprint(', 'import math\nprint(math.sqrt(16))', ['模块名是 math。', '平方根函数是 sqrt。', '调用时要写 math.sqrt。'], has(/import\s+math/, /print\s*\(\s*math\.sqrt\s*\(\s*16\s*\)\s*\)/), 'math.sqrt(16) 说明“函数属于哪个模块”，点号不要省略。'),
      ex('modules-2', '修复导入方式', '修复导入 randint 的语句。', 'import random.randint', 'from random import randint', ['from ... import ... 是直接导入名字的写法。', '模块名是 random。', '被导入的函数是 randint。'], has(/from\s+random\s+import\s+randint/), '两种 import 写法都能复用能力，但调用形式不同：random.randint(...) 或 randint(...)。'),
    ]),
    lesson('algorithm', '11', '综合题：把需求变成程序', '用“输入—处理—输出—测试”完成一个小型真实任务。', [
      { heading: '先写数据流', body: '拿到题目不要立刻敲代码。先写输入是什么、输出是什么、中间需要哪些变量；再用一个最小样例手算。这样能把“不会写”拆成几个可验证的小问题。' },
      { heading: '拆出规则和边界', body: '把自然语言中的“至少、超过、不足、每个、所有”圈出来，它们往往对应 >=、>、循环和列表。再补测 0、1、刚好达到阈值、空列表等边界。' },
      { heading: '复盘不只看对错', body: '完成后记录：这题的核心模式、第一次错在哪里、哪个测试暴露了问题、下次看到什么关键词可以联想到这个模式。复盘记录比抄一份标准答案更能迁移。' },
    ], 'numbers = [int(value) for value in input().split()]\npassed = [number for number in numbers if number >= 60]\nprint(len(passed))\nif passed:\n    print(sum(passed) / len(passed))', ['能从题目提取输入、处理和输出', '能主动测试边界情况', '能把列表、条件和函数知识组合起来'], [
      ex('algorithm-1', '补全输入解析', '读取一行空格分隔的整数，生成 numbers 列表。', 'numbers = [', 'numbers = [int(value) for value in input().split()]', ['先用 input 读取一整行。', 'split 把文本切成多个片段。', '每个片段用 int 转换。'], has(/numbers\s*=\s*\[\s*int\s*\(\s*value\s*\)\s+for\s+value\s+in\s+input\s*\(\s*\)\.split\s*\(\s*\)\s*\]/), '列表推导式把“遍历、转换、收集”压缩成一行，但要先能说清它展开后的三步。'),
      ex('algorithm-2', '修复边界判断', '只有列表非空时才计算平均值，修复可能除以 0 的代码。', 'average = sum(scores) / len(scores)\nprint(average)', 'if scores:\n    average = sum(scores) / len(scores)\n    print(average)', ['空列表在条件中会被当成 False。', '把计算放进 if 代码块。', '两行代码都要缩进。'], has(/if\s+scores\s*:/, /average\s*=\s*sum\s*\(\s*scores\s*\)\s*\/\s*len\s*\(\s*scores\s*\)/, /print\s*\(\s*average\s*\)/), '先处理空输入，再做除法，是把“边界测试”落实到代码里的典型方式。'),
      ex('algorithm-3', '完成成绩分析', '写程序读取若干整数成绩，输出及格人数和及格成绩平均分；没有及格成绩时只输出 0。', '', 'scores = [int(value) for value in input().split()]\npassed = [score for score in scores if score >= 60]\nprint(len(passed))\nif passed:\n    print(sum(passed) / len(passed))', ['先解析一行整数。', '用条件筛出大于等于 60 的成绩。', '先输出人数，非空时再算平均分。'], has(/scores\s*=\s*\[\s*int\s*\(\s*value\s*\)\s+for\s+value\s+in\s+input\s*\(\s*\)\.split\s*\(\s*\)\s*\]/, /passed\s*=\s*\[\s*score\s+for\s+score\s+in\s+scores\s+if\s+score\s*>=\s*60\s*\]/, /print\s*\(\s*len\s*\(\s*passed\s*\)\s*\)/, /if\s+passed\s*:/, /print\s*\(\s*sum\s*\(\s*passed\s*\)\s*\/\s*len\s*\(\s*passed\s*\)\s*\)/), '这道题把输入解析、筛选、计数、平均值和空列表边界串在一起，建议分别测试：空行、59、60、100。'),
    ], '建议节奏：每课先读目标，再不看示例写第一版；提交后把代码复制到本机 Python 运行，最后把一次错误写进自己的复盘记录。'),
  ],
}
