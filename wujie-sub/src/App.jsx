import "./App.css";
import { useState, useEffect } from "react";

function App() {
    // 1. Props通信 - 通过 window.$wujie?.props 获取主应用传递的数据
    const [propsData, setPropsData] = useState({});

    // 2. Window通信 - 通过 postMessage 接收主应用发送的消息
    const [windowData, setWindowData] = useState({});

    // 3. EventBus通信 - 通过 Wujie 事件总线接收事件
    const [eventBusData, setEventBusData] = useState({});

    // 监听 props 变化
    useEffect(() => {
        const checkProps = () => {
            // 修正：使用正确的 Wujie API
            const newProps = window.$wujie?.props || {};
            if (JSON.stringify(newProps) !== JSON.stringify(propsData)) {
                setPropsData(newProps);
            }
        };

        // 初始检查
        checkProps();

        // 定期检查 props 变化（因为 Wujie 的 props 更新可能不会触发 React 重新渲染）
        const interval = setInterval(checkProps, 100);

        return () => clearInterval(interval);
    }, [propsData]);

    // 监听 window postMessage
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data && event.data.type === "WINDOW_COMMUNICATION") {
                setWindowData(event.data.data);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    // 监听 EventBus 事件
    useEffect(() => {
        const handleEventBus = (data) => {
            setEventBusData(data);
        };

        // 修正：使用正确的 Wujie API
        if (window.$wujie?.bus) {
            window.$wujie.bus.$on("EVENT_BUS_COMMUNICATION", handleEventBus);
        }

        return () => {
            if (window.$wujie?.bus) {
                window.$wujie.bus.$off(
                    "EVENT_BUS_COMMUNICATION",
                    handleEventBus
                );
            }
        };
    }, []);

    // 子应用向主应用发送事件的演示
    const sendToMainApp = () => {
        if (window.$wujie?.bus) {
            window.$wujie.bus.$emit("FROM_SUB_APP", {
                message: "来自子应用的消息",
                timestamp: new Date().toLocaleString(),
                random: Math.random(),
            });
        }
    };

    // 方案1: 通过 postMessage 通知主应用修改容器样式
    const requestContainerStyleChange = () => {
        // 向父窗口发送消息，请求修改容器样式
        window.parent.postMessage(
            {
                type: "REQUEST_CONTAINER_STYLE_CHANGE",
                data: {
                    overflow: "auto",
                    height: "100%",
                },
            },
            "*"
        );
    };

    // 方案2: 直接操作父容器DOM（如果同域且有权限）
    const modifyParentContainerDirectly = () => {
        try {
            // 尝试找到父容器并修改样式
            const parentContainer =
                window.parent.document.querySelector(
                    '[name="demo-app"]'
                )?.parentElement;
            if (parentContainer) {
                parentContainer.style.overflow = "auto";
                parentContainer.style.height = "100%";
                alert("直接修改父容器样式成功！");
            } else {
                alert("无法找到父容器或没有权限修改");
            }
        } catch {
            alert("跨域限制，无法直接修改父容器样式");
        }
    };

    // 方案3: 通过 EventBus 通知主应用修改样式
    const requestStyleChangeViaEventBus = () => {
        if (window.$wujie?.bus) {
            window.$wujie.bus.$emit("REQUEST_STYLE_CHANGE", {
                containerName: "demo-app",
                styles: {
                    overflow: "auto",
                    height: "100%",
                },
            });
        }
    };

    // 方案4: 修改子应用自身样式以适应容器
    const adaptSubAppStyle = () => {
        // 在子应用内部添加样式来适应容器
        const style = document.createElement("style");
        style.textContent = `
            .App {
                max-height: 100vh;
                overflow-y: auto;
                padding: 20px;
                box-sizing: border-box;
            }
        `;
        document.head.appendChild(style);
        alert("已添加子应用自适应样式");
    };

    return (
        <div className="App" style={{ padding: 20, textAlign: "center" }}>
            <h2 style={{ color: "#28a745", marginBottom: "20px" }}>
                我是微前端子应用（React）
            </h2>
            <p style={{ marginBottom: "30px" }}>
                本页面通过 <b>Wujie</b>{" "}
                微前端框架被主应用加载，演示三种通信方式。
            </p>

            {/* 容器样式修改功能区域 */}
            <div
                style={{
                    marginBottom: "30px",
                    padding: "15px",
                    border: "2px solid #6f42c1",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9ff",
                }}
            >
                <h3 style={{ color: "#6f42c1", margin: "0 0 15px 0" }}>
                    🎨 容器样式修改方案
                </h3>
                <p
                    style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "15px",
                    }}
                >
                    B团队修改A团队容器样式的几种解决方案：
                </p>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <button
                        onClick={requestContainerStyleChange}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#6f42c1",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        方案1: 通过 postMessage 请求主应用修改样式
                    </button>

                    <button
                        onClick={modifyParentContainerDirectly}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#fd7e14",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        方案2: 直接操作父容器DOM（同域时可用）
                    </button>

                    <button
                        onClick={requestStyleChangeViaEventBus}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#20c997",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        方案3: 通过 EventBus 请求样式修改
                    </button>

                    <button
                        onClick={adaptSubAppStyle}
                        style={{
                            padding: "8px 16px",
                            backgroundColor: "#e83e8c",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                        }}
                    >
                        方案4: 修改子应用自身样式适应容器
                    </button>
                </div>
            </div>

            {/* 子应用向主应用发送事件的按钮 */}
            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={sendToMainApp}
                    style={{
                        padding: "8px 16px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                    }}
                >
                    向主应用发送事件
                </button>
                <p
                    style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "5px",
                    }}
                >
                    点击此按钮向主应用发送 EventBus 事件
                </p>
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                {/* Props 通信展示 */}
                <div
                    style={{
                        padding: "15px",
                        border: "2px solid #28a745",
                        borderRadius: "8px",
                        backgroundColor: "#f8fff8",
                    }}
                >
                    <h3 style={{ color: "#28a745", margin: "0 0 10px 0" }}>
                        1. Props 通信
                    </h3>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#666",
                            margin: "0 0 10px 0",
                        }}
                    >
                        主应用通过 WujieReact 的 props 属性传递数据
                    </p>
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            textAlign: "left",
                        }}
                    >
                        <pre
                            style={{
                                fontSize: "12px",
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                            }}
                        >
                            {JSON.stringify(propsData, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Window 通信展示 */}
                <div
                    style={{
                        padding: "15px",
                        border: "2px solid #ffc107",
                        borderRadius: "8px",
                        backgroundColor: "#fffef8",
                    }}
                >
                    <h3 style={{ color: "#ffc107", margin: "0 0 10px 0" }}>
                        2. Window 通信
                    </h3>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#666",
                            margin: "0 0 10px 0",
                        }}
                    >
                        主应用通过 postMessage 发送消息到子应用
                    </p>
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            textAlign: "left",
                        }}
                    >
                        <pre
                            style={{
                                fontSize: "12px",
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                            }}
                        >
                            {JSON.stringify(windowData, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* EventBus 通信展示 */}
                <div
                    style={{
                        padding: "15px",
                        border: "2px solid #dc3545",
                        borderRadius: "8px",
                        backgroundColor: "#fff8f8",
                    }}
                >
                    <h3 style={{ color: "#dc3545", margin: "0 0 10px 0" }}>
                        3. EventBus 通信
                    </h3>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#666",
                            margin: "0 0 10px 0",
                        }}
                    >
                        主应用通过 Wujie 事件总线发送事件
                    </p>
                    <div
                        style={{
                            padding: "10px",
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            textAlign: "left",
                        }}
                    >
                        <pre
                            style={{
                                fontSize: "12px",
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                            }}
                        >
                            {JSON.stringify(eventBusData, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>

            <div
                style={{
                    marginTop: "20px",
                    padding: "10px",
                    backgroundColor: "#e9ecef",
                    borderRadius: "4px",
                    fontSize: "14px",
                    color: "#495057",
                }}
            >
                💡 <strong>使用说明：</strong>{" "}
                在左侧主应用控制面板输入数据，然后点击对应的通信按钮，观察右侧子应用的数据变化。
            </div>
        </div>
    );
}

export default App;
