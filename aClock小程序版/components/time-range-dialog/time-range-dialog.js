// timeRangeDialog.js
Component({
  properties: {
    // 组件属性
  },
  
  data: {
    startTime: '00:00',
    endTime: '00:00'
  },
  
  methods: {
    // 绑定起始时间变化
    bindStartTimeChange(e) {
      this.setData({ startTime: e.detail.value });
    },
    
    // 绑定结束时间变化
    bindEndTimeChange(e) {
      this.setData({ endTime: e.detail.value });
    },
    
    // 处理确认
    handleConfirm() {
      this.triggerEvent('confirm', {
        startTime: this.data.startTime,
        endTime: this.data.endTime
      });
    },
    
    // 处理取消
    handleCancel() {
      this.triggerEvent('cancel');
    }
  }
});