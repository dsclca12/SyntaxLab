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
  return { id, number, title, eyebrow: 'PYTHON 入门路径', summary, sections, example, goals, exercises, note, walkthrough: detail.walkthrough, checkpoints: detail.checkpoints, resources: detail.resources }
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
      { heading: 'Windows 安装时看清选项', body: '下载安装程序后，普通学习选择 64-bit installer 即可；安装界面如果出现“Add Python to PATH”，建议勾选，它会让终端认识 python 命令。安装完成后关闭并重新打开 PowerShell，再执行 python --version。若电脑上有多个 Python，不要反复覆盖安装，先用 py --list 查看已有版本。' },
      { heading: '项目为什么要用虚拟环境', body: '只学语法时可以直接运行 Python；一旦项目要安装第三方库，建议每个项目创建自己的虚拟环境，避免 A 项目的库版本影响 B 项目。进入项目目录后执行 python -m venv .venv，再用 .\\.venv\\Scripts\\Activate.ps1（Windows PowerShell）或 source .venv/bin/activate（macOS/Linux）激活。安装库时优先写 python -m pip install 包名，这样 pip 一定对应当前 python。' },
      { heading: '验证不是只看安装成功', body: '在终端依次执行 python --version、python -c "print(2 + 3)"，最后把代码保存成 hello.py 并运行 python hello.py。三步分别验证：命令能找到解释器、解释器真的能执行代码、你能运行自己保存的脚本。macOS/Linux 常见命令是 python3；以本机实际输出为准。' },
      { heading: 'Python 到底做什么', body: 'Python 解释器会按顺序读取源文件，把每条语句转换成动作并执行。学习编程不是背 API，而是学会把一个目标拆成数据、步骤和结果。第一关要建立“编辑文件 → 运行 → 观察输出 → 修改再运行”的闭环。' },
      { heading: '脚本、终端与交互式解释器', body: '交互式解释器适合快速试一行代码，输入 exit() 可以退出；.py 脚本适合保存完整程序。运行脚本前，先用 pwd（PowerShell 可用 Get-Location）确认当前目录，再执行 python hello.py。遇到“找不到文件”，先检查目录和文件名，不要急着改代码。' },
      { heading: '读错误信息的习惯', body: '报错最后一行通常告诉你错误类型，回溯中会指出文件和行号。先读类型，再回到对应行附近定位；SyntaxError 多半是语法/缩进，NameError 多半是名字不存在，TypeError 常是操作的类型不匹配。一次只改一个原因，再重新运行验证。' },
    ], 'name = "Ada"\nprint(f"Hello, {name}!")', ['能保存并运行一个 .py 文件', '能区分 print 的输出和变量的值', '知道从错误类型与行号开始排错'], [
      ex('start-1', '补全第一条输出', '补全代码，让程序输出 Hello, Python!。', 'print(', 'print("Hello, Python!")', ['输出文本要用 print。', '文本需要放在引号中。', '别忘了右括号。'], exactOr('print("Hello, Python!")', ['print(\'Hello, Python!\')']), '这条语句调用 print，把一个字符串交给解释器输出。'),
      ex('start-2', '修复脚本文件名', '把不是 Python 源文件的名字修正为可运行的脚本名。', 'hello.txt', 'hello.py', ['Python 源文件以 .py 结尾。', '只需要修改扩展名。', '文件名主体可以保留。']),
      ex('start-3', '写出最小程序', '写一个程序：保存名字 Ada，然后输出这个名字。', '', 'name = "Ada"\nprint(name)', ['先创建变量 name。', 'Ada 是字符串，需要引号。', 'print 输出变量时不要再加引号。'], has(/name\s*=\s*["']Ada["']/i, /print\s*\(\s*name\s*\)/), '变量保存数据，print(name) 读取变量并输出它的当前值。'),
      ex('start-4', '补全版本检查', '补全查看 Python 版本的命令。', 'python ', 'python --version', ['这条命令只检查解释器版本。', '选项由两个短横线和 version 组成。', '完整答案是 python --version。']),
      ex('start-5', '创建虚拟环境', '写出在当前项目目录创建 .venv 虚拟环境的命令。', '', 'python -m venv .venv', ['使用 python -m 可以明确由哪个解释器执行模块。', '虚拟环境模块叫 venv。', '最后写环境目录名 .venv。']),
    ], '提示：本专栏在浏览器中检查代码结构，不会在你的电脑上替你执行 Python。建议每次提交后，复制到本机解释器再跑一次。'),
    lesson('values', '02', '变量、类型与输入输出', '让程序从外界接收数据，并做出可预测的结果。', [
      { heading: '值有类型', body: '字符串 str、整数 int、浮点数 float 和布尔值 bool 的行为不同。input() 永远先返回字符串，所以 input() 得到的 "12" 不能直接当数字做加法，计算前要显式转换成 int 或 float。' },
      { heading: '赋值不是相等', body: 'score = 90 的意思是把 90 绑定到 score；score == 90 才是比较。变量可以重新绑定，但每次都要想清楚：此刻保存的值和类型是什么？用 type(value) 可以检查类型。' },
      { heading: '输出要对齐题意', body: 'print 默认在多个参数之间加空格并在结尾换行。f-string 适合把变量嵌进文本，例如 f"得分：{score}"。考试或作业中，输出多一个空格也可能不符合要求。' },
    ], 'name = input("姓名：")\nscore = int(input("分数："))\nprint(f"{name} 得了 {score} 分")', ['能判断常见值的类型', '能把输入转换为数字', '能用 f-string 生成清晰输出'], [
      ex('values-1', '补全数字输入', '读取一行整数并保存到 age。', 'age = ', 'age = int(input())', ['input() 的结果是字符串。', '整数转换函数叫 int。', '把 input() 放进 int()。'], has(/age\s*=\s*int\s*\(\s*input\s*\(\s*\)\s*\)/), '转换发生在输入之后：先读文本，再把文本解析成整数。'),
      ex('values-2', '修复赋值语句', '修复把姓名 Ada 保存到 name 的语句。', 'name == "Ada"', 'name = "Ada"', ['这里要“保存”，不是比较。', '保存值使用一个等号。', 'Ada 是字符串。'], has(/name\s*=\s*["']Ada["']/), '一个等号改变变量绑定，两个等号才是条件判断。'),
      ex('values-3', '计算并输出', '读取两个整数，输出它们的和。', '', 'a = int(input())\nb = int(input())\nprint(a + b)', ['需要两次 input。', '每次输入都先用 int 转换。', '把两个变量相加交给 print。'], has(/a\s*=\s*int\s*\(\s*input\s*\(\s*\)\s*\)/, /b\s*=\s*int\s*\(\s*input\s*\(\s*\)\s*\)/, /print\s*\(\s*a\s*\+\s*b\s*\)/), '先把输入变成数，再计算；不要把两个字符串直接拼接。'),
    ]),
    lesson('strings', '03', '字符串与格式化', '处理文本、索引和输出格式，写出不靠猜的字符串程序。', [
      { heading: '字符串是有顺序的文本', body: '字符串可以索引和切片：text[0] 是第一个字符，text[-1] 是最后一个字符，text[1:4] 取下标 1、2、3。切片的结束位置不包含在结果里，这是最常见的边界错误之一。' },
      { heading: '方法会产生新字符串', body: 'text.strip() 去掉两端空白，text.lower() 转小写，text.replace(old, new) 替换内容。字符串不可原地修改；需要保存结果时写成 text = text.strip()。' },
      { heading: '格式化比拼接更稳', body: 'f-string 用大括号插入表达式，适合同时输出文字和变量。先明确最终输出长什么样，再选择 print、f-string 或 join，不要用一串难以维护的加号拼接。' },
    ], 'raw = "  Python  "\nword = raw.strip().lower()\nprint(f"语言：{word}")', ['能正确使用索引和切片', '会调用常用字符串方法', '能写出指定格式的文本输出'], [
      ex('strings-1', '补全切片', '取出 text 的前 3 个字符。', 'text[', 'text[:3]', ['切片左边空着表示从头开始。', '结束位置写 3。', '切片不包含下标 3。']),
      ex('strings-2', '清理用户输入', '把 name 两端的空格去掉，并把结果保存回 name。', 'name = name.', 'name = name.strip()', ['去两端空白的方法是 strip。', '方法需要括号。', '要重新赋值，清理结果才会保存。'], has(/name\s*=\s*name\.strip\s*\(\s*\)/), 'strip() 返回清理后的新字符串，不会自动改变原变量。'),
      ex('strings-3', '生成报名信息', '输出“姓名：Ada，科目：Python”，使用变量 name 和 subject。', 'name = "Ada"\nsubject = "Python"\n', 'name = "Ada"\nsubject = "Python"\nprint(f"姓名：{name}，科目：{subject}")', ['先保留两行变量定义。', 'f-string 以 f 开头。', '变量放在大括号里。'], has(/name\s*=\s*["']Ada["']/i, /subject\s*=\s*["']Python["']/i, /print\s*\(\s*f["']姓名：\{name\}，科目：\{subject\}["']\s*\)/), 'f-string 把数据和展示格式分开，修改变量后输出会自动更新。'),
    ]),
    lesson('conditions', '04', '条件、比较与布尔逻辑', '把“如果……那么……”翻译成清楚、可检查的代码。', [
      { heading: '条件是一条问题', body: 'if 后面必须是能得到 True 或 False 的表达式，并以冒号结束。常见比较符号有 ==、!=、>、>=、<、<=。代码块由缩进决定，建议始终使用 4 个空格。' },
      { heading: '组合条件', body: 'and 要求两边都为真，or 只要一边为真，not 会反转真假。复杂条件可以加括号。先用自然语言说清楚，再写代码，能显著减少“看起来差不多”的逻辑错误。' },
      { heading: '分支要覆盖边界', body: '判断分数时要考虑刚好及格、刚好不及格；判断范围时要确认端点是否包含。elif 按顺序检查，前面条件已经成立后，后面的分支不会再执行。' },
    ], 'score = int(input())\nif score >= 60:\n    print("及格")\nelse:\n    print("继续努力")', ['能写出带冒号和缩进的分支', '能区分 > 与 >= 的边界', '能组合两个布尔条件'], [
      ex('conditions-1', '补全及格条件', '60 分也算及格，补全 if 条件。', 'if score ', 'if score >= 60:', ['“包含 60”意味着要带等号。', '大于等于写作 >=。', '条件行末尾要有冒号。'], has(/if\s+score\s*>=\s*60\s*:/), '边界值 60 是测试条件的好例子：先写规则，再用 59、60、61 验证。'),
      ex('conditions-2', '修复登录判断', '只有用户名和密码都正确时才输出登录成功。', 'if user == "admin" or password == "1234":\n    print("登录成功")', 'if user == "admin" and password == "1234":\n    print("登录成功")', ['两个条件必须同时成立。', '同时成立使用 and。', '保留两个比较和缩进。'], has(/if\s+user\s*==\s*["']admin["']\s+and\s+password\s*==\s*["']1234["']\s*:/), 'or 会让“只对一个条件”也通过；权限判断通常需要 and。'),
      ex('conditions-3', '写出分级程序', 'score >= 90 输出 A，否则 score >= 60 输出 B，否则输出 C。', '', 'if score >= 90:\n    print("A")\nelif score >= 60:\n    print("B")\nelse:\n    print("C")', ['第一档先判断更高分数。', '第二档使用 elif。', '每个分支的 print 都要缩进。'], has(/if\s+score\s*>=\s*90\s*:/, /elif\s+score\s*>=\s*60\s*:/, /else\s*:/, /print\s*\(\s*["']A["']\s*\)/, /print\s*\(\s*["']B["']\s*\)/, /print\s*\(\s*["']C["']\s*\)/), '从最严格的条件开始写，避免 95 分先被“>= 60”截走。'),
    ]),
    lesson('loops', '05', '循环与循环不变量', '让重复工作可控，学会追踪每一轮的变量变化。', [
      { heading: 'for 适合遍历', body: 'for item in items 会依次取出每个元素。range(start, stop, step) 生成整数序列，stop 永远不包含在内；range(1, 4) 是 1、2、3。' },
      { heading: 'while 要有出口', body: 'while 在条件为真时反复执行。循环体里必须有某件事让条件最终变假，否则程序会无限循环。写 while 前先想好：初值是什么、每轮怎么变、什么时候停。' },
      { heading: '累加器是小型算法', body: 'total = 0 是累加器的初始状态，每轮用 total += number 更新。手算循环时做一张表，记录轮次、当前元素和 total，比凭感觉猜输出可靠。' },
    ], 'total = 0\nfor number in range(1, 6):\n    total += number\nprint(total)', ['能读懂 range 的开闭范围', '能写出不会死循环的 while', '能用累加器解决求和问题'], [
      ex('loops-1', '补全遍历范围', '打印 1、2、3，补全 range。', 'for number in range(', 'for number in range(1, 4):\n    print(number)', ['range 的结束值不包含。', '要包含 3，结束值写 4。', '循环体需要缩进并打印 number。'], has(/for\s+number\s+in\s+range\s*\(\s*1\s*,\s*4\s*\)\s*:/, /print\s*\(\s*number\s*\)/), '把“包含 1 到 3”翻译成 range(1, 4)，这是边界思维的基本训练。'),
      ex('loops-2', '修复 while 出口', '修复循环变量没有变化的问题，让程序输出 0、1、2 后停止。', 'i = 0\nwhile i < 3:\n    print(i)', 'i = 0\nwhile i < 3:\n    print(i)\n    i += 1', ['条件依赖 i。', '每轮输出后让 i 增加。', '使用 i += 1。'], has(/while\s+i\s*<\s*3\s*:/, /print\s*\(\s*i\s*\)/, /i\s*\+=\s*1/), '检查 while 时必须同时找“条件”和“改变条件的语句”。'),
      ex('loops-3', '统计满足条件的数', '统计 1 到 10 中偶数的个数。', '', 'count = 0\nfor number in range(1, 11):\n    if number % 2 == 0:\n        count += 1\nprint(count)', ['先准备 count = 0。', '偶数除以 2 的余数是 0。', '满足条件时把 count 加 1。'], has(/count\s*=\s*0/, /for\s+number\s+in\s+range\s*\(\s*1\s*,\s*11\s*\)\s*:/, /if\s+number\s*%\s*2\s*==\s*0\s*:/, /count\s*\+=\s*1/, /print\s*\(\s*count\s*\)/), '“统计”通常需要计数器；先判断，再更新计数器。'),
    ]),
    lesson('collections', '06', '列表、字典与可变数据', '选择合适的数据结构，并能安全地遍历和更新它们。', [
      { heading: '列表保存有顺序的数据', body: '列表可以放多个值，索引从 0 开始。append(value) 在末尾添加，len(items) 获取长度，for item in items 遍历全部元素。不要把“第几个”误当成“下标几”。' },
      { heading: '字典保存对应关系', body: '字典用 key 找 value，例如 student["score"]。键应该稳定且有意义；遍历键值对用 for key, value in data.items()。访问不确定存在的键时，可以考虑 get。' },
      { heading: '原地修改与重新绑定', body: 'items.append(4) 会修改列表本身；items = items + [4] 会创建新列表并重新绑定。学习阶段先选择更直观的写法，调试时明确每一步数据长什么样。' },
    ], 'scores = [72, 88, 91]\nscores.append(95)\nstudent = {"name": "Ada", "score": max(scores)}\nprint(student["score"])', ['能使用列表索引、append 和 len', '能读写字典键值', '能选择列表或字典表达数据关系'], [
      ex('collections-1', '补全列表访问', '取出 names 的最后一个元素。', 'names[', 'names[-1]', ['最后一个元素可以用负索引。', '负索引从 -1 开始。', '补上右方括号。']),
      ex('collections-2', '修复字典访问', '修复读取 student 中 score 的语句。', 'print(student.score)', 'print(student["score"])', ['字典不是对象属性访问。', '用方括号写键。', 'score 是字符串键。'], has(/print\s*\(\s*student\s*\[\s*["']score["']\s*\]\s*\)/), '点号适合对象属性；字典的键值访问使用方括号。'),
      ex('collections-3', '筛选高分', '输出 scores 中所有大于等于 80 的分数。', '', 'for score in scores:\n    if score >= 80:\n        print(score)', ['遍历列表中的每个 score。', '条件要包含 80。', 'print 放在 if 代码块内。'], has(/for\s+score\s+in\s+scores\s*:/, /if\s+score\s*>=\s*80\s*:/, /print\s*\(\s*score\s*\)/), '先遍历，再筛选；把 print 缩进到 if 下面就不会输出低分。'),
    ]),
    lesson('functions', '07', '函数：拆分问题与返回结果', '把重复逻辑封装成可测试、可复用的小部件。', [
      { heading: '函数有输入和输出', body: 'def 定义函数，参数是调用者提供的输入，return 是函数交还的结果。return 会立即结束函数；没有 return 时，函数默认返回 None。不要把 print 的展示误当成 return 的结果。' },
      { heading: '局部变量与参数', body: '函数内部创建的局部变量通常只在函数内部使用。参数名可以和外部变量名不同；调用时把实际值传入。每个函数尽量只负责一件事，名字用动词或清晰的动作描述。' },
      { heading: '先写例子再抽象', body: '遇到长题目时，先用一个具体输入手算正确结果，再找出重复步骤，最后提取成函数。函数不是为了显得高级，而是为了让每一部分都能单独验证。' },
    ], 'def is_even(number):\n    return number % 2 == 0\n\nprint(is_even(8))', ['能定义带参数的函数', '能正确使用 return', '能把一段重复逻辑提取出来'], [
      ex('functions-1', '补全返回值', '定义 add(a, b)，返回两个参数的和。', 'def add(a, b):\n', 'def add(a, b):\n    return a + b', ['函数体需要缩进。', '返回语句是 return。', '返回 a + b。'], has(/def\s+add\s*\(\s*a\s*,\s*b\s*\)\s*:/, /return\s+a\s*\+\s*b/), 'return 让调用者拿到结果，所以 result = add(2, 3) 可以继续参与计算。'),
      ex('functions-2', '修复函数调用', '调用 greet 函数，并把返回值保存到 message。', 'message = greet', 'message = greet("Ada")', ['调用函数需要括号。', '把 Ada 作为字符串参数。', '保存调用结果到 message。'], has(/message\s*=\s*greet\s*\(\s*["']Ada["']\s*\)/), '写函数名不等于调用函数；括号表示现在传入参数并执行。'),
      ex('functions-3', '写一个折扣函数', '定义 final_price(price)，价格满 100 打 9 折，否则原价返回。', '', 'def final_price(price):\n    if price >= 100:\n        return price * 0.9\n    return price', ['先写函数头和参数。', '满 100 的条件是 >= 100。', '两个分支都要 return。'], has(/def\s+final_price\s*\(\s*price\s*\)\s*:/, /if\s+price\s*>=\s*100\s*:/, /return\s+price\s*\*\s*0\.9/, /return\s+price/), '让函数覆盖两个分支，并分别测试 99、100 和 150。'),
    ]),
    lesson('files', '08', '文件、异常与资源管理', '让程序能读取真实数据，并面对输入不理想的情况。', [
      { heading: '用 with 管理文件', body: 'with open("notes.txt", encoding="utf-8") as file: 会在代码块结束时自动关闭文件。读取文本常用 read、readline 或 for line in file；写入时要明确 w 会覆盖原内容，a 会追加到末尾。' },
      { heading: '异常是可预期的分支', body: '用户输入非数字、文件不存在都可能发生。try 放可能失败的代码，except 捕获特定异常并给出可理解的处理。不要用裸 except 吞掉所有错误，那会让真正的 bug 消失。' },
      { heading: '先判断能否恢复', body: '如果输入错误可以重新提示，就捕获 ValueError；如果文件不存在，可以提示路径或使用默认内容。异常处理的目标不是让所有错误都安静，而是让可预期的问题有清晰出口。' },
    ], 'try:\n    age = int(input("年龄："))\nexcept ValueError:\n    print("请输入整数")\nelse:\n    print(f"明年：{age + 1}")', ['能用 with 读取文本文件', '知道 r、w、a 的区别', '能捕获具体异常并给出反馈'], [
      ex('files-1', '修复文件模式', '以追加模式打开 log.txt。', 'with open("log.txt", "w") as file:', 'with open("log.txt", "a") as file:', ['w 会覆盖旧内容。', '追加模式是 a。', '保留 with 和 as file 的结构。'], has(/with\s+open\s*\(\s*["']log\.txt["']\s*,\s*["']a["']\s*\)\s+as\s+file\s*:/), '涉及日志时通常不希望每次运行都抹掉历史，先判断需求再选模式。'),
      ex('files-2', '补全安全读取', '使用 with 读取 data.txt 的全部内容，并保存到 content。', 'with open("data.txt", encoding="utf-8") as file:\n', 'with open("data.txt", encoding="utf-8") as file:\n    content = file.read()', ['文件代码块要缩进。', '读取全部内容的方法是 read。', '把结果保存到 content。'], has(/with\s+open\s*\(\s*["']data\.txt["']\s*,\s*encoding\s*=\s*["']utf-8["']\s*\)\s+as\s+file\s*:/, /content\s*=\s*file\.read\s*\(\s*\)/), 'with 同时表达“打开、使用、自动关闭”，比手动 close 更不容易漏资源。'),
      ex('files-3', '处理无效输入', '修复代码：输入不是整数时输出“请输入整数”。', 'try:\n    age = int(input())\nexcept TypeError:\n    print("请输入整数")', 'try:\n    age = int(input())\nexcept ValueError:\n    print("请输入整数")', ['int 转换文本失败会产生 ValueError。', '缩进要保持一致。', '只替换异常类型。'], has(/try\s*:/, /age\s*=\s*int\s*\(\s*input\s*\(\s*\)\s*\)/, /except\s+ValueError\s*:/, /print\s*\(\s*["']请输入整数["']\s*\)/), '异常类型要对应失败原因：文本不能转换成整数通常是 ValueError，不是 TypeError。'),
    ]),
    lesson('modules', '09', '模块、标准库与可读性', '学会复用已有能力，而不是把所有代码堆在一个文件里。', [
      { heading: 'import 是依赖声明', body: 'import math 后通过 math.sqrt(9) 使用模块里的函数；from random import randint 则直接引入名字。导入通常放在文件顶部，便于读者知道程序依赖什么。' },
      { heading: '标准库解决常见问题', body: 'datetime 处理日期，pathlib 处理路径，json 处理结构化文本，statistics 做基础统计。先看模块提供的能力，再决定是否自己造轮子；考试题中也常要求辨认导入和调用关系。' },
      { heading: '可读性是正确性的一部分', body: '使用有意义的变量名，函数保持短小，重复逻辑集中管理。注释应该解释原因或约束，而不是把每一行翻译成中文。能让未来的自己快速复查，就是好的代码。' },
    ], 'from math import sqrt\n\nside = float(input())\narea = side * side\nprint(f"面积：{area:g}")\nprint(f"对角线：{side * sqrt(2):.2f}")', ['能读懂 import 和 from ... import', '知道常见标准库的适用场景', '能用命名和拆分提升可读性'], [
      ex('modules-1', '补全模块调用', '导入 math，并计算 16 的平方根。', 'import math\nprint(', 'import math\nprint(math.sqrt(16))', ['模块名是 math。', '平方根函数是 sqrt。', '调用时要写 math.sqrt。'], has(/import\s+math/, /print\s*\(\s*math\.sqrt\s*\(\s*16\s*\)\s*\)/), 'math.sqrt(16) 说明“函数属于哪个模块”，点号不要省略。'),
      ex('modules-2', '修复导入方式', '修复导入 randint 的语句。', 'import random.randint', 'from random import randint', ['from ... import ... 是直接导入名字的写法。', '模块名是 random。', '被导入的函数是 randint。'], has(/from\s+random\s+import\s+randint/), '两种 import 写法都能复用能力，但调用形式不同：random.randint(...) 或 randint(...)。'),
      ex('modules-3', '写一个可复用统计函数', '定义 average(numbers)，返回列表 numbers 的平均值。', '', 'def average(numbers):\n    return sum(numbers) / len(numbers)', ['总和函数是 sum。', '元素个数用 len。', '平均值是总和除以个数。'], has(/def\s+average\s*\(\s*numbers\s*\)\s*:/, /return\s+sum\s*\(\s*numbers\s*\)\s*\/\s*len\s*\(\s*numbers\s*\)/), '把统计逻辑封装后，任何同样结构的数字列表都可以复用；同时要思考空列表这个边界。'),
    ]),
    lesson('algorithm', '10', '综合题：把需求变成程序', '用“输入—处理—输出—测试”完成一个小型真实任务。', [
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
