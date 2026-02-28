# CLAUDE.md — EchoTalk 项目指南

## 项目概述

EchoTalk 是一个 AI 驱动的英语口语练习系统，提供沉浸式人机对话训练。集成 STT（Deepgram Nova-2）、TTS（Cartesia Sonic 2）、LLM（SiliconFlow Qwen）、音素级发音评估（Needleman-Wunsch）和贝叶斯知识追踪（BKT）。当前处于 Phase 2（已完成 Mock→真实服务切换），数据持久化到 PostgreSQL，外部服务已全部接入。

## 技术栈

- **后端**: Python 3.12 / FastAPI 0.115 / Uvicorn / Pydantic v2 / JWT (python-jose) / Celery + Redis / SQLAlchemy + Alembic
- **前端**: Next.js 15 (App Router) / React 19 / TypeScript 5 / Zustand 5 / Tailwind CSS v4 / pnpm
- **数据库**: PostgreSQL + SQLAlchemy (同步引擎) + Alembic 迁移
- **外部服务**: SiliconFlow LLM (Qwen2.5-7B) / Deepgram STT (Nova-2) / Cartesia TTS (Sonic 2) / LiveKit Cloud

## 项目结构

```
docs/                  # 项目文档（开发前必读）
  AI口语系统升级方案.md    # 产品架构与升级方案（需求来源）
  技术方案设计.md          # 工程技术设计（架构、API、数据库 schema、目录规划）
  开发速查.md             # 开发常用参考
  Phase准备清单.md        # 各阶段开发准备清单
  验收测试手册.md          # 验收测试用例

backend/               # FastAPI 后端
  main.py              # 入口
  config.py            # Pydantic Settings 配置（含 Mock 开关）
  database.py          # SQLAlchemy engine + SessionLocal 工厂
  dependencies.py      # JWT 认证、密码哈希
  models/              # 数据模型
    mock_db.py         # MockDatabase（条件单例：USE_MOCK_DB 控制）
    real_db.py         # RealDatabase（PostgreSQL 实现，API 与 MockDatabase 完全一致）
    db_models.py       # SQLAlchemy ORM 模型（7 张表）
    exercise.py        # Pydantic 模型（发音、语法）
    knowledge.py       # Pydantic 模型（技能、知识状态）
  routers/             # API 路由（auth, sessions, conversation, assessment, reports）
  schemas/             # 请求/响应 schema
  services/            # 外部服务封装（llm, tts, stt, livekit, pronunciation, knowledge）
  workers/             # Celery 异步任务（analysis, knowledge, report）
  alembic/             # 数据库迁移
  seed_skills.py       # BKT 技能种子数据

frontend/              # Next.js 前端
  app/                 # App Router 页面
    (auth)/            # 登录/注册页
    practice/          # 练习页（Dashboard、会话、历史、场景、发音）
    report/            # 周报页
    settings/          # 设置页
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

# 数据库迁移
cd backend && alembic upgrade head     # 应用迁移
cd backend && python seed_skills.py    # 种子数据（首次）
cd backend && alembic revision --autogenerate -m "描述"  # 新增迁移

# Celery worker（真实模式需要）
cd backend && celery -A workers.celery_app worker --loglevel=info
```

## 环境配置

- 复制 `.env.example` 到 `backend/.env`，开发环境使用默认 mock 值即可，无需 API 密钥
- 前端环境变量在 `frontend/.env.local`，关键项：`NEXT_PUBLIC_API_URL`

### Mock 开关（生产环境设为 false）

| 开关 | 作用 | 当前 .env |
|---|---|---|
| `USE_MOCK_DB` | 内存 dict vs PostgreSQL | false |
| `USE_MOCK_LLM` | 预设回复 vs SiliconFlow Qwen | false |
| `USE_MOCK_TTS` | 空字节 vs Cartesia Sonic 2 | false |
| `USE_MOCK_STT` | 预设转录 vs Deepgram Nova-2 | false |
| `USE_MOCK_LIVEKIT` | mock token vs LiveKit Cloud JWT | false |
| `USE_MOCK_CELERY` | 同步执行 vs Redis 异步 | false |
| `USE_MOCK_ELSA` | 随机分数 vs ELSA API（Pro） | true |

## 关键架构模式

### 条件单例（Mock/Real 数据库切换）
`models/mock_db.py` 底部通过 `USE_MOCK_DB` 开关决定导出 `MockDatabase` 或 `RealDatabase` 实例。9 个消费者文件（routers、workers、services）均通过 `from models.mock_db import db` 引入，切换时零改动。

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

- **Phase 1（已完成）**: Mock 全部外部服务，内存数据库，基础对话流，前端页面骨架
- **Phase 2（已完成）**: 真实服务接入（PostgreSQL + SiliconFlow LLM + Deepgram STT + Cartesia TTS + LiveKit + Redis/Celery），Needleman-Wunsch 发音评估，BKT 知识追踪
- **Phase 3（待开发）**: Hume EVI 3 情感感知语音对话

## 注意事项

- 前端路径别名：`@/*` 映射到项目根
- 后端无正式单元测试，使用 `integration_test.sh` 做端到端验证
- `USE_MOCK_DB=true` 时数据存于内存，重启丢失；`false` 时持久化到 PostgreSQL
- Needleman-Wunsch 使用 CMU 发音词典，未命中则退回字符级对齐
- 数据库密码含特殊字符（逗号），URL 中需用 `%2C` 编码
- 真实模式下需单独启动 Celery worker 处理异步分析任务
