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
