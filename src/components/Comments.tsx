import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { toast, Toaster } from "sonner";
import useTheme from "./theme/useTheme";

interface CommentsProps {
  slug: string;
}

export default function Comments({ slug }: CommentsProps) {
  const [body, setBody] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const comments = useQuery(api.comments.getComments, { slug });
  const addComment = useAction(api.comments.addComment);
  const { isDark } = useTheme();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim() && token) {
      const error = await addComment({ slug, body, token });
      if (error) {
        toast.error(error.error);
      }
      setBody("");
    }
  };

  return (
    <div className="mt-8">
      <Toaster richColors position="top-center" toastOptions={{
        className: "border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold rounded-none"
      }} />
      
      <div className="space-y-6 mb-12">
        {comments?.length === 0 && (
          <p className="text-gray-500 italic">No comments yet. Be the first!</p>
        )}
        {comments?.map((comment) => (
          <div key={comment._id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-medium mb-2">{comment.body}</p>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {new Date(comment._creationTime).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a comment..."
          className="w-full p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all font-medium"
        />
        
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="border-2 border-black p-1 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <HCaptcha
              sitekey="8f643442-c6fa-4714-9888-52d4a11e7378"
              size="normal"
              theme={isDark ? "dark" : "light"}
              onVerify={setToken}
            />
          </div>
          
          <button
            type="submit"
            disabled={!body.trim() || !token}
            className="bg-yellow-300 px-8 py-4 font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:bg-yellow-300 disabled:hover:text-black"
          >
            POST COMMENT
          </button>
        </div>
      </form>
    </div>
  );
}
