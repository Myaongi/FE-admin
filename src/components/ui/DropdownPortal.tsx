"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
  offsetY?: number;
  zIndex?: number;
  width?: number; // 드롭다운 예상 너비 (px) - 경계보정에 사용
};

export default function DropdownPortal({
  anchorEl,
  open,
  onClose,
  children,
  align = "left",
  offsetY = 8,
  zIndex = 1000,
  width = 192, // w-48
}: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const recalc = () => {
    if (!open || !anchorEl) return;
    const rect = anchorEl.getBoundingClientRect(); // ✅ fixed 기준(뷰포트 좌표)

    // 기본 위치(버튼 아래)
    let left = align === "left" ? rect.left : rect.right - width;
    let top = rect.bottom + offsetY;

    // 뷰포트 경계 보정(우측/좌측/하단)
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 우측 넘침 방지
    if (left + width > vw - 8) left = Math.max(8, vw - width - 8);
    // 좌측 넘침 방지
    if (left < 8) left = 8;
    // 하단 넘침 시 위로 플립
    const menuH = menuRef.current?.offsetHeight ?? 0;
    if (menuH && top + menuH > vh - 8) {
      top = Math.max(8, rect.top - offsetY - menuH);
    }

    setPos({ top, left });
  };

  // 위치 계산 + 스크롤/리사이즈 대응
  useLayoutEffect(() => {
    recalc();
    // 열릴 때 즉시 한 번 더(레이아웃 변경 직후 보정)
    const id = requestAnimationFrame(recalc);
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchorEl, align, offsetY]);

  useEffect(() => {
    if (!open) return;
    const onWin = () => recalc();
    window.addEventListener("scroll", onWin, true); // 캡처 단계: 내부 스크롤도 잡음
    window.addEventListener("resize", onWin);
    return () => {
      window.removeEventListener("scroll", onWin, true);
      window.removeEventListener("resize", onWin);
    };
  }, [open]); // eslint-disable-line

  // 외부 클릭 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(t) &&
        anchorEl &&
        !anchorEl.contains(t)
      )
        onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose, anchorEl]);

  if (!open || !pos) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{ position: "fixed", top: pos.top, left: pos.left, zIndex }}
      className="w-48 bg-white border border-gray-300 rounded-md shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
}
