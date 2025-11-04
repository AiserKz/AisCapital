import { LogOutIcon } from "lucide-react";
import Button from "./button";

export default function Outbuton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="error" className="btn-soft" size="small" onClick={onClick}>
      <LogOutIcon className="w-5 h-5" />
    </Button>
  );
}
