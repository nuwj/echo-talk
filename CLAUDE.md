# CLAUDE.md — EchoTalk 项目指南

## 项目概述

EchoTalk 是一个 AI 驱动的英语口语练习系统，提供沉浸式人机对话训练。集成 STT（Deepgram）、TTS（Cartesia Sonic 3）、LLM（OpenRouter/SiliconFlow）、音素级发音评估（Needleman-Wunsch）和贝叶斯知识追踪（BKT）。当前处于 Phase 1（v0.1.0），所有外部服务默认 mock 模式，可完全离线开发。

## 技术栈

- **后端**: Python 3.12 / FastAPI 0.115 / Uvicorn / Pydantic v2 / JWT (python-jose) / Celery (可选)
- **前端**: Next.js 15 (App Router) / React 19 / TypeScript 5 / Zustand 5 / Tailwind CSS v4 / pnpm
- **数据库**: 当前为内存 MockDatabase，目标迁移至 PostgreSQL + SQLAlchemy

## 项目结构

```
backend/               # FastAPI 后端
  main.py              # 入口
  config.py            # Pydantic Settings 配置
  dependencies.py      # JWT 认证、密码哈希
  models/              # 数据模型（mock_db, exercise, knowledge）
  routers/             # API 路由（auth, sessions, conversation, assessment）
  schemas/             # 请求/响应 schema
  services/            # 外部服务封装（llm, tts, stt, livekit, pronunciation, knowledge）
  workers/             # Celery 异步任务（analysis, knowledge, report）

frontend/              # Next.js 前端
  app/                 # App Router 页面
    (auth)/            # 登录/注册页
    practice/          # 练习页（需认证）
  components/          # UI 组件（conversation, pronunciation, learning, layout）
  lib/                 # 工具库（api.ts, store.ts, types.ts, utils.ts）
```

## 常用命令

```bash
make install           # 安装前后端依赖
make dev               # 同时启动后端(8000)和前端(3000)
make backend           # 仅启动后端
make frontend          # 仅启动前端
cd frontend && pnpm build   # 前端生产构建
cd frontend && pnpm lint    # ESLint 检查
bash backend/integration_test.sh  # 集成测试（注册→会话→聊天→评估→知识追踪）
```

## 环境配置

- 复制 `.env.example` 到 `backend/.env`，开发环境使用默认 mock 值即可，无需 API 密钥
- 前端环境变量在 `frontend/.env.local`，关键项：`NEXT_PUBLIC_API_URL`

### Mock 开关（均默认 true）

| 开关 | 作用 |
|---|---|
| `USE_MOCK_LLM` | LLM 返回预设英语教练回复 |
| `USE_MOCK_TTS` | TTS 返回空字节 |
| `USE_MOCK_STT` | STT 返回预设转录 |
| `USE_MOCK_LIVEKIT` | LiveKit 返回 mock token |
| `USE_MOCK_CELERY` | 任务同步执行，无需 Redis |
| `USE_MOCK_ELSA` | ELSA 发音 API 返回随机分数 |

## 关键架构模式

### 服务抽象（策略模式 + DI）
每个外部服务遵循：抽象基类 → MockService / RealService → 工厂函数读取 mock 开关 → FastAPI `Depends()` 注入。

### Celery 优雅降级
`workers/celery_app.py` 在 Celery 不可用时提供 shim（`_FakeCelery`），`.delay()` 同步执行。mock 模式下 `task_always_eager=True`。

### 会话后分析管线
会话结束时触发：`analyze_session`（Needleman-Wunsch 音素对齐 + 正则语法检测）→ `update_knowledge`（BKT 更新技能掌握概率）。

### BKT 知识追踪
Corbett & Anderson (1994) 模型，参数：`p_init=0.1, p_transit=0.2, p_slip=0.1, p_guess=0.2`，掌握阈值 0.95，追踪 10 项技能（语法 5 + 发音 5）。

### 前端路由守卫
`AuthGuard` 组件保护 `practice/` 路由，未认证重定向至登录页。Zustand `persist` 中间件持久化 auth 状态到 localStorage。Axios 拦截器自动附加 JWT 并处理 401。

## 开发阶段

- **Phase 1（当前）**: Mock 全部外部服务，内存数据库，基础对话流
- **Phase 2**: 真实发音评估 + ELSA、BKT 知识追踪、Celery 异步、PostgreSQL
- **Phase 3**: Hume EVI 3 情感感知语音对话

## 注意事项

- 前端路径别名：`@/*` 映射到项目根
- 后端无正式单元测试，使用 `integration_test.sh` 做端到端验证
- MockDatabase 为单例，数据存于内存 dict，重启即丢失
- Needleman-Wunsch 使用 CMU 发音词典，未命中则退回字符级对齐
