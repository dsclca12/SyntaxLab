import type { Exercise, LearningModule, WalkthroughStep } from '../../core/types'
import binarySource from './source.md?raw'

const binary = (value: number) => value.toString(2)
const compact = (source: string) => source.toLowerCase().replace(/\s+/g, '').replace(/[，。；：、]/g, '')
const numberAnswer = (value: number, source: string) => compact(source).replace(/₁₀|10进制|十进制/g, '').includes(String(value))
const binaryAnswer = (value: number, source: string) => {
  const expected = binary(value)
  const cleaned = compact(source).replace(/^0b/, '').replace(/₂|二进制/g, '')
  return cleaned === expected || cleaned === `=${expected}`
}
const randomInt = (seed: number, min: number, max: number) => {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return Math.floor((raw - Math.floor(raw)) * (max - min + 1)) + min
}
const answer = (id: string, kind: Exercise['kind'], title: string, prompt: string, starter: string, solution: string, hints: string[], validate: (source: string) => boolean, feedback: string): Exercise => ({
  id,
  kind,
  title,
  prompt,
  starter,
  solution,
  hints,
  feedback,
  validate: (_value, source) => validate(source),
})

export const createBinaryExercises = (lessonId: string, seed: number): Exercise[] => {
  const salt = seed * 17 + lessonId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  if (lessonId === 'overview') {
    const bits = randomInt(salt, 2, 6)
    const bytes = randomInt(salt + 1, 2, 8)
    return [
      answer(`binary-${lessonId}-${seed}-states`, 'create', '状态数量', `${bits} 个 bit 一共有多少种不同状态？写出计算式和结果。`, `计算式：2^${bits} = `, `2^${bits} = ${2 ** bits}`, [`每个 bit 有 2 种状态。`, `把 2 连乘 ${bits} 次。`, `状态数量是 ${2 ** bits}。`], (source) => {
        const normalized = compact(source).replace(/[＝]/g, '=').replace(/\*\*/g, '^').replace(/⁰/g, '0').replace(/¹/g, '1').replace(/²/g, '2').replace(/³/g, '3').replace(/⁴/g, '4').replace(/⁵/g, '5').replace(/⁶/g, '6')
        return new RegExp(`2\\s*\\^\\s*${bits}\\s*=\\s*${2 ** bits}`).test(normalized) || (normalized.includes(`2^${bits}`) && normalized.includes(String(2 ** bits)))
      }, 'n 个 bit 的组合数是 2ⁿ，不是 n×2。'),
      answer(`binary-${lessonId}-${seed}-byte`, 'create', '单位换算', `${bytes} Byte 等于多少 bit？`, `${bytes} Byte = `, `${bytes * 8} bit`, ['现代计算机中 1 Byte 通常由 8 bit 组成。', `计算 ${bytes} × 8。`, '答案要带 bit 单位。'], (source) => numberAnswer(bytes * 8, source) && /bit|位/i.test(source), 'Byte 是数据组织单位，bit 是单个二进制位。'),
      answer(`binary-${lessonId}-${seed}-why`, 'create', '解释二进制', '用一句话说明电子计算机为什么适合使用二进制。', '', '两种离散状态更容易用晶体管可靠地区分，并且对噪声更有容错空间。', ['至少提到“两种状态”。', '再联系噪声或稳定性。', '可以提到晶体管或物理信号。'], (source) => /(两种|二元|0和1|0、1)/.test(source) && /(噪声|稳定|可靠|晶体管|电路)/.test(source), '原因是物理实现更可靠，而不是计算机天生“只认识”0 和 1。'),
    ]
  }
  if (lessonId === 'place-value') {
    const value = randomInt(salt, 9, 63)
    const power = randomInt(salt + 1, 2, 6)
    return [
      answer(`binary-${lessonId}-${seed}-to-decimal`, 'create', '按位展开', `把 ${binary(value)}₂ 转换为十进制，并写出至少一项位权展开。`, `${binary(value)}₂ = `, `${binary(value)}₂ = ${value}`, ['从最右边开始标 2⁰、2¹、2²……。', '只有数字为 1 的位置贡献权值。', `结果是 ${value}。`], (source) => numberAnswer(value, source) && new RegExp(`2\\^\\d|2⁰|2¹|2²|${binary(value)}`).test(source), '二进制每向左一位，位权扩大 2 倍。'),
      answer(`binary-${lessonId}-${seed}-power`, 'create', '认识位权', `2^${power} 对应的二进制形式是什么？`, `2^${power} = `, `${binary(2 ** power)}₂`, ['2 的幂在二进制中只有一个 1。', `在第 ${power} 位放 1，其右侧补 0。`, `答案是 ${binary(2 ** power)}。`], (source) => binaryAnswer(2 ** power, source), '2ⁿ 的二进制形式是 1 后面跟 n 个 0。'),
    ]
  }
  if (lessonId === 'conversion') {
    const decimalValue = randomInt(salt, 12, 180)
    const binaryValue = randomInt(salt + 1, 18, 95)
    return [
      answer(`binary-${lessonId}-${seed}-decimal-to-binary`, 'create', '十进制 → 二进制', `把 ${decimalValue}₁₀ 转换成二进制。`, `${decimalValue}₁₀ = `, `${binary(decimalValue)}₂`, ['可以拆成若干个 2 的幂。', '也可以连续除以 2，倒序读取余数。', `答案是 ${binary(decimalValue)}。`], (source) => binaryAnswer(decimalValue, source), '除 2 取余时，要从最后一次余数开始倒序读取。'),
      answer(`binary-${lessonId}-${seed}-binary-to-decimal`, 'create', '二进制 → 十进制', `把 ${binary(binaryValue)}₂ 转换成十进制。`, `${binary(binaryValue)}₂ = `, `${binaryValue}`, ['写出右起的 1、2、4、8……。', '把值为 1 的位权相加。', `结果是 ${binaryValue}。`], (source) => numberAnswer(binaryValue, source), '不要把数字字符串直接当作十进制读取。'),
    ]
  }
  if (lessonId === 'arithmetic') {
    const left = randomInt(salt, 5, 31)
    const right = randomInt(salt + 1, 2, 15)
    const larger = Math.max(left, right)
    const smaller = Math.min(left, right)
    return [
      answer(`binary-${lessonId}-${seed}-addition`, 'create', '二进制加法', `计算：${binary(left)}₂ + ${binary(right)}₂。`, `${binary(left)}₂ + ${binary(right)}₂ = `, `${binary(left + right)}₂`, ['从右往左计算。', '遇到 1 + 1，要写 0 并向左进 1。', `十进制校验：${left} + ${right} = ${left + right}。`], (source) => binaryAnswer(left + right, source), '二进制的进位点是 2：1 + 1 = 10₂。'),
      answer(`binary-${lessonId}-${seed}-subtraction`, 'create', '二进制减法', `计算：${binary(larger)}₂ − ${binary(smaller)}₂。`, `${binary(larger)}₂ - ${binary(smaller)}₂ = `, `${binary(larger - smaller)}₂`, ['从右往左计算。', '遇到 0 − 1，从高位借 1，当前位得到 10₂。', `十进制校验：${larger} − ${smaller} = ${larger - smaller}。`], (source) => binaryAnswer(larger - smaller, source), '从高位借来的 1，在当前二进制位上等于 10₂。'),
    ]
  }
  if (lessonId === 'bytes') {
    const bits = [4, 8, 16][salt % 3]
    const bytes = randomInt(salt + 1, 2, 6)
    return [
      answer(`binary-${lessonId}-${seed}-max`, 'create', '无符号范围', `${bits} bit 无符号整数的最大值是多少？`, `${bits} bit 最大值 = `, `${2 ** bits - 1}`, ['2ⁿ 是状态数量。', '从 0 开始编号，所以最大值要减 1。', `答案是 ${2 ** bits - 1}。`], (source) => numberAnswer(2 ** bits - 1, source), '最大值是 2ⁿ−1，不是 2ⁿ。'),
      answer(`binary-${lessonId}-${seed}-capacity`, 'create', '容量换算', `${bytes} Byte 等于多少 bit？并说明为什么这和 CPU 字长不是一回事。`, `${bytes} Byte = `, `${bytes * 8} bit；Byte 是数据组织单位，CPU 字长是处理宽度。`, ['先换算 ${bytes} × 8。', 'Byte 不是 CPU 一次处理的数据宽度。', '可举 32 bit 或 64 bit CPU 为例。'], (source) => numberAnswer(bytes * 8, source) && /(Byte|字节)/i.test(source) && /(CPU|字长|处理|运算)/.test(source), '8 bit 的 Byte 不意味着 CPU 一次只能处理 8 bit。'),
    ]
  }
  const codeValue = randomInt(salt, 5, 31)
  return [
    answer(`binary-${lessonId}-${seed}-literal`, 'create', '读懂 0b 前缀', `Python 中 x = 0b${binary(codeValue)}，x 的十进制值是多少？`, `x = 0b${binary(codeValue)}\nprint(x)\n输出：`, `${codeValue}`, ['0b 表示后面的整数按二进制解释。', `把 ${binary(codeValue)}₂ 按位权展开。`, `输出是 ${codeValue}。`], (source) => numberAnswer(codeValue, source), '0b 是源代码写法，变量保存的仍是同一个整数值。'),
    answer(`binary-${lessonId}-${seed}-bin`, 'create', '读懂 bin()', 'Python 表达式 bin(10) 的返回值是什么？', 'bin(10) = ', '0b1010', ['bin() 把整数转换成带 0b 前缀的二进制字符串。', '10₁₀ = 1010₂。', '返回值是字符串。'], (source) => /0b1010/.test(compact(source)), 'bin() 返回字符串表示，输出整数时通常会看到 0b 前缀。'),
  ]
}

type BinaryLessonOptions = { walkthrough: WalkthroughStep[]; checkpoints: string[]; note: string; goals: string[] }
const between = (start: string, end?: string) => {
  const from = binarySource.indexOf(start)
  const to = end ? binarySource.indexOf(end, from) : binarySource.length
  return binarySource.slice(from, to === -1 ? binarySource.length : to).trim()
}
const binaryContent: Record<string, string> = {
  overview: between('## 1. 学习目标', '# 6. 二进制计数'),
  'place-value': between('# 6. 二进制计数', '# 8. 二进制 → 十进制'),
  conversion: between('# 8. 二进制 → 十进制', '# 10. 二进制加法'),
  arithmetic: between('# 10. 二进制加法', '# 13. 为什么计算机适合使用二进制'),
  bytes: between('# 13. 为什么计算机适合使用二进制', '# 17. 和 C / Python 的联系'),
  code: `${between('# 17. 和 C / Python 的联系', '# 22. 自测题')}\n\n${between('# 24. 一页速查表')}`,
}
const binaryLesson = (id: string, number: string, title: string, summary: string, sections: { heading: string; body: string }[], example: string, options: BinaryLessonOptions): LearningModule['lessons'][number] => ({
  id, number, title, eyebrow: 'BINARY FOUNDATIONS', summary, sections, example, content: binaryContent[id], walkthrough: options.walkthrough, checkpoints: options.checkpoints, note: options.note, goals: options.goals, exercises: [],
})

export const binaryModule: LearningModule = {
  id: 'binary-foundations',
  name: '二进制基础',
  language: '计算机基础',
  editor: 'text',
  available: true,
  practiceRequired: false,
  description: '从 bit、位权和进制转换开始，理解计算机为什么用 0 和 1 表示信息。',
  exerciseFactory: createBinaryExercises,
  lessons: [
    binaryLesson('overview', '01', '基础：bit、Byte 与 8 bit', '从原稿建立完整的 bit、Byte、进制与 8 bit 基础。', [
      { heading: '学习目标', body: '学完这一课，你应该能解释 bit 是什么、n 个 bit 能表示多少状态，并用自己的话说明电子计算机为什么适合采用二进制。' },
      { heading: '两种状态是一种工程选择', body: '真实电子信号会有噪声和波动。电路只区分低电平与高电平时，可以留下更大的安全区间；晶体管也容易在导通与截止等状态之间工作。工程师把这些物理状态抽象为 0 和 1，再组合成逻辑门、寄存器和 CPU。' },
      { heading: '不要把写法当成数值', body: '10₂ 表示 2，而 10₁₀ 表示 10。下标或代码前缀告诉我们如何解释数字字符串；解释完成后，它们都表示一个普通整数。' },
    ], '物理状态 → 0 / 1 → 逻辑门 → 寄存器 → CPU\n10₂ = 2₁₀\nn 个 bit → 2ⁿ 种状态', { walkthrough: [{ code: '低电平 / 高电平', explanation: '电路先区分两种稳定的物理区域，而不是直接存储字符“0”和“1”。' }, { code: '0 / 1', explanation: '这是对两种物理状态的抽象编码。' }, { code: '2ⁿ', explanation: '每个 bit 都有两种选择，n 个独立位置的组合数就是 2ⁿ。' }], checkpoints: ['不看资料，用三句话解释“噪声为什么让二进制有优势”。', '列出 0、1、10、11、100，并在旁边写十进制值。', '说明 10₂ 为什么不是十。'], note: '“计算机只认识 0 和 1”是结果，不是完整原因；真正的起点是可靠的物理状态。', goals: ['解释 bit 与状态的关系', '推导 n 个 bit 的状态数量', '说清楚二进制的工程原因'] }),
    binaryLesson('place-value', '02', '计数与位权：1、2、4、8', '从计数规律推导二进制的位权。', [
      { heading: '进制的共同规则', body: 'b 进制使用 b 个基本数字，每向左移动一位，位权乘以 b。十进制的位权是 10⁰、10¹、10²；二进制的位权则是 2⁰、2¹、2²。' },
      { heading: '按位加权求和', body: '二进制 10110₂ 的位权从右到左是 1、2、4、8、16。只有写成 1 的位置贡献权值，所以 10110₂ = 16 + 4 + 2 = 22₁₀。' },
      { heading: '2 的幂很特别', body: '二进制中 2ⁿ 只有一个 1，后面跟 n 个 0：1000₂ = 8，10000₂ = 16。这个规律是估算和转换的快捷方式。' },
    ], '位：      1  0  1  1  0\n权值：   16  8  4  2  1\n结果：   16 + 4 + 2 = 22', { walkthrough: [{ code: '2⁰ = 1', explanation: '最右边一位表示 1，和十进制个位的 10⁰ 类似。' }, { code: '2¹、2²、2³…', explanation: '每向左一位，权值扩大 2 倍。' }, { code: '10110₂', explanation: '把值为 1 的位权相加，得到十进制数值。' }], checkpoints: ['手算 1101₂，并写出每一位权值。', '解释 100000₂ 为什么等于 32。', '自己写一个 6 位二进制数，并展开成位权之和。'], note: '位权是理解转换的核心；不要只背某几个结果。', goals: ['写出二进制位权', '按位展开二进制数', '使用 2 的幂快速估算'] }),
    binaryLesson('conversion', '03', '进制转换：双向都能手算', '掌握“拆成 2 的幂”和“除 2 取余”两条路线，把转换过程写出来。', [
      { heading: '二进制 → 十进制', body: '逐位乘以对应的 2 的幂再相加。例如 1101₂ = 1×8 + 1×4 + 0×2 + 1×1 = 13₁₀。' },
      { heading: '十进制 → 二进制', body: '方法一是拆成 2 的幂：13 = 8 + 4 + 1，所以是 1101₂。方法二是不断除以 2，记录余数，最后把余数倒序读出。' },
      { heading: '为什么除 2 取余有效', body: '任意整数 N 都能写成 N = 2q + r，余数 r 只能是 0 或 1，正好就是二进制的最低位；继续对商除 2，就能得到更高位。' },
    ], '13₁₀ ÷ 2：余 1\n 6₁₀ ÷ 2：余 0\n 3₁₀ ÷ 2：余 1\n 1₁₀ ÷ 2：余 1\n倒序读取：1101₂', { walkthrough: [{ code: '13 = 8 + 4 + 1', explanation: '选择不超过当前数的最大 2 的幂，再处理剩余部分。' }, { code: 'N = 2q + r', explanation: '除以 2 的余数决定当前最低位。' }, { code: '倒序读取余数', explanation: '第一次得到的是最低位，因此最终必须从最后一个余数向前读。' }], checkpoints: ['把 45₁₀ 转为二进制，并写出拆分过程。', '把 101101₂ 转为十进制，写出位权。', '用除 2 取余法验证一次自己的结果。'], note: '转换题最常见的错误不是算术，而是把余数顺序读反。', goals: ['完成二进制到十进制转换', '完成十进制到二进制转换', '解释除 2 取余法的原理'] }),
    binaryLesson('arithmetic', '04', '二进制加减法：进位与借位', '把熟悉的十进制竖式搬到二进制，只需要记住逢 2 进 1，以及从高位借来的 1 等于 10₂。', [
      { heading: '加法规则', body: '0+0=0，0+1=1，1+0=1，1+1=10₂。最后一条表示本位写 0，向左进 1；三个 1 相加时结果是 11₂。' },
      { heading: '减法规则', body: '0−0=0，1−0=1，1−1=0。遇到 0−1 时要从高位借 1，在当前位它变成 10₂，因此 10₂−1₂=1₂。' },
      { heading: '连续借位', body: '10000₂−1₂ 的结果是 01111₂。中间连续的 0 会把借来的 1 继续传递到右侧，这和十进制 10000−1=9999 的结构完全相同。' },
    ], '   1011\n + 0110\n ------\n  10001\n\n   10000\n - 00001\n ------\n   01111', { walkthrough: [{ code: '1 + 1 = 10₂', explanation: '二进制到 2 就要进位，本位只保留 0。' }, { code: '10₂ − 1₂ = 1₂', explanation: '借来的高位 1 在当前位提供了两个单位。' }, { code: '10000₂ − 1₂', explanation: '连续借位后，右侧四位都变成 1。' }], checkpoints: ['计算 1011₂ + 1101₂，并用十进制检查。', '计算 11010₂ − 1011₂。', '解释为什么 2ⁿ−1 的二进制是 n 个 1。'], note: '先对齐位数，再从右向左计算；十进制换算是很好的自检手段。', goals: ['完成二进制加法', '完成需要借位的二进制减法', '用十进制验证结果'] }),
    binaryLesson('bytes', '05', '为什么计算机使用二进制', '从噪声与晶体管的物理特性理解二进制。', [
      { heading: 'bit 与 Byte', body: 'bit 是 binary digit，一个 bit 只有 0 或 1 两种状态。Byte 是一组 bit；现代通用计算机通常约定 1 Byte = 8 bit。大小写很重要：b 常表示 bit，B 常表示 Byte。' },
      { heading: '8 bit 能表示什么', body: '8 bit 有 2⁸=256 种组合。若用于无符号整数并从 0 开始编号，范围是 0 到 255，最大值是 2⁸−1，而不是 256。' },
      { heading: 'Byte 不等于 CPU 字长', body: 'Byte 是数据组织和寻址常用的单位；CPU 字长描述处理器更适合处理的位宽，常见有 32 bit、64 bit。1 Byte=8 bit 并不意味着 CPU 一次只能处理 8 bit。' },
    ], '1 Byte = 8 bit\n8 bit → 2⁸ = 256 种状态\n无符号范围：0 ～ 255\nByte 大小 ≠ CPU 字长', { walkthrough: [{ code: 'b / B', explanation: '网络速率里的 Mbps 是 megabits；文件容量里的 MB 是 megabytes，不能只看字母数量。' }, { code: '2ⁿ 种状态', explanation: '状态数从 0 开始编号时，最大编号自然是 2ⁿ−1。' }, { code: '8 bit Byte / 64 bit CPU', explanation: '数据单位和处理宽度是两个不同维度。' }], checkpoints: ['写出 4 bit 的状态数量和无符号范围。', '解释 8 Mb 与 8 MB 的区别。', '说明为什么 CPU 是 64 bit 时，Byte 仍通常是 8 bit。'], note: '单位换算先看 b/B，再看上下文是容量、速率还是处理宽度。', goals: ['区分 bit 和 Byte', '计算 n bit 的无符号范围', '区分 Byte 与 CPU 字长'] }),
    binaryLesson('code', '06', '代码、系统与常见误区', '把二进制放进 C、Python、Linux 和实际系统语境中。', [
      { heading: '0b 是字面量前缀', body: '在 Python 以及许多现代编译器支持的 C 写法中，0b1010 表示按二进制解释后面的数字。10 和 0b1010 表示同一个整数，只是源码写法不同。' },
      { heading: 'bin() 返回什么', body: 'Python 的 bin(10) 返回字符串 0b1010。它是展示形式，不代表整数内部存在“十进制版”和“二进制版”两个版本。' },
      { heading: 'sizeof 与 bit 宽度', body: 'C 的 sizeof(x) 结果单位是 Byte。sizeof(char) 按语言定义为 1 个 C 字节；具体一个 C 字节包含多少 bit 要看实现，现代通用机器上通常是 8 bit。' },
    ], 'Python：\nx = 0b1010\nprint(x)       # 10\nprint(bin(x))  # 0b1010', { walkthrough: [{ code: '0b1010', explanation: '前缀告诉语言使用二进制字面量。' }, { code: 'print(x) → 10', explanation: '默认输出整数的十进制展示形式。' }, { code: 'bin(x) → 0b1010', explanation: 'bin() 返回带前缀的二进制字符串。' }], checkpoints: ['说明 Python 中 0b1111 的输出值。', '解释 10 与 0b1010 为什么不是两个不同的整数。', '看到 sizeof(x) 时，说出结果单位，并说明它不是 CPU 字长。'], note: '语言可以帮你隐藏存储细节，但理解二进制仍能帮助你读懂类型、范围和内存。', goals: ['读懂 0b 二进制字面量', '解释 bin() 的返回值', '理解 sizeof() 与 Byte 的关系'] }),
  ],
}
