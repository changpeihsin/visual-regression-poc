# PDP Behavior E2E

This directory is the isolated entry point for the PM/QA-facing PDP behavior
testing service. The existing visual regression CLI and report engine remain
independent.

## Scaffold commands

```bash
# 適用開發時
pnpm e2e:dev
# 適用服務啟動
pnpm e2e:start
```

- Scaffold 提供健康檢查端點：`GET http://127.0.0.1:4173/health`
- 可透過 `E2E_HOST` 調整監聽位址。
- 可透過 `E2E_PORT` 調整監聽連接埠。
- 以下功能將在後續里程碑逐步加入：
  - 品牌資料模型
  - Magento 資料供應器
  - Playwright 測試執行器
  - API
  - 資料持久化
  - Web 操作介面
