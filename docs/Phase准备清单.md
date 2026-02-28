# EchoTalk - Phase 1 & Phase 2 准备清单

> 当前状态：Phase 1 & 2 代码已完成（Mock 模式），所有外部依赖均为模拟。
> 本清单列出从 Mock 切换到真实服务所需的全部准备项。
> 请在每项后填写你的结果（账号、连接串、Key 等），完成后我将逐步接入真实服务。

---

## Phase 1：基础对话管线

### 1. 数据库 — PostgreSQL

当前使用内存 MockDatabase（`backend/models/mock_db.py`），需替换为真实 PostgreSQL。

| 项目 | 说明 | 你的结果 |
|------|------|---------|
| PostgreSQL 安装 | 本地安装 / Docker / 云服务均可 | |
| DATABASE_URL | 格式：`postgresql://user:password@host:5432/echotalk` | |
| 创建数据库 | 数据库名建议：`echotalk` | |

> 接入后我会添加 SQLAlchemy + Alembic，自动建表（users, user_profiles, sessions, transcripts）。

---

### 2. LLM 服务 — OpenRouter 或 硅基流动（二选一即可）

当前 `USE_MOCK_LLM=True`，LLM 返回固定模拟回复。

| 项目 | 说明 | 你的结果 |
|------|------|---------|
| 选择提供商 | `openrouter`（推荐，模型多）或 `siliconflow`（国内快） | |
| OPENROUTER_API_KEY | 注册 https://openrouter.ai → API Keys | |
| SILICONFLOW_API_KEY | 注册 https://siliconflow.cn → API Keys（如选硅基流动） | |
| DEFAULT_LLM_PROVIDER | 填 `openrouter` 或 `siliconflow` | |

> 免费用户使用 Llama 3.1 8B（OpenRouter 有免费额度），Pro 使用 Gemini Flash。

---

### 3. 语音识别（STT）— Deepgram

当前 `USE_MOCK_STT=True`，无真实语音转文字。

| 项目 | 说明 | 你的结果 |
|------|------|---------|
| DEEPGRAM_API_KEY | 注册 https://deepgram.com → API Keys（有免费额度） | |

---

### 4. 语音合成（TTS）— Cartesia

当前 `USE_MOCK_TTS=True`，无真实语音合成。

| 项目 | 说明 | 你的结果 |
|------|------|---------|
| CARTESIA_API_KEY | 注册 https://cartesia.ai → API Keys | |

---

### 5. 实时通信 — LiveKit

当前 `USE_MOCK_LIVEKIT=True`，对话通过 REST 文本接口进行。

| 项目 | 说明 | 你的结果 |
|------|------|---------|
| 部署方式 | LiveKit Cloud（推荐，免费套餐够用）或本地 `livekit-server` | |
| LIVEKIT_URL | LiveKit Cloud：`wss://xxx.livekit.cloud`；本地：`ws://localhost:7880` | |
| LIVEKIT_API_KEY | LiveKit 控制台获取 | |
| LIVEKIT_API_SECRET | LiveKit 控制台获取 | |

---

### Phase 1 汇总检查

```env
# .env 需要填入的变量（Phase 1）
DATABASE_URL=
OPENROUTER_API_KEY=          # 或 SILICONFLOW_API_KEY
DEFAULT_LLM_PROVIDER=        # openrouter 或 siliconflow
DEEPGRAM_API_KEY=
CARTESIA_API_KEY=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
```

---

## Phase 2：发音评估 + 知识追踪

> Phase 2 需要 Phase 1 的全部服务 + 以下新增项。

### 6. 消息队列 — Redis

Celery 异步任务队列的 Broker，用于会话结束后的异步分析（发音对齐、语法检测、BKT 更新）。

| 项目 | 说明 | 你的结果 |
|------|------|---------|
| Redis 安装 | 本地安装 / Docker (`docker run -p 6379:6379 redis`) / 云服务 | |
| REDIS_URL | 格式：`redis://localhost:6379/0` | |

> 接入后我会配置 Celery worker，启动命令：`celery -A workers.celery_app worker --loglevel=info`

---

### 7. 发音评估 — ELSA Speech API（Pro 用户）

Free 用户使用本地 Needleman-Wunsch（已实现，无需外部服务）。Pro 用户需要 ELSA API。

| 项目 | 说明 | 你的结果 |
|------|------|---------|
| ELSA_API_KEY | ELSA 开发者平台获取（如暂不需要 Pro 功能可跳过） | |

> 如果暂时不开放 Pro 等级，此项可后续再填。Free 用户的本地发音评估不依赖外部 API。

---

### 8. Python 依赖（Phase 2 新增）

以下包需要安装，目前未在 `requirements.txt` 中：

| 包名 | 用途 | 是否必需 |
|------|------|---------|
| `celery[redis]` | 异步任务队列 | 是 |
| `redis` | Redis 客户端 | 是 |
| `pronouncing` | CMU 发音词典，获取参考音素序列 | 是 |
| `sqlalchemy` | ORM（Phase 1 也需要） | 是 |
| `alembic` | 数据库迁移（Phase 1 也需要） | 是 |

> 这些包我会在开发时自动添加到 `requirements.txt`。

---

### Phase 2 汇总检查

```env
# .env 新增变量（Phase 2，Phase 1 的变量继续保留）
REDIS_URL=redis://localhost:6379/0
ELSA_API_KEY=                # 可选，Pro 用户才需要
```

---

## 优先级建议

如果想尽快看到端到端效果，建议按以下顺序准备：

1. **PostgreSQL** — 替换 MockDB，数据可持久化
2. **OpenRouter / 硅基流动** — 让 AI 对话变真实
3. **Redis** — 启用异步分析管线
4. **Deepgram + Cartesia + LiveKit** — 启用语音交互（如果暂时只用文本对话可后置）

---

*请在"你的结果"列填写对应信息，我会据此逐步将 Mock 服务切换为真实服务。*
