// 获取canvas元素和上下文
const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const timeRangeStartSpan = document.getElementById('timeRangeStart');
const timeRangeEndSpan = document.getElementById('timeRangeEnd');
const minutesDiffSpan = document.getElementById('minutesDiff');

// 创建离屏画布（用于绘制静态元素）
const offscreenCanvas = document.createElement('canvas');
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext('2d');

// 标记静态画布是否需要更新
let staticCanvasNeedsUpdate = true;

// 导入dialog.js模块
import { 
    showTimeRangeDialog, 
    hideTimeRangeDialog, 
    getConfirmButton, 
    getCancelButton,
    getStartTimeInput,
    getEndTimeInput
} from './dialog.js';

// 初始化对话框事件
function initDialogEvents() {
    // 确认按钮事件
    getConfirmButton().addEventListener('click', () => {
        const startTime = getStartTimeInput().value;
        const endTime = getEndTimeInput().value;
        
        if (startTime && endTime) {
            // 解析时间
            const startParts = startTime.split(':');
            const endParts = endTime.split(':');
            
            const startHours = parseInt(startParts[0]);
            const startMinutes = parseInt(startParts[1]);
            const endHours = parseInt(endParts[0]);
            const endMinutes = parseInt(endParts[1]);
            
            // 转换为角度
            const startAngle = timeToAngle(startHours, startMinutes);
            const endAngle = timeToAngle(endHours, endMinutes);
            
            // 更新时间范围
            selectedTimeRange.start = startAngle;
            selectedTimeRange.end = endAngle;
            
            // 更新显示
            updateTimeRangeDisplay(startAngle, endAngle);
            drawClock();
        }
        
        // 关闭对话框
        hideTimeRangeDialog();
    });
    
    // 取消按钮事件
    getCancelButton().addEventListener('click', () => {
        hideTimeRangeDialog();
    });
}

// 时钟参数
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = Math.min(centerX, centerY) - 10;
const outerRingRadius = radius; // 外环半径
const numberRingRadius = radius * 0.8; // 数字环半径
const innerRingOuterRadius = radius * 0.7; // 内环外半径
const innerRingInnerRadius = radius * 0.55; // 内环内半径

// 拖拽状态
let isDragging = false;
let dragType = null; // 'start' 或 'end'或'drag'
let dragStartAngle = 0;
let dragEndAngle = 0;
let selectedTimeRangeMouseAngle = 0;
let selectedTimeRange = { start: null, end: null };

// 绘制静态元素到离屏画布
function drawStaticElements() {
    // 清除离屏画布
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    
    // 绘制外环
    drawOuterRing(offscreenCtx);
    
    // 绘制内环
    drawInnerRing(offscreenCtx);
    
    // 绘制秒刻度
    drawSecondMarks(offscreenCtx);
    
    // 绘制数字
    drawNumbers(offscreenCtx);
    
    staticCanvasNeedsUpdate = false;
}

// 绘制动态元素（指针和时间范围）到主画布
function drawDynamicElements() {
    // 先绘制静态元素的内容
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
    
    // 绘制选择的时间范围
    if (selectedTimeRange.start !== null && selectedTimeRange.end !== null) {
        drawSelectedRange(selectedTimeRange.start, selectedTimeRange.end);
    }
    
    // 绘制指针
    drawHands();
}

// 绘制时钟 - 优化版本
function drawClock() {
    // 如果静态画布需要更新，则先更新
    if (staticCanvasNeedsUpdate) {
        drawStaticElements();
    }
    
    // 绘制动态元素
    drawDynamicElements();
}

// 只绘制选择范围（不重绘整个时钟）
function drawOnlySelectedRange() {
    // 先绘制静态元素的内容（包含指针）
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offscreenCanvas, 0, 0);
    
    // 只绘制选择的时间范围
    if (selectedTimeRange.start !== null && selectedTimeRange.end !== null) {
        drawSelectedRange(selectedTimeRange.start, selectedTimeRange.end);
    }
    
    // 绘制当前时间指针（保持指针显示）
    drawHands();
}

// 绘制外环
function drawOuterRing(drawingCtx = ctx) {
    drawingCtx.beginPath();
    drawingCtx.arc(centerX, centerY, outerRingRadius, 0, Math.PI * 2);
    
    // 绘制外环边框
    drawingCtx.strokeStyle = '#666666';
    drawingCtx.lineWidth = 2;
    drawingCtx.stroke();
}

// 绘制秒刻度
function drawSecondMarks(drawingCtx = ctx) {
    drawingCtx.strokeStyle = '#cccccc';
    
    for (let i = 0; i < 60; i++) {
        const angle = i * Math.PI / 30; // 每6度一个刻度
        const startRadius = outerRingRadius * 0.95; // 刻度起始位置
        
        // 每5秒的刻度长一些，其他秒的刻度短一些
        const endRadius = i % 5 === 0 ? outerRingRadius * 0.88 : outerRingRadius * 0.9;
        
        drawingCtx.beginPath();
        drawingCtx.moveTo(
            centerX + Math.cos(angle) * startRadius,
            centerY + Math.sin(angle) * startRadius
        );
        drawingCtx.lineTo(
            centerX + Math.cos(angle) * endRadius,
            centerY + Math.sin(angle) * endRadius
        );
        drawingCtx.lineWidth = i % 5 === 0 ? 3 : 1;
        drawingCtx.stroke();
    }
}

// 绘制数字
function drawNumbers(drawingCtx = ctx) {
    drawingCtx.font = '20px Arial';
    drawingCtx.fillStyle = '#ffffff';
    drawingCtx.textAlign = 'center';
    drawingCtx.textBaseline = 'middle';
    
    for (let i = 1; i <= 12; i++) {
        const angle = (i - 3) * Math.PI / 6;
        const x = centerX + Math.cos(angle) * numberRingRadius;
        const y = centerY + Math.sin(angle) * numberRingRadius;
        drawingCtx.fillText(i.toString(), x, y);
    }
}

// 绘制内环
function drawInnerRing(drawingCtx = ctx) {
    // 绘制外环
    drawingCtx.beginPath();
    drawingCtx.arc(centerX, centerY, innerRingOuterRadius, 0, Math.PI * 2);
    drawingCtx.strokeStyle = '#666666';
    drawingCtx.lineWidth = 2;
    drawingCtx.stroke();
    
    // 绘制内环
    drawingCtx.beginPath();
    drawingCtx.arc(centerX, centerY, innerRingInnerRadius, 0, Math.PI * 2);
    drawingCtx.strokeStyle = '#555555';
    drawingCtx.lineWidth = 2;
    drawingCtx.stroke();
}

// 绘制指针
function drawHands() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // 绘制时针 - 12点方向
    const hourAngle = (hours + minutes / 60 + seconds / 3600) * Math.PI / 6 - Math.PI / 2;
    drawHand(hourAngle, radius * 0.5, 6, '#7e7e7e');
    
    // 绘制分针 - 12点方向
    const minuteAngle = (minutes + seconds / 60) * Math.PI / 30 - Math.PI / 2;
    drawHand(minuteAngle, radius * 0.75, 4, '#88b3b3');
    
    // 绘制秒针 - 12点方向
    const secondAngle = seconds * Math.PI / 30 - Math.PI / 2;
    drawHand(secondAngle, radius * 0.88, 2, '#ff0000');
    
    // 绘制中心点
    drawCenter();
}

// 绘制单根指针
function drawHand(angle, length, width, color) {
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// 绘制中心点
function drawCenter() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

// 绘制选择的时间范围
function drawSelectedRange(startAngle, endAngle) {
    // 对角度进行四舍五入，减少微小波动导致的抖动
    const normalizedStart = Math.round(startAngle * 100) / 100;
    const normalizedEnd = Math.round(endAngle * 100) / 100;
    
    // 计算角度差，确保绘制正确的圆弧
    let drawStart = normalizedStart;
    let drawEnd = normalizedEnd;
    
    // 如果结束角度小于起始角度，添加2π使其大于起始角度
    if (drawEnd < drawStart) {
        drawEnd += Math.PI * 2;
    }
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, (innerRingOuterRadius + innerRingInnerRadius) / 2, drawStart, drawEnd);
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = innerRingOuterRadius - innerRingInnerRadius;
    ctx.lineCap = 'butt';
    ctx.stroke();
    
    // 绘制起始点和结束点标记
    drawRangeMarker(normalizedStart, '#00ff00');
    drawRangeMarker(normalizedEnd, '#ff0000');
}

// 绘制时间范围标记
function drawRangeMarker(angle, color) {
    const markerRadius = innerRingOuterRadius + 5;
    ctx.beginPath();
    ctx.arc(
        centerX + Math.cos(angle) * markerRadius,
        centerY + Math.sin(angle) * markerRadius,
        5,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = color;
    ctx.fill();
}

// 获取鼠标位置对应的角度
function getAngleFromMouse(event) {
    const rect = canvas.getBoundingClientRect();
    // 计算鼠标相对于canvas中心点的位置
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;
    // 计算弧度（从x轴正方向开始，逆时针为正）
    let angle = Math.atan2(y, x);

    // 确保弧度在0到2π之间
    if (angle < 0) {
        angle += Math.PI * 2;
    }
    // 四舍五入到小数点后2位，减少精度波动导致的抖动
    // 约1.15度的精度，对于时钟来说已经足够精确
    return Math.round(angle * 100) / 100;
}

// 检查鼠标是否在内环区域
function isInInnerRing(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - centerX;
    const y = event.clientY - rect.top - centerY;
    const distance = Math.sqrt(x * x + y * y);
    return distance >= innerRingInnerRadius && distance <= innerRingOuterRadius;
}

// 检查鼠标是否在时间范围标记上
function isOnTimeMarker(event) {
    if (selectedTimeRange.start === null || selectedTimeRange.end === null) {
        return null;
    }
    
    if(isInInnerRing(event)) {
        // 计算当前位置是否在时间范围标记上
        const currentAngle = getAngleFromMouse(event);
        const endAngle = selectedTimeRange.end > selectedTimeRange.start ? selectedTimeRange.end : selectedTimeRange.end + Math.PI * 2;
        if(currentAngle >= selectedTimeRange.start && currentAngle <= endAngle) {
            return {type: 'drag', mouseAngle: currentAngle};
        }
    }

    return null;
}

// 角度转换为时间
function angleToTime(angle) {
    const adjustedAngle = (angle + Math.PI * 1 / 2) % (Math.PI * 2);
    const hours = Math.floor((adjustedAngle / (Math.PI * 2)) * 12);
    const minutes = Math.floor(((adjustedAngle / (Math.PI * 2)) * 12 * 60) % 60);
    return { hours: hours === 0 ? 12 : hours, minutes };
}

// 格式化时间
function formatTime(time) {
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 时间转换为角度
function timeToAngle(hours, minutes) {
    // 将12小时制转换为24小时制
    const adjustedHours = hours % 12;
    // 计算角度 (从3点开始顺时针计算)
    const hourAngle = (adjustedHours + minutes / 60) * Math.PI / 6;
    return (hourAngle + Math.PI * 3 / 2) % (Math.PI * 2);
}

// 更新时间范围显示
function updateTimeRangeDisplay(startAngle, endAngle) {
    const startTime = angleToTime(startAngle);
    const endTime = angleToTime(endAngle);

    let minutesDiff = 0;
    // 计算二者相差多少分钟
    if(startTime.hours > endTime.hours) {
        // 跨天情况
        minutesDiff = (12 * 60 - startTime.hours * 60 - startTime.minutes) + endTime.hours * 60 + endTime.minutes;
    } else if(startTime.hours === endTime.hours && startTime.minutes > endTime.minutes){
        // 跨天情况
        minutesDiff = (12 * 60 - startTime.hours * 60 - startTime.minutes) + endTime.hours * 60 + endTime.minutes;
    } else {
        // 正常情况
        minutesDiff = (endTime.hours * 60 + endTime.minutes) - (startTime.hours * 60 + startTime.minutes);
    }
    const hoursDiff = Math.floor(minutesDiff / 60);
    timeRangeStartSpan.textContent = `${formatTime(startTime)}`;
    timeRangeEndSpan.textContent = `${formatTime(endTime)}`;
    minutesDiffSpan.textContent = ` 相差 ${hoursDiff} 小时 ${minutesDiff % 60} 分钟`;
}



timeRangeStartSpan.addEventListener('click', () => {
    showTimeRangeDialog();
})

timeRangeEndSpan.addEventListener('click', () => {
    showTimeRangeDialog();
})

// 鼠标事件处理
canvas.addEventListener('mousedown', (event) => {
    // 检查是否点击在时间范围标记上
    const markerType = isOnTimeMarker(event);
    if (markerType) {
        console.log('点击了时间范围标记', markerType);
        isDragging = true;
        dragType = markerType.type;
        selectedTimeRangeMouseAngle = markerType.mouseAngle;
        drawClock();
    } else if (isInInnerRing(event)) {
        // 如果没有点击在标记上，则创建新的时间范围
        isDragging = true;
        dragType = null;
        dragStartAngle = getAngleFromMouse(event);
        dragEndAngle = dragStartAngle;
        selectedTimeRange = { start: dragStartAngle, end: dragEndAngle };
        drawClock();
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const currentAngle = getAngleFromMouse(event);
        let newStartAngle = dragStartAngle;
        let newEndAngle = dragEndAngle;
        
        if (dragType === 'start') {
            // 直接使用四舍五入后的角度，已经足够稳定
            newStartAngle = currentAngle;
            
            // 确保起始角度变化后，结束角度仍然大于起始角度
            if (newEndAngle < newStartAngle) {
                newEndAngle += Math.PI * 2;
            }
        } else if (dragType === 'end') {
            // 直接使用四舍五入后的角度，已经足够稳定
            newEndAngle = currentAngle;
            
            // 确保结束角度始终大于起始角度
            if (newEndAngle < newStartAngle) {
                newEndAngle += Math.PI * 2;
            }
        } else if (dragType === 'drag') {
            // 计算鼠标移动位置的差值
            const angleDiff = currentAngle - selectedTimeRangeMouseAngle;
            newStartAngle += angleDiff;
            newEndAngle += angleDiff;
            console.log(angleDiff, currentAngle, selectedTimeRangeMouseAngle)
            // 更新鼠标角度为当前角度，用于后续拖动
            selectedTimeRangeMouseAngle = currentAngle;
        } else {
            // 创建新的时间范围
            // 直接使用四舍五入后的角度，已经足够稳定
            newEndAngle = currentAngle;
            
            // 确保结束角度始终大于起始角度
            if (newEndAngle < newStartAngle) {
                newEndAngle += Math.PI * 2;
            }
        }
        
        // 只有当角度确实发生变化时才更新和重绘
        // 由于已经进行了四舍五入，微小变化会被过滤掉
        if (Math.abs(newStartAngle - dragStartAngle) > 0.01 || Math.abs(newEndAngle - dragEndAngle) > 0.01) {
            // 立即更新角度变量
            dragStartAngle = newStartAngle;
            dragEndAngle = newEndAngle;
            
            // 立即更新时间范围
            selectedTimeRange = { start: newStartAngle, end: newEndAngle };
            updateTimeRangeDisplay(newStartAngle, newEndAngle);
            
            // 只绘制选择范围，不重绘整个时钟
            drawOnlySelectedRange();
        }
    }
    
    // 更新鼠标指针样式
    const markerType = isOnTimeMarker(event);
    if (markerType || isInInnerRing(event)) {
        canvas.style.cursor = 'pointer';
    } else {
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDragging) {
        console.log(centerX)
        isDragging = false;
        dragType = null;
        // 确保结束角度大于起始角度
        if (dragEndAngle < dragStartAngle) {
            dragEndAngle += Math.PI * 2;
        }
        selectedTimeRange = { start: dragStartAngle, end: dragEndAngle };
        updateTimeRangeDisplay(dragStartAngle, dragEndAngle);
        drawClock();
    }
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    dragType = null;
    canvas.style.cursor = 'default';
});

// 初始化
function init() {
    // 先绘制静态元素
    drawStaticElements();
    
    // 绘制动态元素
    drawDynamicElements();
    
    // 每秒更新一次动态元素（主要是指针）
    setInterval(() => {
        // 标记静态画布不需要更新，只更新动态元素
        drawDynamicElements();
    }, 1000);
    
    // 初始化对话框事件
    initDialogEvents();
    
    // 为时间范围显示添加鼠标悬停效果
    timeRangeStartSpan.style.cursor = 'pointer';
    timeRangeStartSpan.style.textDecoration = 'underline';
    timeRangeEndSpan.style.cursor = 'pointer';
    timeRangeEndSpan.style.textDecoration = 'underline';
}

// 页面加载完成后初始化
window.addEventListener('load', init);