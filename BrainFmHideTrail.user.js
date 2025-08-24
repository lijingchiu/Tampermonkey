// ==UserScript==
// @name         Hide Brain.fm Trial Expiry Notice
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  移除 Brain.fm 播放頁面上的「Your trial ends in xxx days」等試用提示訊息
// @author       你的名稱
// @match        https://my.brain.fm/player/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 檢查每隔 1 秒一次，確保動態生成元素也會被移除
    setInterval(() => {
        // 使用 innerText 方式查找含相關訊息的 DOM 元素
        document.querySelectorAll('*').forEach(el => {
            // 判斷文本內容是否包含“Your trial ends in”字樣（可擴充多種變形字串）
            if (el.innerText && /Your trial ends in/i.test(el.innerText)) {
                // 隱藏該元素
                el.style.display = 'none';
            }
        });
    }, 1000);
})();
