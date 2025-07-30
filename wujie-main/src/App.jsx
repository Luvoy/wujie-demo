import { useState } from "react";
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

// 微前端容器页面，适合初学者理解
function MicroAppPage() {
    const data = {
        name: "张三",
        age: 18,
        count: 100,
        tips: "这些数据是主应用通过Wujie传递给子应用的",
    };
    return (
        <div
            style={{
                width: "100%",
                height: "80vh",
                border: "1px solid #eee",
                marginTop: 20,
            }}
        >
            {/*
                这里是Wujie的React组件（WujieReact），它会在本页面的div容器内加载一个子应用。
                - name: 子应用的唯一标识（可自定义）
                - url: 子应用的访问地址（如 http://localhost:5174，需与子应用实际端口一致）
                - width/height: 容器尺寸
                - sync: 是否同步路由等（初学可保持true）
                你可以通过修改url来加载不同的子应用。
            */}
            <WujieReact
                width="100%"
                height="100%"
                name="demo-app"
                url="http://localhost:5174" // 假设子应用端口为5174
                sync={true}
                props={data}
            />
            <div style={{ marginTop: 10, color: "#888", fontSize: 14 }}>
                这里是微前端子应用的容器，Wujie 会将子应用渲染在此处。
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
                    微前端子应用
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
