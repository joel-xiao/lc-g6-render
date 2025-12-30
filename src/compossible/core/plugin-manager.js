/**
 * Plugin Manager
 * 管理图实例的插件生命周期
 */
export class PluginManager {
    constructor(graph) {
        this.graph = graph;
        this.plugins = new Map();
    }

    /**
     * 注册/安装插件
     * @param {string} name 插件名称
     * @param {Object} pluginInstance 插件实例
     */
    register(name, pluginInstance) {
        if (this.plugins.has(name)) {
            console.warn(`Plugin ${name} is already registered.`);
            return;
        }

        // 如果插件有 install 方法，调用它
        if (typeof pluginInstance.install === 'function') {
            pluginInstance.install(this.graph);
        }

        this.plugins.set(name, pluginInstance);
    }

    /**
     * 获取插件实例
     * @param {string} name 
     */
    get(name) {
        return this.plugins.get(name);
    }

    /**
     * 卸载插件
     * @param {string} name 
     */
    uninstall(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) return;

        if (typeof plugin.uninstall === 'function') {
            plugin.uninstall(this.graph);
        }

        this.plugins.delete(name);
    }

    /**
     * 卸载所有插件
     */
    destroy() {
        for (const name of this.plugins.keys()) {
            this.uninstall(name);
        }
    }
}
