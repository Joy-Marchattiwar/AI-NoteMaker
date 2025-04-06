import { Dialog,DialogTitle,DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import React from "react";
interface NameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (name: string) => void;
  }
export default function NameDialog({ open, onOpenChange, onSubmit }: NameDialogProps) {
    const [name, setName] = React.useState("");

    const handleSubmit = () => {
        onSubmit(name);
        setName(""); 
        onOpenChange(false);
      };
    
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogTitle>Please enter name for pdf</DialogTitle>
          <DialogContent>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button onClick={handleSubmit}>Submit</Button>
          </DialogContent>
        </Dialog>
      );

}