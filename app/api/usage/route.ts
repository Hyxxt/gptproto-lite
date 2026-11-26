import { NextResponse } from "next/server";
import { buildUsageSnapshot } from "@/lib/usage";

export const dynamic = "force-dynamic";

/**
 * 控制台页面本身走服务端直调，这个接口留给外部脚本或 cron 拉数，
 * 也是「前后端约定好形状再写页面」的落地点。
 */
export async function GET() {
  return NextResponse.json(buildUsageSnapshot(), {
    headers: { "Cache-Control": "no-store" },
  });
}
