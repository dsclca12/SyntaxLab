import type { Exercise, LearningModule, WalkthroughStep } from '../../core/types'
import hexadecimalSource from './source.md?raw'

const randomInt = (seed: number, min: number, max: number) => {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return Math.floor((raw - Math.floor(raw)) * (max - min + 1)) + min
}
const hex = (value: number) => value.toString(16).toUpperCase()
const binary = (value: number) => value.toString(2)
const decimalAnswer = (value: number, source: string) => {
  const normalized = source.toLowerCase().replace(/\s+/g, '').replace(/₁₀|10进制|十进制/g, '').replace(/[＝]/g, '=')
  return new RegExp(`(?:^|[^0-9a-z_.-])${value}(?:bit)?(?![0-9a-z_.])`, 'i').test(normalized)
}
const hexAnswer = (value: number, source: string) => {
  const expected = hex(value).toLowerCase().replace(/^0+/, '') || '0'
  const normalized = source.toLowerCase().replace(/\s+/g, '').replace(/[＝]/g, '=')
  return new RegExp(`(?:^|=)(?:0x)?0*${expected}(?:₁₆|16进制|十六进制)?(?:$|[^0-9a-z])`, 'i').test(normalized)
}
const binaryAnswer = (value: number, source: string) => {
  const expected = binary(value)
  const normalized = source.toLowerCase().replace(/\s+/g, '').replace(/[＝]/g, '=')
  return new RegExp(`(?:^|=)(?:0b)?0*${expected}(?:₂|二进制)?(?:$|[^0-9a-z])`, 'i').test(normalized)
}
const answer = (id: string, title: string, prompt: string, starter: string, solution: string, hints: string[], validate: (source: string) => boolean, feedback: string): Exercise => ({
  id,
  kind: 'create',
  title,
  prompt,
  starter,
  solution,
  hints,
  feedback,
  validate: (_value, source) => validate(source),
})

export const createHexadecimalExercises = (lessonId: string, seed: number): Exercise[] => {
  const salt = seed * 19 + lessonId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

  if (lessonId === 'overview') {
    const digit = randomInt(salt, 10, 15)
    const digitName = hex(digit)
    return [
      answer(`hex-${lessonId}-${seed}-digit`, '识别十六进制数字', `十六进制数字 ${digitName} 表示十进制多少？`, `${digitName} = `, `${digit}`, ['A 到 F 依次表示 10 到 15。', `把 ${digitName} 当作一个十六进制位。`, `答案是 ${digit}。`], (source) => decimalAnswer(digit, source), 'A、B、C、D、E、F 不是普通字母，而是 10～15 的数字符号。'),
      answer(`hex-${lessonId}-${seed}-reason`, '解释为什么是十六进制', '用一句话说明为什么十六进制特别适合表示二进制数据。', '', '因为 16 = 2⁴，每个十六进制位正好对应 4 个二进制位。', ['必须提到 16 = 2⁴。', '再说明 1 个十六进制位对应 4 个 bit。', '可以补充“更紧凑”。'], (source) => /16\s*[=＝]\s*2\s*(\^|⁴|的4次方)|2\s*(\^|⁴|的4次方)\s*[=＝]\s*16/.test(source) && /4\s*(个)?\s*(?:二进制)?(bit|位)/i.test(source), '核心不是计算机内部使用十六进制，而是它能紧凑、无损地映射二进制。'),
    ]
  }

  if (lessonId === 'mapping') {
    const value = randomInt(salt, 16, 191)
    const binaryValue = randomInt(salt + 1, 16, 127)
    return [
      answer(`hex-${lessonId}-${seed}-binary-to-hex`, '二进制 → 十六进制', `把 ${binary(value)}₂ 转换成十六进制。`, `${binary(value)}₂ = 0x`, `0x${hex(value)}`, ['从右向左每 4 个 bit 分组。', '每组查 0000～1111 的映射表。', `答案是 0x${hex(value)}。`], (source) => hexAnswer(value, source), '直接按 4 bit 分组，不必先转成十进制。'),
      answer(`hex-${lessonId}-${seed}-hex-to-binary`, '十六进制 → 二进制', `把 0x${hex(binaryValue)} 转换成二进制。`, `0x${hex(binaryValue)} = `, `${binary(binaryValue)}`, ['每一个十六进制数字展开成 4 个 bit。', '不足 4 位时，左侧补 0。', `答案是 ${binary(binaryValue)}。`], (source) => binaryAnswer(binaryValue, source), '例如 A 要展开为 1010，F 要展开为 1111。'),
    ]
  }

  if (lessonId === 'place-value') {
    const value = randomInt(salt, 0x12, 0x2ff)
    const power = randomInt(salt + 1, 1, 4)
    return [
      answer(`hex-${lessonId}-${seed}-decimal`, '十六进制 → 十进制', `把 0x${hex(value)} 转换成十进制。`, `0x${hex(value)} = `, `${value}`, ['从右向左使用 16⁰、16¹、16²……。', 'A～F 先换成 10～15。', `结果是 ${value}。`], (source) => decimalAnswer(value, source), '十六进制的每一位权值按 16 的幂增长。'),
      answer(`hex-${lessonId}-${seed}-power`, '认识十六进制位权', `16^${power} 等于多少？`, `16^${power} = `, `${16 ** power}`, ['16⁰=1，16¹=16，16²=256。', `继续乘以 16 ${power} 次。`, `答案是 ${16 ** power}。`], (source) => decimalAnswer(16 ** power, source), '常见位权是 1、16、256、4096、65536。'),
    ]
  }

  if (lessonId === 'bytes') {
    const byte = randomInt(salt, 0, 255)
    const color = [randomInt(salt + 1, 0, 255), randomInt(salt + 2, 0, 255), randomInt(salt + 3, 0, 255)]
    return [
      answer(`hex-${lessonId}-${seed}-byte`, '读懂一个字节', `0x${hex(byte).padStart(2, '0')} 的十进制值是多少？`, `0x${hex(byte).padStart(2, '0')} = `, `${byte}`, ['两个十六进制位通常描述一个字节。', '高位乘以 16，再加低位。', `答案是 ${byte}。`], (source) => decimalAnswer(byte, source), '1 个十六进制位是 4 bit，2 个十六进制位才是 1 Byte。'),
      answer(`hex-${lessonId}-${seed}-rgb`, '拆解 RGB 颜色', `颜色 #${color.map((part) => hex(part).padStart(2, '0')).join('')} 中，蓝色通道的十进制值是多少？`, `#${color.map((part) => hex(part).padStart(2, '0')).join('')}：B = `, `${color[2]}`, ['颜色按 RR、GG、BB 三组拆开。', `蓝色是 ${hex(color[2]).padStart(2, '0')}。`, `答案是 ${color[2]}。`], (source) => decimalAnswer(color[2], source), '一个 RGB 通道通常占 1 Byte，范围是 0～255。'),
    ]
  }

  if (lessonId === 'notation') {
    const value = randomInt(salt, 1, 255)
    return [
      answer(`hex-${lessonId}-${seed}-prefix`, '解释 0x 前缀', `在表达式 x = 0x${hex(value)} 中，x 的十进制值是多少？`, `x = 0x${hex(value)}\n输出：`, `${value}`, ['0x 告诉语言按十六进制解析。', `0x${hex(value)} 与十进制 ${value} 表示同一个整数。`, `输出是 ${value}。`], (source) => decimalAnswer(value, source), '0x 是写法提示，不是存储在整数里的字符。'),
      answer(`hex-${lessonId}-${seed}-width`, '判断位宽', `0x${'F'.repeat(2 + (salt % 3))} 的完整十六进制表示包含多少个 bit？`, `位宽 = `, `${(2 + (salt % 3)) * 4} bit`, ['数十六进制位的个数。', '每位对应 4 bit。', `答案是 ${(2 + (salt % 3)) * 4} bit。`], (source) => decimalAnswer((2 + (salt % 3)) * 4, source) && /bit|位/i.test(source), '位宽按十六进制位数 × 4 计算。'),
    ]
  }

  const value = randomInt(salt, 0, 255)
  return [
    answer(`hex-${lessonId}-${seed}-signed`, '区分数值与位模式', '为什么 0x80 作为数值是 128，但同样的 8 位模式按 int8_t 解释可能是 -128？', '', '0x80 是数值的十六进制写法；10000000 是位模式，最终含义还取决于位宽和有符号补码规则。', ['先说 0x80 的无符号数值。', '再指出 8 位有符号补码使用了最高位作为符号信息。', '强调表示形式和解释规则不同。'], (source) => /128/.test(source) && /位模式|补码|int8|有符号/.test(source), '永远分开看数值、表示形式、位模式和数据类型。'),
    answer(`hex-${lessonId}-${seed}-code`, '读懂代码中的十六进制', `C/Python 中写出一个能表示十进制 ${value} 的十六进制整数常量。`, '常量：', `0x${hex(value)}`, ['十六进制整数常量使用 0x 前缀。', `把 ${value} 转换成十六进制。`, `答案示例：0x${hex(value)}。`], (source) => hexAnswer(value, source), '代码中的 0x 只是告诉解析器如何读取后面的数字。'),
  ]
}

type HexLessonOptions = { walkthrough: WalkthroughStep[]; checkpoints: string[]; note: string; goals: string[] }
const between = (start: string, end?: string) => {
  const from = hexadecimalSource.indexOf(start)
  const to = end ? hexadecimalSource.indexOf(end, from) : hexadecimalSource.length
  return hexadecimalSource.slice(from, to === -1 ? hexadecimalSource.length : to).trim()
}
const hexadecimalContent: Record<string, string> = {
  overview: between('## 1. 学习目标', '# 5. 为什么十六进制和二进制关系特别密切'),
  mapping: between('# 5. 为什么十六进制和二进制关系特别密切', '# 12. 三个必须形成条件反射的值'),
  'place-value': between('# 12. 三个必须形成条件反射的值', '# 16. 为什么地址经常用十六进制'),
  bytes: between('# 16. 为什么地址经常用十六进制', '# 23. C 中如何体现'),
  notation: `${between('# 23. C 中如何体现', '# 29. 自测题')}\n\n${between('# 31. 一页速查表')}`,
}
const hexLesson = (id: string, number: string, title: string, summary: string, sections: { heading: string; body: string }[], example: string, options: HexLessonOptions): LearningModule['lessons'][number] => ({
  id, number, title, eyebrow: 'HEXADECIMAL', summary, sections, example, content: hexadecimalContent[id], walkthrough: options.walkthrough, checkpoints: options.checkpoints, note: options.note, goals: options.goals, exercises: [],
})

export const hexadecimalModule: LearningModule = {
  id: 'hexadecimal',
  name: '十六进制',
  language: '计算机基础',
  editor: 'text',
  available: true,
  practiceRequired: false,
  description: '理解 0x、A～F 与 4 bit 分组，把二进制数据读成紧凑的人类表示。',
  exerciseFactory: createHexadecimalExercises,
  lessons: [
    hexLesson('overview', '01', '十六进制与位权', '完整建立十六进制的定义、符号和位权。', [
      { heading: '十六进制使用 16 个数字符号', body: '十六进制是以 16 为基数的位置计数系统，使用 0～9 和 A～F，其中 A=10、B=11、C=12、D=13、E=14、F=15。大小写通常不影响数值。' },
      { heading: '核心原因：16 = 2⁴', body: '4 个二进制位有 2⁴=16 种组合，正好可以和一个十六进制位一一对应。因此十六进制比二进制短很多，同时保留清晰的位边界。' },
      { heading: '计算机并不是用十六进制计算', body: '硬件最终处理二进制状态；十六进制主要是给人看的紧凑表示。地址、机器码、内存转储和位掩码使用它，是因为它能让二进制结构更容易阅读。' },
    ], 'A = 10    B = 11    C = 12    D = 13    E = 14    F = 15\n16 = 2⁴\n1 hex digit = 4 bits', { walkthrough: [{ code: '0～9、A～F', explanation: '16 个符号覆盖 0 到 15；F 本质上就是数值 15。' }, { code: '16 = 2⁴', explanation: '4 个 bit 的 16 种组合与一个十六进制位完全匹配。' }, { code: '0xFF', explanation: 'FF 是两个十六进制位，也就是 8 个 bit，展开后是 11111111。' }], checkpoints: ['不用查表说出 A、D、F 的十进制值。', '用自己的话解释为什么 CPU 使用二进制而人们常写十六进制。', '说明一个十六进制位和一个 Byte 的关系。'], note: '不要把“计算机内部使用十六进制”当成准确表述；十六进制是人类阅读二进制的工具。', goals: ['说出 A～F 的数值', '解释 16 = 2⁴ 的意义', '区分数值、表示形式和位模式'] }),
    hexLesson('mapping', '02', '二进制 ↔ 十六进制', '掌握最有价值的技巧：从右向左每 4 bit 分组，双向直接替换。', [
      { heading: '二进制转十六进制', body: '从右向左每 4 个 bit 分成一组，左侧不足 4 位时补 0，然后查 0000～1111 的映射表。例如 1010 1101₂ = 0xAD。' },
      { heading: '十六进制转二进制', body: '每一个十六进制数字展开成 4 个 bit：3→0011，A→1010，F→1111。因此 0x3F = 0011 1111₂。' },
      { heading: '一字节正好是两位十六进制', body: '1 Byte 通常是 8 bit，而 1 个十六进制位是 4 bit，所以 2 个十六进制位正好描述 1 个 Byte，范围是 00～FF。' },
    ], '二进制：1010 1101\n十六进制： A    D\n结果：0xAD', { walkthrough: [{ code: '101101₂ → 0010 1101', explanation: '从右向左分组，左边不足 4 位补 0。' }, { code: '0010 → 2，1101 → D', explanation: '每组直接查映射表，无需绕道十进制。' }, { code: '0xAD → 1010 1101', explanation: '反向时每个十六进制位固定展开为 4 位。' }], checkpoints: ['转换 1111 0000₂ 和 0x7F。', '说明为什么前导 0 不改变整数值。', '熟记 0000～1111 与 0～F 的映射。'], note: '二进制和十六进制互转时优先按 4 位分组，不要先转十进制。', goals: ['完成二进制到十六进制转换', '完成十六进制到二进制转换', '理解十六进制位与 Byte 的关系'] }),
    hexLesson('place-value', '03', '高频值、前缀与位模式', '理解 0x、常用值、表示形式与实际位模式。', [
      { heading: '位权仍然从右到左增长', body: '十六进制的位权是 16⁰、16¹、16²……。例如 0x2F = 2×16 + 15 = 47。' },
      { heading: '高频位权', body: '16⁰=1、16¹=16、16²=256、16³=4096、16⁴=65536。于是 0x10=16，0x100=256，0x1000=4096。' },
      { heading: '不要把书写方式当成数字本身', body: '0xFF、255 和 11111111₂ 可以表示同一个数学数值 255。0x 只是提示后面的字符按十六进制解释，不会作为额外字符存进整数。' },
    ], '0x2F = 2 × 16¹ + 15 × 16⁰\n     = 32 + 15\n     = 47', { walkthrough: [{ code: '0x10', explanation: '1×16 + 0 = 16，不是十进制的 10。' }, { code: '0xFF', explanation: '15×16 + 15 = 255。' }, { code: '0x100', explanation: '1×16² = 256；每多一个十六进制位，位权乘以 16。' }], checkpoints: ['手算 0x20、0x7F、0x80、0x100。', '解释 0x 前缀的作用，以及它不是什么。', '区分 0x80 这个数值和 10000000 这个位模式。'], note: '见到 0x10、0x100、0x1000 时，优先联想到 16、256、4096。', goals: ['使用 16 的幂展开十六进制', '快速判断常见十六进制值', '解释 0x 前缀'] }),
    hexLesson('bytes', '04', '地址、机器码、颜色与综合例子', '用原稿中的真实场景和综合例子建立联系。', [
      { heading: '地址和机器码', body: '一个长地址或机器码用二进制写会很难读；按 4 bit 压缩后，0x7FFD2000、DE AD BE EF 等形式更短，也仍然保留字节和位的边界。DE AD BE EF 只是 4 个字节，具体含义取决于上下文。' },
      { heading: 'RGB 颜色', body: '颜色 #RRGGBB 可以拆成三个字节。例如 #FF8000 = R:FF、G:80、B:00，也就是 255、128、0。# 是颜色语法，和代码中的 0x 前缀不是同一种语法。' },
      { heading: '一个数量关系', body: '1 hex digit = 4 bits；2 hex digits = 8 bits = 1 Byte；8 hex digits = 32 bits = 4 Bytes。这个关系能帮助你读懂 dump、协议和调试器输出。' },
    ], '地址：0x7FFD2000\n字节：DE AD BE EF\n颜色：#FF8000 → 255, 128, 0', { walkthrough: [{ code: '0x7FFD2000', explanation: '这是一个用十六进制展示的数，在某些上下文中可能是内存地址。' }, { code: 'DE AD BE EF', explanation: '每两位是一个字节；它们究竟是整数、指令还是文件内容要看上下文。' }, { code: '#FF8000', explanation: '按 RR、GG、BB 拆成三个 0～255 的通道值。' }], checkpoints: ['看到 0xFFFFFFFF 时说出它包含多少 bit 和 Byte。', '把 #FF8000 拆成 R、G、B 的十进制值。', '解释为什么地址通常不用二进制或十进制直接展示。'], note: '十六进制显示的是数据的表示形式；不要只凭外观猜测这些字节的语义。', goals: ['读懂常见地址和字节转储', '拆解 RGB 十六进制颜色', '换算十六进制位数与 bit/Byte'] }),
    hexLesson('notation', '05', '代码、系统与常见误区', '在 C、Python、Linux 中完整理解十六进制。', [
      { heading: 'C / Python 的 0x', body: 'C 和 Python 都支持类似 0xFF 的整数写法。它和 255 是同一个整数的不同表示；输出时使用 %d、%x 或 hex()，只是选择不同的展示方式。' },
      { heading: '同一位模式可以有不同解释', body: '0x80 作为普通数值是 128。若把 8 位模式 10000000 按 int8_t 的有符号补码规则解释，则是 -128。冲突不在十六进制，而在位宽与类型解释。' },
      { heading: '四个概念要分开', body: '阅读底层代码时分别问：这是数值、书写形式、位模式，还是某种数据类型对位模式的解释？这能避免把 0x80 一律理解成 -128。' },
    ], 'C：unsigned int x = 0xFF;\nprintf("%d", x);  // 255\nprintf("%x", x);  // ff\n\nPython：hex(255)  # 0xff', { walkthrough: [{ code: 'x = 0xFF', explanation: '源码中使用十六进制写法，变量保存的是整数 255。' }, { code: 'hex(255) → "0xff"', explanation: 'Python 返回带 0x 前缀的字符串展示。' }, { code: '0x80 / int8_t', explanation: '数值 128 与 8 位有符号补码的解释 -128 属于不同层次的问题。' }], checkpoints: ['说出 C 中 %x 与 %d 的区别。', '解释 Python 中 0xFF == 255 为什么为真。', '用自己的话区分数值、位模式、位宽和数据类型。'], note: '看到十六进制常量时，先确定位宽和类型，再判断它在程序中的实际含义。', goals: ['读懂 C/Python 中的十六进制写法', '理解十六进制输出格式', '区分位模式和有符号解释'] }),
  ],
}
