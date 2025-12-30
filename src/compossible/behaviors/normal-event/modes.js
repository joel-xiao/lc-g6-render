export default function getModes() {
    return {
        default: [
            'drag-canvas',
            'zoom-canvas',
            'click-select',
            // 'drag-combo',
            // {
            //   type: 'drag-node',
            //   // enableDelegate: true,
            //   shouldBegin: (e, self) => {
            //     const model = e?.item?.getModel();
            //     // 不允许拖拽有comboId的节点
            //     if (model?.comboId || model.disabled_event) return false;
            //     return true;
            //   },
            // }
        ],
        // You can define other modes like 'edit', 'view' here if they differ
    };
}
