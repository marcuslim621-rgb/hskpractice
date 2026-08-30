/* ============================================================
   THEMATIC CATEGORIES - orthogonal to HSK level and part of speech.

   CATEGORIES     [id, display name, emoji]            - 17 parents
   SUBCATEGORIES  [id, display name]                   - id is "parent.sub"
   WORD_CATEGORY  hanzi -> id

   A word maps to a subcategory id ("food.drinks") where it has been
   grouped, or to a bare parent id ("food") where only the parent is
   known - the level-3 pool carried over from the first hand-written
   grouping. Keyed by hanzi and level-agnostic, so a word is themed the
   same wherever the HSK bands place it.

   HSK bands 1 and 2 are fully subcategorised. Later bands fill in.
   ============================================================ */
const CATEGORIES=[
["people","People & Relationships","👥"],
["body","Body & Health","💪"],
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
["society","Society & Culture","🏛"],
["concept","Actions & Ideas","💡"],
["grammar","Grammar & Measure Words","🔗"],
];

const SUBCATEGORIES=[
["people.family","Family & relatives"],
["people.social","Friends & people"],
["people.roles","Jobs & roles"],
["people.address","Names & pronouns"],
["people.greetings","Greetings & politeness"],
["body.parts","Body parts"],
["body.senses","Senses & movement"],
["body.illness","Illness & symptoms"],
["body.medicine","Medicine & hospital"],
["emotion.feelings","Feelings"],
["emotion.traits","Character traits"],
["emotion.attitudes","Attitudes & opinions"],
["time.clock","Clock & calendar"],
["time.tense","Days & when"],
["time.frequency","How often & how soon"],
["time.seasons","Seasons & festivals"],
["place.direction","Directions & position"],
["place.city","Around town"],
["place.countries","Countries & languages"],
["place.geography","Geography"],
["nature.weather","Weather"],
["nature.animals","Animals"],
["nature.plants","Plants"],
["nature.landscape","Elements & sky"],
["food.ingredients","Ingredients"],
["food.dishes","Dishes & meals"],
["food.drinks","Drinks"],
["food.cooking","Cooking & taste"],
["food.restaurant","Eating out"],
["clothing.clothes","Clothes & accessories"],
["clothing.colours","Colours & materials"],
["clothing.objects","Everyday objects"],
["home.rooms","Rooms & furniture"],
["home.housework","Housework"],
["home.living","Living & renting"],
["school.life","School life"],
["school.subjects","Subjects & exams"],
["school.literacy","Reading & writing"],
["school.learning","Learning & knowing"],
["work.workplace","Jobs & workplace"],
["work.money","Money & banking"],
["work.trade","Buying & selling"],
["work.admin","Plans & admin"],
["transport.vehicles","Vehicles"],
["transport.traffic","Roads & traffic"],
["transport.travel","Travel & holidays"],
["transport.tickets","Tickets & stations"],
["tech.devices","Devices"],
["tech.internet","Internet & online"],
["tech.phone","Phone & messaging"],
["tech.media","Media & pictures"],
["sport.sports","Sports"],
["sport.games","Games & play"],
["sport.arts","Music & art"],
["sport.hobbies","Fun & hobbies"],
["society.civic","Law & society"],
["society.history","History & tradition"],
["society.customs","Customs & religion"],
["society.environment","People & environment"],
["concept.doing","Common actions"],
["concept.thinking","Thinking & speaking"],
["concept.change","Change & result"],
["concept.quantity","Quantity & degree"],
["concept.quality","Qualities & descriptions"],
["grammar.measure","Measure words"],
["grammar.particles","Particles & markers"],
["grammar.connectives","Connectives"],
["grammar.questions","Question words"],
];

const WORD_CATEGORY={
/* people.family - 19 */
"爸爸":"people.family","儿子":"people.family","家":"people.family","妈妈":"people.family","女儿":"people.family","弟弟":"people.family",
"哥哥":"people.family","姐姐":"people.family","妹妹":"people.family","妻子":"people.family","丈夫":"people.family","家人":"people.family",
"男朋友":"people.family","女朋友":"people.family","爱人":"people.family","家庭":"people.family","家长":"people.family","全家":"people.family",
"太太":"people.family",
/* people.social - 28 */
"朋友":"people.social","人":"people.social","认识":"people.social","同学":"people.social","大家":"people.social","孩子":"people.social",
"介绍":"people.social","男":"people.social","女":"people.social","男人":"people.social","女人":"people.social","病人":"people.social",
"老人":"people.social","男孩儿":"people.social","女孩儿":"people.social","网友":"people.social","小孩儿":"people.social","小朋友":"people.social",
"大人":"people.social","好人":"people.social","坏人":"people.social","交朋友":"people.social","老朋友":"people.social","青少年":"people.social",
"人们":"people.social","少年":"people.social","小组":"people.social","有人":"people.social",
/* people.roles - 23 */
"老师":"people.roles","学生":"people.roles","医生":"people.roles","服务员":"people.roles","大学生":"people.roles","工人":"people.roles",
"后":"people.roles","男生":"people.roles","女生":"people.roles","小学生":"people.roles","中学生":"people.roles","班长":"people.roles",
"队长":"people.roles","教师":"people.roles","留学生":"people.roles","旅客":"people.roles","商人":"people.roles","市长":"people.roles",
"游客":"people.roles","院长":"people.roles","主人":"people.roles","组长":"people.roles","作家":"people.roles",
/* people.address - 19 */
"名字":"people.address","你":"people.address","他":"people.address","她":"people.address","我":"people.address","我们":"people.address",
"先生":"people.address","小姐":"people.address","您":"people.address","姓":"people.address","你们":"people.address","他们":"people.address",
"她们":"people.address","名":"people.address","名称":"people.address","名单":"people.address","它们":"people.address","姓名":"people.address",
"咱":"people.address",
/* people.greetings - 13 */
"不客气":"people.greetings","对不起":"people.greetings","没关系":"people.greetings","请":"people.greetings","喂":"people.greetings","谢谢":"people.greetings",
"再见":"people.greetings","欢迎":"people.greetings","没什么":"people.greetings","请进":"people.greetings","请问":"people.greetings","请坐":"people.greetings",
"晚安":"people.greetings",
/* body.parts - 12 */
"身体":"body.parts","眼睛":"body.parts","毛":"body.parts","身上":"body.parts","手":"body.parts","举手":"body.parts",
"面":"body.parts","全身":"body.parts","身边":"body.parts","头":"body.parts","心里":"body.parts","眼":"body.parts",
/* body.senses - 28 */
"看":"body.senses","看见":"body.senses","睡觉":"body.senses","听":"body.senses","坐":"body.senses","跑步":"body.senses",
"休息":"body.senses","走":"body.senses","飞":"body.senses","见":"body.senses","看到":"body.senses","跑":"body.senses",
"睡":"body.senses","听到":"body.senses","听见":"body.senses","走路":"body.senses","坐下":"body.senses","点头":"body.senses",
"见到":"body.senses","碰":"body.senses","碰到":"body.senses","碰见":"body.senses","听说":"body.senses","闻":"body.senses",
"午睡":"body.senses","站住":"body.senses","走过":"body.senses","走开":"body.senses",
/* body.illness - 3 */
"累":"body.illness","生病":"body.illness","病":"body.illness",
/* body.medicine - 9 */
"医院":"body.medicine","药":"body.medicine","看病":"body.medicine","出院":"body.medicine","西医":"body.medicine","药片":"body.medicine",
"药水":"body.medicine","中医":"body.medicine","住院":"body.medicine",
/* emotion.feelings - 11 */
"爱":"emotion.feelings","高兴":"emotion.feelings","喜欢":"emotion.feelings","快乐":"emotion.feelings","笑":"emotion.feelings","不好意思":"emotion.feelings",
"不满":"emotion.feelings","感到":"emotion.feelings","开心":"emotion.feelings","可怕":"emotion.feelings","怕":"emotion.feelings",
/* emotion.traits - 2 */
"漂亮":"emotion.traits","难看":"emotion.traits",
/* emotion.attitudes - 2 */
"希望":"emotion.attitudes","想法":"emotion.attitudes",
/* time.clock - 18 */
"点":"time.clock","分钟":"time.clock","号":"time.clock","时候":"time.clock","中午":"time.clock","次":"time.clock",
"时间":"time.clock","小时":"time.clock","没事儿":"time.clock","日期":"time.clock","上次":"time.clock","下次":"time.clock",
"一下儿":"time.clock","半夜":"time.clock","那时候":"time.clock","日子":"time.clock","随时":"time.clock","有空儿":"time.clock",
/* time.tense - 46 */
"今天":"time.tense","明天":"time.tense","年":"time.tense","上午":"time.tense","岁":"time.tense","下午":"time.tense",
"现在":"time.tense","星期":"time.tense","月":"time.tense","昨天":"time.tense","去年":"time.tense","日":"time.tense",
"晚上":"time.tense","已经":"time.tense","早上":"time.tense","白天":"time.tense","半年":"time.tense","后天":"time.tense",
"今年":"time.tense","明年":"time.tense","前天":"time.tense","天":"time.tense","晚":"time.tense","星期日":"time.tense",
"星期天":"time.tense","早":"time.tense","不久":"time.tense","不一会儿":"time.tense","从小":"time.tense","今后":"time.tense",
"快要":"time.tense","老年":"time.tense","那会儿":"time.tense","前年":"time.tense","青年":"time.tense","全年":"time.tense",
"上周":"time.tense","下周":"time.tense","小时候":"time.tense","夜":"time.tense","夜里":"time.tense","一生":"time.tense",
"月份":"time.tense","早晨":"time.tense","这时候":"time.tense","中年":"time.tense",
/* time.frequency - 14 */
"还":"time.frequency","就":"time.frequency","再":"time.frequency","常":"time.frequency","常常":"time.frequency","有时候":"time.frequency",
"重":"time.frequency","重复":"time.frequency","好久":"time.frequency","急":"time.frequency","快点儿":"time.frequency","老是":"time.frequency",
"同时":"time.frequency","早就":"time.frequency",
/* time.seasons - 9 */
"生日":"time.seasons","新年":"time.seasons","春节":"time.seasons","春天":"time.seasons","冬天":"time.seasons","过年":"time.seasons",
"秋天":"time.seasons","夏天":"time.seasons","周年":"time.seasons",
/* place.direction - 57 */
"后面":"place.direction","里":"place.direction","那":"place.direction","前面":"place.direction","上":"place.direction","下":"place.direction",
"这":"place.direction","近":"place.direction","旁边":"place.direction","外":"place.direction","右边":"place.direction","远":"place.direction",
"左边":"place.direction","北":"place.direction","北边":"place.direction","东边":"place.direction","后边":"place.direction","里边":"place.direction",
"楼上":"place.direction","楼下":"place.direction","那边":"place.direction","那里":"place.direction","那儿":"place.direction","那些":"place.direction",
"南边":"place.direction","前":"place.direction","前边":"place.direction","上边":"place.direction","外边":"place.direction","西边":"place.direction",
"下边":"place.direction","右":"place.direction","这边":"place.direction","这里":"place.direction","这儿":"place.direction","这些":"place.direction",
"中":"place.direction","左":"place.direction","边":"place.direction","东北":"place.direction","东方":"place.direction","东南":"place.direction",
"里头":"place.direction","面前":"place.direction","那样":"place.direction","南方":"place.direction","问路":"place.direction","西北":"place.direction",
"西方":"place.direction","西南":"place.direction","以上":"place.direction","以外":"place.direction","以下":"place.direction","这样":"place.direction",
"中级":"place.direction","中小学":"place.direction","中心":"place.direction",
/* place.city - 30 */
"饭店":"place.city","商店":"place.city","宾馆":"place.city","火车站":"place.city","机场":"place.city","路":"place.city",
"车站":"place.city","打车":"place.city","地点":"place.city","电影院":"place.city","教学楼":"place.city","路口":"place.city",
"路上":"place.city","马路":"place.city","商场":"place.city","书店":"place.city","出口":"place.city","道":"place.city",
"道路":"place.city","地铁站":"place.city","店":"place.city","动物园":"place.city","公路":"place.city","广场":"place.city",
"街":"place.city","酒店":"place.city","路边":"place.city","市":"place.city","停车场":"place.city","药店":"place.city",
/* place.countries - 14 */
"北京":"place.countries","汉语":"place.countries","中国":"place.countries","国":"place.countries","国外":"place.countries","话":"place.countries",
"外国":"place.countries","外语":"place.countries","出国":"place.countries","回国":"place.countries","全国":"place.countries","外地":"place.countries",
"英文":"place.countries","英语":"place.countries",
/* place.geography - 7 */
"地上":"place.geography","山":"place.geography","大海":"place.geography","海":"place.geography","海边":"place.geography","湖":"place.geography",
"星星":"place.geography",
/* nature.weather - 17 */
"冷":"nature.weather","热":"nature.weather","天气":"nature.weather","下雨":"nature.weather","晴":"nature.weather","雪":"nature.weather",
"阴":"nature.weather","风":"nature.weather","雨":"nature.weather","吹":"nature.weather","多云":"nature.weather","凉":"nature.weather",
"零下":"nature.weather","气温":"nature.weather","晴天":"nature.weather","下雪":"nature.weather","阴天":"nature.weather",
/* nature.animals - 5 */
"狗":"nature.animals","猫":"nature.animals","鱼":"nature.animals","鸡":"nature.animals","养":"nature.animals",
/* nature.plants - 1 */
"草地":"nature.plants",
/* nature.landscape - 4 */
"水":"nature.landscape","大自然":"nature.landscape","气":"nature.landscape","天上":"nature.landscape",
/* food.ingredients - 14 */
"菜":"food.ingredients","米饭":"food.ingredients","苹果":"food.ingredients","水果":"food.ingredients","鸡蛋":"food.ingredients","面条":"food.ingredients",
"西瓜":"food.ingredients","羊肉":"food.ingredients","饭":"food.ingredients","面条儿":"food.ingredients","肉":"food.ingredients","蛋":"food.ingredients",
"方便面":"food.ingredients","油":"food.ingredients",
/* food.dishes - 13 */
"吃饭":"food.dishes","晚饭":"food.dishes","午饭":"food.dishes","早饭":"food.dishes","快餐":"food.dishes","食物":"food.dishes",
"外卖":"food.dishes","晚餐":"food.dishes","午餐":"food.dishes","西餐":"food.dishes","早餐":"food.dishes","中餐":"food.dishes",
"做饭":"food.dishes",
/* food.drinks - 6 */
"茶":"food.drinks","喝":"food.drinks","咖啡":"food.drinks","牛奶":"food.drinks","奶":"food.drinks","酒":"food.drinks",
/* food.cooking - 3 */
"吃":"food.cooking","好吃":"food.cooking","熟":"food.cooking",
/* food.restaurant - 3 */
"杯子":"food.restaurant","饭馆":"food.restaurant","瓶":"food.restaurant",
/* clothing.clothes - 5 */
"衣服":"clothing.clothes","穿":"clothing.clothes","大衣":"clothing.clothes","球鞋":"clothing.clothes","装":"clothing.clothes",
/* clothing.colours - 10 */
"白":"clothing.colours","黑":"clothing.colours","红":"clothing.colours","颜色":"clothing.colours","白色":"clothing.colours","黑色":"clothing.colours",
"红色":"clothing.colours","黄色":"clothing.colours","蓝色":"clothing.colours","绿色":"clothing.colours",
/* clothing.objects - 6 */
"东西":"clothing.objects","手表":"clothing.objects","钱包":"clothing.objects","事":"clothing.objects","表":"clothing.objects","纸":"clothing.objects",
/* home.rooms - 15 */
"椅子":"home.rooms","桌子":"home.rooms","房间":"home.rooms","门":"home.rooms","床":"home.rooms","房子":"home.rooms",
"关上":"home.rooms","回家":"home.rooms","家里":"home.rooms","门口":"home.rooms","在家":"home.rooms","出门":"home.rooms",
"大门":"home.rooms","院":"home.rooms","院子":"home.rooms",
/* home.housework - 1 */
"洗":"home.housework",
/* home.living - 3 */
"住":"home.living","出租":"home.living","住房":"home.living",
/* school.life - 17 */
"学校":"school.life","教室":"school.life","课":"school.life","大学":"school.life","放学":"school.life","上课":"school.life",
"上学":"school.life","书包":"school.life","下课":"school.life","小学":"school.life","学院":"school.life","中学":"school.life",
"高中":"school.life","开学":"school.life","课堂":"school.life","校园":"school.life","学期":"school.life",
/* school.subjects - 6 */
"考试":"school.subjects","考":"school.subjects","分数":"school.subjects","级":"school.subjects","考生":"school.subjects","科":"school.subjects",
/* school.literacy - 21 */
"读":"school.literacy","书":"school.literacy","写":"school.literacy","字":"school.literacy","报纸":"school.literacy","铅笔":"school.literacy",
"本子":"school.literacy","读书":"school.literacy","汉字":"school.literacy","记":"school.literacy","课本":"school.literacy","课文":"school.literacy",
"听写":"school.literacy","笔":"school.literacy","词":"school.literacy","读音":"school.literacy","日报":"school.literacy","生词":"school.literacy",
"晚报":"school.literacy","音节":"school.literacy","作文":"school.literacy",
/* school.learning - 17 */
"学习":"school.learning","懂":"school.learning","题":"school.learning","问":"school.learning","问题":"school.learning","知道":"school.learning",
"回答":"school.learning","记住":"school.learning","忘":"school.learning","学":"school.learning","查":"school.learning","答应":"school.learning",
"懂得":"school.learning","教学":"school.learning","练":"school.learning","请求":"school.learning","听讲":"school.learning",
/* work.workplace - 10 */
"工作":"work.workplace","公司":"work.workplace","忙":"work.workplace","上班":"work.workplace","开会":"work.workplace","下班":"work.workplace",
"打工":"work.workplace","服务":"work.workplace","干活儿":"work.workplace","实习":"work.workplace",
/* work.money - 5 */
"块":"work.money","钱":"work.money","贵":"work.money","便宜":"work.money","银行卡":"work.money",
/* work.trade - 2 */
"买":"work.trade","卖":"work.trade",
/* work.admin - 2 */
"办":"work.admin","组":"work.admin",
/* transport.vehicles - 16 */
"出租车":"transport.vehicles","飞机":"transport.vehicles","公共汽车":"transport.vehicles","自行车":"transport.vehicles","车":"transport.vehicles","车票":"transport.vehicles",
"车上":"transport.vehicles","火车":"transport.vehicles","开车":"transport.vehicles","汽车":"transport.vehicles","上车":"transport.vehicles","下车":"transport.vehicles",
"车辆":"transport.vehicles","公交车":"transport.vehicles","骑车":"transport.vehicles","停车":"transport.vehicles",
/* transport.traffic - 2 */
"加油":"transport.traffic","行人":"transport.traffic",
/* transport.travel - 7 */
"旅游":"transport.travel","放假":"transport.travel","假期":"transport.travel","旅行":"transport.travel","休假":"transport.travel","一路平安":"transport.travel",
"一路顺风":"transport.travel",
/* transport.tickets - 3 */
"票":"transport.tickets","机票":"transport.tickets","门票":"transport.tickets",
/* tech.devices - 9 */
"电脑":"tech.devices","电视":"tech.devices","手机":"tech.devices","电":"tech.devices","电话":"tech.devices","电视机":"tech.devices",
"关机":"tech.devices","计算机":"tech.devices","相机":"tech.devices",
/* tech.internet - 2 */
"网上":"tech.internet","网":"tech.internet",
/* tech.phone - 3 */
"打电话":"tech.phone","短信":"tech.phone","信号":"tech.phone",
/* tech.media - 5 */
"电影":"tech.media","画儿":"tech.media","图片":"tech.media","信息":"tech.media","影片":"tech.media",
/* sport.sports - 15 */
"打篮球":"sport.sports","踢足球":"sport.sports","游泳":"sport.sports","运动":"sport.sports","踢":"sport.sports","打球":"sport.sports",
"球":"sport.sports","队":"sport.sports","篮球":"sport.sports","爬":"sport.sports","排球":"sport.sports","球场":"sport.sports",
"球队":"sport.sports","体育场":"sport.sports","体育馆":"sport.sports",
/* sport.games - 2 */
"玩":"sport.games","玩儿":"sport.games",
/* sport.arts - 7 */
"唱歌":"sport.arts","跳舞":"sport.arts","唱":"sport.arts","歌":"sport.arts","画家":"sport.arts","明星":"sport.arts",
"音乐会":"sport.arts",
/* sport.hobbies - 4 */
"好玩儿":"sport.hobbies","晚会":"sport.hobbies","笑话儿":"sport.hobbies","有意思":"sport.hobbies",
/* society.civic - 3 */
"公平":"society.civic","平等":"society.civic","自由":"society.civic",
/* society.customs - 1 */
"好事":"society.customs",
/* society.environment - 1 */
"人口":"society.environment",
/* concept.doing - 83 */
"回":"concept.doing","会":"concept.doing","叫":"concept.doing","开":"concept.doing","来":"concept.doing","没有":"concept.doing",
"能":"concept.doing","去":"concept.doing","是":"concept.doing","有":"concept.doing","做":"concept.doing","帮助":"concept.doing",
"出":"concept.doing","到":"concept.doing","等":"concept.doing","给":"concept.doing","进":"concept.doing","可以":"concept.doing",
"起床":"concept.doing","让":"concept.doing","事情":"concept.doing","送":"concept.doing","要":"concept.doing","找":"concept.doing",
"准备":"concept.doing","没":"concept.doing","为":"concept.doing","帮":"concept.doing","不用":"concept.doing","出去":"concept.doing",
"打":"concept.doing","打开":"concept.doing","得到":"concept.doing","动":"concept.doing","回到":"concept.doing","回来":"concept.doing",
"回去":"concept.doing","进来":"concept.doing","进去":"concept.doing","来到":"concept.doing","找到":"concept.doing","背":"concept.doing",
"笔记":"concept.doing","不要":"concept.doing","称":"concept.doing","带来":"concept.doing","倒":"concept.doing","等到":"concept.doing",
"等于":"concept.doing","放下":"concept.doing","分开":"concept.doing","该":"concept.doing","过来":"concept.doing","见过":"concept.doing",
"交给":"concept.doing","接到":"concept.doing","接下来":"concept.doing","进入":"concept.doing","就要":"concept.doing","举":"concept.doing",
"靠":"concept.doing","来自":"concept.doing","留下":"concept.doing","拿出":"concept.doing","拿到":"concept.doing","能够":"concept.doing",
"排队":"concept.doing","求":"concept.doing","取得":"concept.doing","生":"concept.doing","收到":"concept.doing","送到":"concept.doing",
"送给":"concept.doing","提":"concept.doing","通":"concept.doing","行动":"concept.doing","行为":"concept.doing","选":"concept.doing",
"占":"concept.doing","找出":"concept.doing","照相":"concept.doing","走进":"concept.doing","做法":"concept.doing",
/* concept.thinking - 19 */
"说":"concept.thinking","想":"concept.thinking","告诉":"concept.thinking","觉得":"concept.thinking","说话":"concept.thinking","意思":"concept.thinking",
"道理":"concept.thinking","观点":"concept.thinking","喊":"concept.thinking","讲话":"concept.thinking","角度":"concept.thinking","叫作":"concept.thinking",
"例子":"concept.thinking","提出":"concept.thinking","提到":"concept.thinking","想到":"concept.thinking","想起":"concept.thinking","小声":"concept.thinking",
"心中":"concept.thinking",
/* concept.change - 16 */
"开始":"concept.change","完":"concept.change","出来":"concept.change","起":"concept.change","变":"concept.change","变成":"concept.change",
"成":"concept.change","得出":"concept.change","改":"concept.change","接着":"concept.change","开机":"concept.change","流":"concept.change",
"实现":"concept.change","停":"concept.change","长大":"concept.change","做到":"concept.change",
/* concept.quantity - 59 */
"八":"concept.quantity","都":"concept.quantity","多":"concept.quantity","多少":"concept.quantity","二":"concept.quantity","很":"concept.quantity",
"几":"concept.quantity","九":"concept.quantity","六":"concept.quantity","七":"concept.quantity","三":"concept.quantity","少":"concept.quantity",
"十":"concept.quantity","四":"concept.quantity","太":"concept.quantity","五":"concept.quantity","些":"concept.quantity","一":"concept.quantity",
"百":"concept.quantity","第一":"concept.quantity","非常":"concept.quantity","两":"concept.quantity","零":"concept.quantity","每":"concept.quantity",
"千":"concept.quantity","真":"concept.quantity","最":"concept.quantity","半天":"concept.quantity","别的":"concept.quantity","不大":"concept.quantity",
"一半":"concept.quantity","一点儿":"concept.quantity","一块儿":"concept.quantity","一些":"concept.quantity","有的":"concept.quantity","有些":"concept.quantity",
"真的":"concept.quantity","不太":"concept.quantity","不够":"concept.quantity","不少":"concept.quantity","不一定":"concept.quantity","大部分":"concept.quantity",
"大大":"concept.quantity","大量":"concept.quantity","大小":"concept.quantity","多数":"concept.quantity","好多":"concept.quantity","加":"concept.quantity",
"全":"concept.quantity","全体":"concept.quantity","人数":"concept.quantity","少数":"concept.quantity","数":"concept.quantity","一部分":"concept.quantity",
"一点点":"concept.quantity","有点儿":"concept.quantity","越来越":"concept.quantity","这么":"concept.quantity","只能":"concept.quantity",
/* concept.quality - 34 */
"大":"concept.quality","好":"concept.quality","小":"concept.quality","长":"concept.quality","错":"concept.quality","高":"concept.quality",
"可能":"concept.quality","快":"concept.quality","慢":"concept.quality","新":"concept.quality","不对":"concept.quality","好看":"concept.quality",
"好听":"concept.quality","有用":"concept.quality","正":"concept.quality","不错":"concept.quality","不如":"concept.quality","不同":"concept.quality",
"不行":"concept.quality","常见":"concept.quality","常用":"concept.quality","大多数":"concept.quality","大声":"concept.quality","刚":"concept.quality",
"坏处":"concept.quality","卡":"concept.quality","难题":"concept.quality","难听":"concept.quality","平":"concept.quality","平安":"concept.quality",
"平常":"concept.quality","普通":"concept.quality","挺好":"concept.quality","同样":"concept.quality",
/* grammar.measure - 20 */
"本":"grammar.measure","件":"grammar.measure","一下":"grammar.measure","公斤":"grammar.measure","元":"grammar.measure","张":"grammar.measure",
"杯":"grammar.measure","间":"grammar.measure","单位":"grammar.measure","度":"grammar.measure","封":"grammar.measure","节":"grammar.measure",
"斤":"grammar.measure","句":"grammar.measure","克":"grammar.measure","排":"grammar.measure","片":"grammar.measure","千克":"grammar.measure",
"套":"grammar.measure","周":"grammar.measure",
/* grammar.particles - 24 */
"不":"grammar.particles","的":"grammar.particles","个":"grammar.particles","了":"grammar.particles","吗":"grammar.particles","呢":"grammar.particles",
"在":"grammar.particles","吧":"grammar.particles","比":"grammar.particles","别":"grammar.particles","从":"grammar.particles","得":"grammar.particles",
"对":"grammar.particles","过":"grammar.particles","离":"grammar.particles","它":"grammar.particles","往":"grammar.particles","着":"grammar.particles",
"正在":"grammar.particles","向":"grammar.particles","第":"grammar.particles","们":"grammar.particles","子":"grammar.particles","正是":"grammar.particles",
/* grammar.connectives - 13 */
"和":"grammar.connectives","虽然":"grammar.connectives","也":"grammar.connectives","一起":"grammar.connectives","因为":"grammar.connectives","但是":"grammar.connectives",
"所以":"grammar.connectives","还有":"grammar.connectives","比如说":"grammar.connectives","但":"grammar.connectives","的话":"grammar.connectives","或":"grammar.connectives",
"那么":"grammar.connectives",
/* grammar.questions - 15 */
"哪":"grammar.questions","谁":"grammar.questions","什么":"grammar.questions","怎么":"grammar.questions","怎么样":"grammar.questions","为什么":"grammar.questions",
"干什么":"grammar.questions","哪里":"grammar.questions","哪儿":"grammar.questions","哪些":"grammar.questions","是不是":"grammar.questions","多久":"grammar.questions",
"什么样":"grammar.questions","怎么办":"grammar.questions","怎样":"grammar.questions",
/* people (parent only, not yet subcategorised) - 14 */
"阿姨":"people","别人":"people","经理":"people","客人":"people","邻居":"people","叔叔":"people",
"司机":"people","同事":"people","校长":"people","咱们":"people","夫妻":"people","姐妹":"people",
"名人":"people","运动员":"people",
/* body (parent only, not yet subcategorised) - 23 */
"矮":"body","饱":"body","鼻子":"body","锻炼":"body","饿":"body","耳朵":"body",
"发烧":"body","感冒":"body","检查":"body","健康":"body","脚":"body","渴":"body",
"脸":"body","胖":"body","瘦":"body","刷":"body","头发":"body","腿":"body",
"洗澡":"body","嘴":"body","身高":"body","牙":"body","牙刷":"body",
/* emotion (parent only, not yet subcategorised) - 22 */
"安静":"emotion","聪明":"emotion","担心":"emotion","放心":"emotion","关心":"emotion","害怕":"emotion",
"可爱":"emotion","哭":"emotion","满意":"emotion","难过":"emotion","努力":"emotion","奇怪":"emotion",
"热情":"emotion","认真":"emotion","生气":"emotion","相信":"emotion","小心":"emotion","兴趣":"emotion",
"愿意":"emotion","着急":"emotion","感兴趣":"emotion","喜爱":"emotion",
/* time (parent only, not yet subcategorised) - 26 */
"迟到":"time","春":"time","冬":"time","刚才":"time","过去":"time","季节":"time",
"节日":"time","久":"time","刻":"time","马上":"time","突然":"time","一直":"time",
"以后":"time","以前":"time","终于":"time","周末":"time","总是":"time","最近":"time",
"刚刚":"time","后来":"time","平时":"time","最后":"time","后年":"time","总":"time",
"季":"time","晚点":"time",
/* place (parent only, not yet subcategorised) - 21 */
"办公室":"place","北方":"place","超市":"place","城市":"place","厨房":"place","地方":"place",
"东":"place","附近":"place","公园":"place","国家":"place","花园":"place","南":"place",
"世界":"place","图书馆":"place","西":"place","中间":"place","到处":"place","方向":"place",
"室":"place","卫生间":"place","屋子":"place",
/* nature (parent only, not yet subcategorised) - 14 */
"草":"nature","动物":"nature","刮":"nature","河":"nature","环境":"nature","马":"nature",
"树":"nature","太阳":"nature","月亮":"nature","凉快":"nature","牛":"nature","羊":"nature",
"冰":"nature","开花":"nature",
/* food (parent only, not yet subcategorised) - 15 */
"菜单":"food","蛋糕":"food","筷子":"food","盘子":"food","啤酒":"food","糖":"food",
"甜":"food","碗":"food","香蕉":"food","新鲜":"food","尝":"food","请客":"food",
"饮料":"food","做客":"food","矿泉水":"food",
/* clothing (parent only, not yet subcategorised) - 10 */
"包":"clothing","衬衫":"clothing","礼物":"clothing","裙子":"clothing","伞":"clothing","鞋":"clothing",
"瓶子":"clothing","短裤":"clothing","上衣":"clothing","箱子":"clothing",
/* home (parent only, not yet subcategorised) - 14 */
"搬":"home","冰箱":"home","打扫":"home","灯":"home","电梯":"home","干净":"home",
"关":"home","空调":"home","沙发":"home","洗衣机":"home","脏":"home","搬家":"home",
"楼梯":"home","扫":"home",
/* school (parent only, not yet subcategorised) - 21 */
"班":"school","笔记本":"school","成绩":"school","词典":"school","复习":"school","黑板":"school",
"简单":"school","句子":"school","历史":"school","练习":"school","了解":"school","明白":"school",
"年级":"school","清楚":"school","数学":"school","字典":"school","作业":"school","留学":"school",
"语言":"school","班级":"school","初中":"school",
/* work (parent only, not yet subcategorised) - 9 */
"办法":"work","帮忙":"work","参加":"work","打算":"work","会议":"work","解决":"work",
"决定":"work","完成":"work","请假":"work",
/* transport (parent only, not yet subcategorised) - 11 */
"船":"transport","地铁":"transport","地图":"transport","出发":"transport","护照":"transport","离开":"transport",
"骑":"transport","站":"transport","起飞":"transport","行李":"transport","高铁":"transport",
/* tech (parent only, not yet subcategorised) - 13 */
"电子邮件":"tech","新闻":"tech","信":"tech","银行":"tech","照片":"tech","号码":"tech",
"网站":"tech","信用卡":"tech","邮件":"tech","邮箱":"tech","照":"tech","耳机":"tech",
"拍照":"tech",
/* sport (parent only, not yet subcategorised) - 14 */
"爱好":"sport","比赛":"sport","表演":"sport","故事":"sport","见面":"sport","节目":"sport",
"体育":"sport","音乐":"sport","游戏":"sport","网球":"sport","羽毛球":"sport","得分":"sport",
"跳":"sport","运动会":"sport",
/* concept (parent only, not yet subcategorised) - 68 */
"变化":"concept","差":"concept","出现":"concept","带":"concept","短":"concept","安全":"concept",
"差不多":"concept","出生":"concept","发现":"concept","方便":"concept","放":"concept","关系":"concept",
"换":"concept","机会":"concept","讲":"concept","接":"concept","结婚":"concept","结束":"concept",
"借":"concept","经过":"concept","旧":"concept","蓝":"concept","老":"concept","难":"concept",
"年轻":"concept","其实":"concept","认为":"concept","容易":"concept","声音":"concept","水平":"concept",
"提高":"concept","同意":"concept","忘记":"concept","文化":"concept","习惯":"concept","像":"concept",
"需要":"concept","选择":"concept","要求":"concept","一般":"concept","一样":"concept","以为":"concept",
"影响":"concept","用":"concept","有名":"concept","遇到":"concept","照顾":"concept","重要":"concept",
"主要":"concept","注意":"concept","丢":"concept","对话":"concept","发":"concept","发生":"concept",
"发展":"concept","方法":"concept","干":"concept","合适":"concept","坚持":"concept","生活":"concept",
"试":"concept","收":"concept","受到":"concept","行":"concept","关注":"concept","认得":"concept",
"受":"concept","遇见":"concept",
/* grammar (parent only, not yet subcategorised) - 51 */
"把":"grammar","半":"grammar","被":"grammar","比较":"grammar","必须":"grammar","不但":"grammar",
"层":"grammar","除了":"grammar","当然":"grammar","地":"grammar","段":"grammar","比如":"grammar",
"遍":"grammar","才":"grammar","而且":"grammar","根据":"grammar","更":"grammar","关于":"grammar",
"或者":"grammar","几乎":"grammar","极":"grammar","角":"grammar","辆":"grammar","米":"grammar",
"其他":"grammar","然后":"grammar","如果":"grammar","双":"grammar","特别":"grammar","为了":"grammar",
"先":"grammar","一边":"grammar","一定":"grammar","一共":"grammar","应该":"grammar","又":"grammar",
"越":"grammar","只":"grammar","种":"grammar","大概":"grammar","好像":"grammar","可是":"grammar",
"挺":"grammar","页":"grammar","只要":"grammar","最好":"grammar","员":"grammar","直到":"grammar",
"只是":"grammar","只有":"grammar","看来":"grammar",
};
