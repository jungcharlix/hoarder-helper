// 囤積症幫手 — 預設物品內容庫
// Each zone gets seeded with realistic items based on room+zone keyword matching.

const ITEM_SETS = {
  // 客廳
  '沙發': [
    { emoji:'🛋️', name:'褪色的沙發抱枕', desc:'內芯已塌陷不再蓬鬆', hint:'抱枕的支撐力會隨使用消耗。' },
    { emoji:'🧣', name:'起毛球的毛毯', desc:'天冷時偶爾蓋的毛毯', hint:'有更新更厚的毛毯時，舊的可考慮捐贈。' },
    { emoji:'📺', name:'舊電視遙控器', desc:'按鍵已失靈，仍留著', hint:'電視已換新，舊遙控器無法配對。' },
    { emoji:'💿', name:'卡在沙發縫的硬幣', desc:'累積了一些零錢', hint:'整理進撲滿或捐款箱。' },
    { emoji:'📰', name:'看過的廣告傳單', desc:'夾在抱枕底下', hint:'資訊已過期，可直接回收。' },
  ],
  '電視': [
    { emoji:'💿', name:'舊 DVD 光碟', desc:'多年沒播放過', hint:'內容多半已能線上觀看。' },
    { emoji:'🔌', name:'用不到的 AV 線材', desc:'紅白黃舊式接線', hint:'新電視已不支援這種接頭。' },
    { emoji:'🔋', name:'過期的遙控器電池', desc:'抽屜深處的一堆', hint:'過期電池應回收至專門點。' },
    { emoji:'🖼️', name:'褪色的小相框', desc:'相片已模糊', hint:'可重新沖洗或數位化保存。' },
    { emoji:'🕯️', name:'裝飾用蠟燭', desc:'從未點燃過', hint:'若不再喜歡風格，可轉送他人。' },
  ],
  '茶几|地面': [
    { emoji:'📰', name:'舊報紙（2019年）', desc:'已泛黃的一疊', hint:'已超過 6 年，內容不會再讀。', memory:'那年家人剛搬來，我喜歡早上邊喝茶邊讀。' },
    { emoji:'🛍️', name:'累積的購物袋', desc:'紙袋與塑膠袋混雜', hint:'留幾個常用即可。' },
    { emoji:'🍪', name:'拆封一半的零食', desc:'已過期或受潮', hint:'食用安全期已過。' },
    { emoji:'🥤', name:'外帶店家的紙杯', desc:'幾天沒清的杯子', hint:'清潔後可作植栽容器或回收。' },
    { emoji:'📦', name:'未拆的小包裹', desc:'網購到的小物', hint:'拆開看是否還需要。' },
  ],
  '書架': [
    { emoji:'📚', name:'看過的小說（重複）', desc:'同一系列有兩套', hint:'保留一套即可，其他可送出。' },
    { emoji:'📖', name:'過期的旅遊指南', desc:'2018 年的版本', hint:'資訊多半已過時。' },
    { emoji:'📓', name:'空白的筆記本', desc:'累積了一打沒寫過', hint:'留幾本實用的即可。' },
    { emoji:'🗞️', name:'舊雜誌', desc:'一年以上的時尚刊物', hint:'內容多半可線上查閱。' },
    { emoji:'🏆', name:'學生時期紀念品', desc:'徽章與獎狀', hint:'拍照保存，僅留最有意義的。' },
  ],

  // 浴室
  '浴室|沐浴|淋浴': [
    { emoji:'🧴', name:'用剩一半的沐浴乳', desc:'多個品牌交替使用', hint:'集中使用一兩瓶即可。' },
    { emoji:'🦷', name:'舊牙刷與牙線', desc:'已超過三個月', hint:'牙刷建議三個月更換。' },
    { emoji:'💄', name:'過期化妝品', desc:'眼影盤與口紅', hint:'過期化妝品可能引起肌膚問題。' },
    { emoji:'🧼', name:'試用包與小樣品', desc:'累積了一抽屜', hint:'試用品多半超過保存期。' },
    { emoji:'🩲', name:'舊毛巾', desc:'已變硬或起毛球', hint:'可降級為清潔用抹布。' },
    { emoji:'💊', name:'過期藥膏', desc:'放在櫃子深處', hint:'過期藥需回收至藥局。' },
  ],

  // 主臥/次臥
  '床頭|床下': [
    { emoji:'📖', name:'床頭看了一半的書', desc:'已超過一年沒翻', hint:'如不打算讀完，可送出或交換。' },
    { emoji:'💊', name:'過期成藥', desc:'感冒藥與止痛藥', hint:'過期藥需送回藥局回收。' },
    { emoji:'📱', name:'舊手機', desc:'已停用兩年以上', hint:'可資料清除後回收或轉售。' },
    { emoji:'🧦', name:'落單的襪子', desc:'找不到另一隻', hint:'超過三個月仍未找到，可放下。' },
    { emoji:'🎁', name:'未拆封的小禮物', desc:'過去收到的紀念品', hint:'若不會使用，可轉送有需要的人。' },
  ],
  '衣櫃|衣物': [
    { emoji:'👕', name:'尺寸不合的襯衫', desc:'兩年前買的襯衫', hint:'可捐贈或上架二手平台。', memory:'原本想瘦下來再穿。' },
    { emoji:'🧥', name:'過季的厚外套', desc:'已不喜歡的款式', hint:'若一年沒穿，下一年也很可能不穿。' },
    { emoji:'🧦', name:'破洞的襪子', desc:'有破洞但還沒丟', hint:'破損的襪子難以再用。' },
    { emoji:'👔', name:'不再戴的領帶', desc:'已不需要正式場合', hint:'可送給有需要的同事或親友。' },
    { emoji:'👗', name:'宴會洋裝', desc:'只穿過一次', hint:'考慮上架二手或借給朋友。' },
    { emoji:'👜', name:'壞掉的包包', desc:'拉鍊損壞', hint:'可修理或丟棄。' },
  ],
  '化妝|梳妝': [
    { emoji:'💄', name:'過期口紅', desc:'顏色已不喜歡', hint:'過期化妝品建議停用。' },
    { emoji:'🧴', name:'用剩的保養品', desc:'多瓶開封超過半年', hint:'開封後超過半年活性降低。' },
    { emoji:'💍', name:'不再戴的飾品', desc:'樣式過時的耳環項鍊', hint:'可送給朋友或上架二手。' },
    { emoji:'🎀', name:'舊髮飾', desc:'童年時的髮夾', hint:'保留有意義的，其他可送出。' },
    { emoji:'💐', name:'乾掉的香水', desc:'味道已變質', hint:'香水開封後約 2-3 年。' },
  ],
  '書桌|文具': [
    { emoji:'📄', name:'過期的帳單', desc:'去年的水電帳單', hint:'可掃描存檔後銷毀。' },
    { emoji:'🎫', name:'票根與收據', desc:'累積的小紙片', hint:'有紀念性的可拍照保存。' },
    { emoji:'✏️', name:'乾掉的原子筆', desc:'寫不出來的筆', hint:'試寫過後不出水即可丟棄。' },
    { emoji:'📎', name:'散落的迴紋針', desc:'抽屜底層的小物', hint:'集中收納到一個小盒子。' },
    { emoji:'📓', name:'寫到一半的筆記本', desc:'三本以上待用', hint:'集中使用一本即可。' },
  ],
  '地板|雜物': [
    { emoji:'📦', name:'空紙箱', desc:'網購留下的箱子', hint:'留少量備用即可。' },
    { emoji:'🛍️', name:'累積的塑膠袋', desc:'各種尺寸的提袋', hint:'適量留作垃圾袋。' },
    { emoji:'📰', name:'舊雜誌與傳單', desc:'隨手翻過的刊物', hint:'資訊已過期。' },
    { emoji:'🎀', name:'禮品的緞帶與紙', desc:'拆開後留下的裝飾', hint:'留少量包裝用，其他丟棄。' },
    { emoji:'🧶', name:'打結的耳機線', desc:'壞掉的舊耳機', hint:'已換新耳機可丟棄。' },
  ],

  // 電腦房 / 書房
  '主桌|桌面|電腦|辦公': [
    { emoji:'🔌', name:'多餘的充電線', desc:'三條 USB-C 線', hint:'留 1-2 條備用即可。' },
    { emoji:'💾', name:'舊隨身碟', desc:'容量小且已備份', hint:'資料轉移後可清空回收。' },
    { emoji:'🖱️', name:'壞掉的滑鼠', desc:'滾輪已失靈', hint:'修不好可回收電子廢棄物。' },
    { emoji:'📝', name:'寫滿的便利貼', desc:'累積的提醒紙條', hint:'整理重要資訊到數位筆記。' },
    { emoji:'🪪', name:'過期的識別證', desc:'前公司的證件', hint:'剪碎後丟棄。' },
  ],
  '抽屜': [
    { emoji:'✏️', name:'壞掉的文具', desc:'乾掉的筆與斷掉的尺', hint:'試寫不出即可丟棄。' },
    { emoji:'🧾', name:'舊收據', desc:'累積數月的紙條', hint:'保固期過後可丟棄。' },
    { emoji:'📎', name:'散裝迴紋針與圖釘', desc:'雜亂的小物', hint:'集中收納或分送。' },
    { emoji:'🔋', name:'未知狀態的電池', desc:'不確定有沒有電', hint:'測試後分類處理。' },
    { emoji:'🗝️', name:'不知道哪把的鑰匙', desc:'兩三把無記憶的鑰匙', hint:'確認用途，無用即可丟棄。' },
  ],
  '主機|線材|電線': [
    { emoji:'🔌', name:'舊 HDMI 線', desc:'規格較舊的版本', hint:'留一條備用即可。' },
    { emoji:'🔌', name:'多餘的 USB 線', desc:'各種長短舊規格', hint:'留 1-2 條最常用的。' },
    { emoji:'⚡', name:'壞掉的變壓器', desc:'用不到的舊充電器', hint:'電子廢棄物回收。' },
    { emoji:'🔌', name:'不知用途的轉接頭', desc:'抽屜裡的小物', hint:'兩年沒用到的可丟棄。' },
    { emoji:'🌐', name:'舊網路線', desc:'數條 Cat5 線', hint:'已換 Wi-Fi 後極少需要。' },
  ],

  // 廚房
  '流理|櫥櫃|廚房': [
    { emoji:'🥫', name:'過期罐頭', desc:'保存期限已過', hint:'過期食品需丟棄。' },
    { emoji:'🍳', name:'不沾鍋（已掉漆）', desc:'塗層已剝落', hint:'塗層損壞可能不健康。' },
    { emoji:'🧂', name:'過期的調味料', desc:'香料與醬料', hint:'香氣已失，無風味價值。' },
    { emoji:'🫙', name:'累積的玻璃罐', desc:'果醬罐與優格罐', hint:'留少量可重複利用。' },
    { emoji:'🥢', name:'外帶餐具', desc:'累積的免洗筷', hint:'環保署建議減少使用。' },
    { emoji:'🥡', name:'不成套的便當盒', desc:'蓋子或盒子單獨剩下', hint:'缺另一半無法使用。' },
  ],
  '冰箱': [
    { emoji:'🥫', name:'過期的醬料', desc:'冰箱門上的小瓶', hint:'開封後通常 3-6 個月。' },
    { emoji:'🧊', name:'凍很久的食材', desc:'已超過半年', hint:'冷凍肉品建議半年內食用。' },
    { emoji:'🥡', name:'剩飯', desc:'放了超過三天', hint:'剩菜建議三天內食用。' },
    { emoji:'🍶', name:'舊保鮮盒', desc:'已變色或變形', hint:'破損的塑膠盒可能釋出化學物。' },
    { emoji:'🧀', name:'即將過期的乳製品', desc:'打開未完食的起司', hint:'盡快食用或丟棄。' },
  ],

  // 小房間 / 倉庫
  '左半|右半|半邊|小房': [
    { emoji:'📦', name:'紙箱（空）', desc:'網購累積的箱子', hint:'留少量備用，其餘回收。' },
    { emoji:'🧳', name:'舊行李箱', desc:'拉桿已壞', hint:'修不好可丟棄。' },
    { emoji:'🏸', name:'未使用的運動器材', desc:'啞鈴或瑜伽墊', hint:'若超過一年沒用可送出。' },
    { emoji:'🎒', name:'舊背包', desc:'學生時期的書包', hint:'可捐贈或保留作紀念。' },
    { emoji:'📚', name:'學生時代的課本', desc:'已不會再翻閱', hint:'拍照存檔即可放下。' },
  ],
  '倉庫|儲藏|儲物': [
    { emoji:'📦', name:'紙箱（多年未拆）', desc:'搬家後就沒打開', hint:'超過兩年沒打開的多半不需要。' },
    { emoji:'🎄', name:'舊節慶裝飾', desc:'壞掉的聖誕燈飾', hint:'保留功能正常的即可。' },
    { emoji:'🧳', name:'舊行李箱', desc:'已壞或不常用', hint:'保留一兩個常用尺寸。' },
    { emoji:'📺', name:'舊家電', desc:'已不使用的小家電', hint:'功能正常可送出，壞掉可回收。' },
    { emoji:'🏆', name:'過去的紀念品', desc:'累積的擺飾與獎狀', hint:'拍照存檔，僅留最有意義的。' },
    { emoji:'👶', name:'舊玩具', desc:'童年時期或孩子用過', hint:'可捐贈給育幼院或親友。' },
    { emoji:'🎨', name:'未完成的手作品', desc:'未拆封的材料', hint:'六個月未動工的多半不會繼續。' },
  ],

  // 陽台
  '洗衣': [
    { emoji:'🧺', name:'破洞的洗衣袋', desc:'網袋已有裂縫', hint:'無法保護衣物可換新。' },
    { emoji:'🧴', name:'用剩的洗衣精', desc:'多瓶交替使用', hint:'集中使用一兩瓶即可。' },
    { emoji:'📌', name:'壞掉的曬衣夾', desc:'彈簧失效', hint:'夾不住即可丟棄。' },
    { emoji:'🧽', name:'舊抹布', desc:'已發霉的擦布', hint:'發霉的抹布建議丟棄。' },
    { emoji:'🪣', name:'多餘的水桶', desc:'累積的塑膠桶', hint:'留 1-2 個常用即可。' },
  ],
  '植物|植栽': [
    { emoji:'🪴', name:'枯萎的盆栽', desc:'已無法救活的植物', hint:'植物可堆肥或丟棄。' },
    { emoji:'🏺', name:'空的花盆', desc:'累積數個未使用', hint:'留幾個備用，多餘可送出。' },
    { emoji:'🌱', name:'過期的肥料', desc:'結塊的肥料包', hint:'結塊的肥料效果已差。' },
    { emoji:'🪚', name:'生鏽的園藝工具', desc:'鋸子與剪刀', hint:'生鏽嚴重可考慮更換。' },
    { emoji:'🛒', name:'裝植物的舊塑膠盆', desc:'園藝店的黑色盆', hint:'可回到園藝店回收。' },
  ],
  '雜物區': [
    { emoji:'📦', name:'空紙箱', desc:'累積在角落', hint:'留少量備用即可回收。' },
    { emoji:'🛍️', name:'破掉的塑膠袋', desc:'環保袋已撕裂', hint:'破損即可丟棄。' },
    { emoji:'📺', name:'舊小家電', desc:'已不使用的物品', hint:'功能正常可送出。' },
    { emoji:'🪑', name:'壞掉的家具配件', desc:'缺一隻腳的小凳子', hint:'修不好可回收。' },
    { emoji:'🧶', name:'雜亂的繩索', desc:'各式繩線', hint:'留少量備用。' },
  ],
  '收納櫃': [
    { emoji:'🛠️', name:'重複的工具', desc:'多支螺絲起子', hint:'留 1-2 種規格即可。' },
    { emoji:'🎨', name:'乾掉的油漆', desc:'多年前剩下的塗料', hint:'乾掉的油漆需特殊回收。' },
    { emoji:'🧴', name:'過期的清潔劑', desc:'瓶身已模糊', hint:'過期清潔劑可能腐蝕容器。' },
    { emoji:'🪛', name:'缺零件的小工具', desc:'缺電池或螺絲', hint:'無法使用可丟棄。' },
    { emoji:'🎁', name:'重複的禮品盒', desc:'累積的包裝盒', hint:'留少量備用。' },
  ],
  '走道|地面': [
    { emoji:'🧹', name:'舊掃帚', desc:'毛已散開', hint:'清潔力下降可換新。' },
    { emoji:'🪣', name:'舊拖把', desc:'布條已硬化', hint:'清潔布條建議定期更換。' },
    { emoji:'📦', name:'堆積的紙箱', desc:'佔據走道的雜物', hint:'回收後走道會更順暢。' },
    { emoji:'🧴', name:'乾掉的清潔液', desc:'瓶內已凝固', hint:'內容物變質即可丟棄。' },
    { emoji:'🪜', name:'壞掉的小階梯', desc:'踏板已鬆動', hint:'安全考量請汰換。' },
  ],
};

// Match a zone (by room+zone name) to a curated item set. Falls back to generic placeholders.
function seedItemsForZone(roomName, zoneName, count = 20) {
  const target = `${roomName} ${zoneName}`;
  let specific = null;
  // Find best matching template — try zone name keywords first, then room
  for (const [keys, items] of Object.entries(ITEM_SETS)) {
    const kw = keys.split('|');
    if (kw.some(k => target.includes(k))) { specific = items; break; }
  }

  const result = [];
  if (specific) {
    specific.forEach((it, i) => {
      result.push({
        id: `seed-${i}-${Math.random().toString(36).slice(2,7)}`,
        emoji: it.emoji, name: it.name,
        desc: it.desc || '', hint: it.hint || '', memory: it.memory || '',
      });
    });
  }
  // pad to count with generic placeholders
  while (result.length < count) {
    const i = result.length;
    result.push({
      id: `seed-pad-${i}-${Math.random().toString(36).slice(2,7)}`,
      emoji: '📦', name: `物品 ${i + 1}`,
      desc: '', hint: '', memory: '',
    });
  }
  return result;
}

window.seedItemsForZone = seedItemsForZone;
window.ITEM_SETS = ITEM_SETS;
