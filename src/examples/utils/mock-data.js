
export function getMockStatsData(type = "node") {
    return {
        total: Math.floor(Math.random() * 1000) + 100,
        dur: Math.floor(Math.random() * 100000) + 10000,
        slow: Math.floor(Math.random() * 50),
        frustrated: Math.floor(Math.random() * 20),
        err: Math.floor(Math.random() * 10),
        fail: Math.floor(Math.random() * 5),
        exception: Math.floor(Math.random() * 8),
        out_total: Math.floor(Math.random() * 800) + 80,
        out_dur: Math.floor(Math.random() * 80000) + 8000,
        out_slow: Math.floor(Math.random() * 40),
        out_frustrated: Math.floor(Math.random() * 15),
        out_err: Math.floor(Math.random() * 8),
        out_fail: Math.floor(Math.random() * 4),
        out_exception: Math.floor(Math.random() * 6)
    };
}

// Generate link mock data
export function getMockLinkData() {
    const baseTotal = Math.floor(Math.random() * 5000) + 500;
    const avgDur = Math.floor(Math.random() * 200) + 10;
    const totalDur = baseTotal * avgDur;

    return {
        total: baseTotal,
        dur: totalDur,
        slow: Math.floor(baseTotal * 0.05) + Math.floor(Math.random() * 10),
        frustrated: Math.floor(baseTotal * 0.02) + Math.floor(Math.random() * 5),
        err: Math.floor(baseTotal * 0.01) + Math.floor(Math.random() * 5),
        fail: Math.floor(baseTotal * 0.005) + Math.floor(Math.random() * 3),
        exception: Math.floor(baseTotal * 0.003) + Math.floor(Math.random() * 3)
    };
}

export function getNodeDisabledCollapse(node) {
    // Nodes in groups (application nodes) should not have expand/collapse buttons
    // Only system nodes (not in groups) may have expand/collapse buttons
    return (
        node.is_user ||
        node.is_external ||
        node.is_deleted ||
        !!node.comboId // Nodes in groups disable expand/collapse
    );
}

export async function getModels(node, old_period) {
    if (old_period !== node.data.old_period) {
        delete node.data.business;
        node.data.old_period = old_period;
    }

    if (node.data.business) return node.data.business;
    if (!node.data.business) node.data.business = [];

    // Mock models data
    node.data.business = [
        { name: "业务模型1", id: "model1", total: 100 },
        { name: "业务模型2", id: "model2", total: 200 }
    ];

    return node.data.business;
}
