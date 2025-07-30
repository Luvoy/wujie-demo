import "./App.css";

function App() {
    // 通过 window.__WUJIE?.props 获取主应用传递的数据
    const props = window.__WUJIE?.props || {};

    return (
        <div className="App" style={{ padding: 40, textAlign: "center" }}>
            <h2>我是微前端子应用（React）</h2>
            <p>
                本页面通过 <b>Wujie</b> 微前端框架被主应用加载。
            </p>
            <div
                style={{
                    margin: "20px 0",
                    padding: 10,
                    border: "1px dashed #aaa",
                    background: "#f9f9f9",
                }}
            >
                <b>主应用传递的数据：</b>
                <pre
                    style={{
                        textAlign: "left",
                        display: "inline-block",
                        margin: 0,
                    }}
                >
                    {JSON.stringify(props, null, 2)}
                </pre>
            </div>
            <p style={{ color: "#888", fontSize: 14 }}>
                你可以在主应用的“微前端子应用”路由下看到我。
            </p>
        </div>
    );
}

export default App;
