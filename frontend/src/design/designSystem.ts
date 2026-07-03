/**
 * Aether Design System — Main Entry Point
 *
 * Import everything from here:
 *   import { colors, Button, Card } from '@/design/designSystem';
 */

export * from "./tokens";

// Components
export { Button, IconButton, LoadingButton } from "./components/Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./components/Button";

export {
  TextInput,
  EmailInput,
  PasswordInput,
  OtpInput,
  SearchInput,
  Textarea,
  Select,
  DateInput,
  FileUpload,
} from "./components/Input";
export type { InputProps, InputState } from "./components/Input";

export {
  Card,
  GlassCard,
  StatisticCard,
  FeatureCard,
  InfoCard,
  EmptyCard,
  HoverCard,
  FloatingCard,
} from "./components/Card";
export type { CardProps, CardVariant } from "./components/Card";

export { Modal, ConfirmationModal, DrawerModal, FullscreenModal } from "./components/Modal";
export type { ModalProps, ModalVariant } from "./components/Modal";

export { Table, TableHeader, TableBody, TableRow, TableCell } from "./components/Table";
export type { TableProps, ColumnDef } from "./components/Table";

export { Badge } from "./components/Badge";
export type { BadgeProps, BadgeVariant } from "./components/Badge";

export { Alert } from "./components/Alert";
export type { AlertProps, AlertVariant } from "./components/Alert";

export { Toast, ToastProvider, useToast } from "./components/Toast";
export type { ToastProps, ToastVariant } from "./components/Toast";

export {
  Skeleton,
  Spinner,
  PageLoader,
  CardLoader,
  TableLoader,
  ChatLoader,
  AIThinkingLoader,
} from "./components/Loading";

export { EmptyState } from "./components/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState";

export { ErrorState } from "./components/ErrorState";
export type { ErrorStateProps } from "./components/ErrorState";

export { PageHeader } from "./components/PageHeader";
export type { PageHeaderProps } from "./components/PageHeader";

export { Container, Section, Grid } from "./components/Layout";

export { Sidebar, SidebarSection, SidebarItem } from "./components/Sidebar";
export type { SidebarProps, SidebarItemProps } from "./components/Sidebar";

export { Topbar } from "./components/Topbar";
export type { TopbarProps } from "./components/Topbar";

export { glassStyles, GlassSurface } from "./components/Glass";

export { PageTransition, AnimatedPage } from "./components/PageTransition";

export { FocusRing, VisuallyHidden } from "./components/Accessibility";

export { Icon, getIconContainerClass } from "./components/Icon";
export type { IconWrapperProps } from "./components/Icon";
