import { useState, useRef } from "react";
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
  const [showCaptcha, setShowCaptcha] = useState(false);
  const comments = useQuery(api.comments.getComments, { slug });
  const addComment = useAction(api.comments.addComment);
  const { isDark } = useTheme();
  const captchaRef = useRef<HCaptcha>(null);

  const handleSubmitClick = () => {
    if (!body.trim()) return;
    else {
      setShowCaptcha(true);
    }
  };

  const submitComment = async (token: string) => {
    if (body.trim() && token) {
      const error = await addComment({ slug, body, token });
      if (error) {
        toast.error(error.error);
      }
      setBody("");
      setShowCaptcha(false);
      captchaRef.current?.resetCaptcha();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}.${dd}.${yy}`;
  };

  return (
    <>
      <Toaster richColors />
      {showCaptcha && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowCaptcha(false)}
        >
          <HCaptcha
            ref={captchaRef}
            sitekey="8f643442-c6fa-4714-9888-52d4a11e7378"
            size="normal"
            theme={isDark ? "dark" : "light"}
            onVerify={(token) => {
              submitComment(token);
            }}
          />
        </div>
      )}
      <div className="mt-12 border-t border-border pt-6">
        <table className="w-full">
          <tbody>
            <tr className="flex w-full mb-4">
              <td className="flex-0 w-[9ch]">&nbsp;</td>
              <td className="flex-1 text-start">
                <h3
                  className="font-medium m-0"
                  id="comment-component"
                >
                  Comments
                </h3>
              </td>
            </tr>
            {comments?.map((comment) => (
              <tr key={comment._id} className="flex mb-3">
                <td className="text-base !font-normal w-[9ch]">
                  <span className="flex font-medium align-baseline">
                    <span className="ml-auto mr-1.5">
                      {formatDate(comment._creationTime)}
                    </span>
                  </span>
                </td>
                <td className="ml-0.5 text-base !font-normal flex-1 align-baseline">
                  {comment.body}
                </td>
              </tr>
            ))}
            {comments?.length === 0 && (
              <tr className="flex mb-2">
                <td className="text-base !font-normal w-[9ch]">&nbsp;</td>
                <td className="text-base !font-normal flex-1 ml-1.5 pl-2 text-muted-foreground">
                  no comments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="mt-6">
          <table className="w-full">
            <tbody>
              <tr className="flex">
                <td className="flex-0 w-[9ch]">&nbsp;</td>
                <td className="flex-1 flex gap-3 pr-3 pb-3">
                  <input
                    type="text"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="write a comment..."
                    className="flex-1 bg-transparent border border-border px-3 py-2 text-base placeholder:text-muted-foreground focus:outline-hidden focus:border-foreground transition-colors"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmitClick();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSubmitClick}
                    disabled={!body.trim()}
                    className="px-4 py-2 text-base font-medium bg-transparent border border-border hover:border-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    submit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
