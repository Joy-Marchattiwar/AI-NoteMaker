"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useContext} from "react";
import { AuthContext } from "./contexts/AuthContext";
import { FileUpload } from "@/components/ui/file-upload";
import axios from "axios";
import { toast } from "sonner";

export default function Page() {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isLoggedIn } = useContext(AuthContext);
  const destination = isLoggedIn ? "/notespage" : "/login";
  const destination2 = isLoggedIn ? "/browse_pdfs" : "/login";
  const handleUpload = async (data:FormData) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(`https://notecraft-backend-ag98.onrender.com/add_pdf/`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
        withCredentials: true
      });
      if (response.status === 201) {
        toast.success("File uploaded successfully");
      }
    } catch (error) {
      toast.error("Error uploading file");
    }

  }

  return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="container px-4 md:px-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                <div className="flex flex-col justify-center space-y-4">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                      Transform Your Learning with AI-Powered Notes
                    </h1>
                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                      Notecraft uses advanced AI to generate comprehensive, customizable notes from any content. Save
                      time, enhance understanding, and boost productivity.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button size="lg" asChild>
                      <Link href={destination}>Build your notes</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild>
                      <Link href={destination2}>Check out existing notes</Link>
                    </Button>
                  </div>
                </div>
                <div className="mx-auto flex items-center justify-center rounded-xl border bg-muted p-8">
                  <div className="space-y-4 bg-background rounded-lg p-6 shadow-sm w-full">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <div className="ml-auto text-xs text-muted-foreground">Notecraft AI</div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-semibold">Introduction to Machine Learning</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                          <span>Machine Learning is a subset of artificial intelligence</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                          <span>Key concepts: supervised, unsupervised, and reinforcement learning</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          </div>
                          <span>Applications include image recognition, natural language processing</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {isLoggedIn && <FileUpload 
                onChange={(files) => console.log('Files changed:', files)} 
                onSubmit={handleUpload} 
              />}
            </div>
          </section>
        </main>
      </div>
  );
}