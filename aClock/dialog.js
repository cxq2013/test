// dialog.js - 时间范围选择对话框功能

// 时间范围选择对话框单例实例
let timeRangeDialog = null;

// 创建时间范围选择对话框
export function createTimeRangeDialog() {
    // 检查对话框是否已存在
    if (timeRangeDialog) {
        return timeRangeDialog;
    }
    
    // 创建对话框容器
    const dialog = document.createElement('div');
    dialog.id = 'timeRangeDialog';
    dialog.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #333;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        color: #fff;
        z-index: 1000;
        font-family: Arial, sans-serif;
    `;
    
    // 创建标题
    const title = document.createElement('h3');
    title.textContent = '设置时间范围';
    title.style.marginTop = '0';
    title.style.marginBottom = '20px';
    dialog.appendChild(title);
    
    // 创建起始时间选择
    const startTimeContainer = document.createElement('div');
    startTimeContainer.style.marginBottom = '15px';
    
    const startTimeLabel = document.createElement('label');
    startTimeLabel.textContent = '起始时间: ';
    startTimeLabel.style.marginRight = '10px';
    
    const startTimeInput = document.createElement('input');
    startTimeInput.type = 'time';
    startTimeInput.id = 'startTimeInput';
    startTimeInput.style.padding = '5px';
    startTimeInput.style.fontSize = '16px';
    
    startTimeContainer.appendChild(startTimeLabel);
    startTimeContainer.appendChild(startTimeInput);
    dialog.appendChild(startTimeContainer);
    
    // 创建结束时间选择
    const endTimeContainer = document.createElement('div');
    endTimeContainer.style.marginBottom = '20px';
    
    const endTimeLabel = document.createElement('label');
    endTimeLabel.textContent = '结束时间: ';
    endTimeLabel.style.marginRight = '10px';
    
    const endTimeInput = document.createElement('input');
    endTimeInput.type = 'time';
    endTimeInput.id = 'endTimeInput';
    endTimeInput.style.padding = '5px';
    endTimeInput.style.fontSize = '16px';
    
    endTimeContainer.appendChild(endTimeLabel);
    endTimeContainer.appendChild(endTimeInput);
    dialog.appendChild(endTimeContainer);
    
    // 创建按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.textAlign = 'center';
    
    // 创建确认按钮
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = '确定';
    confirmBtn.style.cssText = `
        margin: 0 10px;
        padding: 8px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    `;
    
    // 创建取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = '取消';
    cancelBtn.style.cssText = `
        margin: 0 10px;
        padding: 8px 20px;
        background-color: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    `;
    
    // 添加按钮到容器
    buttonContainer.appendChild(confirmBtn);
    buttonContainer.appendChild(cancelBtn);
    dialog.appendChild(buttonContainer);
    
    // 默认隐藏
    dialog.style.display = 'none';
    
    // 添加到页面
    document.body.appendChild(dialog);
    
    // 保存实例
    timeRangeDialog = dialog;
    
    return dialog;
}

// 显示时间范围选择对话框
export function showTimeRangeDialog() {
    const dialog = createTimeRangeDialog();
    dialog.style.display = 'block';
}

// 隐藏时间范围选择对话框
export function hideTimeRangeDialog() {
    if (timeRangeDialog) {
        timeRangeDialog.style.display = 'none';
    }
}

// 获取确认按钮元素
export function getConfirmButton() {
    const dialog = createTimeRangeDialog();
    // 返回第一个按钮（确认按钮）
    return dialog.querySelectorAll('button')[0];
}

// 获取取消按钮元素
export function getCancelButton() {
    const dialog = createTimeRangeDialog();
    // 返回第二个按钮（取消按钮）
    return dialog.querySelectorAll('button')[1];
}

// 获取起始时间输入元素
export function getStartTimeInput() {
    return document.getElementById('startTimeInput');
}

// 获取结束时间输入元素
export function getEndTimeInput() {
    return document.getElementById('endTimeInput');
}
