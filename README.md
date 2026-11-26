# GPTProto Lite

一个按 [GPTProto](https://gptproto.com) 产品形态做的前端复刻练习：模型目录 / 模型详情 / 图片生成工具 / 用量控制台，中英双语，自带 SEO 与静态生成。

做这个项目的原因很直接——投的是「前端开发（AI 应用方向）」，岗位要求里写着「了解 Next.js 的 SSR、路由、静态生成」「了解 SEO 基础」「会 AI Agent 辅助开发」。我原来的项目都是对话类界面，没有一个是带图表的控制台，也没有一个做过多语言，所以照着招聘方的产品形态自己搭了一遍，把缺的那几块补齐。

## 技术栈

- Next.js 16 · App Router
- TypeScript（严格模式）
- Tailwind CSS 4
- 零 UI 库、零图表库、零 i18n 库

## 页面

| 路由 | 内容 |
| --- | --- |
| `/zh` `/en` | 首页：hero、模型预览、平台能力说明 |
| `/[locale]/models` | 模型目录，按能力类型筛选（走 URL 查询参数，可分享、可被收录） |
| `/[locale]/models/[slug]` | 模型详情：参数表、定价、调用示例、同类模型 |
| `/[locale]/tools/image` | 图片生成工具：提示词、比例、数量、下载 |
| `/[locale]/console` | 用量控制台：KPI、30 天趋势、模型分布、Key 管理、请求日志分页 |

## 目录

```text
app/
  route.ts                     # 根路径语言协商
  [locale]/                    # 双语布局、首页与 404
    models/page.tsx            # 可分享的服务端筛选
    models/[slug]/page.tsx     # 六个模型的静态详情
    tools/image/page.tsx       # 图片工具
    console/page.tsx           # 用量控制台
  api/generate-image/route.ts
  api/usage/route.ts
  sitemap.ts · robots.ts
components/                    # 导航、模型卡、图表、表单和交互
lib/                           # 类型化字典、模型目录、演示用量和 SEO
scripts/smoke.mjs               # 针对运行中生产服务的 HTTP 检查
render.yaml                    # 免费 Node Web Service
```

## 实现与验证

- 根路径按浏览器的 Accept-Language 权重选择中文或英文，保留查询串，重定向响应带 Vary。访问带语言前缀的链接时以 URL 为准。
- 首页、六个模型详情、图片工具和控制台按语言预渲染。模型目录在服务端读取查询参数，筛选后的 HTML 可以直接分享。
- 可索引页面按路径声明 canonical 和中英文 hreflang。sitemap 列出 18 个 URL，覆盖两种语言的首页、目录、工具和六个详情页。控制台使用 noindex。
- 用量图在服务端生成 SVG。演示快照使用固定种子和固定 UTC 截止日期，日志在服务端格式化时间。Key 管理使用浏览器本地存储，仅用于演示。
- 图片工具提交 JSON，在服务端校验提示词，再显示并下载结果。公开演示使用 SVG 占位图并显示 Demo 标记。模型名、价格和详情页的调用代码用于展示接口形态。
- Claude Code 搭建初版，Codex 接手后用中英文混合请求头复现了语言优先级错误，修正路由，并检查真实 HTML 中的 canonical、hreflang 和 sitemap。

## 本地运行

```bash
npm ci
npm run dev
```

生产模式使用两个终端。

```bash
npm run build
npm start -- -p 3100
```

```bash
node scripts/smoke.mjs
```

测试其他地址时先设置环境变量 `SMOKE_BASE`。冒烟脚本针对未配置模型密钥的演示实例。

## 部署

Render 按 `render.yaml` 构建。构建前设置 `NEXT_PUBLIC_SITE_URL` 为站点的 HTTPS 地址。缺省时使用 Render 提供的 `RENDER_EXTERNAL_URL`，本地回退到 `http://localhost:3000`。`NEXT_PUBLIC_GITHUB_URL` 指定源码入口。公开演示无需模型密钥，真实图像服务可通过服务器环境变量 `IMAGE_API_KEY`、`IMAGE_API_BASE`、`IMAGE_MODEL` 启用。

## 性能记录

2026-11-26，Lighthouse 13.6.0 移动端配置，模拟限速，单次测量。测试对象为本机生产构建的中文首页。Performance、Accessibility、Best Practices、SEO 均为 100。此结果不包含公网传输和 Render 冷启动。
