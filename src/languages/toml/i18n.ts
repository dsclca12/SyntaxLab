import type { WalkthroughStep } from '../../core/types'

export interface ChineseExerciseCopy { title: string; prompt: string; hints: string[] }
export interface ChineseLessonCopy {
  sections: { heading: string; body: string }[]
  example?: string
  walkthrough?: WalkthroughStep[]
  note?: string
  goals?: string[]
  checkpoints?: string[]
  exercises: Record<string, ChineseExerciseCopy>
}

const h = (title: string, prompt: string, hints: string[]): ChineseExerciseCopy => ({ title, prompt, hints })
const lesson = (
  sections: { heading: string; body: string }[],
  example: string,
  exercises: Record<string, ChineseExerciseCopy>,
  note?: string,
  walkthrough?: WalkthroughStep[],
): ChineseLessonCopy => ({ sections, example, exercises, note, walkthrough })

const tomlChineseBase: Record<string, ChineseLessonCopy> = {
  intro: lesson([
    { heading: '为什么是 TOML？', body: 'TOML 是 Tom 的明显、极简语言，专门为人类读写而设计，同时让程序可以精确解析。它描述的是设置和数据，不负责执行流程。' },
    { heading: '你会在哪里见到它', body: '项目元数据、构建工具和应用设置经常使用 TOML。Python 项目使用 pyproject.toml，Rust 项目使用 Cargo.toml。' },
  ], '# 项目名称\nname = "demo"\n\n# 项目版本\nversion = "1.0.0"', {
    'intro-1': h('第一个配置', '创建一个名为 demo 的项目。', ['先确定键名是 name。', '项目名是文本，需要双引号。', '先写一条设置，再检查解析结果。']),
    'intro-2': h('修复配置', '修复缺少引号的问题。', ['文本值需要成对的引号。', '裸单词不是合法的 TOML 值。', '只修复值的写法，不要改键名。']),
  }, 'TOML 是配置格式，不是通用编程语言。', [
    { code: 'name = "demo"', explanation: '左边是键名，右边是字符串值；引号告诉解析器这是文本。' },
    { code: '# 项目名称', explanation: '# 后面的内容是给人看的注释，不会出现在解析结果中。' },
  ]),
  'key-value': lesson([
    { heading: '赋值的形状', body: '键用来识别设置，等号把键和值分开。等号两边的空格是可选的，但保留空格更容易阅读。' },
    { heading: '注释', body: '# 会开始一条注释，直到当前行结束。注释用于解释意图，不会进入解析后的数据。' },
  ], '# 服务是否启用\nenabled = true\n\n# 服务名称\nname = "api"', {
    'kv-1': h('启用服务', '设置 enabled = true。', ['这是一个布尔值。', '布尔值不需要引号。', '值必须是小写的 true。']),
    'kv-2': h('修复键和值', '修复分隔符和字符串值。', ['TOML 使用 =，不是 :。', 'api 是字符串，所以需要引号。', '保持一行一个键值对。']),
  }),
  types: lesson([
    { heading: '一组清晰的类型', body: '字符串、整数、小数、布尔值、日期和时间都是不同的值。这让读取配置的程序行为更加可预测。' },
    { heading: '观察值的写法', body: '引号表示文本，小数点表示浮点数，true 和 false 是布尔值，而不是字符串。不要只看“长得像什么”，要判断程序需要的类型。' },
  ], '# 应用名称是文本\ntitle = "SyntaxLab"\n# count 是整数，ratio 是小数\ncount = 12\nratio = 0.75\nactive = true', {
    'types-1': h('混合使用类型', '创建 count = 3 和 ratio = 1.5。', ['整数没有小数点。', '小数点后的值是浮点数。', '不要给数字加引号。']),
    'types-2': h('修复布尔值', '让 active 成为布尔值，而不是文本。', ['移除引号。', '布尔字面量使用小写。', '解析后的值应该是 true，而不是字符串 "true"。']),
  }),
  string: lesson([
    { heading: '基本字符串和字面字符串', body: '基本字符串使用双引号，并支持 \\n 等转义。字面字符串使用单引号，可以让反斜杠保持原样。' },
    { heading: '多行字符串', body: '三重引号可以容纳跨行文本，适合描述信息或嵌入代码片段。先掌握成对引号，再尝试多行写法。' },
  ], '# 双引号字符串支持转义\nname = "hello"\n# 单引号字符串会保留反斜杠\npath = \'C:\\\\temp\'\n# 三重引号可以跨行\ndescription = """A\nshort note."""', {
    'str-1': h('写一句问候', '创建 greeting = "hello"。', ['这是一个字符串。', '使用双引号包住 hello。', '不要忘记键和值之间的等号。']),
    'str-2': h('修复字符串', '修复没有结束引号的字符串。', ['基本字符串需要开头和结尾两个双引号。', '让 hello 保持在引号内。', '先补引号，再检查整行是否仍是一个值。']),
  }),
  number: lesson([
    { heading: '数字是值', body: '整数没有小数点，浮点数有小数点。数字可以使用 + 或 - 符号，也可以用下划线作为视觉分隔。' },
    { heading: '保持含义不变', body: '1_000 与 1000 是同一个数字。加上引号会把数字变成文本，工具的处理方式也会随之改变。' },
  ], '# 并发数量是整数\nworkers = 4\n# 超时可以是小数\ntimeout = 2.5\n# 下划线只为阅读服务\nbudget = 1_000', {
    'num-1': h('设置端口', '创建 port = 8080。', ['端口是整数。', '不要添加引号。', '键和值之间使用等号。']),
    'num-2': h('修复数字', '让 timeout 成为数字。', ['移除数字两边的引号。', '带小数点的是浮点数。', '期望值是 2.5。']),
  }),
  boolean: lesson([
    { heading: '只有两个值', body: 'TOML 的布尔值是 true 和 false。它们必须使用小写，并且不能放在引号中。布尔值适合表达“是否启用”这类判断。' },
  ], '# 功能开关\nenabled = true\ndebug = false', {
    'bool-1': h('打开功能', '设置 enabled = true。', ['这是开关值。', '移除引号。', '使用小写 true。']),
    'bool-2': h('修复 debug', '让 debug 成为布尔值 false。', ['移除引号。', '使用小写 false。', '不要把布尔值写成字符串。']),
  }),
  array: lesson([
    { heading: '一个有序列表', body: '数组使用方括号和逗号。数组可以跨多行，也可以包含字符串、数字或嵌套数组。数组的顺序会保留。' },
    { heading: '类型要保持一致', body: '让数组中的项目保持兼容。端口列表应该包含数字，主机列表应该包含字符串；不要因为值看起来相似就混合类型。' },
  ], '# 端口按书写顺序保存\nports = [80, 443, 8080]\n\n# 长数组可以换行\nhosts = [\n  "api.example.com",\n  "cdn.example.com"\n]', {
    'arr-1': h('列出端口', '创建包含 80 和 443 的 ports 数组。', ['数组使用方括号。', '项目之间用逗号分隔。', '两个端口都是数字，不要加引号。']),
    'arr-2': h('修复数组', '修复缺少结束方括号的问题。', ['数组以 [ 开始，以 ] 结束。', '项目之间需要逗号。', '确认解析后的值是列表。']),
  }),
  table: lesson([
    { heading: '表是一个命名空间', body: '[server] 这样的表头会打开一个命名空间。之后的键属于 server，直到声明另一个表。' },
    { heading: '为什么需要表', body: '表可以把扁平设置组织成有意义的树。解析结果会是 { server: { ... } }，与应用理解配置的方式一致。' },
  ], '# 服务器配置表\n[server]\nhost = "127.0.0.1"\nport = 8080', {
    'table-1': h('创建服务器', '创建一个 [server] 表，并设置 port = 8080。', ['表头放在方括号中。', '把 port 写在表头之后。', 'port 是整数。']),
    'table-2': h('修复表', '修复表头。', ['表头需要左右两个方括号。', '键值写在表头之后。', 'localhost 是字符串，需要引号。']),
  }),
  nested: lesson([
    { heading: '点号路径', body: '[database.primary] 会创建 database，再在其中创建 primary。这是表达嵌套对象的简洁方式。点号表达层级，不是分隔两个无关的表。' },
  ], '# 主数据库位于 database.primary\n[database.primary]\nhost = "localhost"\nport = 5432', {
    'nested-1': h('连接数据库', '创建 [database.primary]，并设置 port = 5432。', ['嵌套表使用点号。', '表头需要完整写出。', 'port 是整数。']),
    'nested-2': h('修复路径', '修复嵌套表头。', ['嵌套表名使用点号。', '不要在表头中使用逗号。', '结果应该有两层对象。']),
  }),
  'array-table': lesson([
    { heading: '对象列表', body: '[[servers]] 会在数组中开始一张表。重复这个表头，就会向同一个列表添加另一个对象。' },
    { heading: '把它看成记录', body: '服务器、用户或插件都可以用这种结构表示：每个重复的代码块描述一个形状相同的项目。' },
  ], '# 每个双中括号块都是一条服务器记录\n[[servers]]\nname = "server-a"\nip = "10.0.0.1"\n\n[[servers]]\nname = "server-b"\nip = "10.0.0.2"', {
    'aot-1': h('添加两台服务器', '创建两个名称分别为 a 和 b 的服务器。', ['使用双层方括号。', '第二条记录重复同一个表头。', '解析后的值应该是数组。']),
    'aot-2': h('修复记录', '把第二张表改成 servers 数组中的另一个项目。', ['两个代码块都是列表项目。', '两次使用 [[servers]]。', '单层方括号创建的是对象，不是列表。']),
  }),
  inline: lesson([
    { heading: '紧凑对象', body: '内联表使用花括号和逗号分隔的键值对，适合小型、独立的结构。它通常应该保持在一行，不要把它当作普通代码块。' },
  ], '# 一个小对象可以写在同一行\npoint = { x = 1, y = 2 }', {
    'inline-1': h('创建坐标点', '创建 point，其中 x = 1、y = 2。', ['内联表使用花括号。', '字段之间用逗号分隔。', 'x 和 y 都是数字。']),
    'inline-2': h('修复内联表', '补上缺少的结束花括号。', ['内联表以 { 开始，以 } 结束。', '字段之间需要逗号。', '保持 x 和 y 为数字。']),
  }),
  datetime: lesson([
    { heading: '四种时间类型', body: 'TOML 支持带时区的日期时间、本地日期时间、本地日期和本地时间。不同解析器对本地日期的支持细节可能不同；本练习使用带时区的完整日期时间，便于在浏览器中观察稳定结果。' },
    { heading: '先区分时间点和文本', body: '不加引号时，解析器会把符合 TOML 日期时间语法的值当作时间类型；加引号则只是文本。生产项目还要明确时区和序列化方式。' },
  ], '# 使用 UTC 时间点，末尾的 Z 表示零时区\npublished = 1979-05-27T07:32:00Z\n# 日期时间也可以用于生日记录\nbirthday = 1990-01-01T00:00:00Z', {
    'date-1': h('添加时间点', '创建 birthday = 1990-01-01T00:00:00Z。', ['这是 TOML 的日期时间值。', '不要加引号。', '按年-月-日 T 时:分:秒 Z 书写。']),
    'date-2': h('修复时间类型', '移除日期时间两边的引号。', ['带引号时它只是字符串。', '移除引号并保留完整时间。', '末尾的 Z 表示 UTC。']),
  }, '本应用使用的 TOML 解析器把日期时间解析为 Date；如果换用别的库，请以该库的文档和序列化结果为准。'),
  style: lesson([
    { heading: '注释解释原因', body: '用注释记录背景、取舍和安全默认值。不要只重复键名本身；好的注释解释“为什么这样设”。' },
    { heading: '保持格式一致', body: '等号两边留空格，把相关键放在一起，并按照合理顺序排列表。格式是给人看的，不会改变解析后的数据。' },
  ], '# 公共 HTTP 端口\nport = 8080\n\n# 本地调试时保持关闭\ndebug = false', {
    'style-1': h('添加有意义的注释', '创建 port = 8080，并为它写一句说明用途的注释。', ['注释以 # 开头。', '注释应该解释用途，而不是只重复 port。', '设置本身仍然需要合法的键和值。']),
  }),
  errors: lesson([
    { heading: '常见陷阱', body: '注意重复键、重复定义的表、未结束的字符串、数组的逗号或括号不完整以及缺少引号。遇到错误时先读解析器指出的位置，再只改一个问题。' },
    { heading: '格式容易混淆', body: 'TOML 使用等号和表头；YAML 常使用冒号；JSON 要求引号和花括号。它们看起来相似，但语法不能混用。' },
  ], '# 表头和字符串都要完整\n[server]\nhost = "localhost"\nport = 8080', {
    'err-1': h('修复字符串', '修复缺少引号的问题；表头已经正确。', ['字符串需要成对引号。', '不要修改已经正确的表头。', '保持 port 为数字。']),
    'err-2': h('修复重复键', '只保留一个值为 demo 的 name 键。', ['一个键只能定义一次。', '删除重复的那一行。', '最终值应该是 demo。']),
  }),
  pyproject: lesson([
    { heading: '项目元数据', body: 'pyproject.toml 为工具提供一个标准位置，用来发现项目名称、版本、描述和依赖。' },
    { heading: '工具配置', body: '[tool] 命名空间为不同工具提供独立的配置空间。脚本则把命令名映射到 Python 可调用对象。' },
  ], '# 项目元数据\n[project]\nname = "example"\nversion = "0.1.0"\ndescription = "Example project"\n\n# 命令名映射到 Python 可调用对象\n[project.scripts]\nexample = "example:main"', {
    'py-1': h('添加项目元数据', '创建 [project]，并设置 name 和 version。', ['先打开 project 表。', '添加两个字符串值。', '把示例当作结构参考，不必照抄描述。']),
    'py-2': h('修复脚本', '修复 project.scripts 中的脚本值。', ['可调用路径是文本。', '给 example:main 加引号。', '点号表头会创建嵌套表。']),
  }, '本课关注结构和基本思想，不展开所有打包细节。'),
}

const chineseStudy: Record<string, { goals: string[]; checkpoints: string[] }> = {
  intro: { goals: ['说清 TOML 适合解决什么问题，以及它不负责什么', '写出合法的键值对，并区分数据和注释'], checkpoints: ['不看正文，解释配置格式为什么既要方便人读，也要方便程序精确解析。', '写两行项目配置，并指出解析器会忽略哪一部分。'] },
  'key-value': { goals: ['正确书写键、值、等号和注释', '解释注释为什么不会改变解析后的配置'], checkpoints: ['把一句自然语言设置翻译成键值对。', '预测带引号文本和未加引号布尔值的类型。'] },
  types: { goals: ['根据写法区分字符串、整数、小数和布尔值', '为具体设置选择合适的 TOML 类型'], checkpoints: ['不运行程序，判断五个值分别是什么类型。', '解释给 true 加引号后为什么含义变了。'] },
  string: { goals: ['为普通文本、路径和多行文本选择合适的字符串形式', '修复引号问题，并有意识地处理反斜杠'], checkpoints: ['写一个含反斜杠的路径，并说明选择哪种引号。', '解释转义引号为什么不会结束字符串。'] },
  number: { goals: ['正确书写整数、小数、正负号和数字分隔符', '预测解析器如何表示一个数字'], checkpoints: ['判断 8080、2.5、-10 和 1_000 的类型。', '解释把端口写成字符串会给程序带来什么不便。'] },
  boolean: { goals: ['使用 true 和 false 表达配置开关', '区分布尔值与字符串 "true" / "false"'], checkpoints: ['设计两个功能开关并写出默认行为。', '判断几组带引号和不带引号的值哪些是真布尔值。'] },
  array: { goals: ['写出有序数组并保持元素类型兼容', '解释何时列表比一组编号键更合适'], checkpoints: ['写三个端口并说明顺序是否重要。', '解释为什么 [80, "443"] 不是好的端口模型。'] },
  table: { goals: ['使用表头把相关设置归到同一命名空间', '预测表解析后形成的嵌套对象'], checkpoints: ['画出 server 表的解析结果。', '解释两个设置为什么应该分到不同的表。'] },
  nested: { goals: ['使用点号表头表达多层配置', '把点号路径读成层级，而不是一个扁平名字'], checkpoints: ['画出 database.primary 的对象树。', '写出同级的 primary 和 replica 表。'] },
  'array-table': { goals: ['用表数组表示重复记录', '区分单个对象表和重复对象列表'], checkpoints: ['画出两条 server 记录的解析结果。', '解释重复 [[servers]] 与重复 [servers] 的数据模型差异。'] },
  inline: { goals: ['用内联表写出小型对象', '判断内联表何时更清楚、何时应该改用命名表'], checkpoints: ['写出包含两个数字字段的 point。', '把一个拥挤的内联表改成命名表，并说明取舍。'] },
  datetime: { goals: ['区分原生日期时间值和带引号的字符串', '知道本应用解析器如何序列化日期时间'], checkpoints: ['指出完整日期时间中的时区标记。', '解释同一时刻为什么可能以不同本地时间显示。'] },
  style: { goals: ['写出能保留意图的注释', '在不改变数据的前提下保持格式和分组一致'], checkpoints: ['为一个不明显的默认值补充“为什么这样设”的注释。', '重新排版一小段配置，并确认数据含义没有变化。'] },
  errors: { goals: ['根据解析器反馈定位语法或结构错误', '区分 TOML 与相似的 YAML、JSON 写法'], checkpoints: ['把一个错误归类为引号、重复键、表头或数组问题。', '一次只修一个错误，并预测下一次解析结果。'] },
  pyproject: { goals: ['读懂 pyproject.toml 中 project 与 project.scripts 的层级', '解释 TOML 结构如何变成项目元数据'], checkpoints: ['画出 project.scripts 的解析结果。', '新增一个元数据字段，但不要破坏表的层级。'] },
}

export const tomlChinese: Record<string, ChineseLessonCopy> = Object.fromEntries(
  Object.entries(tomlChineseBase).map(([id, copy]) => [id, { ...copy, ...chineseStudy[id] }]),
) as Record<string, ChineseLessonCopy>
