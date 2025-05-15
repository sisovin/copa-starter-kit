export interface NavItem {
  title: string;
  href: string;
  icon?: string; // Icon name as string
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string; // For accessibility and tooltips
  ariaLabel?: string; // Custom aria-label
}

export interface NavSection {
  title: string;
  items: NavItem[];
  id?: string; // Unique identifier for the section for ARIA relationships
  description?: string; // Description for screen readers
  collapsible?: boolean; // Whether this section can be collapsed
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sections: NavSection[];
  className?: string;
}

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
}

export interface NavLinkProps extends NavItem {
  isActive?: boolean;
  children?: React.ReactNode;
  className?: string;
}
