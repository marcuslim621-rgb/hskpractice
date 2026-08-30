/* ============================================================
   THEMATIC CATEGORIES - orthogonal to HSK level and part of speech.

   CATEGORIES     [id, display name, emoji]
   WORD_CATEGORY  hanzi -> category id

   Built from a hand-written HSK 3.0 Level-3 thematic grouping;
   words the source doc did not name were assigned individually.
   Keyed by hanzi and level-agnostic, so words the app bands
   outside level 3 are themed too. Coverage today is the level-3
   pool; other bands fill in as they are grouped.
   ============================================================ */
const CATEGORIES=[
["people","People & Relationships","👥"],
["body","Body & Health","🫀"],
["emotion","Emotions & Personality","🙂"],
["time","Time & Seasons","📅"],
["place","Places & Directions","🗺"],
["nature","Nature & Weather","🌳"],
["food","Food & Dining","🍜"],
["clothing","Clothing & Objects","👕"],
["home","Home & Chores","🏠"],
["school","School & Study","📚"],
["work","Work & Business","💼"],
["transport","Transport & Travel","🚆"],
["tech","Tech & Communication","📱"],
["sport","Sports & Leisure","⚽"],
["concept","Concepts & Common Verbs","💡"],
["grammar","Grammar & Measure Words","🔗"],
];

const WORD_CATEGORY={
/* People & Relationships - 25 */
"别人":"people","叔叔":"people","司机":"people","同事":"people","名人":"people","咱们":"people",
"大人":"people","夫妻":"people","女人":"people","女生":"people","姐妹":"people","客人":"people",
"校长":"people","游客":"people","爱人":"people","男人":"people","男生":"people","画家":"people",
"留学生":"people","病人":"people","经理":"people","老人":"people","运动员":"people","邻居":"people",
"阿姨":"people",
/* Body & Health - 25 */
"住院":"body","健康":"body","出院":"body","刷":"body","发烧":"body","嘴":"body",
"头发":"body","感冒":"body","检查":"body","洗澡":"body","渴":"body","牙":"body",
"牙刷":"body","瘦":"body","矮":"body","耳朵":"body","胖":"body","脚":"body",
"脸":"body","腿":"body","身高":"body","锻炼":"body","饱":"body","饿":"body",
"鼻子":"body",
/* Emotions & Personality - 27 */
"关心":"emotion","兴趣":"emotion","努力":"emotion","可爱":"emotion","哭":"emotion","喜爱":"emotion",
"奇怪":"emotion","安静":"emotion","害怕":"emotion","小心":"emotion","开心":"emotion","心里":"emotion",
"怕":"emotion","急":"emotion","感兴趣":"emotion","感到":"emotion","愿意":"emotion","担心":"emotion",
"放心":"emotion","满意":"emotion","热情":"emotion","生气":"emotion","相信":"emotion","着急":"emotion",
"聪明":"emotion","认真":"emotion","难过":"emotion",
/* Time & Seasons - 48 */
"一直":"time","不久":"time","久":"time","以前":"time","以后":"time","休假":"time",
"假期":"time","冬":"time","冬天":"time","刚":"time","刚刚":"time","刚才":"time",
"刻":"time","前天":"time","前年":"time","半天":"time","后天":"time","后年":"time",
"后来":"time","周末":"time","四季":"time","夏天":"time","好久":"time","季":"time",
"季节":"time","学期":"time","工作日":"time","常":"time","常常":"time","平时":"time",
"总":"time","总是":"time","放假":"time","新年":"time","春":"time","春天":"time",
"晚点":"time","最后":"time","最近":"time","有时候":"time","秋天":"time","突然":"time",
"终于":"time","节日":"time","过去":"time","过节":"time","迟到":"time","马上":"time",
/* Places & Directions - 47 */
"世界":"place","东":"place","东北":"place","东南":"place","东方":"place","中":"place",
"中间":"place","体育馆":"place","公园":"place","到处":"place","办公室":"place","动物园":"place",
"北":"place","北方":"place","南":"place","南方":"place","卫生间":"place","厨房":"place",
"园":"place","国家":"place","图书馆":"place","地方":"place","地点":"place","城市":"place",
"外地":"place","室":"place","宾馆":"place","小区":"place","屋子":"place","市":"place",
"房子":"place","方向":"place","来自":"place","校园":"place","花园":"place","街":"place",
"西":"place","西北":"place","西南":"place","西方":"place","超市":"place","路口":"place",
"路边":"place","身边":"place","附近":"place","面前":"place","马路":"place",
/* Nature & Weather - 20 */
"冰":"nature","凉快":"nature","刮":"nature","动物":"nature","大熊猫":"nature","太阳":"nature",
"山":"nature","开花":"nature","月亮":"nature","树":"nature","河":"nature","海":"nature",
"牛":"nature","环境":"nature","羊":"nature","草":"nature","草地":"nature","风":"nature",
"马":"nature","鸡":"nature",
/* Food & Dining - 21 */
"做客":"food","冰激凌":"food","勺子":"food","啤酒":"food","外卖":"food","尝":"food",
"新鲜":"food","方便面":"food","甜":"food","盘子":"food","矿泉水":"food","碗":"food",
"筷子":"food","糖":"food","菜单":"food","蛋糕":"food","西瓜":"food","请客":"food",
"酒":"food","饮料":"food","香蕉":"food",
/* Clothing & Objects - 12 */
"上衣":"clothing","伞":"clothing","包":"clothing","大衣":"clothing","瓶子":"clothing","短裤":"clothing",
"礼物":"clothing","箱子":"clothing","衬衫":"clothing","裙子":"clothing","雨衣":"clothing","鞋":"clothing",
/* Home & Chores - 15 */
"关":"home","冰箱":"home","干净":"home","打扫":"home","扫":"home","搬":"home",
"搬家":"home","楼梯":"home","沙发":"home","洗衣机":"home","灯":"home","电":"home",
"电梯":"home","空调":"home","脏":"home",
/* School & Study - 30 */
"了解":"school","作业":"school","初中":"school","历史":"school","句子":"school","复习":"school",
"外语":"school","字典":"school","年级":"school","懂得":"school","成绩":"school","放学":"school",
"数学":"school","明白":"school","清楚":"school","班":"school","班级":"school","留学":"school",
"笔记":"school","笔记本":"school","简单":"school","纸":"school","练":"school","练习":"school",
"词典":"school","语言":"school","课文":"school","课本":"school","铅笔":"school","黑板":"school",
/* Work & Business - 14 */
"会":"work","会议":"work","决定":"work","办":"work","办法":"work","参加":"work",
"完成":"work","帮助":"work","帮忙":"work","开会":"work","打算":"work","服务":"work",
"解决":"work","请假":"work",
/* Transport & Travel - 15 */
"出发":"transport","地图":"transport","地铁":"transport","护照":"transport","检票":"transport","汽车":"transport",
"离开":"transport","站":"transport","红绿灯":"transport","自行车":"transport","船":"transport","行李":"transport",
"起飞":"transport","骑":"transport","高铁":"transport",
/* Tech & Communication - 20 */
"信":"tech","信用卡":"tech","关机":"tech","卡":"tech","号码":"tech","开机":"tech",
"拍照":"tech","新闻":"tech","照":"tech","照片":"tech","照相":"tech","电子书":"tech",
"电子邮件":"tech","相机":"tech","网站":"tech","耳机":"tech","邮件":"tech","邮箱":"tech",
"银行":"tech","银行卡":"tech",
/* Sports & Leisure - 19 */
"体育":"sport","得分":"sport","故事":"sport","晚会":"sport","比赛":"sport","游戏":"sport",
"爬":"sport","爱好":"sport","球场":"sport","网球":"sport","羽毛球":"sport","聊":"sport",
"聊天儿":"sport","节目":"sport","表演":"sport","见面":"sport","跳":"sport","运动会":"sport",
"音乐":"sport",
/* Concepts & Common Verbs - 100 */
"一样":"concept","一般":"concept","不同":"concept","不见":"concept","丢":"concept","主要":"concept",
"习惯":"concept","以上":"concept","以下":"concept","以为":"concept","以外":"concept","借":"concept",
"像":"concept","关注":"concept","关系":"concept","其实":"concept","养":"concept","出现":"concept",
"出生":"concept","分开":"concept","加":"concept","发":"concept","发展":"concept","发现":"concept",
"发生":"concept","受":"concept","受到":"concept","变":"concept","变化":"concept","变成":"concept",
"合适":"concept","同意":"concept","名单":"concept","向":"concept","听说":"concept","回答":"concept",
"坚持":"concept","声":"concept","声音":"concept","大小":"concept","安全":"concept","容易":"concept",
"对话":"concept","差":"concept","差不多":"concept","带":"concept","常用":"concept","常见":"concept",
"干":"concept","年轻":"concept","影响":"concept","得到":"concept","忘记":"concept","换":"concept",
"接":"concept","提高":"concept","收":"concept","收到":"concept","放":"concept","文化":"concept",
"方便":"concept","方法":"concept","旧":"concept","有名":"concept","有用":"concept","机会":"concept",
"查":"concept","欢迎":"concept","水平":"concept","注意":"concept","照顾":"concept","生活":"concept",
"用":"concept","短":"concept","经过":"concept","结婚":"concept","结束":"concept","老":"concept",
"蓝":"concept","行":"concept","要求":"concept","认为":"concept","认得":"concept","记":"concept",
"讲":"concept","试":"concept","起":"concept","还":"concept","选":"concept","选择":"concept",
"遇到":"concept","遇见":"concept","重要":"concept","长":"concept","难":"concept","难听":"concept",
"难看":"concept","难题":"concept","需要":"concept","黄色":"concept",
/* Grammar & Measure Words - 75 */
"一共":"grammar","一块儿":"grammar","一定":"grammar","一边":"grammar","不但":"grammar","不用":"grammar",
"不行":"grammar","为":"grammar","为了":"grammar","先":"grammar","公斤":"grammar","关于":"grammar",
"其他":"grammar","几乎":"grammar","别的":"grammar","半":"grammar","又":"grammar","双":"grammar",
"句":"grammar","只":"grammar","只是":"grammar","只有":"grammar","只能":"grammar","只要":"grammar",
"可":"grammar","可是":"grammar","员":"grammar","地":"grammar","大概":"grammar","好像":"grammar",
"好多":"grammar","如果":"grammar","子":"grammar","封":"grammar","层":"grammar","应该":"grammar",
"张":"grammar","当然":"grammar","得":"grammar","必须":"grammar","怎么办":"grammar","怎样":"grammar",
"或":"grammar","或者":"grammar","才":"grammar","把":"grammar","挺":"grammar","斤":"grammar",
"更":"grammar","最好":"grammar","有一点儿":"grammar","有关":"grammar","极":"grammar","根据":"grammar",
"段":"grammar","比如":"grammar","比较":"grammar","毛":"grammar","然后":"grammar","特别":"grammar",
"的话":"grammar","直到":"grammar","看来":"grammar","种":"grammar","米":"grammar","而且":"grammar",
"节":"grammar","被":"grammar","角":"grammar","该":"grammar","越":"grammar","辆":"grammar",
"遍":"grammar","除了":"grammar","页":"grammar",
};

/* words -> category id, for a word tuple from WORDS/WORDS_V2 */
function categoryOf(w){return WORD_CATEGORY[w[0]]||null}
const CATEGORY_NAME=Object.fromEntries(CATEGORIES.map(c=>[c[0],c[1]]));
const CATEGORY_EMOJI=Object.fromEntries(CATEGORIES.map(c=>[c[0],c[2]]));
