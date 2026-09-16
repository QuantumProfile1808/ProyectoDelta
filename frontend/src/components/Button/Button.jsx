import "./Button.css";

export default function Button({ children, className = "", type = "button", ...props }) {
  return (
    <button {...props} type={type} className={`app-button ${className}`.trim()}>
      {children}
    </button>
  );
}
