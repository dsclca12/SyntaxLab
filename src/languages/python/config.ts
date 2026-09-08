import type { Exercise, LearningModule } from '../../core/types'

const ex = (id: string, title: string, prompt: string, starter: string, solution: string, hints: string[]): Exercise => ({
  id: `python-${id}`, kind: title.includes('修复') ? 'repair' : title.includes('补全') ? 'complete' : 'create', title, prompt, starter, solution, hints,
  validate: (_value, source) => source.trim().replace(/\s+/g, ' ') === solution.trim().replace(/\s+/g, ' '),
})

const lesson = (id: string, number: string, title: string, summary: string, sections: { heading: string; body: string }[], example: string, goals: string[], exercises: Exercise[]): LearningModule['lessons'][number] => ({ id, number, title, eyebrow: 'PYTHON LEVEL 2', summary, sections, example, goals, exercises })

export const pythonModule: LearningModule = {
  id: 'python-level-2', name: 'Python 二级专项', language: 'Python 二级', editor: 'text', available: true,
  description: '从安装环境到读写程序，逐步准备 Python 程序设计考试。',
  lessons: [
    lesson('install', '01', '安装 Python 与准备环境', '先让电脑能够稳定运行 Python，再开始写程序。', [
      { heading: '安装什么', body: '建议安装 Python 3 的稳定版本，并使用官方 Python 安装包。Windows 安装时注意勾选“Add Python to PATH”，这样可以在终端直接使用 python 命令。macOS 和 Linux 通常可以使用 python3 命令，具体以本机环境为准。' },
      { heading: '如何验证', body: '打开 PowerShell、终端或命令提示符，执行 python --version；如果系统使用 python3，则执行 python3 --version。看到 Python 3.x.x 才说明解释器可用。再运行一条 print 命令，确认不仅安装了版本，还能执行代码。' },
      { heading: '编辑器与文件', body: '入门可以使用 IDLE，也可以使用 VS Code 等编辑器。把代码保存为 .py 文件，例如 hello.py；运行时要确认终端当前目录和文件所在目录一致，避免“找不到文件”。' },
    ], 'python --version\npython\n>>> print("Hello, Python!")', ['安装 Python 3 并能查看版本', '能在交互式解释器中运行 print', '能保存并运行一个 .py 文件'], [
      ex('install-1', '补全检查命令', '补全查看 Python 版本的命令。', 'python ', 'python --version', ['命令用于查看版本。', '选项是两个短横线加 version。', '完整答案以 python 开头。']),
      ex('install-2', '修复文件名', '修复 Python 源文件的扩展名。', 'hello.txt', 'hello.py', ['Python 源文件使用专用扩展名。', '扩展名以点开头。', '答案以 .py 结尾。']),
      ex('install-3', '写出验证步骤', '写出安装后最小验证流程，用“→”连接。', '', '查看版本 → 执行 print → 运行 .py 文件', ['第一步确认解释器存在。', '第二步执行一行代码。', '最后运行保存的文件。']),
    ]),
    lesson('basics', '02', '变量、输入与输出', '掌握程序如何接收数据、保存数据并展示结果。', [
      { heading: '变量是名字', body: '变量名指向一个值，例如 score = 90。等号是赋值，不是数学上的相等判断；同一个变量可以在后面被重新赋值。变量名要有含义，避免使用容易混淆的单字母。' },
      { heading: '输入与类型', body: 'input() 读入的内容默认是字符串。需要计算时要用 int() 或 float() 转换，例如 age = int(input())。print() 可以输出多个值，逗号会自动加入空格。' },
    ], 'name = input("Name: ")\nscore = int(input("Score: "))\nprint(name, score)', ['区分赋值和比较', '知道 input 默认返回字符串', '完成一次输入、转换和输出'], [
      ex('basics-1', '补全转换', '把输入的年龄转换成整数。', 'age = ', 'age = int(input())', ['input 返回字符串。', '整数转换函数是 int。', '把 input() 放进 int()。']),
      ex('basics-2', '修复赋值', '修复把姓名保存到变量的语句。', 'name == "Ada"', 'name = "Ada"', ['单个等号表示赋值。', '两个等号用于比较。', '姓名是字符串。']),
      ex('basics-3', '写出输出', '写出输出变量 total 的语句。', '', 'print(total)', ['输出函数是 print。', '变量名不需要引号。', '括号不能省略。']),
    ]),
    lesson('control', '03', '条件、循环与缩进', '用程序控制结构表达判断和重复。', [
      { heading: '条件分支', body: 'if 后面写条件并以冒号结束，下一行缩进的代码属于分支。多个条件可以使用 elif，所有条件都不满足时使用 else。比较时使用 ==，不要把赋值符号 = 写进条件。' },
      { heading: '循环执行', body: 'for 常用于遍历一组数据，range(5) 产生 0 到 4。while 会在条件为真时继续执行，必须确保循环变量最终改变，否则可能无限循环。缩进通常使用 4 个空格，并保持整段代码一致。' },
    ], 'for number in range(1, 4):\n    print(number)\n\nif score >= 60:\n    print("pass")', ['正确使用 if/elif/else 和冒号', '能读懂 range 的范围', '用缩进表示代码块'], [
      ex('control-1', '补全条件', '补全 60 分及格的条件。', 'if score ', 'if score >= 60:', ['及格包含 60 分。', '比较符号是 >=。', '条件末尾需要冒号。']),
      ex('control-2', '修复循环', '修复循环变量没有递增的问题。', 'i = 0\nwhile i < 3:\n    print(i)', 'i = 0\nwhile i < 3:\n    print(i)\n    i += 1', ['while 条件需要最终变为假。', '每轮让 i 增加。', '使用 i += 1。']),
      ex('control-3', '写出遍历', '写出打印 1、2、3 的 for 循环。', '', 'for number in range(1, 4):\n    print(number)', ['range 的结束值不包含在内。', '要得到 1、2、3，结束值写 4。', '循环体要缩进。']),
    ]),
    lesson('collections', '04', '字符串、列表与字典', '用常见数据类型组织程序中的一组信息。', [
      { heading: '序列与索引', body: '字符串和列表都支持索引，索引从 0 开始。names[0] 是第一个元素，names[-1] 是最后一个元素。切片 names[1:3] 包含下标 1，不包含下标 3。' },
      { heading: '选择合适结构', body: '列表适合保存有顺序的一组数据；字典用键和值保存有对应关系的数据，例如 student = {"name": "Ada", "score": 90}。遍历字典时要明确是在遍历键、值还是键值对。' },
    ], 'names = ["Ada", "Lin"]\nprint(names[0])\nstudent = {"name": "Ada", "score": 90}', ['正确处理从 0 开始的索引', '能使用列表和字典保存数据', '读懂简单的遍历和切片'], [
      ex('collections-1', '补全索引', '取出列表 names 的第一个元素。', 'names[', 'names[0]', ['索引从 0 开始。', '第一个元素的下标是 0。', '补上右方括号。']),
      ex('collections-2', '修复切片', '取出下标 1 和 2 的元素。', 'items[1:2]', 'items[1:3]', ['切片不包含结束下标。', '要包含 1、2，结束值写 3。', '保留冒号。']),
      ex('collections-3', '写出字典', '创建 name 为 Ada、score 为 90 的字典。', '', 'student = {"name": "Ada", "score": 90}', ['字典使用花括号。', '键和值之间使用冒号。', '两个键值对之间用逗号。']),
    ]),
    lesson('functions', '05', '函数、文件与错误', '把重复逻辑封装起来，并学会定位常见错误。', [
      { heading: '函数的四个部分', body: '函数使用 def 定义，后面是函数名和参数列表，行尾有冒号；函数体缩进；return 把结果交还给调用者。参数是输入，返回值是输出，调用函数时才会执行函数体。' },
      { heading: '文件与排错', body: '文件操作要注意打开模式和关闭资源，常见模式是 r 读取、w 覆盖写入、a 追加。遇到错误先看错误类型和行号：SyntaxError 常是语法问题，NameError 常是变量名不存在，TypeError 常是类型用错。' },
    ], 'def add(a, b):\n    return a + b\n\nresult = add(2, 3)', ['写出带参数和返回值的函数', '区分读取、覆盖写入和追加', '根据错误类型定位问题'], [
      ex('functions-1', '补全函数', '补全返回两个数之和的函数。', 'def add(a, b):\n', 'def add(a, b):\n    return a + b', ['函数体需要缩进。', '返回语句是 return。', '返回 a + b。']),
      ex('functions-2', '修复模式', '修复需要追加写入的文件模式。', 'open("log.txt", "w")', 'open("log.txt", "a")', ['w 会覆盖原内容。', '追加模式使用字母 a。', '保留文件名。']),
      ex('functions-3', '写出调用', '调用 add 函数计算 2 和 3 的和。', '', 'result = add(2, 3)', ['函数名是 add。', '参数按 2、3 传入。', '把返回值保存到 result。']),
    ]),
    lesson('exam', '06', '程序题与模拟复盘', '把知识点组合成考试中可执行的解题流程。', [
      { heading: '读题四步', body: '先圈出输入和输出，再确定数据类型；然后写最小可运行版本，最后补充边界情况。不要一开始就追求复杂写法。每写一段就运行一次，尽早发现缩进和变量名错误。' },
      { heading: '模拟检查表', body: '提交前检查：是否能运行、输入为空时是否出错、循环是否少算或多算一次、输出格式是否完全符合题目、是否把临时调试信息删除。把每次错误归入语法、类型、逻辑或格式。' },
    ], '读输入 → 确认类型 → 写最小版本 → 小数据测试 → 检查边界 → 对照输出', ['能按步骤拆解程序题', '知道如何测试边界情况', '形成一份自己的错误分类表'], [
      ex('exam-1', '补全流程', '补全程序题的基础流程。', '读输入 → ', '读输入 → 确认类型 → 写最小版本 → 小数据测试', ['读题后先确认数据类型。', '先写能运行的最小版本。', '用小数据进行第一次测试。']),
      ex('exam-2', '修复检查项', '补上程序提交前的关键检查项。', '检查能否运行 → 检查输出格式', '检查能否运行 → 检查边界情况 → 检查输出格式', ['能运行不代表逻辑正确。', '要测试空值或边界值。', '最后检查输出格式。']),
      ex('exam-3', '写出错因', '写出四类常见错误，用“、”分隔。', '', '语法、类型、逻辑、格式', ['第一类通常包含缩进和冒号。', '第二类与数据类型有关。', '最后两类是逻辑和输出格式。']),
    ]),
  ],
}
