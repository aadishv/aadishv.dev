import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

interface CommentsProps {
  slug: string;
}

export default function Comments({ slug }: CommentsProps) {
  const [body, setBody] = useState("");
  const comments = useQuery(api.comments.getComments, { slug });
  const addComment = useMutation(api.comments.addComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim()) {
      await addComment({ slug, body });
      setBody("");
    }
  };

  return (
    <>
      <hr />
        <h3>Comments</h3>
        <div className="flex flex-col gap-4">
          {comments?.map((comment) => (
            <div key={comment._id}>
              <p>{comment.body}</p>
              <small className="text-muted-foreground">
                {new Date(comment._creationTime).toLocaleString()}
              </small>
              <hr className="mx-20" />
            </div>
          ))}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment..."
              className="mb-2"
            />
            <Button type="submit" disabled={!body.trim()} className="min-h-full">
              Submit
            </Button>
          </form>
        </div>
    </>
  );
}
