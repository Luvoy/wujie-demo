import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import WujieReact from "wujie-react";

function Home() {
    const [count, setCount] = useState(0);
    return (
        <>
            <div>
                <a href="https://vite.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <h1>Vite + React</h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                </button>
                <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                </p>
            </div>
            <p className="read-the-docs">
                Click on the Vite and React logos to learn more
            </p>
        </>
    );
}

// 微前端通信演示页面 - 左右两列布局
function MicroAppPage() {
    const [propsData, setPropsData] = useState({});

    const [inputValue, setInputValue] = useState("");
    const [countValue, setCountValue] = useState(0);

    // 自动触发开关状态
    const [autoProps, setAutoProps] = useState(true);
    const [autoWindow, setAutoWindow] = useState(true);
    const [autoEventBus, setAutoEventBus] = useState(true);

    // 接收子应用发送的数据
    const [fromSubAppData, setFromSubAppData] = useState({});

    // 监听子应用发送的事件
    useEffect(() => {
        const handleFromSubApp = (data) => {
            setFromSubAppData(data);
        };

        const { bus } = WujieReact;
        bus.$on("FROM_SUB_APP", handleFromSubApp);

        return () => {
            bus.$off("FROM_SUB_APP", handleFromSubApp);
        };
    }, []);

    // 监听子应用的样式修改请求
    useEffect(() => {
        // 监听 postMessage 样式修改请求
        const handleStyleChangeRequest = (event) => {
            if (
                event.data &&
                event.data.type === "REQUEST_CONTAINER_STYLE_CHANGE"
            ) {
                const { data: styles } = event.data;
                // 找到子应用容器并修改样式
                const container =
                    document.querySelector('[name="demo-app"]')?.parentElement;
                if (container) {
                    Object.assign(container.style, styles);
                    alert("主应用已响应子应用的样式修改请求！");
                }
            }
        };

        // 监听 EventBus 样式修改请求
        const handleEventBusStyleRequest = (data) => {
            const { containerName, styles } = data;
            if (containerName === "demo-app") {
                const container = document.querySelector(
                    `[name="${containerName}"]`
                )?.parentElement;
                if (container) {
                    Object.assign(container.style, styles);
                    alert("主应用已通过EventBus响应样式修改请求！");
                }
            }
        };

        // 添加事件监听
        window.addEventListener("message", handleStyleChangeRequest);
        const { bus } = WujieReact;
        bus.$on("REQUEST_STYLE_CHANGE", handleEventBusStyleRequest);

        return () => {
            window.removeEventListener("message", handleStyleChangeRequest);
            bus.$off("REQUEST_STYLE_CHANGE", handleEventBusStyleRequest);
        };
    }, []);

    // 1. Props通信 - 通过props传递数据给子应用
    const handlePropsUpdate = () => {
        setPropsData((prev) => ({
            ...prev,
            count: countValue,
            message: inputValue || prev.message,
            timestamp: new Date().toLocaleString(),
        }));
    };

    // 2. Window通信 - 直接操作子应用的window对象
    const handleWindowUpdate = () => {
        // 使用官方文档推荐的方式：通过iframe查询子应用
        const iframe = window.document.querySelector("iframe[name=demo-app]");
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
                {
                    type: "WINDOW_COMMUNICATION",
                    data: {
                        count: countValue,
                        message: inputValue,
                        timestamp: new Date().toLocaleString(),
                    },
                },
                "*"
            );
        }
    };

    // 3. EventBus通信 - 通过Wujie的事件总线
    const handleEventBusUpdate = () => {
        const { bus } = WujieReact;
        bus.$emit("EVENT_BUS_COMMUNICATION", {
            count: countValue,
            message: inputValue,
            timestamp: new Date().toLocaleString(),
        });
    };

    // 自动触发逻辑 - 当输入值变化时，如果对应开关开启则自动触发
    useEffect(() => {
        if (autoProps) {
            handlePropsUpdate();
        }
    }, [inputValue, countValue, autoProps]);

    useEffect(() => {
        if (autoWindow) {
            handleWindowUpdate();
        }
    }, [inputValue, countValue, autoWindow]);

    useEffect(() => {
        if (autoEventBus) {
            handleEventBusUpdate();
        }
    }, [inputValue, countValue, autoEventBus]);

    return (
        <div style={{ display: "flex", height: "90vh", gap: "20px" }}>
            {/* 左侧：主应用控制面板 */}
            <div
                style={{
                    width: "40%",
                    padding: "20px",
                    border: "2px solid #007bff",
                    borderRadius: "8px",
                    backgroundColor: "#f8f9fa",
                }}
            >
                <h2 style={{ color: "#007bff", marginBottom: "20px" }}>
                    主应用控制面板
                </h2>

                {/* 输入区域 */}
                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "5px",
                            fontWeight: "bold",
                        }}
                    >
                        输入消息：
                    </label>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="输入要传递的消息"
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                        }}
                    />
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label
                        style={{
                            display: "block",
                            marginBottom: "5px",
                            fontWeight: "bold",
                        }}
                    >
                        数字值：
                    </label>
                    <input
                        type="number"
                        value={countValue}
                        onChange={(e) => setCountValue(Number(e.target.value))}
                        placeholder="输入数字"
                        style={{
                            width: "100%",
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                        }}
                    />
                </div>

                {/* 三种通信方式按钮 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    {/* Props 通信 */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={autoProps}
                            onChange={(e) => setAutoProps(e.target.checked)}
                            style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            自动触发
                        </span>
                        <button
                            onClick={handlePropsUpdate}
                            disabled={autoProps}
                            style={{
                                padding: "10px",
                                backgroundColor: autoProps
                                    ? "#6c757d"
                                    : "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: autoProps ? "not-allowed" : "pointer",
                                flex: 1,
                            }}
                        >
                            1. Props通信 - 更新子应用数据
                        </button>
                    </div>

                    {/* Window 通信 */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={autoWindow}
                            onChange={(e) => setAutoWindow(e.target.checked)}
                            style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            自动触发
                        </span>
                        <button
                            onClick={handleWindowUpdate}
                            disabled={autoWindow}
                            style={{
                                padding: "10px",
                                backgroundColor: autoWindow
                                    ? "#6c757d"
                                    : "#ffc107",
                                color: autoWindow ? "white" : "black",
                                border: "none",
                                borderRadius: "4px",
                                cursor: autoWindow ? "not-allowed" : "pointer",
                                flex: 1,
                            }}
                        >
                            2. Window通信 - 发送消息
                        </button>
                    </div>

                    {/* EventBus 通信 */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={autoEventBus}
                            onChange={(e) => setAutoEventBus(e.target.checked)}
                            style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: "14px", color: "#666" }}>
                            自动触发
                        </span>
                        <button
                            onClick={handleEventBusUpdate}
                            disabled={autoEventBus}
                            style={{
                                padding: "10px",
                                backgroundColor: autoEventBus
                                    ? "#6c757d"
                                    : "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: autoEventBus
                                    ? "not-allowed"
                                    : "pointer",
                                flex: 1,
                            }}
                        >
                            3. EventBus通信 - 发送事件
                        </button>
                    </div>
                </div>

                {/* 当前Props数据展示 */}
                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "white",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                    }}
                >
                    <h4 style={{ margin: "0 0 10px 0", color: "#007bff" }}>
                        当前Props数据：
                    </h4>
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

                {/* 接收子应用数据展示 */}
                <div
                    style={{
                        marginTop: "20px",
                        padding: "10px",
                        backgroundColor: "white",
                        border: "1px solid #17a2b8",
                        borderRadius: "4px",
                    }}
                >
                    <h4 style={{ margin: "0 0 10px 0", color: "#17a2b8" }}>
                        接收子应用数据：
                    </h4>
                    <pre
                        style={{
                            fontSize: "12px",
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                        }}
                    >
                        {JSON.stringify(fromSubAppData, null, 2)}
                    </pre>
                </div>
            </div>

            {/* 右侧：微前端子应用容器 */}
            <div
                style={{
                    width: "60%",
                    border: "2px solid #28a745",
                    borderRadius: "8px",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        padding: "10px",
                        backgroundColor: "#28a745",
                        color: "white",
                        fontWeight: "bold",
                    }}
                >
                    微前端子应用容器
                </div>
                <div style={{ height: "calc(100% - 50px)" }}>
                    {/*
               这里是Wujie的React组件（WujieReact），它会在本页面的div容器内加载一个子应用。
               - name: 子应用的唯一标识（可自定义）
               - url: 子应用的访问地址（如 http://localhost:5174，需与子应用实际端口一致）
               - width/height: 容器尺寸
               - sync: 是否同步路由等（初学可保持true）
               - props: 传递给子应用的数据对象
               你可以通过修改url来加载不同的子应用。
             */}
                    <WujieReact
                        width="100%"
                        height="100%"
                        name="demo-app"
                        url="http://localhost:5174"
                        sync={true}
                        props={propsData}
                    />
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <nav style={{ marginBottom: 20 }}>
                <Link to="/">首页</Link> |
                <Link to="/micro-app" style={{ marginLeft: 10 }}>
                    微前端通信演示
                </Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/micro-app" element={<MicroAppPage />} />
            </Routes>
        </Router>
    );
}

export default App;
