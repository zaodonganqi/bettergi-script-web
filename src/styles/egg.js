// mushroomTrip.js
class MushroomTrip {
    constructor() {
        this.isTripping = false;
        this.interval = null;
        this.animationStyle = null;

        // 菌子配色数组
        this.colors = [
            '#ff0008', '#00FFFF', '#FFFF00', '#00FF00',
            '#f46b38', '#8A2BE2', '#FF1493', '#143bff',
            '#FF00FF', '#00FFFF', '#ff0008', '#7FFF00',
            '#00FF7F', '#FF7F00', '#7F00FF', '#FF007F'
        ];

        // 要动态修改的 CSS 变量映射
        this.cssVarMap = {
            '--color-primary': 'colorPrimary',
            '--color-info': 'colorInfo',
            '--color-border': 'colorBorder',
            '--color-bg-container': 'colorBgContainer',
            '--color-text': 'colorText',
            '--color-success': 'colorSuccessText',
            '--color-error': 'colorErrorText',
            '--color-bg-layout': 'colorBgLayout'
        };
    }

    // 开始菌子之旅
    start() {
        if (this.isTripping) return;

        this.isTripping = true;
        this.injectStyles();
        this.startColorAnimation();

        console.log('🍄 菌子之旅开始！小心看到小人...');
    }

    // 停止菌子之旅
    stop() {
        if (!this.isTripping) return;

        this.isTripping = false;
        this.stopColorAnimation();
        this.removeStyles();
        this.resetColors();

        console.log('💊 清醒了！菌子效果已解除');
    }

    // 切换状态
    toggle() {
        if (this.isTripping) {
            this.stop();
        } else {
            this.start();
        }
    }

    // 注入动态样式
    injectStyles() {
        this.animationStyle = document.createElement('style');
        this.animationStyle.textContent = `
      @keyframes mushroomColorShift {
        0% { 
          filter: hue-rotate(0deg) saturate(150%);
          transform: rotate(0deg) scale(1);
        }
        25% { 
          filter: hue-rotate(90deg) saturate(200%);
          transform: rotate(0.3deg) scale(1.01);
        }
        50% { 
          filter: hue-rotate(180deg) saturate(250%);
          transform: rotate(-0.3deg) scale(0.99);
        }
        75% { 
          filter: hue-rotate(270deg) saturate(200%);
          transform: rotate(0.2deg) scale(1.02);
        }
        100% { 
          filter: hue-rotate(360deg) saturate(150%);
          transform: rotate(0deg) scale(1);
        }
      }

      .mushroom-trip-active * {
        animation: mushroomColorShift 3s infinite ease-in-out !important;
        transition: all 0.5s ease !important;
      }

      .mushroom-trip-active {
        position: relative;
        overflow: hidden;
      }

      .mushroom-trip-active::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          45deg,
          #FF00FF20,
          #00FFFF20,
          #FFFF0020,
          #00FF0020
        );
        animation: backgroundShift 4s infinite linear;
        pointer-events: none;
        z-index: 9998;
      }

      @keyframes backgroundShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `;
        document.head.appendChild(this.animationStyle);
        document.body.classList.add('mushroom-trip-active');
    }

    // 开始颜色动画
    startColorAnimation() {
        let colorIndex = 0;

        this.interval = setInterval(() => {
            const root = document.documentElement;
            colorIndex = (colorIndex + 1) % this.colors.length;

            // 动态更新所有 CSS 变量
            Object.keys(this.cssVarMap).forEach((cssVar, index) => {
                const targetIndex = (colorIndex + index * 2) % this.colors.length;
                let colorValue = this.colors[targetIndex];

                // 为背景色添加透明度
                if (cssVar.includes('bg')) {
                    colorValue += '20'; // 添加透明度
                }

                root.style.setProperty(cssVar, colorValue);
            });

            // 随机背景闪烁
            if (Math.random() > 0.7) {
                document.body.style.backgroundColor = this.colors[
                (colorIndex + 5) % this.colors.length
                    ] + '10';
            }

        }, 400); // 每400ms换一次颜色
    }

    // 停止颜色动画
    stopColorAnimation() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    // 移除注入的样式
    removeStyles() {
        if (this.animationStyle) {
            document.head.removeChild(this.animationStyle);
            this.animationStyle = null;
        }
        document.body.classList.remove('mushroom-trip-active');
    }

    // 重置颜色到默认值
    resetColors() {
        const root = document.documentElement;
        Object.keys(this.cssVarMap).forEach(cssVar => {
            root.style.removeProperty(cssVar);
        });
        document.body.style.backgroundColor = '';
    }

    // 获取当前状态
    getStatus() {
        return this.isTripping ? 'tripping' : 'sober';
    }

    // 设置自定义颜色数组
    setColors(newColors) {
        if (Array.isArray(newColors) && newColors.length > 0) {
            this.colors = newColors;
        }
    }

    // 设置动画速度 (ms)
    setSpeed(speed) {
        if (this.isTripping) {
            this.stopColorAnimation();
            this.startColorAnimation(speed);
        }
    }
}

// 创建单例
const mushroomTrip = new MushroomTrip();

export default mushroomTrip;