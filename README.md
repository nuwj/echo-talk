# EchoTalk

EchoTalk 是一个 AI 驱动的英语口语练习系统，提供沉浸式的人机英语对话训练。系统集成了语音识别、语音合成、LLM 对话引擎、音素级发音评估（Needleman-Wunsch 算法）和贝叶斯知识追踪（BKT），帮助用户在自然对话中提升口语能力。

## 技术栈

### 后端

| 类别 | 技术 |
|------|------|
| Web 框架 | FastAPI 0.115 |
| 运行时 | Python 3.12 + Uvicorn |
| 数据验证 | Pydantic v2 |
| 认证 | JWT（python-jose + passlib/bcrypt） |
| 任务队列 | Celery（可选，内置 mock shim） |
| 消息代理 | Redis（可选，内置 fallback） |
| 数据库 | 内存 MockDB（生产环境使用 PostgreSQL） |

### 前端

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 + React 19 |
| 语言 | TypeScript 5 |
| 状态管理 | Zustand 5 |
| 样式 | Tailwind CSS v4 |
| HTTP 客户端 | Axios |
| 构建工具 | Turbopack |
| 包管理器 | pnpm |

### AI / 语音服务（通过 mock 开关控制）

| 服务 | 用途 |
|------|------|
| Deepgram Flux | 语音转文字（STT） |
| Cartesia Sonic 3 | 文字转语音（TTS） |
| OpenRouter / SiliconFlow | LLM 路由（Llama 3.1、Gemini Flash 等） |
| LiveKit | WebRTC 实时音频 |
| ELSA Speech API | 发音评估 |
| Hume EVI 3 | 情感感知语音对话（Phase 3） |

## 项目结构

```
.
├── backend/
│   ├── main.py                 # FastAPI 入口
│   ├── config.py               # 配置管理（Pydantic Settings）
│   ├── dependencies.py         # JWT 认证、密码哈希
│   ├── requirements.txt
│   ├── routers/                # API 路由
│   │   ├── auth.py             # 注册 / 登录 / 用户信息
│   │   ├── sessions.py         # 练习会话管理
│   │   ├── conversation.py     # AI 对话
│   │   └── assessment.py       # 发音评估 / 知识追踪
│   ├── services/               # 业务逻辑
│   │   ├── llm_service.py      # LLM 服务
│   │   ├── tts_service.py      # TTS 服务
│   │   ├── stt_service.py      # STT 服务
│   │   ├── pronunciation/      # 发音评估（Needleman-Wunsch）
│   │   └── knowledge/          # BKT 知识追踪
│   ├── models/                 # 数据模型
│   └── workers/                # Celery 异步任务
│
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 根布局
│   │   ├── page.tsx            # 入口页面
│   │   └── globals.css         # 全局样式
│   └── lib/
│       ├── api.ts              # Axios 实例 + 拦截器
│       ├── store.ts            # Zustand 状态管理
│       ├── types.ts            # TypeScript 类型定义
│       └── utils.ts            # 工具函数
│
├── Makefile                    # 开发命令
└── .env.example                # 环境变量模板
```

## 安装

### 前置要求

- Python 3.12+
- Node.js 18+
- pnpm

### 一键安装

```bash
make install
```

或手动分步执行：

```bash
# 后端
cd backend
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt

# 前端
cd frontend
pnpm install
```

## 环境配置

复制环境变量模板：

```bash
cp .env.example backend/.env
```

开发环境默认使用 mock 模式，无需配置任何外部 API Key。核心配置项：

```env
# Mock 开关（开发模式全部设为 true）
USE_MOCK_LLM=true
USE_MOCK_TTS=true
USE_MOCK_STT=true
USE_MOCK_LIVEKIT=true

# JWT
JWT_SECRET_KEY=dev-secret-key-change-in-production

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

前端环境变量（`frontend/.env.local`）：

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 启动

### 同时启动前后端

```bash
make dev
```

### 分别启动

```bash
# 后端（端口 8000）
make backend

# 前端（端口 3000）
make frontend
```

启动后访问：

- 前端：http://localhost:3000
- 后端 API：http://localhost:8000/api
- API 文档：http://localhost:8000/docs

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health` | 健康检查 |
| `POST` | `/api/auth/register` | 用户注册 |
| `POST` | `/api/auth/login` | 用户登录 |
| `GET` | `/api/auth/me` | 获取当前用户信息 |
| `POST` | `/api/sessions` | 创建练习会话 |
| `GET` | `/api/sessions` | 获取会话列表 |
| `POST` | `/api/sessions/{id}/end` | 结束会话（触发分析） |
| `POST` | `/api/conversation/chat` | 发送消息获取 AI 回复 |
| `GET` | `/api/assessments/{id}` | 获取发音评估结果 |
| `GET` | `/api/assessments/knowledge/states` | 获取知识追踪状态 |

## 集成测试

```bash
bash backend/integration_test.sh
```

测试流程覆盖：用户注册 → 创建会话 → 对话 → 结束会话 → 发音评估 → 知识追踪。
