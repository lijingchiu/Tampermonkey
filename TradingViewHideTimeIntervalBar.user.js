// ==UserScript==
// @name         移除 TradingView chart-toolbar，容器自適應填滿（完整改進版）
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  移除 .chart-toolbar.chart-controls-bar 並讓父容器自適應填滿，多種方法觸發佈局更新
// @author       YourName
// @match        https://www.tradingview.com/chart/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let hasProcessed = false;

    // 觸發佈局重新計算
    function triggerLayoutUpdate() {
        // 多種方法組合使用
        window.dispatchEvent(new Event('resize'));
        document.body.offsetHeight;

        requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'));

            // 嘗試觸發 TradingView 內部的重新計算
            const chartWidget = window.TradingView?.widget;
            if (chartWidget && typeof chartWidget.resize === 'function') {
                chartWidget.resize();
            }
        });
    }

    // 模擬輕微的用戶交互
    function simulateInteraction() {
        const centerArea = document.querySelector('.layout__area--center');
        if (!centerArea) return;

        const rect = centerArea.getBoundingClientRect();
        const event = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: rect.left + 10,
            clientY: rect.top + 10
        });

        centerArea.dispatchEvent(event);
    }

    // 移除 toolbar 並調整佈局
    function removeToolbarAndExpand() {
        const toolbars = document.querySelectorAll('.chart-toolbar.chart-controls-bar');

        if (toolbars.length === 0 || hasProcessed) return;

        let removed = false;
        toolbars.forEach(toolbar => {
            if (toolbar.parentNode) {
                toolbar.parentNode.removeChild(toolbar);
                removed = true;
            }
        });

        if (!removed) return;

        hasProcessed = true;

        // 調整佈局
        const centerArea = document.querySelector('.layout__area--center');
        if (centerArea) {
            centerArea.style.display = 'flex';
            centerArea.style.flexDirection = 'column';
            centerArea.style.height = '100%';

            Array.from(centerArea.children).forEach(child => {
                if (!child.classList.contains('chart-toolbar') &&
                    !child.classList.contains('chart-controls-bar')) {
                    child.style.flex = '1 1 0%';
                    child.style.minHeight = '0';
                }
            });
        }

        // 多階段觸發佈局更新
        setTimeout(triggerLayoutUpdate, 50);
        setTimeout(simulateInteraction, 150);
        setTimeout(triggerLayoutUpdate, 300);
        setTimeout(() => hasProcessed = false, 1000); // 重置標記
    }

    // 等待頁面準備就緒
    function waitForReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', removeToolbarAndExpand);
        } else {
            setTimeout(removeToolbarAndExpand, 500);
        }
    }

    // 監控動態變化
    const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 檢查是否有新的 toolbar 被添加
                const hasToolbar = document.querySelector('.chart-toolbar.chart-controls-bar');
                if (hasToolbar && !hasProcessed) {
                    setTimeout(removeToolbarAndExpand, 100);
                    break;
                }
            }
        }
    });

    // 啟動
    waitForReady();
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
})();
