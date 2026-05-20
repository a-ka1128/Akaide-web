/**
 * 아직 구현되지 않은 페이지의 공통 빈 상태 화면.
 *
 * props.maxWidth: tailwind max-w 클래스 (예: "max-w-3xl"). 기본 max-w-3xl.
 */
export default function StubPage({ title, description, maxWidth = 'max-w-3xl' }) {
  return (
    <div className={`${maxWidth} mx-auto flex flex-col gap-7`}>
      <header>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
      </header>

      <div className="bg-surface border border-border rounded-xl px-6 py-16 text-center">
        <div className="text-[13px] text-muted max-w-md mx-auto leading-relaxed mb-4">
          {description}
        </div>
        <div className="text-[12px] text-muted">아직 준비 중인 화면입니다.</div>
      </div>
    </div>
  );
}
