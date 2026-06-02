function Ic({ size = 16, color = "currentColor", strokeWidth = 1.8, children, viewBox = "0 0 24 24" }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={{ display:"inline-block", flexShrink:0 }}>
      {children}
    </svg>
  );
}

export function IconBook({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M4 3.5 C4 3.5 6 3 8 3 C10.5 3 12 4.5 12 4.5 C12 4.5 13.5 3 16 3 C18 3 20 3.5 20 3.5 L20 19.5 C20 19.5 18 19 16 19 C13.5 19 12 20.5 12 20.5 C12 20.5 10.5 19 8 19 C6 19 4 19.5 4 19.5 Z" />
      <line x1="12" y1="4.5" x2="12" y2="20.5" />
    </Ic>
  );
}

export function IconMessage({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M3 6.5 C3 5.1 4.1 4 5.5 4 L18.5 4 C19.9 4 21 5.1 21 6.5 L21 15.5 C21 16.9 19.9 18 18.5 18 L9 18 L5 21.5 L5 18 L5.5 18 C4.1 18 3 16.9 3 15.5 Z" />
      <line x1="7.5" y1="9" x2="16.5" y2="9" strokeWidth="1.4" />
      <line x1="7.5" y1="12.5" x2="13" y2="12.5" strokeWidth="1.4" />
    </Ic>
  );
}

export function IconStar({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 2.5 L14.2 8.8 L21 9.3 L15.8 13.7 L17.6 20.5 L12 16.8 L6.4 20.5 L8.2 13.7 L3 9.3 L9.8 8.8 Z" />
    </Ic>
  );
}

export function IconUser({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 3 C9.5 3 7.5 5 7.5 7.5 C7.5 10 9.5 12 12 12 C14.5 12 16.5 10 16.5 7.5 C16.5 5 14.5 3 12 3 Z" />
      <path d="M4 21 C4 17 7.5 14 12 14 C16.5 14 20 17 20 21" />
    </Ic>
  );
}

export function IconHistory({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M4 12 C4 7.6 7.6 4 12 4 C14.7 4 17.1 5.3 18.6 7.4" />
      <polyline points="3.5,7 4,12 8.5,11.5" />
      <circle cx="12" cy="12" r="8" opacity="0.12" fill="currentColor" stroke="currentColor" strokeWidth="0" />
      <line x1="12" y1="8.5" x2="12" y2="13" />
      <line x1="12" y1="13" x2="15" y2="15" />
    </Ic>
  );
}

export function IconHeartPulse({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 20 C12 20 3 14 3 8.5 C3 5.5 5.5 3 8.5 3 C10 3 11.3 3.8 12 5 C12.7 3.8 14 3 15.5 3 C18.5 3 21 5.5 21 8.5 C21 14 12 20 12 20 Z" />
      <polyline points="6,12 8.5,9 11,13.5 13.5,10 15.5,12.5" strokeWidth="1.4" />
    </Ic>
  );
}

export function IconLogOut({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M9 5.5 L5 5.5 C4.2 5.5 3.5 6.2 3.5 7 L3.5 17 C3.5 17.8 4.2 18.5 5 18.5 L9 18.5" />
      <polyline points="15,8.5 20,12 15,15.5" />
      <line x1="20" y1="12" x2="9" y2="12" />
    </Ic>
  );
}

export function IconClose({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </Ic>
  );
}

export function IconMenu({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="16" y2="12" />
      <line x1="4" y1="17" x2="12" y2="17" />
    </Ic>
  );
}

export function IconHome({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M3.5 10.5 L12 3 L20.5 10.5 L20.5 21 L14.5 21 L14.5 15 L9.5 15 L9.5 21 L3.5 21 Z" />
    </Ic>
  );
}

export function IconEdit({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M14.5 4.5 L19.5 9.5 L8 21 L3 21 L3 16 Z" />
      <line x1="12" y1="7" x2="17" y2="12" />
    </Ic>
  );
}

export function IconCamera({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M9 4 L7.5 6.5 L3 6.5 C2.2 6.5 1.5 7.2 1.5 8 L1.5 19 C1.5 19.8 2.2 20.5 3 20.5 L21 20.5 C21.8 20.5 22.5 19.8 22.5 19 L22.5 8 C22.5 7.2 21.8 6.5 21 6.5 L16.5 6.5 L15 4 Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </Ic>
  );
}

export function IconSave({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M4 3.5 L17.5 3.5 L20.5 6.5 L20.5 20.5 L3.5 20.5 L3.5 3.5 Z" />
      <rect x="8" y="3.5" width="8" height="5.5" rx="0.5" />
      <rect x="6" y="13" width="12" height="7.5" rx="0.5" />
    </Ic>
  );
}

export function IconChevronRight({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="9,5.5 16,12 9,18.5" />
    </Ic>
  );
}

export function IconChevronLeft({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="15,5.5 8,12 15,18.5" />
    </Ic>
  );
}

export function IconChevronDown({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="5.5,9 12,16 18.5,9" />
    </Ic>
  );
}

export function IconChevronUp({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="5.5,15 12,8 18.5,15" />
    </Ic>
  );
}

export function IconSearch({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
    </Ic>
  );
}

export function IconClock({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="8.5" />
      <polyline points="12,7.5 12,12.5 15.5,14.5" />
    </Ic>
  );
}

export function IconTrash({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="4" y1="7" x2="20" y2="7" />
      <path d="M9 7 L9 4.5 C9 4 9.4 3.5 10 3.5 L14 3.5 C14.6 3.5 15 4 15 4.5 L15 7" />
      <path d="M5.5 7 L6.5 20 C6.5 20.6 7 21 7.5 21 L16.5 21 C17 21 17.5 20.6 17.5 20 L18.5 7" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </Ic>
  );
}

export function IconPlus({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="4" y1="12" x2="20" y2="12" />
    </Ic>
  );
}

export function IconLoader({ size = 16, color = "currentColor", strokeWidth = 2 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 3.5 A8.5 8.5 0 0 1 20.5 12" />
      <circle cx="12" cy="12" r="8.5" opacity="0.12" stroke={color} />
    </Ic>
  );
}

export function IconMapPin({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 2.5 C8.7 2.5 6 5.2 6 8.5 C6 13 12 21 12 21 C12 21 18 13 18 8.5 C18 5.2 15.3 2.5 12 2.5 Z" />
      <circle cx="12" cy="8.5" r="2.5" />
    </Ic>
  );
}

export function IconPhone({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M7 2.5 L10 2.5 C10.6 2.5 11 2.9 11 3.5 L11 7 C11 7.6 10.6 8 10 8 L8.5 8 C8.5 8 8.5 11.5 11.5 14.5 C14.5 17.5 17 17.5 17 17.5 L17 16 C17 15.4 17.4 15 18 15 L21 15 C21.6 15 22 15.4 22 16 L22 19 C22 19.6 21.6 20 21 20 C10 20 4 14 4 3 C4 2.4 4.4 2.5 5 2.5 Z" />
    </Ic>
  );
}

export function IconNavigation({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <polygon points="12,2.5 21.5,21 12,16.5 2.5,21" />
    </Ic>
  );
}

export function IconAlert({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="13" strokeWidth="2" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
    </Ic>
  );
}

export function IconExternalLink({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M14 4 L20 4 L20 10" />
      <line x1="11" y1="13" x2="20" y2="4" />
      <path d="M20 13.5 L20 19 C20 19.6 19.6 20 19 20 L5 20 C4.4 20 4 19.6 4 19 L4 5 C4 4.4 4.4 4 5 4 L10.5 4" />
    </Ic>
  );
}

export function IconQuote({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M3.5 8 C3.5 8 5 5 8 5.5 C10.5 6 10 9 9 10.5 C8 12 6.5 13 6.5 13 L3.5 13 Z" />
      <path d="M13 8 C13 8 14.5 5 17.5 5.5 C20 6 19.5 9 18.5 10.5 C17.5 12 16 13 16 13 L13 13 Z" />
      <line x1="3.5" y1="16" x2="20.5" y2="16" strokeWidth="1.2" opacity="0.5" />
      <line x1="3.5" y1="19" x2="14" y2="19" strokeWidth="1.2" opacity="0.5" />
    </Ic>
  );
}

export function IconCheck({ size = 16, color = "currentColor", strokeWidth = 2 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <polyline points="4,12.5 9.5,18 20,6" />
    </Ic>
  );
}

export function IconPen({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M4 20 L4 16 L15.5 4.5 C16.3 3.7 17.5 3.7 18.3 4.5 L19.5 5.7 C20.3 6.5 20.3 7.7 19.5 8.5 L8 20 Z" />
      <line x1="13" y1="7" x2="17" y2="11" />
    </Ic>
  );
}

export function IconCalendar({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="8" y1="2.5" x2="8" y2="6.5" />
      <line x1="16" y1="2.5" x2="16" y2="6.5" />
      <rect x="7" y="13" width="3" height="3" rx="0.5" fill="currentColor" stroke="none" />
    </Ic>
  );
}

export function IconAI({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <circle cx="12" cy="10" r="5" />
      <line x1="12" y1="15" x2="12" y2="18.5" />
      <line x1="7.5" y1="18.5" x2="16.5" y2="18.5" />
      <circle cx="9.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="9.5" r="1" fill="currentColor" stroke="none" />
      <path d="M10 12 C10.5 12.8 13.5 12.8 14 12" strokeWidth="1.4" />
      <path d="M5 6 C5 3.5 7.5 2 12 2 C16.5 2 19 3.5 19 6" strokeDasharray="2 2" strokeWidth="1.2" />
    </Ic>
  );
}

export function IconShield({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 2.5 L20 6 L20 13 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 13 L4 6 Z" />
      <polyline points="8.5,11.5 11,14 15.5,9" strokeWidth="2" />
    </Ic>
  );
}

export function IconBrain({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M9.5 3.5 C7 3.5 5 5.5 5 8 C5 8.8 5.2 9.5 5.6 10.1 C4.6 10.7 4 11.8 4 13 C4 14.7 5.1 16.2 6.7 16.7 C7 18.5 8.6 20 10.5 20 L13.5 20 C15.4 20 17 18.5 17.3 16.7 C18.9 16.2 20 14.7 20 13 C20 11.8 19.4 10.7 18.4 10.1 C18.8 9.5 19 8.8 19 8 C19 5.5 17 3.5 14.5 3.5 C13.8 3.5 13.1 3.7 12.5 4 C11.9 3.7 11.2 3.5 10.5 3.5 Z" />
      <line x1="12" y1="4" x2="12" y2="20" strokeWidth="1.2" opacity="0.4" />
      <line x1="8" y1="10" x2="16" y2="10" strokeWidth="1.2" opacity="0.4" />
    </Ic>
  );
}

export function IconChart({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <polyline points="7,15 10,10 13,13 17,8" strokeWidth="2" />
      <circle cx="7" cy="15" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="10" cy="10" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="13" cy="13" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </Ic>
  );
}

export function IconCursor({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M5 3 L5 19 L9 15 L12.5 21 L14.5 20 L11 14 L17 14 Z" />
    </Ic>
  );
}

export function IconPencilWrite({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M3 17.5 L3 21 L6.5 21 L17.5 10 L14 6.5 Z" />
      <path d="M14 6.5 L16.5 4 C17.3 3.2 18.5 3.2 19.3 4 L20 4.7 C20.8 5.5 20.8 6.7 20 7.5 L17.5 10 Z" />
    </Ic>
  );
}

export function IconSparkle({ size = 16, color = "currentColor", strokeWidth = 1.8 }) {
  return (
    <Ic size={size} color={color} strokeWidth={strokeWidth}>
      <path d="M12 2 L13.5 9 L20 12 L13.5 15 L12 22 L10.5 15 L4 12 L10.5 9 Z" />
      <path d="M19 2 L19.8 5.2 L23 6 L19.8 6.8 L19 10 L18.2 6.8 L15 6 L18.2 5.2 Z" strokeWidth="1.2" />
    </Ic>
  );
}
