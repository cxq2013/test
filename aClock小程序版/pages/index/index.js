// index.js
Page({
  data: {
    timeRangeStart: '--:--',
    timeRangeEnd: '--:--',
    minutesDiff: '',
    showDialog: false,
    selectedTimeRange: { start: null, end: null },
    isDragging: false,
    dragType: null, // 'start' 或 'end'或'drag'
    selectedTimeRangeMouseAngle: 0, // 记录选中时间范围时的鼠标角度
    dragStartAngle: 0,
    dragEndAngle: 0
  },

  onLoad() {
    // 初始化Canvas
    this.initCanvas();
    // 开始时钟动画
    this.startClock();
  },

  // 初始化Canvas
  initCanvas() {
    this.canvas = wx.createCanvasContext('clockCanvas');

    // 获取屏幕宽度
    const systemInfo = wx.getSystemInfoSync();
    const screenWidth = systemInfo.screenWidth;
    
    // 设置Canvas尺寸为屏幕宽度
    this.canvasWidth = screenWidth;
    this.canvasHeight = screenWidth;
    this.centerX = this.canvasWidth / 2;
    this.centerY = this.canvasHeight / 2;
    this.radius = Math.min(this.centerX, this.centerY) - 10;
    this.outerRingRadius = this.radius;
    this.numberRingRadius = this.radius * 0.8;
    this.innerRingOuterRadius = this.radius * 0.7;
    this.innerRingInnerRadius = this.radius * 0.55;
    
    // 绘制静态元素
    this.drawStaticElements();
  },

  // 开始时钟动画
  startClock() {
    this.updateClock();
    setInterval(() => {
      this.updateClock();
    }, 1000);
  },

  // 更新时钟
  updateClock() {
    // 清除画布
    this.canvas.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // 绘制静态元素
    this.drawStaticElements();
    
    // 绘制时间范围
    if (this.data.selectedTimeRange.start !== null && this.data.selectedTimeRange.end !== null) {
      this.drawSelectedRange(this.data.selectedTimeRange.start, this.data.selectedTimeRange.end);
    }
    
    // 绘制指针
    this.drawHands();
    
    // 执行绘制
    this.canvas.draw();
  },

  // 绘制静态元素
  drawStaticElements() {
    // 绘制外环
    this.drawOuterRing();
    
    // 绘制内环
    this.drawInnerRing();
    
    // 绘制秒刻度
    this.drawSecondMarks();
    
    // 绘制数字
    this.drawNumbers();
  },

  // 绘制外环
  drawOuterRing() {
    this.canvas.beginPath();
    this.canvas.arc(this.centerX, this.centerY, this.outerRingRadius, 0, Math.PI * 2);
    this.canvas.setStrokeStyle('#666666');
    this.canvas.setLineWidth(2);
    this.canvas.stroke();
  },

  // 绘制内环
  drawInnerRing() {
    // 绘制外环
    this.canvas.beginPath();
    this.canvas.arc(this.centerX, this.centerY, this.innerRingOuterRadius, 0, Math.PI * 2);
    this.canvas.setStrokeStyle('#666666');
    this.canvas.setLineWidth(2);
    this.canvas.stroke();
    
    // 绘制内环
    this.canvas.beginPath();
    this.canvas.arc(this.centerX, this.centerY, this.innerRingInnerRadius, 0, Math.PI * 2);
    this.canvas.setStrokeStyle('#555555');
    this.canvas.setLineWidth(2);
    this.canvas.stroke();
  },

  // 绘制秒刻度
  drawSecondMarks() {
    this.canvas.setStrokeStyle('#cccccc');
    
    for (let i = 0; i < 60; i++) {
      const angle = i * Math.PI / 30;
      const startRadius = this.outerRingRadius * 0.95;
      const endRadius = i % 5 === 0 ? this.outerRingRadius * 0.88 : this.outerRingRadius * 0.9;
      
      this.canvas.beginPath();
      this.canvas.moveTo(
        this.centerX + Math.cos(angle) * startRadius,
        this.centerY + Math.sin(angle) * startRadius
      );
      this.canvas.lineTo(
        this.centerX + Math.cos(angle) * endRadius,
        this.centerY + Math.sin(angle) * endRadius
      );
      this.canvas.setLineWidth(i % 5 === 0 ? 3 : 1);
      this.canvas.stroke();
    }
  },

  // 绘制数字
  drawNumbers() {
    this.canvas.setFontSize(20);
    this.canvas.setFillStyle('#ffffff');
    this.canvas.setTextAlign('center');
    this.canvas.setTextBaseline('middle');
    
    for (let i = 1; i <= 12; i++) {
      const angle = (i - 3) * Math.PI / 6;
      const x = this.centerX + Math.cos(angle) * this.numberRingRadius;
      const y = this.centerY + Math.sin(angle) * this.numberRingRadius;
      this.canvas.fillText(i.toString(), x, y);
    }
  },

  // 绘制指针
  drawHands() {
    const now = new Date();
    const hours = now.getHours() % 12;
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // 绘制时针
    const hourAngle = (hours + minutes / 60 + seconds / 3600) * Math.PI / 6 - Math.PI / 2;
    this.drawHand(hourAngle, this.radius * 0.5, 6, '#7e7e7e');
    
    // 绘制分针
    const minuteAngle = (minutes + seconds / 60) * Math.PI / 30 - Math.PI / 2;
    this.drawHand(minuteAngle, this.radius * 0.75, 4, '#88b3b3');
    
    // 绘制秒针
    const secondAngle = seconds * Math.PI / 30 - Math.PI / 2;
    this.drawHand(secondAngle, this.radius * 0.88, 2, '#ff0000');
    
    // 绘制中心点
    this.drawCenter();
  },

  // 绘制单根指针
  drawHand(angle, length, width, color) {
    this.canvas.beginPath();
    this.canvas.moveTo(this.centerX, this.centerY);
    this.canvas.lineTo(this.centerX + Math.cos(angle) * length, this.centerY + Math.sin(angle) * length);
    this.canvas.setStrokeStyle(color);
    this.canvas.setLineWidth(width);
    this.canvas.stroke();
  },

  // 绘制中心点
  drawCenter() {
    this.canvas.beginPath();
    this.canvas.arc(this.centerX, this.centerY, 5, 0, Math.PI * 2);
    this.canvas.setFillStyle('#ffffff');
    this.canvas.fill();
  },

  // 绘制时间范围
  drawSelectedRange(startAngle, endAngle) {
    const normalizedStart = Math.round(startAngle * 100) / 100;
    const normalizedEnd = Math.round(endAngle * 100) / 100;
    
    let drawStart = normalizedStart;
    let drawEnd = normalizedEnd;
    
    if (drawEnd < drawStart) {
      drawEnd += Math.PI * 2;
    }
    
    this.canvas.beginPath();
    this.canvas.arc(this.centerX, this.centerY, (this.innerRingOuterRadius + this.innerRingInnerRadius) / 2, drawStart, drawEnd);
    this.canvas.setStrokeStyle('#00aaff');
    this.canvas.setLineWidth(this.innerRingOuterRadius - this.innerRingInnerRadius);
    this.canvas.stroke();
    
    // 绘制起始点和结束点标记
    this.drawRangeMarker(normalizedStart, '#00ff00');
    this.drawRangeMarker(normalizedEnd, '#ff0000');
  },

  // 绘制时间范围标记
  drawRangeMarker(angle, color) {
    const markerRadius = this.innerRingOuterRadius + 5;
    this.canvas.beginPath();
    this.canvas.arc(
      this.centerX + Math.cos(angle) * markerRadius,
      this.centerY + Math.sin(angle) * markerRadius,
      5,
      0,
      Math.PI * 2
    );
    this.canvas.setFillStyle(color);
    this.canvas.fill();
  },

  // 获取触摸位置对应的角度
  getAngleFromTouch(touch) {
    const x = touch.x - this.centerX;
    const y = touch.y - this.centerY;
    let angle = Math.atan2(y, x);
    
    if (angle < 0) {
      angle += Math.PI * 2;
    }
    return Math.round(angle * 100) / 100;
  },

  // 检查触摸是否在内环区域
  isInInnerRing(touch) {
    const x = touch.x - this.centerX;
    const y = touch.y - this.centerY;
    const distance = Math.sqrt(x * x + y * y);
    return distance >= this.innerRingInnerRadius && distance <= this.innerRingOuterRadius;
  },

  // 检查触摸是否在时间范围标记上
  isOnTimeMarker(touch) {
    if (this.data.selectedTimeRange.start === null || this.data.selectedTimeRange.end === null) {
      return null;
    }
    
    const markerRadius = 10;
    const markerDistance = this.innerRingOuterRadius + markerRadius;
    
    // 检查起始点标记
    const startX = this.centerX + Math.cos(this.data.selectedTimeRange.start) * markerDistance;
    const startY = this.centerY + Math.sin(this.data.selectedTimeRange.start) * markerDistance;
    const startDistance = Math.sqrt((touch.x - startX) ** 2 + (touch.y - startY) ** 2);
    
    if (startDistance <= markerRadius) {
      return 'start';
    }
    
    // 检查结束点标记
    const endX = this.centerX + Math.cos(this.data.selectedTimeRange.end) * markerDistance;
    const endY = this.centerY + Math.sin(this.data.selectedTimeRange.end) * markerDistance;
    const endDistance = Math.sqrt((touch.x - endX) ** 2 + (touch.y - endY) ** 2);
    
    if (endDistance <= markerRadius) {
      return 'end';
    }
      
    if(this.isInInnerRing(touch)) {
      // 计算当前位置是否在时间范围标记上
      const currentAngle = this.getAngleFromTouch(touch);
      const endAngle = this.data.selectedTimeRange.end > this.data.selectedTimeRange.start ? this.data.selectedTimeRange.end : this.data.selectedTimeRange.end + Math.PI * 2;
      if(currentAngle >= this.data.selectedTimeRange.start && currentAngle <= endAngle) {
        return {type: 'drag', mouseAngle: currentAngle};
      }
    }
    
    return null;
  },

  // 角度转换为时间
  angleToTime(angle) {
    const adjustedAngle = (angle + Math.PI * 1 / 2) % (Math.PI * 2);
    const hours = Math.floor((adjustedAngle / (Math.PI * 2)) * 12);
    const minutes = Math.floor(((adjustedAngle / (Math.PI * 2)) * 12 * 60) % 60);
    return { hours: hours === 0 ? 12 : hours, minutes };
  },

  // 格式化时间
  formatTime(time) {
    const hours = time.hours.toString().padStart(2, '0');
    const minutes = time.minutes.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 时间转换为角度
  timeToAngle(hours, minutes) {
    const adjustedHours = hours % 12;
    const hourAngle = (adjustedHours + minutes / 60) * Math.PI / 6;
    return (hourAngle + Math.PI * 3 / 2) % (Math.PI * 2);
  },

  // 更新时间范围显示
  updateTimeRangeDisplay(startAngle, endAngle) {
    const startTime = this.angleToTime(startAngle);
    const endTime = this.angleToTime(endAngle);

    let minutesDiff = 0;
    if (startTime.hours > endTime.hours) {
      minutesDiff = (12 * 60 - startTime.hours * 60 - startTime.minutes) + endTime.hours * 60 + endTime.minutes;
    } else if (startTime.hours === endTime.hours && startTime.minutes > endTime.minutes) {
      minutesDiff = (12 * 60 - startTime.hours * 60 - startTime.minutes) + endTime.hours * 60 + endTime.minutes;
    } else {
      minutesDiff = (endTime.hours * 60 + endTime.minutes) - (startTime.hours * 60 + startTime.minutes);
    }
    const hoursDiff = Math.floor(minutesDiff / 60);
    
    this.setData({
      timeRangeStart: this.formatTime(startTime),
      timeRangeEnd: this.formatTime(endTime),
      minutesDiff: ` 相差 ${hoursDiff} 小时 ${minutesDiff % 60} 分钟`
    });
  },

  // 触摸开始事件
  onTouchStart(e) {
    const touch = e.touches[0];
    const markerType = this.isOnTimeMarker(touch);
    
    if (markerType) {
      this.setData({
        isDragging: true,
        dragType: markerType.type ? markerType.type : markerType
      });
      
      if (markerType.type) {
        this.setData({ selectedTimeRangeMouseAngle: markerType.mouseAngle });
      }
      
      this.updateClock();
    } else if (this.isInInnerRing(touch)) {
      this.setData({
        isDragging: true,
        dragType: null,
        dragStartAngle: this.getAngleFromTouch(touch),
        dragEndAngle: this.getAngleFromTouch(touch),
        selectedTimeRange: { 
          start: this.getAngleFromTouch(touch), 
          end: this.getAngleFromTouch(touch) 
        }
      });
      this.updateClock();
    }
  },

  // 触摸移动事件
  onTouchMove(e) {
    if (this.data.isDragging) {
      const touch = e.touches[0];
      const currentAngle = this.getAngleFromTouch(touch);
      let newStartAngle = this.data.dragStartAngle;
      let newEndAngle = this.data.dragEndAngle;
      
      if (this.data.dragType === 'start') {
        newStartAngle = currentAngle;
        if (newEndAngle < newStartAngle) {
          newEndAngle += Math.PI * 2;
        }
      } else if (this.data.dragType === 'end') {
        newEndAngle = currentAngle;
        if (newEndAngle < newStartAngle) {
          newEndAngle += Math.PI * 2;
        }
      } else if (this.data.dragType === 'drag') {
        const angleDiff = currentAngle - this.data.selectedTimeRangeMouseAngle;
        newStartAngle += angleDiff;
        newEndAngle += angleDiff;
        this.data.selectedTimeRangeMouseAngle = currentAngle;
      } else {
        newEndAngle = currentAngle;
        if (newEndAngle < newStartAngle) {
          newEndAngle += Math.PI * 2;
        }
      }
      
      if (Math.abs(newStartAngle - this.data.dragStartAngle) > 0.01 || Math.abs(newEndAngle - this.data.dragEndAngle) > 0.01) {
        this.setData({
          dragStartAngle: newStartAngle,
          dragEndAngle: newEndAngle,
          selectedTimeRange: { start: newStartAngle, end: newEndAngle }
        });
        this.updateTimeRangeDisplay(newStartAngle, newEndAngle);
        this.updateClock();
      }
    }
  },

  // 触摸结束事件
  onTouchEnd() {
    if (this.data.isDragging) {
      this.setData({
        isDragging: false,
        dragType: null
      });
      
      let { dragStartAngle, dragEndAngle } = this.data;
      if (dragEndAngle < dragStartAngle) {
        dragEndAngle += Math.PI * 2;
      }
      
      // 确保角度差值至少为12度
      const minAngleDiff = 12 * Math.PI / 180;
      if (dragEndAngle - dragStartAngle < minAngleDiff) {
        dragEndAngle = dragStartAngle + minAngleDiff;
      }
      
      this.setData({
        selectedTimeRange: { start: dragStartAngle, end: dragEndAngle }
      });
      this.updateTimeRangeDisplay(dragStartAngle, dragEndAngle);
      this.updateClock();
    }
  },

  // 触摸取消事件
  onTouchCancel() {
    this.setData({
      isDragging: false,
      dragType: null
    });
  },

  // 显示时间范围对话框
  showTimeRangeDialog() {
    console.log('显示时间范围对话框');
    this.setData({ showDialog: true });
  },

  // 对话框确认事件
  onDialogConfirm(e) {
    const { startTime, endTime } = e.detail;
    
    if (startTime && endTime) {
      const startParts = startTime.split(':');
      const endParts = endTime.split(':');
      
      const startHours = parseInt(startParts[0]);
      const startMinutes = parseInt(startParts[1]);
      const endHours = parseInt(endParts[0]);
      const endMinutes = parseInt(endParts[1]);
      
      const startAngle = this.timeToAngle(startHours, startMinutes);
      const endAngle = this.timeToAngle(endHours, endMinutes);
      
      this.setData({
        selectedTimeRange: { start: startAngle, end: endAngle }
      });
      
      this.updateTimeRangeDisplay(startAngle, endAngle);
      this.updateClock();
    }
    
    this.setData({ showDialog: false });
  },

  // 对话框取消事件
  onDialogCancel() {
    this.setData({ showDialog: false });
  },

  onShareAppMessage() {
    return {
      title: '时钟时长', // 转发后显示的标题
      path: '/pages/index/index', // 转发后打开的具体页面路径，必须是以 / 开头的完整路径
    }
  },

  // 2. 配置分享到朋友圈
  onShareTimeline() {
    return {
      title: '时钟工具，大家快来使用吧', // 朋友圈展示的标题
    };
  }
});