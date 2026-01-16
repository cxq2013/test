// 获取canvas元素和上下文
const canvas = document.getElementById('clockCanvas');
const ctx = canvas.getContext('2d');
const timeRangeStartSpan = document.getElementById('timeRangeStart');
const timeRangeEndSpan = document.getElementById('timeRangeEnd');
const minutesDiffSpan = document.getElementById('minutesDiff');

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
let dragType = null; // 'start' 或 'end'
let dragStartAngle = 0;
let dragEndAngle = 0;
let selectedTimeRange = { start: null, end: null };

// 绘制时钟
function drawClock() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制外环
    drawOuterRing();
    
    // 绘制内环
    drawInnerRing();
    
    // 绘制秒刻度
    drawSecondMarks();
    
    // 绘制数字
    drawNumbers();
    
    // 绘制中心点
    drawCenter();
    
    // 绘制选择的时间范围
    if (selectedTimeRange.start !== null && selectedTimeRange.end !== null) {
        drawSelectedRange(selectedTimeRange.start, selectedTimeRange.end);
    }
    
    // 绘制指针
    drawHands();
}

// 绘制外环
function drawOuterRing() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#cccccc';
    
    // 绘制外环边框
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 绘制秒刻度
function drawSecondMarks() {
    ctx.strokeStyle = '#cccccc';
    
    for (let i = 0; i < 60; i++) {
        const angle = i * Math.PI / 30; // 每6度一个刻度
        const startRadius = outerRingRadius * 0.95; // 刻度起始位置
        
        // 每5秒的刻度长一些，其他秒的刻度短一些
        const endRadius = i % 5 === 0 ? outerRingRadius * 0.88 : outerRingRadius * 0.9;
        
        ctx.beginPath();
        ctx.moveTo(
            centerX + Math.cos(angle) * startRadius,
            centerY + Math.sin(angle) * startRadius
        );
        ctx.lineTo(
            centerX + Math.cos(angle) * endRadius,
            centerY + Math.sin(angle) * endRadius
        );
        ctx.lineWidth = i % 5 === 0 ? 3 : 1;
        ctx.stroke();
    }
}

// 绘制数字
function drawNumbers() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    for (let i = 1; i <= 12; i++) {
        const angle = (i - 3) * Math.PI / 6; // 从3点开始
        const x = centerX + Math.cos(angle) * numberRingRadius;
        const y = centerY + Math.sin(angle) * numberRingRadius;
        ctx.fillText(i.toString(), x, y);
    }
}

// 绘制内环
function drawInnerRing() {
    // 绘制外环
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRingOuterRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 绘制内环
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRingInnerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.stroke();
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
    ctx.beginPath();
    ctx.arc(centerX, centerY, (innerRingOuterRadius + innerRingInnerRadius) / 2, startAngle, endAngle);
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = innerRingOuterRadius - innerRingInnerRadius;
    ctx.lineCap = 'butt';
    ctx.stroke();
    
    // 绘制起始点和结束点标记
    drawRangeMarker(startAngle, '#00ff00');
    drawRangeMarker(endAngle, '#ff0000');
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
    return angle;
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
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const markerRadius = 5;
    const markerDistance = innerRingOuterRadius + 5;
    
    // 检查起始点标记
    const startX = centerX + Math.cos(selectedTimeRange.start) * markerDistance;
    const startY = centerY + Math.sin(selectedTimeRange.start) * markerDistance;
    const startDistance = Math.sqrt((mouseX - startX) ** 2 + (mouseY - startY) ** 2);
    
    if (startDistance <= markerRadius) {
        return 'start';
    }
    
    // 检查结束点标记
    const endX = centerX + Math.cos(selectedTimeRange.end) * markerDistance;
    const endY = centerY + Math.sin(selectedTimeRange.end) * markerDistance;
    const endDistance = Math.sqrt((mouseX - endX) ** 2 + (mouseY - endY) ** 2);
    
    if (endDistance <= markerRadius) {
        return 'end';
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
        isDragging = true;
        dragType = markerType;
        if (markerType === 'start') {
            dragStartAngle = getAngleFromMouse(event);
        } else {
            dragEndAngle = getAngleFromMouse(event);
        }
        selectedTimeRange = { start: dragStartAngle, end: dragEndAngle };
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
        if (dragType === 'start') {
            dragStartAngle = currentAngle;
        } else if (dragType === 'end') {
            dragEndAngle = currentAngle;
        } else {
            // 创建新的时间范围
            dragEndAngle = currentAngle;
        }
        selectedTimeRange = { start: dragStartAngle, end: dragEndAngle };
        updateTimeRangeDisplay(dragStartAngle, dragEndAngle);
        drawClock();
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
    drawClock();
    // 每秒更新一次
    setInterval(drawClock, 1000);
    
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