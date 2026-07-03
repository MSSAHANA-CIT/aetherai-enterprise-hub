import { forwardRef, type InputHTMLAttributes } from "react";
import { TextInput } from "../../design/components/Input";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ icon, className, ...props }, ref) => (
  <TextInput ref={ref} leftIcon={icon} className={className} {...props} />
));

Input.displayName = "Input";

export default Input;
