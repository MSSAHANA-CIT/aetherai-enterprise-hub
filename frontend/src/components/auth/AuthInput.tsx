import { forwardRef, type InputHTMLAttributes } from "react";
import { EmailInput, PasswordInput, TextInput } from "../../design/components/Input";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, type = "text", ...props }, ref) => {
    if (type === "email") {
      return <EmailInput ref={ref} label={label} error={error} leftIcon={icon} {...props} />;
    }
    if (type === "password") {
      return <PasswordInput ref={ref} label={label} error={error} leftIcon={icon} {...props} />;
    }
    return <TextInput ref={ref} label={label} error={error} leftIcon={icon} type={type} {...props} />;
  }
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
