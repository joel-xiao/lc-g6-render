import { icons } from './icons';

export function getUuid() {
  var s = [];
  var hexDigits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = "4"
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = "-"
  let uuid = s.join("")
  return uuid
}

export function getTextRect(text, style) {
  let span = document.createElement("span");
  span.innerText = text || '';
  document.body.appendChild(span);
  Object.assign(span.style, style);
  let rect = span.getBoundingClientRect();
  document.body.removeChild(span);
  span = null;
  return rect;
}

export function getRectSize(G6, str, maxWidth, fontSize) {
  let currentWidth = 0;
  str = str ? str + '' : '';
  const pattern = new RegExp("[\u4E00-\u9FA5]+");
  str.split("").forEach((letter, i) => {
    if (currentWidth > maxWidth) return;

    if (pattern.test(letter)) {
      currentWidth += fontSize;
    } else {
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }

    if (currentWidth > maxWidth) {
      currentWidth = maxWidth;
    }
  });

  return [currentWidth];
}

export function fittingStringRows(G6, str, maxWidth, fontSize, ellipsis = '...') {
  let currentWidth = 0;
  str = str || '';
  let res = str;
  let addn = 0;
  let currIdx = 0;
  let text = '';
  let newStr = ''
  str.split("").forEach((letter, i) => {
    text += letter;
    let rect = getTextRect(text, { fontSize });
    if (rect.width > (maxWidth + 30) && i < str.length - 1) { 
      newStr += `${text} \n`;
      text = '';
      addn++;
      if (addn === 2) {
        currIdx = i;
      }
    }
    if (i === str.length - 1 && text) {
      newStr += `${text}`;
    } 
  });
  

  if (currIdx) {
    newStr = `${newStr.substr(0, currIdx)}${ellipsis}`;
  }
  return newStr || res;
}

export function fittingString(G6, str, maxWidth, fontSize, ellipsis = '...') {
  const ellipsisLength = G6.Util.getTextSize(ellipsis, fontSize)[0];
  let currentWidth = 0;
  str = str || '';
  let res = str;
  const pattern = new RegExp("[\u4E00-\u9FA5]+"); // distinguish the Chinese charactors and letters
  str.split("").forEach((letter, i) => {
    // if (currentWidth > maxWidth - ellipsisLength) return;
    if (currentWidth > maxWidth) return;
    if (pattern.test(letter)) {
      // Chinese charactors
      currentWidth += fontSize;
    } else {
      // get the width of single letter according to the fontSize
      currentWidth += G6.Util.getLetterWidth(letter, fontSize);
    }
    // if (currentWidth > maxWidth - ellipsisLength) {
    if (currentWidth > maxWidth) {
      res = `${str.substr(0, i)}${ellipsis}`;
    }
  });
  return res;
};

export function joinDataMapKey(node_edge_type, id, join = '-|-') {
  return node_edge_type + join + id;
}

export function getG6TooltipPos(g6_graph, e) {
  const model = e.item.getModel();
  const tooltip_name = model.id.startsWith('edge') ? 'edge' : 'node';
  if (tooltip_name === 'node') {
    return {
      x: e.clientX + (model.x - e.x) + model.size / 1.5,
      y: e.clientY + (model.y - e.y) - 10,
    }
  } else {
    return {
      x: e.clientX + 10,
      y: e.clientY + 10,
    }
  }
}

export function getHealthSetting(nodeType) {
  const baseData = {
    lineWidth: 3,
  };

  const health = {
    'normal': {
      ...baseData,
      stroke: '#00B42A', 
      fill: '#E8FFEA', 
      label: '健康',
      icon: icons['normal']['default'],
      icons: icons['normal'],
      filterFn: (d) => {
        if (d.statusType === 'normal' || d.statusType === 'external' || d.statusType === 'user') return true;
        return false;
      },
    },
    'warning': {
      ...baseData,
      stroke: '#FF7D00', 
      fill: '#FFF7E8', 
      label: '警示',
      icon: icons['warning']['default'],
      icons: icons['warning'],
      filterFn: (d) => {
        if (d.statusType === 'warning') return true;
        return false;
      },
    },
    'abnormal': {
      ...baseData,
      stroke: '#F53F3F', 
      fill: '#FFECE8', 
      label: '异常',
      icon: icons['abnormal']['default'],
      icons: icons['abnormal'],
      filterFn: (d) => {
        if (d.statusType === 'abnormal') return true;
        return false;
      }
    },
    'external': {
      ...baseData,
      legend: false,
      stroke: '#0099FF', 
      fill: '#F1FAFF', 
      label: '外部服务',
      icon: icons['normal']['external'],
      filterFn: (d) => {
        if (d.statusType === 'external') return true;
        return false;
      }
    },
    'user': {
      ...baseData,
      legend: false,
      stroke: '#0099FF', 
      fill: '#F1FAFF', 
      label: 'USER',
      icon: icons['normal']['user'],
      filterFn: (d) => {
        if (d.statusType === 'user') return true;
        return false;
      }
    },

    'disabled': {
      ...baseData,
      legend: false,
      stroke: '#BCC4D0', 
      fill: '#F5F7FA', 
      titleStyle: {
        color: '#999999',
        bg: '#E3E6EB'  
      },
      label: '已删除',
      icon: icons['normal']['disabled'],
      filterFn: (d) => {
        if (d.statusType === 'disabled') return true;
        return false;
      }
    },

    'moved': {
      ...baseData,
      legend: false,
      stroke: '#BCC4D0', 
      fill: '#F5F7FA', 
      titleStyle: {
        color: '#999999',
        bg: '#E3E6EB'  
      },
      label: '已移动',
      icon: icons['normal']['moved'],
      filterFn: (d) => {
        if (d.statusType === 'moved') return true;
        return false;
      }
    }
  };
  if (nodeType === '_all') return health;
  return health[nodeType] || health['normal'];
}


export function getTooltipStatus(itemModel) {
  const tooltipStatus = {
    'deleted': {
      color: '#fff',
      bg: '#F53F3F',
      label: '已删除'
    },

    'no_permission': {
      color: '#fff',
      bg: '#F53F3F',
      label: '暂无权限'
    },

    'moved': {
      color: '#fff',
      bg: '#F53F3F',
      label: '已移动',
      desc: '该应用已配置至其他应用系统'
    }
  }
  
  let status_type = itemModel.statusType;
  if (itemModel.is_deleted === true) status_type = 'deleted';
  if (itemModel.is_permission === false) status_type = 'no_permission';

  return tooltipStatus[status_type];
}

export function noLogicStatusType(item) {
  return item.statusType === 'disabled' || item.statusType === 'moved' || item.statusType === 'external' || item.statusType === 'user';
}
