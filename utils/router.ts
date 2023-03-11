/**
 * 路由相关通用工具。
 */

/** 回到上一页。 */
export function back(): void {
  const router = useRouter();
  if (history.state.back === null) { // 没有上一页
    router.replace('/');
  } else {
    router.back();
  }
}
