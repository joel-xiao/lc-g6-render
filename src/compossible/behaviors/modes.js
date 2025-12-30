export function getModels() {
    return [
        'drag-canvas',
        // 'drag-combo',
        'zoom-canvas',
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
    ];
}
