/*!
 * phrase-picker.js — 台詞挑選元件（前台與後台共用）
 * 前台：PhrasePicker.create({ mountId, count, getLibrary, onChange })
 * 後台：使用 PhrasePicker.DEFAULT_LIBRARY 作為預設台詞庫
 */
(function (global) {
    'use strict';

    // 預設台詞庫（data.json 沒有 phraseLibrary 時使用，可在後台編輯）
    const DEFAULT_LIBRARY = [
        { icon: '💬', name: '日常回應', phrases: ["OK", "好喔", "沒問題", "了解", "知道了", "收到", "可以啊", "等我一下", "馬上來", "稍等一下", "我看看", "我想想", "真的假的", "對啊對啊", "不要啦", "隨便都好", "好哇", "瞭啦"] },
        { icon: '👋', name: '問候招呼', phrases: ["早安", "午安", "晚安", "嗨嗨", "哈囉", "好久不見", "最近好嗎", "吃飽沒", "安安", "掰掰", "下次見", "路上小心", "到家說一聲", "早點休息", "週末愉快", "今天也加油"] },
        { icon: '💼', name: '上班職場', phrases: ["收到，馬上處理", "辛苦了", "已確認", "請查收", "開會中", "稍後回覆", "我來跟進", "這邊沒問題", "麻煩了", "感謝協助", "請再確認", "先這樣處理", "下班了", "準時下班", "加班中", "進度更新"] },
        { icon: '🫠', name: '職場厭世', phrases: ["不想上班", "好想放假", "還要幾天放假", "我還能撐", "腦袋當機", "燃燒殆盡", "今天不營業", "下班倒數", "再一下就好", "薪水快來", "只想躺平", "累到不行", "我是誰我在哪", "週一症候群", "靈魂出竅", "別再加班了"] },
        { icon: '🎭', name: '情緒反應', phrases: ["哈哈哈", "笑死", "傻眼", "超感動", "嚇到我了", "氣氣氣", "好難過", "嗚嗚嗚", "太扯了", "好害羞", "心累", "驚喜", "我不要", "好煩喔", "超開心", "無言"] },
        { icon: '🌟', name: '鼓勵稱讚', phrases: ["你最棒", "加油加油", "做得好", "太厲害了", "真有你的", "一定可以", "為你驕傲", "給你讚", "超強der", "辛苦你了", "慢慢來", "別放棄", "你值得", "我挺你", "好樣的", "拍拍手"] },
        { icon: '🔥', name: '聊天社群', phrases: ["已讀不回", "哈哈哈哈", "笑到打滾", "+1", "同意", "附議", "求分享", "幫推", "來了來了", "吃瓜中", "潛水中", "刷存在感", "跟你說喔", "等你回覆", "在嗎", "快回我"] },
        { icon: '📍', name: '通知報備', phrases: ["我到了", "出發囉", "快到了", "遲到五分鐘", "在路上", "先走一步", "晚點到", "我先下線", "馬上回來", "開會中勿擾", "已完成", "搞定了", "稍後聯絡", "今天休息", "外出中", "請假一天"] },
        { icon: '🛍️', name: '團購購物', phrases: ["我要一份", "加我一個", "+1 跟團", "下單囉", "已匯款", "幾點取貨", "還有貨嗎", "好想買", "剁手中", "錢包失守", "免運了嗎", "限時特價", "搶購成功", "缺貨中", "已出貨", "收到包裹"] },
        { icon: '🍜', name: '吃飯飲料', phrases: ["吃飯了嗎", "好餓", "吃什麼好", "我請客", "乾杯", "來杯手搖", "半糖少冰", "再來一碗", "吃太飽了", "宵夜時間", "減肥明天開始", "好好吃", "咖啡續命", "開動了", "約吃飯", "想吃火鍋"] },
        { icon: '💕', name: '情侶撒嬌', phrases: ["想你了", "抱抱", "親一個", "愛你喔", "我生氣了", "哄我", "陪我嘛", "不要不理我", "你最好了", "晚安好夢", "等我回家", "好想見你", "笨蛋", "牽牽手", "今天也愛你", "撒嬌中"] },
        { icon: '🏠', name: '家庭親子', phrases: ["回家吃飯", "媽媽愛你", "爸爸辛苦了", "寶貝乖", "該睡覺了", "功課寫完沒", "來吃飯囉", "早點回家", "全家出遊", "我回來了", "幫我開門", "零用錢", "想你們", "抱抱孩子", "謝謝爸媽", "好溫暖"] },
        { icon: '🎉', name: '節日祝福', phrases: ["新年快樂", "恭喜發財", "紅包拿來", "生日快樂", "聖誕快樂", "中秋快樂", "情人節快樂", "母親節快樂", "父親節快樂", "畢業快樂", "萬事如意", "心想事成", "身體健康", "平安喜樂", "週年快樂", "假期愉快"] }
    ];

    function injectStyle() {
        if (document.getElementById('pk-style')) return;
        const st = document.createElement('style');
        st.id = 'pk-style';
        st.textContent = `
        .pk-box{border:1px solid #e2e8f0;border-radius:12px;background:#fff;padding:14px;margin-bottom:16px}
        .pk-title{font-size:.95rem;font-weight:700;margin-bottom:10px}
        .pk-cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:6px;margin-bottom:10px;-webkit-overflow-scrolling:touch}
        .pk-cat{flex:0 0 auto;border:1px solid #e2e8f0;background:#edf2f7;color:#718096;border-radius:999px;padding:6px 12px;font-size:.82rem;font-weight:600;cursor:pointer;white-space:nowrap}
        .pk-cat.active{background:#388e3c;border-color:#388e3c;color:#fff}
        .pk-phrases{display:flex;flex-wrap:wrap;gap:6px;max-height:180px;overflow-y:auto;padding:2px;margin-bottom:12px}
        .pk-chip{border:1px solid #cbd5e0;background:#fff;color:#1a202c;border-radius:8px;padding:7px 12px;font-size:.88rem;cursor:pointer}
        .pk-chip:active{background:#e8f5e9}
        .pk-chip.used{opacity:.35;cursor:not-allowed;background:#f1f5f9}
        .pk-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}
        .pk-btn{border:none;border-radius:8px;padding:8px 14px;font-size:.85rem;font-weight:700;cursor:pointer;background:#388e3c;color:#fff}
        .pk-btn.sec{background:#edf2f7;color:#4a5568}
        .pk-btn.warn{background:#fee2e2;color:#b91c1c}
        .pk-opt{display:flex;align-items:center;gap:4px;font-size:.82rem;color:#4a5568}
        .pk-add{display:flex;gap:8px;margin-bottom:12px}
        .pk-add input{flex:1;min-width:0;padding:9px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:.9rem;outline:none}
        .pk-status{font-size:.82rem;font-weight:700;color:#388e3c;margin-bottom:8px}
        .pk-status.full{color:#b45309}
        .pk-selected{display:flex;flex-wrap:wrap;gap:6px;min-height:34px}
        .pk-sel{display:inline-flex;align-items:center;gap:6px;background:#e8f5e9;border:1px solid #a5d6a7;color:#1b5e20;border-radius:8px;padding:6px 10px;font-size:.85rem;cursor:pointer}
        .pk-sel b{font-size:.72rem;color:#388e3c}
        .pk-sel i{font-style:normal;color:#b91c1c;font-weight:700}
        .pk-empty{font-size:.82rem;color:#a0aec0}
        `;
        document.head.appendChild(st);
    }

    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text !== undefined) e.textContent = text;
        return e;
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function create(opts) {
        injectStyle();
        const mount = document.getElementById(opts.mountId);
        if (!mount) return null;
        const count = opts.count || 8;

        let selected = [];
        let catIndex = 0;
        let avoidDup = true;
        let notice = '';

        function getLib() {
            const lib = opts.getLibrary && opts.getLibrary();
            const valid = Array.isArray(lib) ? lib.filter(c => c && Array.isArray(c.phrases) && c.phrases.length) : [];
            return valid.length ? valid : DEFAULT_LIBRARY;
        }

        function allPhrases() {
            const set = new Set();
            getLib().forEach(c => c.phrases.forEach(p => { const t = String(p).trim(); if (t) set.add(t); }));
            return Array.from(set);
        }

        function commit() {
            render();
            if (opts.onChange) opts.onChange(selected.slice());
        }

        function add(text) {
            const t = String(text || '').trim();
            if (!t) return;
            if (selected.length >= count) { notice = `已滿 ${count} 句，請先點選下方已選台詞移除後再加入`; render(); return; }
            if (avoidDup && selected.includes(t)) { notice = `「${t}」已經選過了`; render(); return; }
            notice = '';
            selected.push(t);
            commit();
        }

        function removeAt(i) { selected.splice(i, 1); notice = ''; commit(); }

        function randomPick() {
            notice = '';
            selected = shuffle(allPhrases()).slice(0, count);
            commit();
        }

        function autoFill() {
            notice = '';
            let pool = allPhrases();
            if (avoidDup) pool = pool.filter(p => !selected.includes(p));
            pool = shuffle(pool);
            while (selected.length < count && pool.length) selected.push(pool.shift());
            commit();
        }

        function clearAll() { selected = []; notice = ''; commit(); }

        function render() {
            const lib = getLib();
            if (catIndex >= lib.length) catIndex = 0;
            mount.innerHTML = '';

            const box = el('div', 'pk-box');
            box.appendChild(el('div', 'pk-title', `🔍 挑選台詞（目標 ${count} 句）`));

            // 分類
            const cats = el('div', 'pk-cats');
            lib.forEach((c, i) => {
                const b = el('button', 'pk-cat' + (i === catIndex ? ' active' : ''), `${c.icon || ''}${c.name || '未命名'}`);
                b.type = 'button';
                b.onclick = () => { catIndex = i; render(); };
                cats.appendChild(b);
            });
            box.appendChild(cats);

            // 台詞
            const list = el('div', 'pk-phrases');
            lib[catIndex].phrases.forEach(p => {
                const t = String(p).trim();
                if (!t) return;
                const used = avoidDup && selected.includes(t);
                const b = el('button', 'pk-chip' + (used ? ' used' : ''), t);
                b.type = 'button';
                b.onclick = () => { if (!used) add(t); };
                list.appendChild(b);
            });
            box.appendChild(list);

            // 工具列
            const tools = el('div', 'pk-tools');
            const bRand = el('button', 'pk-btn', `🎲 隨機挑選（一鍵帶入 ${count} 句）`); bRand.type = 'button'; bRand.onclick = randomPick;
            const bFill = el('button', 'pk-btn sec', '自動補滿'); bFill.type = 'button'; bFill.onclick = autoFill;
            const bClear = el('button', 'pk-btn warn', '清空已選'); bClear.type = 'button'; bClear.onclick = clearAll;
            const opt = el('label', 'pk-opt');
            const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = avoidDup;
            cb.onchange = () => { avoidDup = cb.checked; render(); };
            opt.appendChild(cb); opt.appendChild(document.createTextNode('避免重複'));
            [bRand, bFill, bClear, opt].forEach(x => tools.appendChild(x));
            box.appendChild(tools);

            // 自行輸入
            const addRow = el('div', 'pk-add');
            const input = document.createElement('input');
            input.type = 'text'; input.placeholder = '自己輸入台詞，按「加入台詞」';
            const bAdd = el('button', 'pk-btn', '加入台詞'); bAdd.type = 'button';
            const doAdd = () => { const v = input.value; if (v.trim()) { add(v); } };
            bAdd.onclick = doAdd;
            input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doAdd(); } });
            addRow.appendChild(input); addRow.appendChild(bAdd);
            box.appendChild(addRow);

            // 已選
            const full = selected.length >= count;
            box.appendChild(el('div', 'pk-status' + (full ? ' full' : ''),
                notice || (full ? `✓ 已滿 ${count} 句（點擊可移除）` : `已選 ${selected.length} / ${count} 句（點擊可移除）`)));
            const sel = el('div', 'pk-selected');
            if (!selected.length) sel.appendChild(el('div', 'pk-empty', '尚未選擇台詞，點上方台詞即可加入'));
            selected.forEach((t, i) => {
                const chip = el('span', 'pk-sel');
                chip.appendChild(el('b', '', String(i + 1)));
                chip.appendChild(document.createTextNode(t));
                chip.appendChild(el('i', '', '×'));
                chip.onclick = () => removeAt(i);
                sel.appendChild(chip);
            });
            box.appendChild(sel);

            mount.appendChild(box);
        }

        render();

        return {
            // 從外部（輸入框、快速套用按鈕）同步目前台詞，不會觸發 onChange
            setLines(arr) {
                selected = (arr || []).map(s => String(s || '').trim()).filter(Boolean).slice(0, count);
                notice = '';
                render();
            },
            refresh() { render(); }
        };
    }

    global.PhrasePicker = { create, DEFAULT_LIBRARY };
})(window);
