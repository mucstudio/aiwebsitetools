import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 简化 middleware，移除数据库查询以提升性能
// 维护模式检查移到服务端组件中处理
export async function middleware(request: NextRequest) {
  // 直接放行所有请求，不做数据库查询
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
